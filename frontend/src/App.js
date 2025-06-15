import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  TextField,
  Paper,
  CircularProgress,
  Stack
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import Footer from './components/Footer';

const UploadZone = styled(Paper)(({ theme, isDragging }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  backgroundColor: isDragging ? 'rgba(108, 99, 255, 0.1)' : 'rgba(36, 38, 50, 0.8)',
  border: `2px dashed ${isDragging ? theme.palette.primary.main : 'rgba(108, 99, 255, 0.3)'}`,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    transform: 'translateY(-2px)',
  },
}));

const QuestionField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    backgroundColor: 'rgba(36, 38, 50, 0.8)',
    '& textarea': {
      color: '#B3C0FF',  // Light purple for input text
    },
    '& textarea::placeholder': {
      color: '#8B9DFF',  // Soft purple for placeholder
      opacity: 0.7,
    },
    '&:hover': {
      '& fieldset': {
        borderColor: '#6C63FF', // Brighter purple on hover
      },
    },
    '& fieldset': {
      borderColor: 'rgba(108, 99, 255, 0.3)',
    },
  },
}));

function App() {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    setLoading(true);
    const formData = new FormData();
    files.forEach(file => formData.append('pdf', file));

    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      const data = await response.json();
      setFile(files);
      setAnswer('✨ PDFs uploaded successfully! Ask me anything about them.');
    } catch (error) {
      setAnswer('❌ Upload failed. Please try again.');
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionSubmit = async () => {
    if (!question.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() })
      });
      
      const data = await response.json();
      setAnswer(data.answer);
    } catch (error) {
      setAnswer('❌ Failed to get an answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const files = Array.from(event.dataTransfer.files).filter(
      file => file.type === 'application/pdf'
    );

    if (files.length === 0) {
      setAnswer('❌ Please upload only PDF files');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    files.forEach(file => formData.append('pdf', file));

    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      const data = await response.json();
      setFile(files);
      setAnswer('✨ PDFs uploaded successfully! Ask me anything about them.');
    } catch (error) {
      setAnswer('❌ Upload failed. Please try again.');
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
        rgba(108, 99, 255, 0.15) 0%, 
        rgba(30, 31, 46, 0.8) 25%, 
        #13141C 100%)`,
      position: 'relative',
      py: 4,
      transition: 'background 0.3s ease',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
          rgba(108, 99, 255, 0.1) 0%, 
          transparent 60%)`,
        pointerEvents: 'none',
        transition: 'background 0.3s ease',
      }
    }}>
      <Container maxWidth="md">
        <Stack spacing={4}>
          <Typography 
            variant="h1" 
            align="center"
            sx={{ 
              mb: 2,
              background: 'linear-gradient(45deg, #6C63FF, #8F88FF)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.02)',
                background: 'linear-gradient(45deg, #8F88FF, #6C63FF)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
              }
            }}
          >
            PDF Bestie ✨
          </Typography>

          <UploadZone
            isDragging={isDragging}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            sx={{
              '&:hover': {
                borderColor: 'primary.main',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 20px rgba(108, 99, 255, 0.15)',
                background: 'linear-gradient(145deg, rgba(36, 38, 50, 0.9) 0%, rgba(44, 42, 60, 0.9) 100%)',
              }
            }}
          >
            <input
              accept="application/pdf"
              style={{ display: 'none' }}
              id="pdf-upload"
              multiple
              type="file"
              onChange={handleFileUpload}
              disabled={loading}
            />
            <label htmlFor="pdf-upload">
              <Stack spacing={2} alignItems="center">
                <CloudUploadIcon 
                  sx={{ 
                    fontSize: 48, 
                    color: isDragging ? 'primary.main' : 'primary.light',
                    transform: isDragging ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.3s ease'
                  }} 
                />
                <Typography variant="h6" color="primary.main">
                  {isDragging ? 'Drop PDFs here' : 'Drop your PDFs here'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  or click to choose files
                </Typography>
                {file && (
                  <Stack spacing={1}>
                    {Array.isArray(file) ? file.map((f, i) => (
                      <Typography key={i} color="success.main">
                        ✓ {f.name}
                      </Typography>
                    )) : (
                      <Typography color="success.main">
                        ✓ {file.name}
                      </Typography>
                    )}
                  </Stack>
                )}
              </Stack>
            </label>
          </UploadZone>

          <Paper 
            elevation={1}
            sx={{ p: 3, bgcolor: 'background.paper' }}
          >
            <Stack spacing={2}>
              <QuestionField
                fullWidth
                placeholder="Ask me anything about your PDFs..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleQuestionSubmit()}
                disabled={!file || loading}
                multiline
                rows={2}
              />
              <Button
                variant="contained"
                onClick={handleQuestionSubmit}
                disabled={!file || !question.trim() || loading}
                endIcon={loading ? <CircularProgress size={20} /> : <SendRoundedIcon />}
                sx={{ 
                  alignSelf: 'flex-end',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 15px rgba(108, 99, 255, 0.2)',
                  }
                }}
              >
                Ask Away!
              </Button>
            </Stack>

            {answer && (
              <Paper 
                sx={{ 
                  p: 3, 
                  mt: 2, 
                  backgroundColor: 'rgba(36, 38, 50, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(108, 99, 255, 0.2)',
                  boxShadow: '0 4px 15px rgba(108, 99, 255, 0.1)',
                }}
              >
                <Typography color="text.primary">{answer}</Typography>
              </Paper>
            )}
          </Paper>
        </Stack>
      </Container>
      <Footer />
    </Box>
  );
}

export default App;