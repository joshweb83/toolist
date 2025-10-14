import { Container, Typography, Box, Button } from '@mui/material';
import Link from 'next/link';

export default function HomePage() {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to Toolist!
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          A collection of handy web utilities.
        </Typography>
        <Link href="/tools/script-timer" passHref>
          <Button variant="contained" size="large">
            Go to Script-Timer
          </Button>
        </Link>
      </Box>
    </Container>
  );
}