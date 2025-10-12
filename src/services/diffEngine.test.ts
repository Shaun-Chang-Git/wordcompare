import { describe, it, expect } from 'vitest'
import {
  compareAtCharacterLevel,
  compareAtWordLevel,
  compareAtSentenceLevel,
  compareAtParagraphLevel,
  compareDocuments,
  calculateSimilarity,
} from './diffEngine'
import { DocumentFile, ComparisonOptions, ChangeType } from '../types'

describe('diffEngine', () => {
  describe('compareAtCharacterLevel', () => {
    it('문자 수준에서 추가된 텍스트를 감지해야 함', () => {
      const text1 = '안녕하세요'
      const text2 = '안녕하세요 반갑습니다'

      const changes = compareAtCharacterLevel(text1, text2)

      expect(changes.length).toBeGreaterThan(0)
      expect(changes.some(c => c.type === ChangeType.ADDED)).toBe(true)
    })

    it('문자 수준에서 삭제된 텍스트를 감지해야 함', () => {
      const text1 = '안녕하세요 반갑습니다'
      const text2 = '안녕하세요'

      const changes = compareAtCharacterLevel(text1, text2)

      expect(changes.length).toBeGreaterThan(0)
      expect(changes.some(c => c.type === ChangeType.DELETED)).toBe(true)
    })

    it('동일한 텍스트는 변경사항이 없어야 함', () => {
      const text1 = '안녕하세요'
      const text2 = '안녕하세요'

      const changes = compareAtCharacterLevel(text1, text2)

      expect(changes.length).toBe(0)
    })
  })

  describe('compareAtWordLevel', () => {
    it('단어 수준에서 추가된 단어를 감지해야 함', () => {
      const text1 = '안녕하세요 여러분'
      const text2 = '안녕하세요 친애하는 여러분'

      const changes = compareAtWordLevel(text1, text2)

      expect(changes.length).toBeGreaterThan(0)
      expect(changes.some(c => c.type === ChangeType.ADDED)).toBe(true)
    })

    it('단어 수준에서 삭제된 단어를 감지해야 함', () => {
      const text1 = '안녕하세요 친애하는 여러분'
      const text2 = '안녕하세요 여러분'

      const changes = compareAtWordLevel(text1, text2)

      expect(changes.length).toBeGreaterThan(0)
      expect(changes.some(c => c.type === ChangeType.DELETED)).toBe(true)
    })
  })

  describe('compareAtSentenceLevel', () => {
    it('문장 수준에서 추가된 문장을 감지해야 함', () => {
      const text1 = '첫 번째 문장입니다.'
      const text2 = '첫 번째 문장입니다. 두 번째 문장입니다.'

      const changes = compareAtSentenceLevel(text1, text2)

      expect(changes.length).toBeGreaterThan(0)
      expect(changes.some(c => c.type === ChangeType.ADDED)).toBe(true)
    })

    it('문장 수준에서 삭제된 문장을 감지해야 함', () => {
      const text1 = '첫 번째 문장입니다. 두 번째 문장입니다.'
      const text2 = '첫 번째 문장입니다.'

      const changes = compareAtSentenceLevel(text1, text2)

      expect(changes.length).toBeGreaterThan(0)
      expect(changes.some(c => c.type === ChangeType.DELETED)).toBe(true)
    })
  })

  describe('compareAtParagraphLevel', () => {
    it('단락 수준에서 추가된 단락을 감지해야 함', () => {
      const text1 = '첫 번째 단락\n\n두 번째 단락'
      const text2 = '첫 번째 단락\n\n두 번째 단락\n\n세 번째 단락'

      const changes = compareAtParagraphLevel(text1, text2)

      expect(changes.length).toBeGreaterThan(0)
      expect(changes.some(c => c.type === ChangeType.ADDED)).toBe(true)
    })

    it('단락 수준에서 삭제된 단락을 감지해야 함', () => {
      const text1 = '첫 번째 단락\n\n두 번째 단락\n\n세 번째 단락'
      const text2 = '첫 번째 단락\n\n두 번째 단락'

      const changes = compareAtParagraphLevel(text1, text2)

      expect(changes.length).toBeGreaterThan(0)
      expect(changes.some(c => c.type === ChangeType.DELETED)).toBe(true)
    })
  })

  describe('compareDocuments', () => {
    const createMockDocument = (name: string, content: string): DocumentFile => ({
      file: new File([], name),
      name,
      size: 1000,
      lastModified: new Date(),
      content,
      htmlContent: `<p>${content}</p>`,
    })

    it('두 문서를 비교하고 결과를 반환해야 함', () => {
      const original = createMockDocument('original.docx', '안녕하세요')
      const modified = createMockDocument('modified.docx', '안녕하세요 반갑습니다')
      const options: ComparisonOptions = {
        compareFormatting: true,
        caseSensitive: false,
        compareWhitespace: true,
        compareTables: true,
        compareHeadersFooters: true,
        compareFootnotes: true,
        compareFields: true,
        compareTextBoxes: true,
        compareComments: true,
        detailLevel: 'word',
        displayMode: 'sideBySide',
      }

      const result = compareDocuments(original, modified, options)

      expect(result).toBeDefined()
      expect(result.changes).toBeDefined()
      expect(result.statistics).toBeDefined()
      expect(result.statistics.totalChanges).toBeGreaterThan(0)
      expect(result.originalDocument).toBe(original)
      expect(result.modifiedDocument).toBe(modified)
      expect(result.comparisonDate).toBeInstanceOf(Date)
    })

    it('대소문자 구분 옵션을 적용해야 함', () => {
      const original = createMockDocument('original.docx', 'Hello')
      const modified = createMockDocument('modified.docx', 'hello')

      const sensitiveOptions: ComparisonOptions = {
        compareFormatting: true,
        caseSensitive: true,
        compareWhitespace: true,
        compareTables: true,
        compareHeadersFooters: true,
        compareFootnotes: true,
        compareFields: true,
        compareTextBoxes: true,
        compareComments: true,
        detailLevel: 'character',
        displayMode: 'sideBySide',
      }

      const insensitiveOptions: ComparisonOptions = {
        ...sensitiveOptions,
        caseSensitive: false,
      }

      const sensitiveResult = compareDocuments(original, modified, sensitiveOptions)
      const insensitiveResult = compareDocuments(original, modified, insensitiveOptions)

      expect(sensitiveResult.statistics.totalChanges).toBeGreaterThan(0)
      expect(insensitiveResult.statistics.totalChanges).toBe(0)
    })
  })

  describe('calculateSimilarity', () => {
    it('동일한 텍스트는 100% 유사도를 가져야 함', () => {
      const text1 = '안녕하세요'
      const text2 = '안녕하세요'

      const similarity = calculateSimilarity(text1, text2)

      expect(similarity).toBe(100)
    })

    it('완전히 다른 텍스트는 0%에 가까운 유사도를 가져야 함', () => {
      const text1 = '안녕하세요'
      const text2 = 'xyz123'

      const similarity = calculateSimilarity(text1, text2)

      expect(similarity).toBeLessThan(50)
    })

    it('부분적으로 유사한 텍스트는 중간 유사도를 가져야 함', () => {
      const text1 = '안녕하세요 여러분'
      const text2 = '안녕하세요 친구들'

      const similarity = calculateSimilarity(text1, text2)

      expect(similarity).toBeGreaterThan(30)
      expect(similarity).toBeLessThan(100)
    })
  })
})
