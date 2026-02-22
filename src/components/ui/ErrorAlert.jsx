import React from 'react';
import { Alert, IconButton, Collapse } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const ErrorAlert = ({ error, onClose, severity = 'error', ...props }) => {
  if (!error) return null;

  return (
    <Alert
      severity={severity}
      action={
        <IconButton
          aria-label="close"
          color="inherit"
          size="small"
          onClick={onClose}
        >
          <CloseIcon fontSize="inherit" />
        </IconButton>
      }
      sx={{ mb: 2 }}
      {...props}
    >
      {error}
    </Alert>
  );
};

export default ErrorAlert;
