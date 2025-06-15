import React, { useState } from 'react';
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

const UploadZone = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  backgroundColor: 'rgba(36, 38, 50, 0.8)',
  backdropFilter: 'blur(10px)',
  border: `2px dashed ${theme.palette.primary.main}`,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.light,
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 20px ${theme.palette.primary.main}25`,
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

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #1A1B25 0%, #2C2A3C 100%)',
      py: 4,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Container maxWidth="md">
        <Stack spacing={4}>
          <Typography 
            variant="h1" 
            align="center"
            sx={{ 
              mb: 2,
              background: 'linear-gradient(45deg, #94B3FD, #FFB3B3)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            PDF Bestie ✨
          </Typography>

          <UploadZone>
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
                <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#8B9DFF',  // Light purple
                    fontWeight: 500,
                    mb: 1
                  }}
                >
                  Drop your PDFs here
                </Typography>

                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#B3C0FF',  // Lighter purple
                    opacity: 0.8 
                  }}
                >
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
                sx={{ alignSelf: 'flex-end' }}
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