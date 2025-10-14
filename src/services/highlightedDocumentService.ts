/**
 * 변경사항이 하이라이트된 수정 문서 생성 서비스
 *
 * 수정 문서의 내용을 기반으로, 변경된 부분에 노란색 음영을 적용한 Word 문서를 생성합니다.
 */

import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  WidthType,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
} from 'docx'
import { saveAs } from 'file-saver'
import type { ComparisonResult, Change } from '../types'

/**
 * 변경사항이 하이라이트된 수정 문서를 Word 파일로 내보내기
 */
export const exportHighlightedDocument = async (
  result: ComparisonResult,
  modifiedFileName: string
): Promise<void> => {
  try {
    const doc = createHighlightedDocument(result, modifiedFileName)
    const { Packer } = await import('docx')
    const blob = await Packer.toBlob(doc)

    const fileName = `${modifiedFileName.replace(/\.[^/.]+$/, '')}_하이라이트.docx`
    saveAs(blob, fileName)
  } catch (error) {
    console.error('하이라이트된 문서 생성 오류:', error)
    throw new Error('하이라이트된 문서 생성에 실패했습니다.')
  }
}

/**
 * Word 문서 생성
 */
const createHighlightedDocument = (
  result: ComparisonResult,
  modifiedFileName: string
): Document => {
  const sections = [
    // 제목
    new Paragraph({
      text: '문서 비교 결과 - 하이라이트된 수정 문서',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    }),

    // 안내 정보
    new Paragraph({
      children: [
        new TextRun({
          text: '📄 파일명: ',
          bold: true,
        }),
        new TextRun({ text: modifiedFileName }),
      ],
      spacing: { after: 100 },
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: '📅 비교 날짜: ',
          bold: true,
        }),
        new TextRun({
          text: result.comparisonDate
            ? new Date(result.comparisonDate).toLocaleString('ko-KR')
            : new Date().toLocaleString('ko-KR'),
        }),
      ],
      spacing: { after: 100 },
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: '💡 안내: ',
          bold: true,
        }),
        new TextRun({
          text: '노란색 음영은 원본 문서와 비교하여 변경된 부분을 나타냅니다.',
        }),
      ],
      spacing: { after: 300 },
    }),

    // 통계 테이블
    new Paragraph({
      text: '변경사항 통계',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
    }),

    createStatisticsTable(result.statistics),

    new Paragraph({
      text: '',
      spacing: { after: 300 },
    }),

    // 구분선
    new Paragraph({
      text: '─'.repeat(80),
      spacing: { before: 200, after: 200 },
    }),

    // 문서 내용 (하이라이트 적용)
    new Paragraph({
      text: '수정된 문서 내용 (변경 부분 하이라이트)',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 200 },
    }),
  ]

  // HTML 콘텐츠를 파싱하고 하이라이트 적용
  const contentParagraphs = createHighlightedContent(
    result.modifiedDocument.htmlContent || '',
    result.changes
  )
  sections.push(...contentParagraphs)

  // 범례 추가
  sections.push(
    new Paragraph({
      text: '',
      spacing: { before: 400 },
    }),
    new Paragraph({
      text: '─'.repeat(80),
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: '범례',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: '노란색 음영',
          highlight: 'yellow',
        }),
        new TextRun({ text: ': 원본 대비 변경된 부분 (추가, 삭제, 수정)' }),
      ],
      spacing: { after: 100 },
    })
  )

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
        new TableCell({
          children: [new Paragraph(String(statistics.totalChanges))],
        }),
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
        new TableCell({
          children: [new Paragraph(String(statistics.deleted))],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph('수정됨')] }),
        new TableCell({
          children: [new Paragraph(String(statistics.modified))],
        }),
      ],
    }),
  ]

  return new Table({
    rows,
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
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
 * 하이라이트가 적용된 문서 내용 생성
 */
const createHighlightedContent = (
  htmlContent: string,
  changes: Change[]
): Paragraph[] => {
  const paragraphs: Paragraph[] = []

  // HTML 파싱
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlContent, 'text/html')

  // 변경사항을 텍스트 위치 기반으로 매핑
  const changeMap = buildChangeMap(changes)

  // 문서의 각 요소를 처리
  const body = doc.body
  if (body) {
    processNode(body, paragraphs, changeMap)
  }

  // 내용이 없으면 기본 메시지
  if (paragraphs.length === 0) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '문서 내용을 불러올 수 없습니다.',
            italics: true,
          }),
        ],
      })
    )
  }

  return paragraphs
}

