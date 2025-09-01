import React from 'react';
import { Paper, List, ListItem, ListItemText, Button, Typography, Chip } from '@mui/material';
import { useStore } from '../store/Store';

export const LinksList: React.FC = () => {
  const { state, dispatch } = useStore();
  const now = Date.now();

  const handleOpen = async (id: string, original: string) => {
    const detail = {
      timestamp: Date.now(),
      referrer: document.referrer || null,
      source: navigator.userAgent || null,
      geo: null as any,
    };
    // try to fetch coarse geo (ipapi.co)
    try {
      const res = await fetch('https://ipapi.co/json/');
      if (res.ok) {
        const j = await res.json();
        detail.geo = { country: j.country_name, city: j.city };
      }
    } catch {
      detail.geo = null;
    }
    dispatch({ type: 'INCREMENT_CLICK', payload: { id, detail } });
    window.open(original, '_blank', 'noopener');
  };

  return (
    <Paper style={{ padding: 16 }}>
      <Typography variant="h6" gutterBottom>
        Links
      </Typography>
      <List>
        {state.links.map(l => {
          const expired = !!l.expiresAt && l.expiresAt <= now;
          return (
            <ListItem key={l.id} divider secondaryAction={
              <Button variant="outlined" color="primary" disabled={expired} onClick={() => handleOpen(l.id, l.original)}>
                Open
              </Button>
            }>
              <ListItemText
                primary={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <a href={l.original} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#0d47a1' }}>
                      {window.location.origin + '/r/' + l.id}
                    </a>
                    {expired ? <Chip label="Expired" color="default" size="small" /> : <Chip label={`${l.clicks} clicks`} color="success" size="small" />}
                  </div>
                }
                secondary={
                  <>
                    <div style={{ fontSize: 13, color: '#555' }}>Original: {l.original}</div>
                    <div style={{ fontSize: 12, color: '#777' }}>
                      Created: {new Date(l.createdAt).toLocaleString()}
                      {l.expiresAt ? ' — Expires: ' + new Date(l.expiresAt).toLocaleString() : ' — Never expires'}
                    </div>
                  </>
                }
              />
            </ListItem>
          );
        })}
        {state.links.length === 0 && <Typography variant="body2" style={{ padding: 12 }}>No links yet.</Typography>}
      </List>
    </Paper>
  );
};