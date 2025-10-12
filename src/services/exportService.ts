import jsPDF from 'jspdf'
// import html2canvas from 'html2canvas' // 추후 스크린샷 기능에 사용
import { ComparisonResult, ChangeType } from '../types'

/**
 * PDF로 비교 결과 내보내기
 */
export const exportToPDF = async (result: ComparisonResult, includeDetails: boolean = true): Promise<void> => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 15
  let yPosition = margin

  // 제목
  pdf.setFontSize(20)
  pdf.setFont('helvetica', 'bold')
  pdf.text('문서 비교 리포트', margin, yPosition)
  yPosition += 10

  // 날짜
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.text(`생성일: ${result.comparisonDate.toLocaleString('ko-KR')}`, margin, yPosition)
  yPosition += 10

  // 문서 정보
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'bold')
  pdf.text('문서 정보', margin, yPosition)
  yPosition += 7

  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.text(`원본 문서: ${result.originalDocument.name}`, margin, yPosition)
  yPosition += 5
  pdf.text(`수정 문서: ${result.modifiedDocument.name}`, margin, yPosition)
  yPosition += 10

  // 통계 요약
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'bold')
  pdf.text('변경 사항 통계', margin, yPosition)
  yPosition += 7

  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')

  const stats = [
    `총 변경사항: ${result.statistics.totalChanges}개`,
    `추가: ${result.statistics.added}개`,
    `삭제: ${result.statistics.deleted}개`,
    `수정: ${result.statistics.modified}개`,
    `이동: ${result.statistics.moved}개`,
    `서식 변경: ${result.statistics.formatChanged}개`,
  ]

  stats.forEach((stat) => {
    pdf.text(stat, margin + 5, yPosition)
    yPosition += 5
  })

  yPosition += 5

  // 상세 변경사항 (옵션)
  if (includeDetails && result.changes.length > 0) {
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('변경 사항 상세', margin, yPosition)
    yPosition += 7

    pdf.setFontSize(9)

    result.changes.slice(0, 50).forEach((change, index) => {
      // 페이지 넘김 체크
      if (yPosition > pageHeight - 30) {
        pdf.addPage()
        yPosition = margin
      }

      const typeLabel = getChangeTypeLabel(change.type)

      pdf.setFont('helvetica', 'bold')
      pdf.text(`${index + 1}. ${typeLabel}`, margin, yPosition)
      yPosition += 5

      pdf.setFont('helvetica', 'normal')
      const content = change.content.substring(0, 100)
      const lines = pdf.splitTextToSize(content, pageWidth - 2 * margin)
      pdf.text(lines, margin + 5, yPosition)
      yPosition += lines.length * 4 + 3

      if (change.beforeContent && change.afterContent) {
        pdf.setFontSize(8)
        pdf.text(`이전: ${change.beforeContent.substring(0, 80)}`, margin + 5, yPosition)
        yPosition += 4
        pdf.text(`이후: ${change.afterContent.substring(0, 80)}`, margin + 5, yPosition)
        yPosition += 5
        pdf.setFontSize(9)
      }
    })

    if (result.changes.length > 50) {
      yPosition += 5
      pdf.setFont('helvetica', 'italic')
      pdf.text(`... 그 외 ${result.changes.length - 50}개의 변경사항`, margin, yPosition)
    }
  }

  // PDF 다운로드
  const fileName = `문서비교_${result.originalDocument.name.replace(/\.[^/.]+$/, '')}_${new Date().getTime()}.pdf`
  pdf.save(fileName)
}

/**
 * HTML 리포트로 내보내기
 */
