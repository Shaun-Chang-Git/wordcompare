import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableCell,
  TableRow,
  AlignmentType,
  BorderStyle,
  WidthType,
  HeadingLevel,
  UnderlineType,
} from 'docx'
import { saveAs } from 'file-saver'
import { ComparisonResult, Change, ChangeType } from '../types'

/**
 * Word 문서 생성 서비스
 * 비교 결과를 Track Changes 스타일로 .docx 파일 생성
 */

/**
 * 비교 결과를 Word 문서로 생성하고 다운로드
 */
export const exportComparisonToWord = async (
  result: ComparisonResult,
  originalFileName: string,
  modifiedFileName: string
): Promise<void> => {
  try {
    // Word 문서 생성
    const doc = createWordDocument(result, originalFileName, modifiedFileName)

    // Blob 생성
    const { Packer } = await import('docx')
    const blob = await Packer.toBlob(doc)

    // 파일 다운로드
    const fileName = `비교결과_${new Date().toISOString().slice(0, 10)}.docx`
    saveAs(blob, fileName)
  } catch (error) {
    console.error('Word 문서 생성 오류:', error)
    throw new Error('Word 문서 생성에 실패했습니다.')
  }
}

/**
 * Word 문서 생성
 */
const createWordDocument = (
  result: ComparisonResult,
  originalFileName: string,
  modifiedFileName: string
): Document => {
  const { changes, statistics } = result

  // 문서 섹션 생성
  const sections: any[] = []

  // 1. 제목
  sections.push(
    new Paragraph({
      text: '문서 비교 결과',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  )

  // 2. 문서 정보
  sections.push(
    new Paragraph({
      text: '비교 문서 정보',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 200 },
    })
  )

  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: '원본 문서: ', bold: true }),
        new TextRun({ text: originalFileName }),
      ],
      spacing: { after: 100 },
    })
  )

  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: '수정된 문서: ', bold: true }),
        new TextRun({ text: modifiedFileName }),
      ],
      spacing: { after: 100 },
    })
  )

  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: '비교 날짜: ', bold: true }),
        new TextRun({ text: new Date().toLocaleString('ko-KR') }),
      ],
      spacing: { after: 300 },
    })
  )

  // 3. 통계 정보
  sections.push(
    new Paragraph({
      text: '변경사항 통계',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 200 },
    })
  )

  const statsTable = createStatisticsTable(statistics)
  sections.push(statsTable)

  // 4. 변경사항 상세
  sections.push(
    new Paragraph({
      text: '변경사항 상세 내역',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    })
  )

  // 변경사항을 문서에 추가
  changes.forEach((change, index) => {
    sections.push(...createChangeParagraphs(change, index + 1))
  })

  // 5. 범례
  sections.push(
    new Paragraph({
      text: '변경사항 범례',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    })
  )

  sections.push(...createLegend())

  // 문서 생성
  return new Document({
    sections: [
      {
        properties: {},
        children: sections,
      },
    ],
  })
}

/**
 * 통계 테이블 생성
 */
const createStatisticsTable = (statistics: any): Table => {
  const rows = [
    // 헤더
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: '항목', bold: true })],
            }),
          ],
          width: { size: 50, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: '개수', bold: true })],
            }),
          ],
          width: { size: 50, type: WidthType.PERCENTAGE },
        }),
      ],
    }),
    // 데이터 행
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph('총 변경사항')] }),
        new TableCell({ children: [new Paragraph(String(statistics.totalChanges))] }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph('추가됨')] }),
        new TableCell({ children: [new Paragraph(String(statistics.added))] }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph('삭제됨')] }),
        new TableCell({ children: [new Paragraph(String(statistics.deleted))] }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph('수정됨')] }),
        new TableCell({ children: [new Paragraph(String(statistics.modified))] }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph('이동됨')] }),
        new TableCell({ children: [new Paragraph(String(statistics.moved))] }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph('서식 변경')] }),
        new TableCell({ children: [new Paragraph(String(statistics.formatChanged))] }),
      ],
    }),
  ]

  return new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1 },
      bottom: { style: BorderStyle.SINGLE, size: 1 },
      left: { style: BorderStyle.SINGLE, size: 1 },
      right: { style: BorderStyle.SINGLE, size: 1 },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
      insideVertical: { style: BorderStyle.SINGLE, size: 1 },
    },
  })
}

