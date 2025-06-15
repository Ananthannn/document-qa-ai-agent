import { styled } from '@mui/material/styles';
import { Box, Paper } from '@mui/material';

export const UploadBox = styled(Paper)(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.spacing(2),
  padding: theme.spacing(4),
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backgroundColor: theme.palette.background.default,
  '&:hover': {
    borderColor: theme.palette.primary.dark,
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  }
}));

export const AnswerBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
  marginTop: theme.spacing(3),
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '4px',
    height: '100%',
    backgroundColor: theme.palette.primary.main,
    borderTopLeftRadius: theme.spacing(2),
    borderBottomLeftRadius: theme.spacing(2),
  }
}));