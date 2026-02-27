import React from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';

export const AuthLayout = ({ children }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #00bd7d 0%, #00a56d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            p: 4,
            borderRadius: 2,
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              component="img"
              src="/assets/logo.png"
              alt="OutfitGo Admin"
              sx={{
                height: 60,
                width: 'auto',
                objectFit: 'contain',
                mb: 2,
                mx: 'auto',
                display: 'block'
              }}
            />
            <Typography variant="body2" color="text.secondary">
              Management Dashboard
            </Typography>
          </Box>
          {children}
        </Paper>
      </Container>
    </Box>
  );
};