/**
 * 변경사항을 단락으로 변환
 */
const createChangeParagraphs = (change: Change, index: number): Paragraph[] => {
  const paragraphs: Paragraph[] = []

  // 변경사항 헤더
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `${index}. ${getChangeTypeLabel(change.type)} `,
          bold: true,
        }),
        new TextRun({
          text: `(${change.position.paragraph}단락)`,
          italics: true,
        }),
      ],
      spacing: { before: 200, after: 100 },
    })
  )

  // 변경 전 내용 (삭제/수정)
  if (change.type === ChangeType.DELETED || change.type === ChangeType.MODIFIED) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: '변경 전: ', bold: true }),
          new TextRun({
            text: change.beforeContent || change.content,
            strike: true,
            color: 'FF0000', // 빨간색
          }),
        ],
        spacing: { after: 50 },
      })
    )
  }

  // 변경 후 내용 (추가/수정)
  if (change.type === ChangeType.ADDED || change.type === ChangeType.MODIFIED) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: '변경 후: ', bold: true }),
          new TextRun({
            text: change.afterContent || change.content,
            underline: { type: UnderlineType.SINGLE },
            color: '0000FF', // 파란색
          }),
        ],
        spacing: { after: 50 },
      })
    )
  }

  // 이동된 내용
  if (change.type === ChangeType.MOVED) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: '내용: ', bold: true }),
          new TextRun({
            text: change.content,
            color: '2196F3', // 파란색
          }),
        ],
        spacing: { after: 50 },
      })
    )
  }

  // 서식 변경
  if (change.type === ChangeType.FORMAT_CHANGED) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: '서식 변경: ', bold: true }),
          new TextRun({
            text: change.content,
            color: '9C27B0', // 보라색
          }),
        ],
        spacing: { after: 100 },
      })
    )
  }

  // 구분선
  paragraphs.push(
    new Paragraph({
      text: '',
      border: {
        bottom: {
          style: BorderStyle.SINGLE,
          size: 1,
          color: 'CCCCCC',
        },
      },
      spacing: { after: 200 },
    })
  )

  return paragraphs
}

/**
 * 변경 타입 레이블
 */
const getChangeTypeLabel = (type: ChangeType): string => {
  switch (type) {
    case ChangeType.ADDED:
      return '추가됨'
    case ChangeType.DELETED:
      return '삭제됨'
    case ChangeType.MODIFIED:
      return '수정됨'
    case ChangeType.MOVED:
      return '이동됨'
    case ChangeType.FORMAT_CHANGED:
      return '서식 변경'
    default:
      return '알 수 없음'
  }
}


/**
 * 범례 생성
 */
const createLegend = (): Paragraph[] => {
  return [
    new Paragraph({
      children: [
        new TextRun({ text: '• 삭제된 내용: ', bold: true }),
        new TextRun({
          text: '빨간색 취소선',
          strike: true,
          color: 'FF0000',
        }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: '• 추가된 내용: ', bold: true }),
        new TextRun({
          text: '파란색 밑줄',
          underline: { type: UnderlineType.SINGLE },
          color: '0000FF',
        }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: '• 이동된 내용: ', bold: true }),
        new TextRun({
          text: '파란색 텍스트',
          color: '2196F3',
        }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: '• 서식 변경: ', bold: true }),
        new TextRun({
          text: '보라색 텍스트',
          color: '9C27B0',
        }),
      ],
      spacing: { after: 100 },
    }),
  ]
}
