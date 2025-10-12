import { describe, it, expect } from 'vitest'
import { generateSummaryReport } from './exportService'
import { ComparisonResult, ChangeType } from '../types'

describe('exportService', () => {
  const createMockResult = (): ComparisonResult => ({
    changes: [
      {
        id: '1',
        type: ChangeType.ADDED,
        content: '추가된 내용입니다',
        position: { page: 1, paragraph: 1 },
      },
      {
        id: '2',
        type: ChangeType.DELETED,
        content: '삭제된 내용입니다',
        position: { page: 1, paragraph: 2 },
      },
      {
        id: '3',
        type: ChangeType.MODIFIED,
        content: '수정된 내용입니다',
        beforeContent: '이전 내용',
        afterContent: '이후 내용',
        position: { page: 1, paragraph: 3 },
      },
    ],
    statistics: {
      totalChanges: 3,
      added: 1,
      deleted: 1,
      modified: 1,
      moved: 0,
      formatChanged: 0,
    },
    originalDocument: {
      file: new File([], 'original.docx'),
      name: 'original.docx',
      size: 5000,
      lastModified: new Date('2025-01-01'),
      content: '원본 문서 내용',
    },
    modifiedDocument: {
      file: new File([], 'modified.docx'),
      name: 'modified.docx',
      size: 5500,
      lastModified: new Date('2025-01-02'),
      content: '수정된 문서 내용',
    },
    comparisonDate: new Date('2025-01-10'),
  })

  describe('generateSummaryReport', () => {
    it('요약 리포트를 생성해야 함', () => {
      const result = createMockResult()
      const report = generateSummaryReport(result)

      expect(report).toContain('문서 비교 요약 리포트')
      expect(report).toContain('original.docx')
      expect(report).toContain('modified.docx')
      expect(report).toContain('총 변경사항: 3개')
      expect(report).toContain('추가: 1개')
      expect(report).toContain('삭제: 1개')
      expect(report).toContain('수정: 1개')
    })

    it('주요 변경사항 목록을 포함해야 함', () => {
      const result = createMockResult()
      const report = generateSummaryReport(result)

      expect(report).toContain('주요 변경사항')
      expect(report).toContain('[추가]')
      expect(report).toContain('[삭제]')
      expect(report).toContain('[수정]')
    })

    it('변경 비율을 계산해야 함', () => {
      const result = createMockResult()
      const report = generateSummaryReport(result)

      expect(report).toContain('변경 비율')
      expect(report).toMatch(/변경 비율: \d+\.\d+%/)
    })

    it('파일 크기를 포맷팅해야 함', () => {
      const result = createMockResult()
      const report = generateSummaryReport(result)

      expect(report).toContain('KB')
    })
  })

  describe('exportToPDF', () => {
    it('PDF 생성 함수는 정의되어 있어야 함', async () => {
      const { exportToPDF } = await import('./exportService')
      expect(exportToPDF).toBeDefined()
      expect(typeof exportToPDF).toBe('function')
    })
  })

  describe('exportToHTML', () => {
    it('HTML 생성 함수는 정의되어 있어야 함', async () => {
      const { exportToHTML } = await import('./exportService')
      expect(exportToHTML).toBeDefined()
      expect(typeof exportToHTML).toBe('function')
    })
  })

  describe('exportToCSV', () => {
    it('CSV 생성 함수는 정의되어 있어야 함', async () => {
      const { exportToCSV } = await import('./exportService')
      expect(exportToCSV).toBeDefined()
      expect(typeof exportToCSV).toBe('function')
    })
  })

  describe('exportToJSON', () => {
    it('JSON 생성 함수는 정의되어 있어야 함', async () => {
      const { exportToJSON } = await import('./exportService')
      expect(exportToJSON).toBeDefined()
      expect(typeof exportToJSON).toBe('function')
    })
  })
})
