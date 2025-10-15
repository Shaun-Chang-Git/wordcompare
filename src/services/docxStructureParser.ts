/**
 * DOCX 구조 파싱 서비스
 *
 * docx4js를 사용하여 DOCX 파일의 내부 구조(단락, 런, 서식, 표 등)를 파싱합니다.
 * 이를 통해 텍스트뿐만 아니라 서식, 구조 정보를 보존하여 정확한 비교가 가능합니다.
 */

import JSZip from 'jszip'

/**
 * 텍스트 런 (서식이 적용된 텍스트 단위)
 */
export interface TextRun {
  text: string
  formatting: {
    bold?: boolean
    italic?: boolean
    underline?: boolean
    strike?: boolean
    color?: string
    fontSize?: number
    fontFamily?: string
    highlight?: string
  }
}

/**
 * 단락 (여러 런으로 구성)
 */
export interface Paragraph {
  id: string
  runs: TextRun[]
  style?: string
  alignment?: string
  indentation?: {
    left?: number
    right?: number
    firstLine?: number
  }
  spacing?: {
    before?: number
    after?: number
    line?: number
  }
  numbering?: {
    level: number
    numId: number
  }
}

/**
 * 표 셀
 */
export interface TableCell {
  content: Paragraph[]
  gridSpan?: number
  rowSpan?: number
}

/**
 * 표 행
 */
export interface TableRow {
  cells: TableCell[]
}

/**
 * 표
 */
export interface Table {
  id: string
  rows: TableRow[]
  style?: string
}

/**
 * 파싱된 DOCX 문서 구조
 */
export interface ParsedDocxStructure {
  paragraphs: Paragraph[]
  tables: Table[]
  sections: Section[]
}

/**
 * 섹션
 */
export interface Section {
  id: string
  elements: (Paragraph | Table)[]
}

/**
 * DOCX 파일에서 구조 추출
 */
export const parseDocxStructure = async (
  file: File
): Promise<ParsedDocxStructure> => {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const zip = await JSZip.loadAsync(arrayBuffer)

    // word/document.xml 읽기
    const documentXml = await zip.file('word/document.xml')?.async('string')
    if (!documentXml) {
      throw new Error('document.xml을 찾을 수 없습니다.')
    }

    // styles.xml 읽기 (선택적, 향후 사용)
    // const stylesXml = await zip.file('word/styles.xml')?.async('string')

    // XML 파싱
    const parser = new DOMParser()
    const doc = parser.parseFromString(documentXml, 'text/xml')

    // 구조 추출
    const structure = extractStructure(doc)

    return structure
  } catch (error) {
    console.error('DOCX 구조 파싱 오류:', error)
    throw new Error('DOCX 파일 구조를 파싱할 수 없습니다.')
  }
}

/**
 * XML 문서에서 구조 추출
 */
const extractStructure = (doc: Document): ParsedDocxStructure => {
  const body = doc.getElementsByTagName('w:body')[0]
  if (!body) {
    throw new Error('문서 본문을 찾을 수 없습니다.')
  }

  const paragraphs: Paragraph[] = []
  const tables: Table[] = []
  const sections: Section[] = []

  let paragraphIndex = 0
  let tableIndex = 0

  // body의 자식 요소들 순회
  Array.from(body.children).forEach((element) => {
    const tagName = element.tagName

    if (tagName === 'w:p') {
      // 단락 파싱
      const paragraph = parseParagraph(element, `p-${paragraphIndex++}`)
      paragraphs.push(paragraph)
    } else if (tagName === 'w:tbl') {
      // 표 파싱
      const table = parseTable(element, `tbl-${tableIndex++}`)
      tables.push(table)
    }
  })

  // 기본 섹션 생성 (단순화)
  const mainSection: Section = {
    id: 'section-0',
    elements: [
      ...paragraphs.map((p) => p as Paragraph | Table),
      ...tables.map((t) => t as Paragraph | Table),
    ],
  }
  sections.push(mainSection)

  return { paragraphs, tables, sections }
}

/**
 * 단락 파싱
 */
const parseParagraph = (element: Element, id: string): Paragraph => {
  const runs: TextRun[] = []

  // w:r (run) 요소들 추출
  const runElements = element.getElementsByTagName('w:r')

  Array.from(runElements).forEach((runElement) => {
    const run = parseRun(runElement)
    if (run.text) {
      runs.push(run)
    }
  })

  // 단락 속성 파싱
  const pPr = element.getElementsByTagName('w:pPr')[0]
  let style: string | undefined
  let alignment: string | undefined

  if (pPr) {
    const pStyle = pPr.getElementsByTagName('w:pStyle')[0]
    if (pStyle) {
      style = pStyle.getAttribute('w:val') || undefined
    }

    const jc = pPr.getElementsByTagName('w:jc')[0]
    if (jc) {
      alignment = jc.getAttribute('w:val') || undefined
    }
  }

  return {
    id,
    runs,
    style,
    alignment,
  }
}

