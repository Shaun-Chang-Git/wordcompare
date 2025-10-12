import { useState } from 'react'
import {
  Container,
  Typography,
  Box,
  ThemeProvider,
  createTheme,
  AppBar,
  Toolbar,
  IconButton,
  Grid,
  Paper,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material'
import { Settings as SettingsIcon, Help as HelpIcon, FileDownload as FileDownloadIcon } from '@mui/icons-material'
import FileUpload from './components/FileUpload'
import ComparisonOptions from './components/ComparisonOptions'
import DiffViewer from './components/DiffViewer'
import ChangeListPanel from './components/ChangeListPanel'
import ExportDialog from './components/ExportDialog'
import { DocumentFile, ComparisonOptions as ComparisonOptionsType, ComparisonResult, ChangeStatus } from './types'
import { parseDocxToHtml, analyzeDocumentStructure } from './services/documentParser'
import { compareDocuments, calculateSimilarity } from './services/diffEngine'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
})

function App() {
  const [originalFile, setOriginalFile] = useState<DocumentFile | null>(null)
  const [modifiedFile, setModifiedFile] = useState<DocumentFile | null>(null)
  const [optionsDialogOpen, setOptionsDialogOpen] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [loading, setLoading] = useState<{ original: boolean; modified: boolean }>({
    original: false,
    modified: false,
  })
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [comparing, setComparing] = useState(false)
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null)

  const [comparisonOptions, setComparisonOptions] = useState<ComparisonOptionsType>({
    compareFormatting: true,
    caseSensitive: false,
    compareWhitespace: true,
    compareTables: true,
    compareHeadersFooters: true,
    compareFootnotes: true,
    compareFields: true,
    compareTextBoxes: true,
    compareComments: true,
    detailLevel: 'character',
    displayMode: 'sideBySide',
  })

  const handleOriginalFileSelect = async (file: File) => {
    setLoading((prev) => ({ ...prev, original: true }))

    try {
      const result = await parseDocxToHtml(file)

      if (!result.success) {
        setErrorMessage(result.error || '파일 파싱 중 오류가 발생했습니다.')
        setSnackbarOpen(true)
        setLoading((prev) => ({ ...prev, original: false }))
        return
      }

      const structure = analyzeDocumentStructure(result.html, result.text)

      const docFile: DocumentFile = {
        file,
        name: file.name,
        size: file.size,
        lastModified: new Date(file.lastModified),
        content: result.text,
        htmlContent: result.html,
      }

      setOriginalFile(docFile)
      console.log('원본 문서 구조:', structure)
    } catch (error) {
      setErrorMessage('파일 처리 중 예상치 못한 오류가 발생했습니다.')
      setSnackbarOpen(true)
    } finally {
      setLoading((prev) => ({ ...prev, original: false }))
    }
  }

  const handleModifiedFileSelect = async (file: File) => {
    setLoading((prev) => ({ ...prev, modified: true }))

    try {
      const result = await parseDocxToHtml(file)

      if (!result.success) {
        setErrorMessage(result.error || '파일 파싱 중 오류가 발생했습니다.')
        setSnackbarOpen(true)
        setLoading((prev) => ({ ...prev, modified: false }))
        return
      }

      const structure = analyzeDocumentStructure(result.html, result.text)

      const docFile: DocumentFile = {
        file,
        name: file.name,
        size: file.size,
        lastModified: new Date(file.lastModified),
        content: result.text,
        htmlContent: result.html,
      }

      setModifiedFile(docFile)
      console.log('수정 문서 구조:', structure)
    } catch (error) {
      setErrorMessage('파일 처리 중 예상치 못한 오류가 발생했습니다.')
      setSnackbarOpen(true)
    } finally {
      setLoading((prev) => ({ ...prev, modified: false }))
    }
  }

  const isCompareEnabled = originalFile !== null && modifiedFile !== null

  const handleCompare = async () => {
    if (!originalFile || !modifiedFile) return

    setComparing(true)

    try {
      // 비교 수행
      const result = compareDocuments(originalFile, modifiedFile, comparisonOptions)

      // 유사도 계산
      const similarity = calculateSimilarity(
        originalFile.content || '',
        modifiedFile.content || ''
      )

      console.log('비교 결과:', result)
      console.log('유사도:', similarity + '%')

      setComparisonResult(result)
    } catch (error) {
      console.error('비교 중 오류:', error)
      setErrorMessage('문서 비교 중 오류가 발생했습니다.')
      setSnackbarOpen(true)
    } finally {
      setComparing(false)
    }
  }

  const handleNavigateToChange = (index: number) => {
    console.log('Navigate to change:', index)
    // DiffViewer handles navigation internally
  }

  const handleAcceptChange = (changeId: string) => {
    if (!comparisonResult) return

    setComparisonResult({
      ...comparisonResult,
      changes: comparisonResult.changes.map((change) =>
        change.id === changeId ? { ...change, status: ChangeStatus.ACCEPTED } : change
      ),
    })
  }

  const handleRejectChange = (changeId: string) => {
    if (!comparisonResult) return

    setComparisonResult({
      ...comparisonResult,
      changes: comparisonResult.changes.map((change) =>
        change.id === changeId ? { ...change, status: ChangeStatus.REJECTED } : change
      ),
    })
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Header */}
        <AppBar position="static" elevation={1}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              🔍 WordCompare - 문서 비교 프로그램
            </Typography>
            <IconButton color="inherit" aria-label="설정">
              <SettingsIcon />
            </IconButton>
            <IconButton color="inherit" aria-label="도움말">
              <HelpIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
          {/* File Upload Section */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              문서 선택
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FileUpload
                  label="📁 원본 문서"
                  onFileSelect={handleOriginalFileSelect}
                />
                {loading.original && (
                  <Box sx={{ mt: 2, p: 2, textAlign: 'center' }}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      파일 파싱 중...
                    </Typography>
                  </Box>
                )}
                {originalFile && !loading.original && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="success.dark">
                      ✅ 파싱 완료
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>
                      {originalFile.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      크기: {(originalFile.size / 1024).toFixed(2)} KB
                    </Typography>
                  </Box>
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <FileUpload
                  label="📁 수정 문서"
                  onFileSelect={handleModifiedFileSelect}
                />
                {loading.modified && (
                  <Box sx={{ mt: 2, p: 2, textAlign: 'center' }}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      파일 파싱 중...
                    </Typography>
                  </Box>
                )}
                {modifiedFile && !loading.modified && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="success.dark">
                      ✅ 파싱 완료
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>
                      {modifiedFile.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      크기: {(modifiedFile.size / 1024).toFixed(2)} KB
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Paper>

          {/* Comparison Options */}
          <Box sx={{ textAlign: 'center', mb: 3, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              disabled={!isCompareEnabled}
              onClick={() => setOptionsDialogOpen(true)}
            >
              ⚙️ 비교 옵션
            </Button>
            <Button
              variant="contained"
              size="large"
              disabled={!isCompareEnabled || comparing}
              onClick={handleCompare}
              sx={{ minWidth: 200 }}
            >
              {comparing ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                  비교 중...
                </>
              ) : (
                '🔍 비교 시작'
              )}
            </Button>
            {comparisonResult && (
              <Button
                variant="contained"
                color="success"
                startIcon={<FileDownloadIcon />}
                onClick={() => setExportDialogOpen(true)}
              >
                내보내기
              </Button>
            )}
          </Box>

          {/* Comparison Options Dialog */}
          <ComparisonOptions
            open={optionsDialogOpen}
            onClose={() => setOptionsDialogOpen(false)}
            options={comparisonOptions}
            onOptionsChange={setComparisonOptions}
          />

          {/* Export Dialog */}
          <ExportDialog
            open={exportDialogOpen}
            onClose={() => setExportDialogOpen(false)}
            result={comparisonResult}
          />

          {/* Comparison Result */}
          {comparisonResult ? (
            <>
              {/* Statistics Summary */}
              <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom>
                  📊 비교 결과 요약
                </Typography>
                <Divider sx={{ mb: 3 }} />

                {/* 통계 */}
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4} md={2}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.100', textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {comparisonResult.statistics.totalChanges}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        총 변경사항
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'success.light', textAlign: 'center' }}>
                      <Typography variant="h4" color="success.dark">
                        {comparisonResult.statistics.added}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        추가
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'error.light', textAlign: 'center' }}>
                      <Typography variant="h4" color="error.dark">
                        {comparisonResult.statistics.deleted}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        삭제
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'warning.light', textAlign: 'center' }}>
                      <Typography variant="h4" color="warning.dark">
                        {comparisonResult.statistics.modified}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        수정
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'info.light', textAlign: 'center' }}>
                      <Typography variant="h4" color="info.dark">
                        {comparisonResult.statistics.moved}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        이동
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'secondary.light', textAlign: 'center' }}>
                      <Typography variant="h4" color="secondary.dark">
                        {comparisonResult.statistics.formatChanged}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        서식 변경
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>

              {/* Main comparison view with side panel */}
              <Grid container spacing={3}>
                <Grid item xs={12} lg={3}>
                  <ChangeListPanel
                    result={comparisonResult}
                    onNavigateToChange={handleNavigateToChange}
                    onAcceptChange={handleAcceptChange}
                    onRejectChange={handleRejectChange}
                  />
                </Grid>
                <Grid item xs={12} lg={9}>
                  <DiffViewer result={comparisonResult} />
                </Grid>
              </Grid>
            </>
          ) : !isCompareEnabled ? (
            <Paper elevation={1} sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                비교할 문서를 선택해주세요
              </Typography>
              <Typography variant="body2" color="text.secondary">
                좌측에 원본 문서, 우측에 수정 문서를 업로드하면 비교를 시작할 수 있습니다.
              </Typography>
            </Paper>
          ) : null}
        </Container>

        {/* Error Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setSnackbarOpen(false)} severity="error" sx={{ width: '100%' }}>
            {errorMessage}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  )
}

export default App
