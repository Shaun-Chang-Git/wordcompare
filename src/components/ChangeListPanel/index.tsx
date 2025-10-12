import { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
  Divider,
  SelectChangeEvent,
} from '@mui/material'
import {
  MyLocation as MyLocationIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material'
import { ChangeType, ComparisonResult, ChangeStatus } from '../../types'

interface ChangeListPanelProps {
  result: ComparisonResult
  onNavigateToChange: (index: number) => void
  onAcceptChange: (changeId: string) => void
  onRejectChange: (changeId: string) => void
}

type FilterType = 'all' | 'added' | 'deleted' | 'modified' | 'moved' | 'format_changed'
type SortType = 'position' | 'type' | 'size'

const ChangeListPanel = ({ result, onNavigateToChange, onAcceptChange, onRejectChange }: ChangeListPanelProps) => {
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [sortType, setSortType] = useState<SortType>('position')

  const { changes, statistics } = result

  // Filter changes
  const filteredChanges = changes.filter((change) => {
    if (filterType === 'all') return true
    return change.type === filterType
  })

  // Sort changes
  const sortedChanges = [...filteredChanges].sort((a, b) => {
    switch (sortType) {
      case 'position':
        return a.position.paragraph - b.position.paragraph
      case 'type':
        return a.type.localeCompare(b.type)
      case 'size':
        return (b.content?.length || 0) - (a.content?.length || 0)
      default:
        return 0
    }
  })

  // Get change type display info
  const getChangeTypeInfo = (type: ChangeType) => {
    switch (type) {
      case ChangeType.ADDED:
        return { label: '추가', color: 'success', icon: '✅' }
      case ChangeType.DELETED:
        return { label: '삭제', color: 'error', icon: '❌' }
      case ChangeType.MODIFIED:
        return { label: '수정', color: 'warning', icon: '⚠️' }
      case ChangeType.MOVED:
        return { label: '이동', color: 'info', icon: '🔵' }
      case ChangeType.FORMAT_CHANGED:
        return { label: '서식', color: 'secondary', icon: '🎨' }
      default:
        return { label: '기타', color: 'default', icon: '❔' }
    }
  }

  const handleFilterChange = (event: SelectChangeEvent<FilterType>) => {
    setFilterType(event.target.value as FilterType)
  }

  const handleSortChange = (event: SelectChangeEvent<SortType>) => {
    setSortType(event.target.value as SortType)
  }

  const handleNavigate = (index: number) => {
    // Find the original index of this change in the unfiltered list
    const change = sortedChanges[index]
    const originalIndex = changes.findIndex((c) => c.id === change.id)
    onNavigateToChange(originalIndex)
  }

  return (
    <Paper elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" gutterBottom>
          📋 변경사항 목록
        </Typography>
        <Typography variant="body2">
          전체 {statistics.totalChanges}개 변경사항
        </Typography>
      </Box>

      {/* Statistics chips */}
      <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Chip
          label={`추가 ${statistics.added}`}
          size="small"
          color="success"
          variant={filterType === 'added' ? 'filled' : 'outlined'}
          onClick={() => setFilterType(filterType === 'added' ? 'all' : 'added')}
        />
        <Chip
          label={`삭제 ${statistics.deleted}`}
          size="small"
          color="error"
          variant={filterType === 'deleted' ? 'filled' : 'outlined'}
          onClick={() => setFilterType(filterType === 'deleted' ? 'all' : 'deleted')}
        />
        <Chip
          label={`수정 ${statistics.modified}`}
          size="small"
          color="warning"
          variant={filterType === 'modified' ? 'filled' : 'outlined'}
          onClick={() => setFilterType(filterType === 'modified' ? 'all' : 'modified')}
        />
        <Chip
          label={`이동 ${statistics.moved}`}
          size="small"
          color="info"
          variant={filterType === 'moved' ? 'filled' : 'outlined'}
          onClick={() => setFilterType(filterType === 'moved' ? 'all' : 'moved')}
        />
        <Chip
          label={`서식 ${statistics.formatChanged}`}
          size="small"
          color="secondary"
          variant={filterType === 'format_changed' ? 'filled' : 'outlined'}
          onClick={() => setFilterType(filterType === 'format_changed' ? 'all' : 'format_changed')}
        />
      </Box>

      <Divider />

      {/* Filter and sort controls */}
      <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
        <FormControl size="small" sx={{ flex: 1 }}>
          <InputLabel>필터</InputLabel>
          <Select value={filterType} label="필터" onChange={handleFilterChange}>
            <MenuItem value="all">전체 보기</MenuItem>
            <MenuItem value="added">추가만 보기</MenuItem>
            <MenuItem value="deleted">삭제만 보기</MenuItem>
            <MenuItem value="modified">수정만 보기</MenuItem>
            <MenuItem value="moved">이동만 보기</MenuItem>
            <MenuItem value="format_changed">서식 변경만 보기</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ flex: 1 }}>
          <InputLabel>정렬</InputLabel>
          <Select value={sortType} label="정렬" onChange={handleSortChange}>
            <MenuItem value="position">위치순</MenuItem>
            <MenuItem value="type">유형별</MenuItem>
            <MenuItem value="size">크기별</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Divider />

      {/* Change list */}
      <List
        sx={{
          flex: 1,
          overflow: 'auto',
          bgcolor: 'grey.50',
        }}
      >
        {sortedChanges.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              표시할 변경사항이 없습니다.
            </Typography>
          </Box>
        ) : (
          sortedChanges.map((change, index) => {
            const typeInfo = getChangeTypeInfo(change.type)
            return (
              <ListItem
                key={change.id}
                sx={{
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
                secondaryAction={
                  <Box>
                    <Tooltip title="위치로 이동">
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => handleNavigate(index)}
                      >
                        <MyLocationIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="수락">
                      <IconButton
                        edge="end"
                        size="small"
                        color="success"
                        onClick={() => onAcceptChange(change.id)}
                        disabled={change.status === ChangeStatus.ACCEPTED}
                      >
                        <CheckCircleIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="거부">
                      <IconButton
                        edge="end"
                        size="small"
                        color="error"
                        onClick={() => onRejectChange(change.id)}
                        disabled={change.status === ChangeStatus.REJECTED}
                      >
                        <CancelIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                        {typeInfo.icon} {index + 1}.
                      </Typography>
                      <Chip
                        label={typeInfo.label}
                        size="small"
                        color={typeInfo.color as any}
                        variant="outlined"
                      />
                      {change.status === ChangeStatus.ACCEPTED && (
                        <Chip label="수락됨" size="small" color="success" />
                      )}
                      {change.status === ChangeStatus.REJECTED && (
                        <Chip label="거부됨" size="small" color="error" />
                      )}
                      <Typography variant="caption" color="text.secondary">
                        {change.position.page}페이지, {change.position.paragraph}단락
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          mb: 0.5,
                        }}
                      >
                        {change.content.substring(0, 150)}
                        {change.content.length > 150 ? '...' : ''}
                      </Typography>
                      {change.beforeContent && change.afterContent && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="error.dark" sx={{ display: 'block' }}>
                            이전: {change.beforeContent.substring(0, 80)}
                            {change.beforeContent.length > 80 ? '...' : ''}
                          </Typography>
                          <Typography variant="caption" color="success.dark" sx={{ display: 'block' }}>
                            이후: {change.afterContent.substring(0, 80)}
                            {change.afterContent.length > 80 ? '...' : ''}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            )
          })
        )}
      </List>

      {/* Footer with result count */}
      <Divider />
      <Box sx={{ p: 1.5, bgcolor: 'grey.100', textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          {sortedChanges.length}개 항목 표시 중
        </Typography>
      </Box>
    </Paper>
  )
}

export default ChangeListPanel
