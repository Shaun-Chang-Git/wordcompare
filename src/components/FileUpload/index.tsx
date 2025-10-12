import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Box, Typography, Button } from '@mui/material'
import { CloudUpload as CloudUploadIcon, InsertDriveFile as FileIcon } from '@mui/icons-material'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  label: string
}

const FileUpload = ({ onFileSelect, label }: FileUploadProps) => {
  const [isDragActive, setIsDragActive] = useState(false)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        // Validate file type
        if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
          onFileSelect(file)
        } else {
          alert('Word 문서 파일(.docx, .doc)만 업로드 가능합니다.')
        }
      }
      setIsDragActive(false)
    },
    [onFileSelect]
  )

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
    },
    maxFiles: 1,
    noClick: true,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  })

  return (
    <Box
      {...getRootProps()}
      sx={{
        border: isDragActive ? '2px solid' : '2px dashed',
        borderColor: isDragActive ? 'primary.main' : 'grey.400',
        borderRadius: 2,
        p: 4,
        textAlign: 'center',
        cursor: 'pointer',
        bgcolor: isDragActive ? 'action.hover' : 'background.paper',
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: 'action.hover',
        },
      }}
    >
      <input {...getInputProps()} />

      {isDragActive ? (
        <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
      ) : (
        <FileIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
      )}

      <Typography variant="h6" color="text.primary" gutterBottom>
        {label}
      </Typography>

      {isDragActive ? (
        <Typography variant="body2" color="primary" sx={{ mb: 2 }}>
          파일을 여기에 놓으세요
        </Typography>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          파일을 드래그하거나 버튼을 클릭하세요
        </Typography>
      )}

      <Button
        variant="outlined"
        onClick={open}
        sx={{ mt: 1 }}
      >
        파일 선택
      </Button>

      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
        지원 형식: .docx, .doc
      </Typography>
    </Box>
  )
}

export default FileUpload
