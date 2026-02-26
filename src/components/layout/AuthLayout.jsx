import React from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';

export const AuthLayout = ({ children }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #16A085 0%, #138D75 100%)',
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
            <Typography variant="h4" component="h1" gutterBottom color="primary">
              OutfitGo Admin
            </Typography>
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
