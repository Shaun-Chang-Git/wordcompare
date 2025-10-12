import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import FileUpload from './index'

describe('FileUpload', () => {
  it('컴포넌트가 렌더링되어야 함', () => {
    const mockOnFileSelect = vi.fn()

    render(<FileUpload label="테스트 업로드" onFileSelect={mockOnFileSelect} />)

    expect(screen.getByText(/테스트 업로드/i)).toBeDefined()
  })

  it('드래그앤드롭 안내 문구가 표시되어야 함', () => {
    const mockOnFileSelect = vi.fn()

    render(<FileUpload label="파일 업로드" onFileSelect={mockOnFileSelect} />)

    expect(screen.getByText(/파일을 드래그하거나 버튼을 클릭하세요/i)).toBeDefined()
  })

  it('파일 선택 버튼이 표시되어야 함', () => {
    const mockOnFileSelect = vi.fn()

    render(<FileUpload label="파일 업로드" onFileSelect={mockOnFileSelect} />)

    expect(screen.getByText(/파일 선택/i)).toBeDefined()
  })
})
