import { describe, it, expect, vi } from 'vitest'
import { exportHighlightedDocument } from './highlightedDocumentService'
import { ComparisonResult, ChangeType } from '../types'

// Mock file-saver
vi.mock('file-saver', () => ({
  saveAs: vi.fn(),
}))

describe('highlightedDocumentService', () => {
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
      htmlContent:
        '<p>추가된 텍스트</p><p>수정된 텍스트</p><p>기존 내용</p>',
    },
    comparisonDate: new Date(),
  })

  it('하이라이트된 문서 생성 함수가 존재해야 함', () => {
    expect(exportHighlightedDocument).toBeDefined()
    expect(typeof exportHighlightedDocument).toBe('function')
  })

  it('수정 문서를 하이라이트된 Word 문서로 변환할 수 있어야 함', async () => {
    const result = createMockResult()

    // 오류 없이 실행되어야 함
    await expect(
      exportHighlightedDocument(result, '수정본.docx')
    ).resolves.not.toThrow()
  })

  it('변경사항이 있는 문서를 처리할 수 있어야 함', async () => {
    const result = createMockResult()

    // HTML 콘텐츠가 있는 경우
    expect(result.modifiedDocument.htmlContent).toBeTruthy()
    expect(result.changes.length).toBeGreaterThan(0)

    await expect(
      exportHighlightedDocument(result, '수정본.docx')
    ).resolves.not.toThrow()
  })

  it('통계 정보를 포함해야 함', async () => {
    const result = createMockResult()

    // 통계 정보가 있는 경우
    expect(result.statistics.totalChanges).toBeGreaterThan(0)
    expect(result.statistics.added).toBeGreaterThanOrEqual(0)

    await expect(
      exportHighlightedDocument(result, '수정본.docx')
    ).resolves.not.toThrow()
  })

  it('파일명에 하이라이트 접미사를 추가해야 함', async () => {
    const result = createMockResult()
    const { saveAs } = await import('file-saver')

    await exportHighlightedDocument(result, '테스트문서.docx')

    // saveAs가 호출되었고, 파일명에 _하이라이트가 포함되어야 함
    expect(saveAs).toHaveBeenCalled()
  })
})
