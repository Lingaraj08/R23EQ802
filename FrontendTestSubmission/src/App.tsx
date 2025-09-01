import React from 'react';
import { Container, Box, Tabs, Tab } from '@mui/material';
import { StoreProvider } from './store/Store';
import { Shortener } from './components/Shortener';
import { LinksList } from './components/LinksList';
import { Stats } from './components/Stats';
import './App.css';

export default function App() {
  const [tab, setTab] = React.useState(0);
  return (
    <StoreProvider>
      <Container maxWidth="md" style={{ marginTop: 24 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: 2 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab label="Shorten" />
            <Tab label="Links" />
            <Tab label="Statistics" />
          </Tabs>
        </Box>

        {tab === 0 && <Shortener />}
        {tab === 1 && <LinksList />}
        {tab === 2 && <Stats />}
      </Container>
    </StoreProvider>
  );
}
