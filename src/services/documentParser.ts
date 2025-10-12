import mammoth from 'mammoth'

/**
 * Word 문서 파서 서비스
 * mammoth.js를 사용하여 .docx 파일을 HTML로 변환
 */

// 파일 크기 제한 (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024

// 파싱 결과 타입
export interface ParseResult {
  html: string
  text: string
  messages: string[]
  success: boolean
  error?: string
}

/**
 * 파일 크기 검증
 */
export const validateFileSize = (file: File): { valid: boolean; error?: string } => {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `파일 크기가 제한을 초과했습니다. (최대 ${MAX_FILE_SIZE / 1024 / 1024}MB)`,
    }
  }
  return { valid: true }
}

/**
 * 파일 형식 검증
 */
export const validateFileType = (file: File): { valid: boolean; error?: string } => {
  const validExtensions = ['.docx', '.doc']
  const fileName = file.name.toLowerCase()
  const isValid = validExtensions.some((ext) => fileName.endsWith(ext))

  if (!isValid) {
    return {
      valid: false,
      error: 'Word 문서 파일(.docx, .doc)만 업로드 가능합니다.',
    }
  }
  return { valid: true }
}

/**
 * Word 문서를 HTML로 변환
 */
export const parseDocxToHtml = async (file: File): Promise<ParseResult> => {
  try {
    // 파일 크기 검증
    const sizeValidation = validateFileSize(file)
    if (!sizeValidation.valid) {
      return {
        html: '',
        text: '',
        messages: [],
        success: false,
        error: sizeValidation.error,
      }
    }

    // 파일 형식 검증
    const typeValidation = validateFileType(file)
    if (!typeValidation.valid) {
      return {
        html: '',
        text: '',
        messages: [],
        success: false,
        error: typeValidation.error,
      }
    }

    // ArrayBuffer로 파일 읽기
    const arrayBuffer = await file.arrayBuffer()

    // mammoth.js로 변환
    const result = await mammoth.convertToHtml(
      { arrayBuffer },
      {
        // 이미지 변환 설정
        convertImage: mammoth.images.imgElement((image) => {
          return image.read('base64').then((imageBuffer) => {
            return {
              src: `data:${image.contentType};base64,${imageBuffer}`,
            }
          })
        }),
      }
    )

    // 텍스트 추출
    const textResult = await mammoth.extractRawText({ arrayBuffer })

    return {
      html: result.value,
      text: textResult.value,
      messages: result.messages.map((msg) => msg.message),
      success: true,
    }
  } catch (error) {
    console.error('Document parsing error:', error)

    let errorMessage = '문서를 파싱하는 중 오류가 발생했습니다.'

    if (error instanceof Error) {
      // 손상된 파일 감지
      if (error.message.includes('signature') || error.message.includes('corrupt')) {
        errorMessage = '손상된 파일입니다. 파일을 확인해주세요.'
      } else {
        errorMessage = `오류: ${error.message}`
      }
    }

    return {
      html: '',
      text: '',
      messages: [],
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * 문서 구조 분석
 */
export const analyzeDocumentStructure = (html: string, text: string) => {
  // 간단한 구조 분석
  const paragraphCount = (html.match(/<p>/g) || []).length
  const headingCount = (html.match(/<h[1-6]>/g) || []).length
  const listCount = (html.match(/<li>/g) || []).length
  const tableCount = (html.match(/<table>/g) || []).length
  const imageCount = (html.match(/<img/g) || []).length

  const wordCount = text.trim().split(/\s+/).length
  const charCount = text.length

  return {
    paragraphs: paragraphCount,
    headings: headingCount,
    lists: listCount,
    tables: tableCount,
    images: imageCount,
    words: wordCount,
    characters: charCount,
  }
}
