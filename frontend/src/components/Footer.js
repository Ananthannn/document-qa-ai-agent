import React from 'react';
import { Box, Link, Stack, Typography, IconButton } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailIcon from '@mui/icons-material/Email';
import GitHubIcon from '@mui/icons-material/GitHub';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        width: '100%',
        py: 3,
        mt: 4,
        borderTop: '1px solid rgba(139, 157, 255, 0.1)',
      }}
    >
      <Stack
        direction="row"
        spacing={3}
        justifyContent="center"
        alignItems="center"
      >
        <IconButton
          component={Link}
          href="https://www.instagram.com/v_ananthann_?igsh=MWFlcHo5a2pvNm5yaA=="
          target="_blank"
          sx={{ 
            color: '#B3C0FF',
            '&:hover': { 
              color: '#FF6B6B',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s ease'
          }}
        >
          <InstagramIcon />
        </IconButton>

        <IconButton
          component={Link}
          href="https://www.linkedin.com/in/v-anantha-krishnan-739b942a5/"
          target="_blank"
          sx={{ 
            color: '#B3C0FF',
            '&:hover': { 
              color: '#0077B5',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s ease'
          }}
        >
          <LinkedInIcon />
        </IconButton>

        <IconButton
          component={Link}
          href="mailto:vananthakrs@gmail.com"
          sx={{ 
            color: '#B3C0FF',
            '&:hover': { 
              color: '#EA4335',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s ease'
          }}
        >
          <EmailIcon />
        </IconButton>

        <IconButton
          component={Link}
          href="https://github.com/Ananthannn"
          target="_blank"
          sx={{ 
            color: '#B3C0FF',
            '&:hover': { 
              color: '#FFFFFF',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s ease'
          }}
        >
          <GitHubIcon />
        </IconButton>
      </Stack>

      <Typography 
        variant="body2" 
        align="center" 
        sx={{ 
          mt: 2,
          color: '#8B9DFF',
          opacity: 0.8
        }}
      >
        © {new Date().getFullYear()} V Anantha Krishnan
      </Typography>
    </Box>
  );
};

export default Footer;