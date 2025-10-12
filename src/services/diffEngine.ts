import DiffMatchPatch from 'diff-match-patch'
import { Change, ChangeType, ComparisonResult, DocumentFile, ComparisonOptions } from '../types'

/**
 * 문서 비교 엔진
 * diff-match-patch 라이브러리를 사용하여 두 문서의 차이점을 분석
 */

const dmp = new DiffMatchPatch()

// Diff 타입 상수
const DIFF_DELETE = -1
const DIFF_INSERT = 1

/**
 * 문자 수준 비교
 */
export const compareAtCharacterLevel = (text1: string, text2: string): Change[] => {
  const diffs = dmp.diff_main(text1, text2)
  dmp.diff_cleanupSemantic(diffs) // 의미론적 정리

  const changes: Change[] = []
  let position = 0

  diffs.forEach((diff, index) => {
    const [operation, text] = diff

    if (operation === DIFF_DELETE) {
      changes.push({
        id: `change-${index}`,
        type: ChangeType.DELETED,
        content: text,
        beforeContent: text,
        position: {
          page: 1, // 실제로는 페이지 계산 필요
          paragraph: Math.floor(position / 100) + 1,
        },
      })
    } else if (operation === DIFF_INSERT) {
      changes.push({
        id: `change-${index}`,
        type: ChangeType.ADDED,
        content: text,
        afterContent: text,
        position: {
          page: 1,
          paragraph: Math.floor(position / 100) + 1,
        },
      })
    }

    if (operation !== DIFF_INSERT) {
      position += text.length
    }
  })

  return changes
}

/**
 * 단어 수준 비교
 */
export const compareAtWordLevel = (text1: string, text2: string): Change[] => {
  // 단어 단위로 분리
  const words1 = text1.split(/\s+/)
  const words2 = text2.split(/\s+/)

  // 단어 배열을 문자열로 변환 (각 단어를 유니크 문자로 매핑)
  const wordMap: Map<string, string> = new Map()
  let charCode = 0

  const mapWords = (words: string[]): string => {
    return words
      .map((word) => {
        if (!wordMap.has(word)) {
          wordMap.set(word, String.fromCharCode(charCode++))
        }
        return wordMap.get(word)!
      })
      .join('')
  }

  const mapped1 = mapWords(words1)
  const mapped2 = mapWords(words2)

  // diff 실행
  const diffs = dmp.diff_main(mapped1, mapped2)
  dmp.diff_cleanupSemantic(diffs)

  // 역매핑
  const reverseMap = new Map(Array.from(wordMap.entries()).map(([k, v]) => [v, k]))

  const changes: Change[] = []
  let wordPosition = 0

  diffs.forEach((diff, index) => {
    const [operation, mappedText] = diff
    const words = mappedText.split('').map((char) => reverseMap.get(char) || '')

    if (operation === DIFF_DELETE) {
      changes.push({
        id: `change-${index}`,
        type: ChangeType.DELETED,
        content: words.join(' '),
        beforeContent: words.join(' '),
        position: {
          page: 1,
          paragraph: Math.floor(wordPosition / 50) + 1,
        },
      })
    } else if (operation === DIFF_INSERT) {
      changes.push({
        id: `change-${index}`,
        type: ChangeType.ADDED,
        content: words.join(' '),
        afterContent: words.join(' '),
        position: {
          page: 1,
          paragraph: Math.floor(wordPosition / 50) + 1,
        },
      })
    }

    if (operation !== DIFF_INSERT) {
      wordPosition += words.length
    }
  })

  return changes
}

/**
 * 문장 수준 비교
 */
export const compareAtSentenceLevel = (text1: string, text2: string): Change[] => {
  // 문장 분리 (마침표, 느낌표, 물음표 기준)
  const sentences1 = text1.split(/[.!?]\s+/).filter((s) => s.trim().length > 0)
  const sentences2 = text2.split(/[.!?]\s+/).filter((s) => s.trim().length > 0)

  const changes: Change[] = []

  // 간단한 LCS 기반 비교
  const maxLen = Math.max(sentences1.length, sentences2.length)

  for (let i = 0; i < maxLen; i++) {
    const sent1 = sentences1[i]
    const sent2 = sentences2[i]

    if (sent1 && !sent2) {
      changes.push({
        id: `change-${i}`,
        type: ChangeType.DELETED,
        content: sent1,
        beforeContent: sent1,
        position: { page: 1, paragraph: i + 1 },
      })
    } else if (!sent1 && sent2) {
      changes.push({
        id: `change-${i}`,
        type: ChangeType.ADDED,
        content: sent2,
        afterContent: sent2,
        position: { page: 1, paragraph: i + 1 },
      })
    } else if (sent1 && sent2 && sent1 !== sent2) {
      changes.push({
        id: `change-${i}`,
        type: ChangeType.MODIFIED,
        content: sent2,
        beforeContent: sent1,
        afterContent: sent2,
        position: { page: 1, paragraph: i + 1 },
      })
    }
  }

  return changes
}

