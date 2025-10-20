import { Container, Typography, Box } from '@mui/material';

export default function NewscraperPage() {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          News Scraper
        </Typography>
        <Typography variant="h6" component="p" sx={{ mt: 4 }}>
          준비 중입니다.
        </Typography>
      </Box>
    </Container>
  );
}
