import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const EditPost = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Edit Post
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This page is under development.
        </Typography>
      </Box>
    </Container>
  );
};

export default EditPost;
