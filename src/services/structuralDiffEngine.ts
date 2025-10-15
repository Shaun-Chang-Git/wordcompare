/**
 * 구조 기반 문서 비교 엔진
 *
 * DOCX의 내부 구조(단락, 런, 서식, 표)를 기반으로 정확한 비교를 수행합니다.
 * 기존의 단순 텍스트 비교 방식의 한계를 극복합니다.
 */

import {
  ParsedDocxStructure,
  Paragraph,
  TextRun,
  Table,
  paragraphToText,
} from './docxStructureParser'
import {
  Change,
  ChangeType,
  ComparisonResult,
  DocumentFile,
  ComparisonOptions,
} from '../types'
import { distance } from 'fastest-levenshtein'

/**
 * 구조 기반 문서 비교
 */
export const compareDocumentsStructural = async (
  original: DocumentFile,
  modified: DocumentFile,
  originalStructure: ParsedDocxStructure,
  modifiedStructure: ParsedDocxStructure,
  options: ComparisonOptions
): Promise<ComparisonResult> => {
  const changes: Change[] = []

  // 1. 단락 레벨 비교
  const paragraphChanges = compareParagraphsStructural(
    originalStructure.paragraphs,
    modifiedStructure.paragraphs,
    options
  )
  changes.push(...paragraphChanges)

  // 2. 표 레벨 비교
  const tableChanges = compareTablesStructural(
    originalStructure.tables,
    modifiedStructure.tables
  )
  changes.push(...tableChanges)

  // 3. 통계 계산
  const statistics = calculateStatistics(changes)

  return {
    changes,
    statistics,
    originalDocument: original,
    modifiedDocument: modified,
    comparisonDate: new Date(),
  }
}

/**
 * 단락 레벨 비교 (LCS 알고리즘 사용)
 */
const compareParagraphsStructural = (
  originalParagraphs: Paragraph[],
  modifiedParagraphs: Paragraph[],
  options: ComparisonOptions
): Change[] => {
  const changes: Change[] = []

  // LCS (Longest Common Subsequence) 알고리즘으로 단락 매칭
  const lcs = findLCS(originalParagraphs, modifiedParagraphs, options)

  let origIndex = 0
  let modIndex = 0
  let changeIndex = 0

  for (const match of lcs) {
    // LCS 이전의 단락들 처리
    while (origIndex < match.origIndex) {
      // 삭제된 단락
      const paragraph = originalParagraphs[origIndex]
      const text = paragraphToText(paragraph)

      if (text.trim()) {
        changes.push({
          id: `change-${changeIndex++}`,
          type: ChangeType.DELETED,
          content: text,
          beforeContent: text,
          position: {
            page: 1,
            paragraph: origIndex + 1,
          },
        })
      }
      origIndex++
    }

    while (modIndex < match.modIndex) {
      // 추가된 단락
      const paragraph = modifiedParagraphs[modIndex]
      const text = paragraphToText(paragraph)

      if (text.trim()) {
        changes.push({
          id: `change-${changeIndex++}`,
          type: ChangeType.ADDED,
          content: text,
          afterContent: text,
          position: {
            page: 1,
            paragraph: modIndex + 1,
          },
        })
      }
      modIndex++
    }

    // 매칭된 단락 내부 비교 (런 레벨)
    const origParagraph = originalParagraphs[match.origIndex]
    const modParagraph = modifiedParagraphs[match.modIndex]

    const paragraphInternalChanges = compareParagraphRuns(
      origParagraph,
      modParagraph,
      modIndex,
      changeIndex
    )
    changes.push(...paragraphInternalChanges)
    changeIndex += paragraphInternalChanges.length

    origIndex++
    modIndex++
  }

  // 나머지 단락들 처리
  while (origIndex < originalParagraphs.length) {
    const paragraph = originalParagraphs[origIndex]
    const text = paragraphToText(paragraph)

    if (text.trim()) {
      changes.push({
        id: `change-${changeIndex++}`,
        type: ChangeType.DELETED,
        content: text,
        beforeContent: text,
        position: {
          page: 1,
          paragraph: origIndex + 1,
        },
      })
    }
    origIndex++
  }

  while (modIndex < modifiedParagraphs.length) {
    const paragraph = modifiedParagraphs[modIndex]
    const text = paragraphToText(paragraph)

    if (text.trim()) {
      changes.push({
        id: `change-${changeIndex++}`,
        type: ChangeType.ADDED,
        content: text,
        afterContent: text,
        position: {
          page: 1,
          paragraph: modIndex + 1,
        },
      })
    }
    modIndex++
  }

  return changes
}

