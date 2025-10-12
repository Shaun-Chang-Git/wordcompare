import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Divider,
  Box,
  Typography,
} from '@mui/material'
import { ComparisonOptions as ComparisonOptionsType } from '../../types'

interface ComparisonOptionsProps {
  open: boolean
  onClose: () => void
  options: ComparisonOptionsType
  onOptionsChange: (options: ComparisonOptionsType) => void
}

const ComparisonOptions = ({ open, onClose, options, onOptionsChange }: ComparisonOptionsProps) => {
  const [localOptions, setLocalOptions] = useState<ComparisonOptionsType>(options)

  const handleCheckboxChange = (field: keyof ComparisonOptionsType) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setLocalOptions({
      ...localOptions,
      [field]: event.target.checked,
    })
  }

  const handleDetailLevelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalOptions({
      ...localOptions,
      detailLevel: event.target.value as ComparisonOptionsType['detailLevel'],
    })
  }

  const handleDisplayModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalOptions({
      ...localOptions,
      displayMode: event.target.value as ComparisonOptionsType['displayMode'],
    })
  }

  const handleApply = () => {
    onOptionsChange(localOptions)
    onClose()
  }

  const handleReset = () => {
    const defaultOptions: ComparisonOptionsType = {
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
    }
    setLocalOptions(defaultOptions)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>비교 옵션 설정</DialogTitle>
      <DialogContent>
        {/* 비교 설정 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
            비교 설정
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={localOptions.compareFormatting}
                onChange={handleCheckboxChange('compareFormatting')}
              />
            }
            label="서식 비교 (글꼴, 크기, 색상, 스타일)"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={localOptions.caseSensitive}
                onChange={handleCheckboxChange('caseSensitive')}
              />
            }
            label="대/소문자 구분"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={localOptions.compareWhitespace}
                onChange={handleCheckboxChange('compareWhitespace')}
              />
            }
            label="공백 비교 (스페이스, 탭, 줄바꿈)"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={localOptions.compareTables}
                onChange={handleCheckboxChange('compareTables')}
              />
            }
            label="표 (테이블 구조 및 내용)"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={localOptions.compareHeadersFooters}
                onChange={handleCheckboxChange('compareHeadersFooters')}
              />
            }
            label="머리글/바닥글"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={localOptions.compareFootnotes}
                onChange={handleCheckboxChange('compareFootnotes')}
              />
            }
            label="각주 및 미주"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={localOptions.compareFields}
                onChange={handleCheckboxChange('compareFields')}
              />
            }
            label="필드"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={localOptions.compareTextBoxes}
                onChange={handleCheckboxChange('compareTextBoxes')}
              />
            }
            label="텍스트 상자"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={localOptions.compareComments}
                onChange={handleCheckboxChange('compareComments')}
              />
            }
            label="주석 및 변경 내용 추적"
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* 표시 수준 */}
        <Box sx={{ mb: 3 }}>
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ fontWeight: 'bold' }}>
              표시 수준
            </FormLabel>
            <RadioGroup value={localOptions.detailLevel} onChange={handleDetailLevelChange}>
              <FormControlLabel value="character" control={<Radio />} label="문자 수준 (가장 상세함)" />
              <FormControlLabel value="word" control={<Radio />} label="단어 수준" />
              <FormControlLabel value="sentence" control={<Radio />} label="문장 수준" />
              <FormControlLabel value="paragraph" control={<Radio />} label="단락 수준" />
            </RadioGroup>
          </FormControl>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* 원본 표시 방법 */}
        <Box>
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ fontWeight: 'bold' }}>
              원본 표시 방법
            </FormLabel>
            <RadioGroup value={localOptions.displayMode} onChange={handleDisplayModeChange}>
              <FormControlLabel
                value="sideBySide"
                control={<Radio />}
                label="원본과 수정본 나란히 표시"
              />
              <FormControlLabel value="unified" control={<Radio />} label="통합 문서로 표시" />
              <FormControlLabel value="modified" control={<Radio />} label="수정본만 표시" />
            </RadioGroup>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleReset} color="inherit">
          기본값으로 재설정
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button onClick={onClose}>취소</Button>
        <Button onClick={handleApply} variant="contained">
          적용
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ComparisonOptions