export const exportToHTML = (result: ComparisonResult): void => {
  const html = generateHTMLReport(result)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `문서비교_${result.originalDocument.name.replace(/\.[^/.]+$/, '')}_${new Date().getTime()}.html`
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * JSON으로 내보내기
 */
export const exportToJSON = (result: ComparisonResult): void => {
  const json = JSON.stringify(result, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `문서비교_${result.originalDocument.name.replace(/\.[^/.]+$/, '')}_${new Date().getTime()}.json`
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * CSV로 변경사항 목록 내보내기
 */
export const exportToCSV = (result: ComparisonResult): void => {
  let csv = '\uFEFF' // BOM for UTF-8
  csv += '번호,변경유형,페이지,단락,내용,이전내용,이후내용\n'

  result.changes.forEach((change, index) => {
    const row = [
      index + 1,
      getChangeTypeLabel(change.type),
      change.position.page,
      change.position.paragraph,
      `"${change.content.replace(/"/g, '""').substring(0, 200)}"`,
      `"${(change.beforeContent || '').replace(/"/g, '""').substring(0, 200)}"`,
      `"${(change.afterContent || '').replace(/"/g, '""').substring(0, 200)}"`,
    ]
    csv += row.join(',') + '\n'
  })

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `문서비교_${result.originalDocument.name.replace(/\.[^/.]+$/, '')}_${new Date().getTime()}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * 요약 리포트 생성
 */
export const generateSummaryReport = (result: ComparisonResult): string => {
  const { statistics, originalDocument, modifiedDocument, comparisonDate } = result

  let report = '========================================\n'
  report += '          문서 비교 요약 리포트\n'
  report += '========================================\n\n'

  report += `생성일: ${comparisonDate.toLocaleString('ko-KR')}\n\n`

  report += '문서 정보:\n'
  report += `  - 원본: ${originalDocument.name} (${formatFileSize(originalDocument.size)})\n`
  report += `  - 수정: ${modifiedDocument.name} (${formatFileSize(modifiedDocument.size)})\n\n`

  report += '변경 통계:\n'
  report += `  - 총 변경사항: ${statistics.totalChanges}개\n`
  report += `  - 추가: ${statistics.added}개\n`
  report += `  - 삭제: ${statistics.deleted}개\n`
  report += `  - 수정: ${statistics.modified}개\n`
  report += `  - 이동: ${statistics.moved}개\n`
  report += `  - 서식 변경: ${statistics.formatChanged}개\n\n`

  // 변경 비율 계산
  const totalContent = (originalDocument.content?.length || 0) + (modifiedDocument.content?.length || 0)
  const changeRate = totalContent > 0 ? ((statistics.totalChanges / totalContent) * 100).toFixed(2) : '0'
  report += `변경 비율: ${changeRate}%\n\n`

  report += '주요 변경사항 (상위 10개):\n'
  result.changes.slice(0, 10).forEach((change, index) => {
    report += `  ${index + 1}. [${getChangeTypeLabel(change.type)}] ${change.content.substring(0, 80)}...\n`
  })

  report += '\n========================================\n'
  report += '                  끝\n'
  report += '========================================\n'

  return report
}

/**
 * HTML 리포트 생성
 */
const generateHTMLReport = (result: ComparisonResult): string => {
  const { statistics, originalDocument, modifiedDocument, comparisonDate, changes } = result

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>문서 비교 리포트</title>
  <style>
    body {
      font-family: 'Malgun Gothic', sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 10px;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0 0 10px 0;
    }
    .card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }
    .stat-item {
      padding: 15px;
      border-radius: 8px;
      text-align: center;
    }
    .stat-item h3 {
      margin: 0;
      font-size: 32px;
    }
    .stat-item p {
      margin: 5px 0 0 0;
      font-size: 14px;
      opacity: 0.8;
    }
    .total { background: #e3f2fd; color: #1976d2; }
    .added { background: #e8f5e9; color: #388e3c; }
    .deleted { background: #ffebee; color: #d32f2f; }
    .modified { background: #fff3e0; color: #f57c00; }
    .moved { background: #e1f5fe; color: #0288d1; }
    .format { background: #f3e5f5; color: #7b1fa2; }
    .change-item {
      border-left: 4px solid #ddd;
      padding: 10px 15px;
      margin: 10px 0;
      background: #fafafa;
    }
    .change-item.added { border-color: #4caf50; }
    .change-item.deleted { border-color: #f44336; }
    .change-item.modified { border-color: #ff9800; }
    .change-header {
      font-weight: bold;
      margin-bottom: 5px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📄 문서 비교 리포트</h1>
    <p>생성일: ${comparisonDate.toLocaleString('ko-KR')}</p>
  </div>

  <div class="card">
    <h2>📁 문서 정보</h2>
    <p><strong>원본 문서:</strong> ${originalDocument.name} (${formatFileSize(originalDocument.size)})</p>
    <p><strong>수정 문서:</strong> ${modifiedDocument.name} (${formatFileSize(modifiedDocument.size)})</p>
  </div>

  <div class="card">
    <h2>📊 변경 통계</h2>
    <div class="stats">
      <div class="stat-item total">
        <h3>${statistics.totalChanges}</h3>
        <p>총 변경사항</p>
      </div>
      <div class="stat-item added">
        <h3>${statistics.added}</h3>
        <p>추가</p>
      </div>
      <div class="stat-item deleted">
        <h3>${statistics.deleted}</h3>
        <p>삭제</p>
      </div>
      <div class="stat-item modified">
        <h3>${statistics.modified}</h3>
        <p>수정</p>
      </div>
      <div class="stat-item moved">
        <h3>${statistics.moved}</h3>
        <p>이동</p>
      </div>
      <div class="stat-item format">
        <h3>${statistics.formatChanged}</h3>
        <p>서식 변경</p>
      </div>
    </div>
  </div>

  <div class="card">
    <h2>📋 변경 사항 목록</h2>
    ${changes.slice(0, 50).map((change, index) => `
      <div class="change-item ${change.type}">
        <div class="change-header">
          ${index + 1}. ${getChangeTypeLabel(change.type)} - ${change.position.page}페이지, ${change.position.paragraph}단락
        </div>
        <div>${escapeHtml(change.content.substring(0, 200))}${change.content.length > 200 ? '...' : ''}</div>
        ${change.beforeContent && change.afterContent ? `
          <div style="margin-top: 8px; font-size: 12px;">
            <div style="color: #d32f2f;">이전: ${escapeHtml(change.beforeContent.substring(0, 100))}</div>
            <div style="color: #388e3c;">이후: ${escapeHtml(change.afterContent.substring(0, 100))}</div>
          </div>
        ` : ''}
      </div>
    `).join('')}
    ${changes.length > 50 ? `<p style="text-align: center; color: #666;">... 그 외 ${changes.length - 50}개의 변경사항</p>` : ''}
  </div>

  <div class="card" style="text-align: center; color: #666;">
    <p>이 리포트는 WordCompare에 의해 자동 생성되었습니다.</p>
  </div>
</body>
</html>
  `
}

/**
 * 변경 타입 레이블 반환
 */
const getChangeTypeLabel = (type: ChangeType): string => {
  switch (type) {
    case ChangeType.ADDED:
      return '추가'
    case ChangeType.DELETED:
      return '삭제'
    case ChangeType.MODIFIED:
      return '수정'
    case ChangeType.MOVED:
      return '이동'
    case ChangeType.FORMAT_CHANGED:
      return '서식 변경'
    default:
      return '기타'
  }
}

/**
 * 파일 크기 포맷팅
 */
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

/**
 * HTML 이스케이프
 */
const escapeHtml = (text: string): string => {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
