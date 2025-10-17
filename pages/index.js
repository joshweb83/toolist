import { Container, Typography, Box, Paper, TableContainer, Table, TableBody, TableRow, TableCell } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';

const tools = [
  {
    name: 'Script-Timer',
    description: '대본 리딩 시간을 측정하는 타이머입니다.',
    href: '/tools/script-timer',
  },
  {
    name: 'VAT Calculator',
    description: '부가가치세(VAT)를 계산하는 도구입니다.',
    href: '/tools/vat-calculator',
  },
  {
    name: 'Newscraper',
    description: '뉴스 기사를 수집하는 도구입니다. (준비 중)',
    href: '/tools/newscraper',
  },
];

export default function HomePage() {
  const router = useRouter();

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom align="center">
          Welcome to Toolist!
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph align="center">
          A collection of handy web utilities.
        </Typography>
        <TableContainer component={Paper} elevation={3} sx={{ mt: 4 }}>
          <Table aria-label="tool list table">
            <TableBody>
              {tools.map((tool) => (
                <TableRow
                  key={tool.name}
                  hover
                  onClick={() => router.push(tool.href)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                    {tool.name}
                  </TableCell>
                  <TableCell>{tool.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
}