/**
 * 단락 수준 비교
 */
export const compareAtParagraphLevel = (text1: string, text2: string): Change[] => {
  // 단락 분리 (빈 줄 기준)
  const paragraphs1 = text1.split(/\n\s*\n/).filter((p) => p.trim().length > 0)
  const paragraphs2 = text2.split(/\n\s*\n/).filter((p) => p.trim().length > 0)

  const changes: Change[] = []
  const maxLen = Math.max(paragraphs1.length, paragraphs2.length)

  for (let i = 0; i < maxLen; i++) {
    const para1 = paragraphs1[i]
    const para2 = paragraphs2[i]

    if (para1 && !para2) {
      changes.push({
        id: `change-${i}`,
        type: ChangeType.DELETED,
        content: para1,
        beforeContent: para1,
        position: { page: 1, paragraph: i + 1 },
      })
    } else if (!para1 && para2) {
      changes.push({
        id: `change-${i}`,
        type: ChangeType.ADDED,
        content: para2,
        afterContent: para2,
        position: { page: 1, paragraph: i + 1 },
      })
    } else if (para1 && para2 && para1.trim() !== para2.trim()) {
      changes.push({
        id: `change-${i}`,
        type: ChangeType.MODIFIED,
        content: para2,
        beforeContent: para1,
        afterContent: para2,
        position: { page: 1, paragraph: i + 1 },
      })
    }
  }

  return changes
}

/**
 * 비교 옵션에 따라 적절한 비교 수준 선택
 */
const selectComparisonLevel = (
  text1: string,
  text2: string,
  options: ComparisonOptions
): Change[] => {
  switch (options.detailLevel) {
    case 'character':
      return compareAtCharacterLevel(text1, text2)
    case 'word':
      return compareAtWordLevel(text1, text2)
    case 'sentence':
      return compareAtSentenceLevel(text1, text2)
    case 'paragraph':
      return compareAtParagraphLevel(text1, text2)
    default:
      return compareAtCharacterLevel(text1, text2)
  }
}

/**
 * 두 문서를 비교하여 변경사항 반환
 */
export const compareDocuments = (
  original: DocumentFile,
  modified: DocumentFile,
  options: ComparisonOptions
): ComparisonResult => {
  const text1 = original.content || ''
  const text2 = modified.content || ''

  // 옵션에 따른 전처리
  let processedText1 = text1
  let processedText2 = text2

  // 대소문자 무시
  if (!options.caseSensitive) {
    processedText1 = processedText1.toLowerCase()
    processedText2 = processedText2.toLowerCase()
  }

  // 공백 무시
  if (!options.compareWhitespace) {
    processedText1 = processedText1.replace(/\s+/g, ' ')
    processedText2 = processedText2.replace(/\s+/g, ' ')
  }

  // 비교 수행
  const changes = selectComparisonLevel(processedText1, processedText2, options)

  // 통계 계산
  const statistics = {
    totalChanges: changes.length,
    added: changes.filter((c) => c.type === ChangeType.ADDED).length,
    deleted: changes.filter((c) => c.type === ChangeType.DELETED).length,
    modified: changes.filter((c) => c.type === ChangeType.MODIFIED).length,
    moved: changes.filter((c) => c.type === ChangeType.MOVED).length,
    formatChanged: changes.filter((c) => c.type === ChangeType.FORMAT_CHANGED).length,
  }

  return {
    changes,
    statistics,
    originalDocument: original,
    modifiedDocument: modified,
    comparisonDate: new Date(),
  }
}

/**
 * 유사도 계산 (0-100%)
 */
export const calculateSimilarity = (text1: string, text2: string): number => {
  const diffs = dmp.diff_main(text1, text2)
  const levenshtein = dmp.diff_levenshtein(diffs)
  const maxLength = Math.max(text1.length, text2.length)

  if (maxLength === 0) return 100

  const similarity = ((maxLength - levenshtein) / maxLength) * 100
  return Math.round(similarity * 100) / 100
}