/**
 * 런 파싱 (서식이 적용된 텍스트)
 */
const parseRun = (element: Element): TextRun => {
  // 텍스트 추출
  const textElements = element.getElementsByTagName('w:t')
  let text = ''
  Array.from(textElements).forEach((t) => {
    text += t.textContent || ''
  })

  // 탭, 줄바꿈 등 추가
  const tabElements = element.getElementsByTagName('w:tab')
  if (tabElements.length > 0) {
    text += '\t'
  }

  const brElements = element.getElementsByTagName('w:br')
  if (brElements.length > 0) {
    text += '\n'
  }

  // 서식 정보 추출
  const formatting: TextRun['formatting'] = {}
  const rPr = element.getElementsByTagName('w:rPr')[0]

  if (rPr) {
    // Bold
    if (rPr.getElementsByTagName('w:b')[0]) {
      formatting.bold = true
    }

    // Italic
    if (rPr.getElementsByTagName('w:i')[0]) {
      formatting.italic = true
    }

    // Underline
    const u = rPr.getElementsByTagName('w:u')[0]
    if (u) {
      formatting.underline = true
    }

    // Strike
    if (rPr.getElementsByTagName('w:strike')[0]) {
      formatting.strike = true
    }

    // Color
    const color = rPr.getElementsByTagName('w:color')[0]
    if (color) {
      const val = color.getAttribute('w:val')
      if (val && val !== 'auto') {
        formatting.color = '#' + val
      }
    }

    // Font size
    const sz = rPr.getElementsByTagName('w:sz')[0]
    if (sz) {
      const val = sz.getAttribute('w:val')
      if (val) {
        formatting.fontSize = parseInt(val) / 2 // half-points to points
      }
    }

    // Font family
    const rFonts = rPr.getElementsByTagName('w:rFonts')[0]
    if (rFonts) {
      const ascii = rFonts.getAttribute('w:ascii')
      if (ascii) {
        formatting.fontFamily = ascii
      }
    }

    // Highlight
    const highlight = rPr.getElementsByTagName('w:highlight')[0]
    if (highlight) {
      const val = highlight.getAttribute('w:val')
      if (val) {
        formatting.highlight = val
      }
    }
  }

  return { text, formatting }
}

/**
 * 표 파싱
 */
const parseTable = (element: Element, id: string): Table => {
  const rows: TableRow[] = []

  // w:tr (table row) 요소들 추출
  const rowElements = element.getElementsByTagName('w:tr')

  Array.from(rowElements).forEach((rowElement) => {
    const cells: TableCell[] = []

    // w:tc (table cell) 요소들 추출
    const cellElements = rowElement.getElementsByTagName('w:tc')

    Array.from(cellElements).forEach((cellElement) => {
      const cellParagraphs: Paragraph[] = []

      // 셀 내부의 단락들 파싱
      const pElements = cellElement.getElementsByTagName('w:p')
      Array.from(pElements).forEach((pElement, pIndex) => {
        const paragraph = parseParagraph(pElement, `${id}-cell-p-${pIndex}`)
        cellParagraphs.push(paragraph)
      })

      cells.push({
        content: cellParagraphs,
      })
    })

    rows.push({ cells })
  })

  return { id, rows }
}

/**
 * 단락을 텍스트로 변환 (디버깅/로깅용)
 */
export const paragraphToText = (paragraph: Paragraph): string => {
  return paragraph.runs.map((run) => run.text).join('')
}

/**
 * 표를 텍스트로 변환 (디버깅/로깅용)
 */
export const tableToText = (table: Table): string => {
  return table.rows
    .map((row) =>
      row.cells
        .map((cell) => cell.content.map(paragraphToText).join('\n'))
        .join(' | ')
    )
    .join('\n')
}

/**
 * 전체 구조를 텍스트로 변환 (디버깅/로깅용)
 */
export const structureToText = (structure: ParsedDocxStructure): string => {
  const paragraphTexts = structure.paragraphs.map(paragraphToText)
  const tableTexts = structure.tables.map(tableToText)
  return [...paragraphTexts, ...tableTexts].join('\n\n')
}
