import { useState, useRef, useMemo, useCallback, memo } from 'react'
import {
  Box,
  Paper,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  ViewColumn as ViewColumnIcon,
  ViewAgenda as ViewAgendaIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material'
import { ComparisonResult, Change, ChangeType } from '../../types'

interface DiffViewerProps {
  result: ComparisonResult
}

type ViewMode = 'sideBySide' | 'unified'

const DiffViewer = ({ result }: DiffViewerProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('sideBySide')
  const [currentChangeIndex, setCurrentChangeIndex] = useState<number>(0)
  const changeRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  const { changes, originalDocument, modifiedDocument } = result

  // Navigate to specific change
  const scrollToChange = useCallback((index: number) => {
    if (index < 0 || index >= changes.length) return
    setCurrentChangeIndex(index)
    const changeId = changes[index].id
    const element = changeRefs.current[changeId]
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [changes])

  const handlePrevChange = useCallback(() => {
    scrollToChange(currentChangeIndex - 1)
  }, [currentChangeIndex, scrollToChange])

  const handleNextChange = useCallback(() => {
    scrollToChange(currentChangeIndex + 1)
  }, [currentChangeIndex, scrollToChange])

  // Get background color for change type - memoized
  const getChangeColor = useCallback((type: ChangeType, opacity = 0.2) => {
    switch (type) {
      case ChangeType.ADDED:
        return `rgba(76, 175, 80, ${opacity})` // Green
      case ChangeType.DELETED:
        return `rgba(244, 67, 54, ${opacity})` // Red
      case ChangeType.MODIFIED:
        return `rgba(255, 193, 7, ${opacity})` // Yellow
      case ChangeType.MOVED:
        return `rgba(33, 150, 243, ${opacity})` // Blue
      case ChangeType.FORMAT_CHANGED:
        return `rgba(156, 39, 176, ${opacity})` // Purple
      default:
        return 'transparent'
    }
  }, [])

  // Render text with inline highlighting - memoized
  const renderTextWithHighlights = useMemo(() => (text: string, changes: Change[], documentType: 'original' | 'modified') => {
    const lines = text.split('\n')
    const result: JSX.Element[] = []

    // Create a map of positions to changes
    const changeMap = new Map<number, Change>()
    changes.forEach((change) => {
      const pos = change.position.paragraph
      if (!changeMap.has(pos)) {
        changeMap.set(pos, change)
      }
    })

    lines.forEach((line, index) => {
      const change = changeMap.get(index + 1)
      const shouldHighlight = change && (
        (documentType === 'original' && (change.type === ChangeType.DELETED || change.type === ChangeType.MODIFIED)) ||
        (documentType === 'modified' && (change.type === ChangeType.ADDED || change.type === ChangeType.MODIFIED))
      )

      result.push(
        <Box
          key={index}
          ref={shouldHighlight && change ? (el) => { changeRefs.current[change.id] = el as HTMLDivElement | null } : undefined}
          sx={{
            p: 1,
            backgroundColor: shouldHighlight && change ? getChangeColor(change.type) : 'transparent',
            borderLeft: shouldHighlight && change ? `4px solid ${getChangeColor(change.type, 0.8)}` : 'none',
            minHeight: '24px',
            '&:hover': {
              backgroundColor: shouldHighlight && change ? getChangeColor(change.type, 0.3) : 'rgba(0,0,0,0.02)',
            },
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              textDecoration: shouldHighlight && change?.type === ChangeType.DELETED ? 'line-through' : 'none',
              textDecorationColor: shouldHighlight && change?.type === ChangeType.DELETED ? getChangeColor(change.type, 1) : 'transparent',
            }}
          >
            {line || '\u00A0'}
          </Typography>
        </Box>
      )
    })

    return result
  }, [getChangeColor])

  // Render unified diff view - memoized
  const renderUnifiedDiff = useMemo(() => () => {
    const result: JSX.Element[] = []

    changes.forEach((change, index) => {
      const isActive = index === currentChangeIndex

      if (change.type === ChangeType.DELETED || change.type === ChangeType.MODIFIED) {
        result.push(
          <Box
            key={`${change.id}-before`}
            ref={(el) => { changeRefs.current[`${change.id}-before`] = el as HTMLDivElement | null }}
            sx={{
              p: 1,
              backgroundColor: getChangeColor(ChangeType.DELETED, isActive ? 0.3 : 0.15),
              borderLeft: `4px solid ${getChangeColor(ChangeType.DELETED, 0.8)}`,
              mb: 0.5,
            }}
          >
            <Typography variant="caption" sx={{ color: 'error.dark', fontWeight: 'bold', display: 'block', mb: 0.5 }}>
              - {change.position.paragraph}단락 (원본)
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                textDecoration: 'line-through',
                textDecorationColor: getChangeColor(ChangeType.DELETED, 1),
              }}
            >
              {change.beforeContent || change.content}
            </Typography>
          </Box>
        )
      }

      if (change.type === ChangeType.ADDED || change.type === ChangeType.MODIFIED) {
        result.push(
          <Box
            key={`${change.id}-after`}
            ref={(el) => { changeRefs.current[`${change.id}-after`] = el as HTMLDivElement | null }}
            sx={{
              p: 1,
              backgroundColor: getChangeColor(ChangeType.ADDED, isActive ? 0.3 : 0.15),
              borderLeft: `4px solid ${getChangeColor(ChangeType.ADDED, 0.8)}`,
              mb: 0.5,
            }}
          >
            <Typography variant="caption" sx={{ color: 'success.dark', fontWeight: 'bold', display: 'block', mb: 0.5 }}>
              + {change.position.paragraph}단락 (수정)
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                textDecoration: 'underline',
                textDecorationColor: getChangeColor(ChangeType.ADDED, 0.5),
              }}
            >
              {change.afterContent || change.content}
            </Typography>
          </Box>
        )
      }
    })

    return result
  }, [changes, currentChangeIndex, getChangeColor])

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      {/* Header with controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">📄 문서 비교 뷰어</Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Navigation controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="이전 변경사항">
              <span>
                <IconButton
                  size="small"
                  onClick={handlePrevChange}
                  disabled={currentChangeIndex <= 0}
                >
                  <NavigateBeforeIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Typography variant="body2" sx={{ minWidth: 80, textAlign: 'center' }}>
              {changes.length > 0 ? `${currentChangeIndex + 1} / ${changes.length}` : '0 / 0'}
            </Typography>
            <Tooltip title="다음 변경사항">
              <span>
                <IconButton
                  size="small"
                  onClick={handleNextChange}
                  disabled={currentChangeIndex >= changes.length - 1}
                >
                  <NavigateNextIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Box>

          {/* View mode toggle */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="sideBySide">
              <Tooltip title="나란히 보기">
                <ViewColumnIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="unified">
              <Tooltip title="통합 보기">
                <ViewAgendaIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Content area */}
      {viewMode === 'sideBySide' ? (
        <Box sx={{ display: 'flex', gap: 2, height: 600, overflow: 'hidden' }}>
          {/* Original document */}
          <Paper
            variant="outlined"
            sx={{ flex: 1, overflow: 'auto', bgcolor: 'grey.50' }}
          >
            <Box sx={{ p: 2, bgcolor: 'grey.200', position: 'sticky', top: 0, zIndex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                📁 원본 문서
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {originalDocument.name}
              </Typography>
            </Box>
            <Box sx={{ p: 2 }}>
              {renderTextWithHighlights(originalDocument.content || '', changes, 'original')}
            </Box>
          </Paper>

          {/* Modified document */}
          <Paper
            variant="outlined"
            sx={{ flex: 1, overflow: 'auto', bgcolor: 'grey.50' }}
          >
            <Box sx={{ p: 2, bgcolor: 'grey.200', position: 'sticky', top: 0, zIndex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                📁 수정 문서
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {modifiedDocument.name}
              </Typography>
            </Box>
            <Box sx={{ p: 2 }}>
              {renderTextWithHighlights(modifiedDocument.content || '', changes, 'modified')}
            </Box>
          </Paper>
        </Box>
      ) : (
        <Paper
          variant="outlined"
          sx={{ height: 600, overflow: 'auto', bgcolor: 'grey.50' }}
        >
          <Box sx={{ p: 2, bgcolor: 'grey.200', position: 'sticky', top: 0, zIndex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              🔀 통합 비교 뷰
            </Typography>
            <Typography variant="caption" color="text.secondary">
              - 삭제된 내용 (원본) / + 추가된 내용 (수정)
            </Typography>
          </Box>
          <Box sx={{ p: 2 }}>
            {renderUnifiedDiff()}
          </Box>
        </Paper>
      )}

      {/* Legend */}
      <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: getChangeColor(ChangeType.ADDED), border: '1px solid #ccc' }} />
          <Typography variant="caption">추가</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: getChangeColor(ChangeType.DELETED), border: '1px solid #ccc' }} />
          <Typography variant="caption">삭제</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: getChangeColor(ChangeType.MODIFIED), border: '1px solid #ccc' }} />
          <Typography variant="caption">수정</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: getChangeColor(ChangeType.MOVED), border: '1px solid #ccc' }} />
          <Typography variant="caption">이동</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: getChangeColor(ChangeType.FORMAT_CHANGED), border: '1px solid #ccc' }} />
          <Typography variant="caption">서식 변경</Typography>
        </Box>
      </Box>
    </Paper>
  )
}

export default memo(DiffViewer)