/**
 * 변경사항 맵 생성 (텍스트 내용을 키로 사용)
 */
const buildChangeMap = (changes: Change[]): Map<string, Change> => {
  const map = new Map<string, Change>()

  changes.forEach((change) => {
    // 변경된 텍스트를 키로 사용
    if (change.afterContent) {
      map.set(change.afterContent.trim(), change)
    }
    if (change.content) {
      map.set(change.content.trim(), change)
    }
  })

  return map
}

/**
 * DOM 노드 처리 (재귀적)
 */
const processNode = (
  node: Node,
  paragraphs: Paragraph[],
  changeMap: Map<string, Change>
): void => {
  if (node.nodeType === Node.TEXT_NODE) {
    // 텍스트 노드 처리
    const text = node.textContent?.trim()
    if (text) {
      const change = changeMap.get(text)
      const isChanged = !!change

      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: text,
              highlight: isChanged ? 'yellow' : undefined,
            }),
          ],
          spacing: { after: 100 },
        })
      )
    }
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as HTMLElement
    const tagName = element.tagName.toLowerCase()

    // 단락 요소
    if (tagName === 'p') {
      const textRuns = processTextWithHighlight(element, changeMap)
      if (textRuns.length > 0) {
        paragraphs.push(
          new Paragraph({
            children: textRuns,
            spacing: { after: 200 },
          })
        )
      }
    }
    // 제목 요소
    else if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
      const level = parseInt(tagName[1]) as 1 | 2 | 3 | 4 | 5 | 6
      const headingLevels = [
        HeadingLevel.HEADING_1,
        HeadingLevel.HEADING_2,
        HeadingLevel.HEADING_3,
        HeadingLevel.HEADING_4,
        HeadingLevel.HEADING_5,
        HeadingLevel.HEADING_6,
      ]

      const textRuns = processTextWithHighlight(element, changeMap)
      if (textRuns.length > 0) {
        paragraphs.push(
          new Paragraph({
            children: textRuns,
            heading: headingLevels[level - 1],
            spacing: { before: 300, after: 200 },
          })
        )
      }
    }
    // 표 요소
    else if (tagName === 'table') {
      // 표는 하이라이트 없이 그대로 표시
      const tableContent = element.textContent?.trim()
      if (tableContent) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `[표: ${tableContent.substring(0, 100)}...]`,
                italics: true,
              }),
            ],
            spacing: { before: 200, after: 200 },
          })
        )
      }
    }
    // 리스트 요소
    else if (tagName === 'li') {
      const textRuns = processTextWithHighlight(element, changeMap)
      if (textRuns.length > 0) {
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: '• ' }), ...textRuns],
            spacing: { after: 100 },
          })
        )
      }
    }
    // 자식 노드 재귀 처리
    else {
      node.childNodes.forEach((child) => {
        processNode(child, paragraphs, changeMap)
      })
    }
  }
}

/**
 * 텍스트를 하이라이트와 함께 처리
 */
const processTextWithHighlight = (
  element: HTMLElement,
  changeMap: Map<string, Change>
): TextRun[] => {
  const textRuns: TextRun[] = []
  const fullText = element.textContent?.trim() || ''

  if (!fullText) return textRuns

  // 전체 텍스트가 변경사항에 있는지 확인
  const change = changeMap.get(fullText)

  if (change) {
    // 전체가 변경된 경우
    textRuns.push(
      new TextRun({
        text: fullText,
        highlight: 'yellow',
        bold: element.querySelector('strong, b') !== null,
        italics: element.querySelector('em, i') !== null,
      })
    )
  } else {
    // 부분적으로 변경된 부분을 찾아서 하이라이트
    const words = fullText.split(/\s+/)
    let hasHighlight = false

    words.forEach((word, index) => {
      const wordChange = changeMap.get(word)
      const isHighlighted = !!wordChange

      if (isHighlighted) {
        hasHighlight = true
      }

      textRuns.push(
        new TextRun({
          text: word + (index < words.length - 1 ? ' ' : ''),
          highlight: isHighlighted ? 'yellow' : undefined,
          bold: element.querySelector('strong, b') !== null,
          italics: element.querySelector('em, i') !== null,
        })
      )
    })

    // 변경사항이 없으면 전체를 하나의 TextRun으로
    if (!hasHighlight) {
      textRuns.length = 0
      textRuns.push(
        new TextRun({
          text: fullText,
          bold: element.querySelector('strong, b') !== null,
          italics: element.querySelector('em, i') !== null,
        })
      )
    }
  }

  return textRuns
}
