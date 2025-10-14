import {
  Paragraph,
  TextRun,
  Table,
  TableCell,
  TableRow,
  ImageRun,
  WidthType,
  BorderStyle,
  AlignmentType,
} from 'docx'

/**
 * HTML을 Word 요소로 변환하는 서비스
 * mammoth로 파싱된 HTML을 docx 요소로 변환
 */

/**
 * HTML 문자열을 Word Paragraph 배열로 변환
 */
export const convertHtmlToWordElements = async (html: string): Promise<any[]> => {
  const elements: any[] = []

  try {
    // HTML 파싱
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const body = doc.body

    // 각 자식 요소를 변환
    for (const child of Array.from(body.children)) {
      const converted = await convertElementToWord(child as HTMLElement)
      if (converted) {
        if (Array.isArray(converted)) {
          elements.push(...converted)
        } else {
          elements.push(converted)
        }
      }
    }
  } catch (error) {
    console.error('HTML 변환 오류:', error)
    // 오류 발생 시 기본 텍스트로 처리
    elements.push(new Paragraph({ text: html.replace(/<[^>]*>/g, '') }))
  }

  return elements.length > 0 ? elements : [new Paragraph({ text: '' })]
}

/**
 * HTML 요소를 Word 요소로 변환
 */
const convertElementToWord = async (element: HTMLElement): Promise<any | any[] | null> => {
  const tagName = element.tagName.toLowerCase()

  switch (tagName) {
    case 'p':
      return convertParagraph(element)
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return convertHeading(element)
    case 'table':
      return convertTable(element)
    case 'img':
      return await convertImage(element)
    case 'ul':
    case 'ol':
      return convertList(element)
    case 'br':
      return new Paragraph({ text: '' })
    case 'div':
      // div는 재귀적으로 자식 처리
      return await convertChildren(element)
    default:
      // 기타 요소는 텍스트로 처리
      return convertParagraph(element)
  }
}

/**
 * 단락 변환
 */
const convertParagraph = (element: HTMLElement): Paragraph => {
  const runs: TextRun[] = []
  processTextNode(element, runs)

  return new Paragraph({
    children: runs.length > 0 ? runs : [new TextRun({ text: '' })],
    spacing: { after: 100 },
  })
}

/**
 * 제목 변환
 */
const convertHeading = (element: HTMLElement): Paragraph => {
  const runs: TextRun[] = []
  processTextNode(element, runs)

  return new Paragraph({
    children: runs.length > 0 ? runs : [new TextRun({ text: '' })],
    spacing: { before: 200, after: 100 },
  })
}

/**
 * 텍스트 노드 처리 (굵게, 기울임 등)
 */
const processTextNode = (node: Node, runs: TextRun[]): void => {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent || ''
    if (text.trim()) {
      runs.push(new TextRun({ text }))
    }
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as HTMLElement
    const tagName = element.tagName.toLowerCase()
    const text = element.textContent || ''

    if (!text.trim()) return

    const runOptions: any = { text }

    // 스타일 적용
    if (tagName === 'strong' || tagName === 'b') {
      runOptions.bold = true
    }
    if (tagName === 'em' || tagName === 'i') {
      runOptions.italics = true
    }
    if (tagName === 'u') {
      runOptions.underline = {}
    }
    if (tagName === 's' || tagName === 'strike' || tagName === 'del') {
      runOptions.strike = true
    }

    // 자식이 있으면 재귀 처리
    if (element.children.length > 0) {
      for (const child of Array.from(element.childNodes)) {
        processTextNode(child, runs)
      }
    } else {
      runs.push(new TextRun(runOptions))
    }
  }
}

/**
 * 테이블 변환
 */
const convertTable = (tableElement: HTMLElement): Table => {
  const rows: TableRow[] = []

  // tbody 또는 직접 tr 찾기
  const tbody = tableElement.querySelector('tbody') || tableElement
  const trs = Array.from(tbody.querySelectorAll('tr'))

  for (const tr of trs) {
    const cells: TableCell[] = []
    const tds = Array.from(tr.querySelectorAll('td, th'))

    for (const td of tds) {
      const text = td.textContent || ''
      const isHeader = td.tagName.toLowerCase() === 'th'

      cells.push(
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text,
                  bold: isHeader,
                }),
              ],
            }),
          ],
          width: { size: 100 / tds.length, type: WidthType.PERCENTAGE },
        })
      )
    }

    if (cells.length > 0) {
      rows.push(new TableRow({ children: cells }))
    }
  }

  return new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    },
  })
}

/**
 * 이미지 변환
 */
const convertImage = async (imgElement: HTMLElement): Promise<Paragraph> => {
  const src = imgElement.getAttribute('src') || ''

  // base64 이미지만 처리
  if (src.startsWith('data:image/')) {
    try {
      // base64 데이터 추출
      const base64Data = src.split(',')[1]
      const imageBuffer = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0))

      return new Paragraph({
        children: [
          new ImageRun({
            data: imageBuffer,
            transformation: {
              width: 400,
              height: 300,
            },
            type: 'png',
          } as any), // docx 라이브러리 타입 이슈로 인한 임시 처리
        ],
        spacing: { before: 100, after: 100 },
        alignment: AlignmentType.CENTER,
      })
    } catch (error) {
      console.error('이미지 변환 오류:', error)
      return new Paragraph({
        text: '[이미지]',
        spacing: { before: 100, after: 100 },
      })
    }
  }

  return new Paragraph({
    text: '[이미지]',
    spacing: { before: 100, after: 100 },
  })
}

/**
 * 리스트 변환
 */
const convertList = (listElement: HTMLElement): Paragraph[] => {
  const paragraphs: Paragraph[] = []
  const items = Array.from(listElement.querySelectorAll('li'))
  const isOrdered = listElement.tagName.toLowerCase() === 'ol'

  items.forEach((li, index) => {
    const text = li.textContent || ''
    const bullet = isOrdered ? `${index + 1}. ` : '• '

    paragraphs.push(
      new Paragraph({
        text: bullet + text,
        spacing: { after: 50 },
      })
    )
  })

  return paragraphs
}

/**
 * 자식 요소들을 재귀적으로 변환
 */
const convertChildren = async (element: HTMLElement): Promise<any[]> => {
  const elements: any[] = []

  for (const child of Array.from(element.children)) {
    const converted = await convertElementToWord(child as HTMLElement)
    if (converted) {
      if (Array.isArray(converted)) {
        elements.push(...converted)
      } else {
        elements.push(converted)
      }
    }
  }

  return elements
}
