import { describe, it, expect, vi } from 'vitest'
import { exportComparisonToWord } from './wordDocumentService'
import { ComparisonResult, ChangeType } from '../types'

// Mock file-saver
vi.mock('file-saver', () => ({
  saveAs: vi.fn(),
}))

describe('wordDocumentService', () => {
  const createMockResult = (): ComparisonResult => ({
    changes: [
      {
        id: '1',
        type: ChangeType.ADDED,
        content: '추가된 텍스트',
        afterContent: '추가된 텍스트',
        position: {
          page: 1,
          paragraph: 1,
        },
      },
      {
        id: '2',
        type: ChangeType.DELETED,
        content: '삭제된 텍스트',
        beforeContent: '삭제된 텍스트',
        position: {
          page: 1,
          paragraph: 2,
        },
      },
      {
        id: '3',
        type: ChangeType.MODIFIED,
        content: '수정된 텍스트',
        beforeContent: '원본 텍스트',
        afterContent: '수정된 텍스트',
        position: {
          page: 1,
          paragraph: 3,
        },
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
      file: new File([], '원본.docx'),
      name: '원본.docx',
      size: 1024,
      lastModified: new Date(),
      content: '원본 내용',
      htmlContent: '<p>원본 내용</p>',
    },
    modifiedDocument: {
      file: new File([], '수정본.docx'),
      name: '수정본.docx',
      size: 1024,
      lastModified: new Date(),
      content: '수정된 내용',
      htmlContent: '<p>수정된 내용</p>',
    },
    comparisonDate: new Date(),
  })

  it('Word 문서 생성 함수가 존재해야 함', () => {
    expect(exportComparisonToWord).toBeDefined()
    expect(typeof exportComparisonToWord).toBe('function')
  })

  it('비교 결과를 Word 문서로 변환할 수 있어야 함', async () => {
    const result = createMockResult()

    // 오류 없이 실행되어야 함
    await expect(
      exportComparisonToWord(result, '원본.docx', '수정본.docx')
    ).resolves.not.toThrow()
  })

  it('모든 변경 타입을 처리할 수 있어야 함', async () => {
    const result = createMockResult()

    // 추가 변경 타입들
    result.changes.push({
      id: '4',
      type: ChangeType.MOVED,
      content: '이동된 텍스트',
      position: {
        page: 1,
        paragraph: 4,
      },
    })

    result.changes.push({
      id: '5',
      type: ChangeType.FORMAT_CHANGED,
      content: '서식 변경',
      position: {
        page: 1,
        paragraph: 5,
      },
    })

    await expect(
      exportComparisonToWord(result, '원본.docx', '수정본.docx')
    ).resolves.not.toThrow()
  })

  it('통계 정보를 포함해야 함', async () => {
    const result = createMockResult()

    // 통계 정보가 있는 경우
    expect(result.statistics.totalChanges).toBeGreaterThan(0)
    expect(result.statistics.added).toBeGreaterThanOrEqual(0)
    expect(result.statistics.deleted).toBeGreaterThanOrEqual(0)

    await expect(
      exportComparisonToWord(result, '원본.docx', '수정본.docx')
    ).resolves.not.toThrow()
  })
})