/**
 * LCS (Longest Common Subsequence) 찾기
 */
interface LCSMatch {
  origIndex: number
  modIndex: number
}

const findLCS = (
  originalParagraphs: Paragraph[],
  modifiedParagraphs: Paragraph[],
  options: ComparisonOptions
): LCSMatch[] => {
  const m = originalParagraphs.length
  const n = modifiedParagraphs.length

  // DP 테이블 생성
  const dp: number[][] = Array(m + 1)
    .fill(0)
    .map(() => Array(n + 1).fill(0))

  // LCS 길이 계산
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (
        areParagraphsSimilar(
          originalParagraphs[i - 1],
          modifiedParagraphs[j - 1],
          options
        )
      ) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  // LCS 역추적
  const matches: LCSMatch[] = []
  let i = m
  let j = n

  while (i > 0 && j > 0) {
    if (
      areParagraphsSimilar(
        originalParagraphs[i - 1],
        modifiedParagraphs[j - 1],
        options
      )
    ) {
      matches.unshift({ origIndex: i - 1, modIndex: j - 1 })
      i--
      j--
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--
    } else {
      j--
    }
  }

  return matches
}

/**
 * 두 단락이 유사한지 판단
 */
const areParagraphsSimilar = (
  p1: Paragraph,
  p2: Paragraph,
  options: ComparisonOptions
): boolean => {
  let text1 = paragraphToText(p1)
  let text2 = paragraphToText(p2)

  // 옵션 적용
  if (!options.caseSensitive) {
    text1 = text1.toLowerCase()
    text2 = text2.toLowerCase()
  }

  if (!options.compareWhitespace) {
    text1 = text1.replace(/\s+/g, ' ').trim()
    text2 = text2.replace(/\s+/g, ' ').trim()
  }

  // 완전 일치 확인
  if (text1 === text2) {
    return true
  }

  // 유사도 기반 판단 (90% 이상 유사하면 같은 단락으로 간주)
  if (text1.length === 0 || text2.length === 0) {
    return false
  }

  const maxLen = Math.max(text1.length, text2.length)
  const dist = distance(text1, text2)
  const similarity = 1 - dist / maxLen

  return similarity >= 0.9
}

/**
 * 단락 내부의 런 레벨 비교
 */
const compareParagraphRuns = (
  origParagraph: Paragraph,
  modParagraph: Paragraph,
  paragraphIndex: number,
  startChangeIndex: number
  // options: ComparisonOptions // 향후 사용을 위해 보류
): Change[] => {
  const changes: Change[] = []
  let changeIndex = startChangeIndex

  const origText = paragraphToText(origParagraph)
  const modText = paragraphToText(modParagraph)

  // 텍스트가 동일하면 서식만 비교
  if (origText === modText) {
    const formatChanges = compareFormatting(
      origParagraph,
      modParagraph,
      paragraphIndex,
      changeIndex
    )
    changes.push(...formatChanges)
    return changes
  }

  // 텍스트가 다르면 수정으로 처리
  if (origText.trim() && modText.trim() && origText !== modText) {
    changes.push({
      id: `change-${changeIndex++}`,
      type: ChangeType.MODIFIED,
      content: modText,
      beforeContent: origText,
      afterContent: modText,
      position: {
        page: 1,
        paragraph: paragraphIndex + 1,
      },
    })
  }

  return changes
}

/**
 * 서식 변경 비교
 */
const compareFormatting = (
  origParagraph: Paragraph,
  modParagraph: Paragraph,
  paragraphIndex: number,
  startChangeIndex: number
): Change[] => {
  const changes: Change[] = []

  // 각 런의 서식 비교
  const maxRuns = Math.max(origParagraph.runs.length, modParagraph.runs.length)

  for (let i = 0; i < maxRuns; i++) {
    const origRun = origParagraph.runs[i]
    const modRun = modParagraph.runs[i]

    if (!origRun || !modRun) continue
    if (origRun.text !== modRun.text) continue

    // 서식 비교
    if (!areFormattingsEqual(origRun.formatting, modRun.formatting)) {
      const formatDesc = describeFormattingChange(
        origRun.formatting,
        modRun.formatting
      )

      changes.push({
        id: `change-${startChangeIndex + changes.length}`,
        type: ChangeType.FORMAT_CHANGED,
        content: `"${origRun.text}" - ${formatDesc}`,
        beforeContent: origRun.text,
        afterContent: origRun.text,
        position: {
          page: 1,
          paragraph: paragraphIndex + 1,
        },
      })
    }
  }

  return changes
}

