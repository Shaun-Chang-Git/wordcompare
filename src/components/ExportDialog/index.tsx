import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Checkbox,
  FormControlLabel,
  Divider,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material'
import {
  PictureAsPdf as PdfIcon,
  Html as HtmlIcon,
  TableChart as CsvIcon,
  Code as JsonIcon,
  Description as SummaryIcon,
  Article as WordIcon,
  Highlight as HighlightIcon,
} from '@mui/icons-material'
import { ComparisonResult } from '../../types'
import {
  exportToPDF,
  exportToHTML,
  exportToCSV,
  exportToJSON,
  generateSummaryReport,
} from '../../services/exportService'
import { exportComparisonToWord } from '../../services/wordDocumentService'
import { exportHighlightedDocument } from '../../services/highlightedDocumentService'

interface ExportDialogProps {
  open: boolean
  onClose: () => void
  result: ComparisonResult | null
}

type ExportFormat =
  | 'word'
  | 'highlighted'
  | 'pdf'
  | 'html'
  | 'csv'
  | 'json'
  | 'summary'

const ExportDialog = ({ open, onClose, result }: ExportDialogProps) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('word')
  const [includeDetails, setIncludeDetails] = useState(true)
  const [exporting, setExporting] = useState(false)

  const exportFormats = [
    {
      id: 'word' as ExportFormat,
      label: 'Word 문서 (비교 리포트)',
      description: 'MS Word에서 열 수 있는 .docx 파일 - 표/이미지 완벽 지원',
      icon: <WordIcon sx={{ color: '#2B579A' }} />,
    },
    {
      id: 'highlighted' as ExportFormat,
      label: '하이라이트된 수정 문서 (추천) ⭐',
      description: '수정 문서에 변경 부분을 노란색 음영으로 표시한 Word 파일',
      icon: <HighlightIcon sx={{ color: '#FFC107' }} />,
    },
    {
      id: 'pdf' as ExportFormat,
      label: 'PDF 문서',
      description: '보고서 형식의 PDF 파일로 저장',
      icon: <PdfIcon color="error" />,
    },
    {
      id: 'html' as ExportFormat,
      label: 'HTML 문서',
      description: '웹 브라우저로 볼 수 있는 HTML 파일',
      icon: <HtmlIcon color="primary" />,
    },
    {
      id: 'csv' as ExportFormat,
      label: 'CSV 파일',
      description: '엑셀에서 열 수 있는 변경사항 목록',
      icon: <CsvIcon color="success" />,
    },
    {
      id: 'json' as ExportFormat,
      label: 'JSON 데이터',
      description: '프로그래밍 용도의 구조화된 데이터',
      icon: <JsonIcon color="warning" />,
    },
    {
      id: 'summary' as ExportFormat,
      label: '텍스트 요약',
      description: '간단한 텍스트 형식의 요약 리포트',
      icon: <SummaryIcon color="info" />,
    },
  ]

  const handleExport = async () => {
    if (!result) return

    setExporting(true)
    try {
      switch (selectedFormat) {
        case 'word':
          await exportComparisonToWord(
            result,
            result.originalDocument.name,
            result.modifiedDocument.name
          )
          break
        case 'highlighted':
          await exportHighlightedDocument(result, result.modifiedDocument.name)
          break
        case 'pdf':
          await exportToPDF(result, includeDetails)
          break
        case 'html':
          exportToHTML(result)
          break
        case 'csv':
          exportToCSV(result)
          break
        case 'json':
          exportToJSON(result)
          break
        case 'summary': {
          const summary = generateSummaryReport(result)
          const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' })
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `문서비교_요약_${new Date().getTime()}.txt`
          link.click()
          URL.revokeObjectURL(url)
          break
        }
      }
      onClose()
    } catch (error) {
      console.error('내보내기 오류:', error)
      alert('내보내기 중 오류가 발생했습니다.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          📤 비교 결과 내보내기
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          비교 결과를 다양한 형식으로 내보낼 수 있습니다.
        </Typography>

        <List>
          {exportFormats.map((format) => (
            <ListItem key={format.id} disablePadding>
              <ListItemButton
                selected={selectedFormat === format.id}
                onClick={() => setSelectedFormat(format.id)}
              >
                <ListItemIcon>{format.icon}</ListItemIcon>
                <ListItemText
                  primary={format.label}
                  secondary={format.description}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        {selectedFormat === 'pdf' && (
          <FormControlLabel
            control={
              <Checkbox
                checked={includeDetails}
                onChange={(e) => setIncludeDetails(e.target.checked)}
              />
            }
            label="상세 변경사항 포함 (최대 50개)"
          />
        )}

        {result && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              파일 정보
            </Typography>
            <Typography variant="body2">
              총 변경사항: <strong>{result.statistics.totalChanges}개</strong>
            </Typography>
            <Typography variant="body2">
              원본: {result.originalDocument.name}
            </Typography>
            <Typography variant="body2">
              수정: {result.modifiedDocument.name}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={exporting}>
          취소
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          disabled={!result || exporting}
          startIcon={exporting ? <CircularProgress size={16} /> : null}
        >
          {exporting ? '내보내는 중...' : '내보내기'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ExportDialog