/**
 * 서식이 동일한지 비교
 */
const areFormattingsEqual = (
  f1: TextRun['formatting'],
  f2: TextRun['formatting']
): boolean => {
  return (
    f1.bold === f2.bold &&
    f1.italic === f2.italic &&
    f1.underline === f2.underline &&
    f1.strike === f2.strike &&
    f1.color === f2.color &&
    f1.fontSize === f2.fontSize &&
    f1.highlight === f2.highlight
  )
}

/**
 * 서식 변경 설명
 */
const describeFormattingChange = (
  oldFormat: TextRun['formatting'],
  newFormat: TextRun['formatting']
): string => {
  const changes: string[] = []

  if (oldFormat.bold !== newFormat.bold) {
    changes.push(newFormat.bold ? '굵게 적용' : '굵게 해제')
  }
  if (oldFormat.italic !== newFormat.italic) {
    changes.push(newFormat.italic ? '기울임 적용' : '기울임 해제')
  }
  if (oldFormat.underline !== newFormat.underline) {
    changes.push(newFormat.underline ? '밑줄 적용' : '밑줄 해제')
  }
  if (oldFormat.color !== newFormat.color) {
    changes.push(`색상 변경 (${oldFormat.color} → ${newFormat.color})`)
  }
  if (oldFormat.fontSize !== newFormat.fontSize) {
    changes.push(`크기 변경 (${oldFormat.fontSize}pt → ${newFormat.fontSize}pt)`)
  }

  return changes.join(', ')
}

/**
 * 표 레벨 비교
 */
const compareTablesStructural = (
  originalTables: Table[],
  modifiedTables: Table[],
  // options: ComparisonOptions // 향후 사용을 위해 보류
): Change[] => {
  const changes: Change[] = []
  let changeIndex = 0

  // 간단한 표 비교 (개수 기반)
  const maxTables = Math.max(originalTables.length, modifiedTables.length)

  for (let i = 0; i < maxTables; i++) {
    const origTable = originalTables[i]
    const modTable = modifiedTables[i]

    if (!origTable && modTable) {
      // 표 추가됨
      changes.push({
        id: `change-${changeIndex++}`,
        type: ChangeType.ADDED,
        content: `표 추가됨 (${modTable.rows.length}행)`,
        afterContent: `표 ${i + 1}`,
        position: {
          page: 1,
          paragraph: i + 1,
        },
      })
    } else if (origTable && !modTable) {
      // 표 삭제됨
      changes.push({
        id: `change-${changeIndex++}`,
        type: ChangeType.DELETED,
        content: `표 삭제됨 (${origTable.rows.length}행)`,
        beforeContent: `표 ${i + 1}`,
        position: {
          page: 1,
          paragraph: i + 1,
        },
      })
    } else if (origTable && modTable) {
      // 표 구조 변경 확인
      if (origTable.rows.length !== modTable.rows.length) {
        changes.push({
          id: `change-${changeIndex++}`,
          type: ChangeType.MODIFIED,
          content: `표 행 개수 변경 (${origTable.rows.length} → ${modTable.rows.length})`,
          beforeContent: `${origTable.rows.length}행`,
          afterContent: `${modTable.rows.length}행`,
          position: {
            page: 1,
            paragraph: i + 1,
          },
        })
      }
    }
  }

  return changes
}

/**
 * 통계 계산
 */
const calculateStatistics = (changes: Change[]) => {
  return {
    totalChanges: changes.length,
    added: changes.filter((c) => c.type === ChangeType.ADDED).length,
    deleted: changes.filter((c) => c.type === ChangeType.DELETED).length,
    modified: changes.filter((c) => c.type === ChangeType.MODIFIED).length,
    moved: changes.filter((c) => c.type === ChangeType.MOVED).length,
    formatChanged: changes.filter((c) => c.type === ChangeType.FORMAT_CHANGED)
      .length,
  }
}
