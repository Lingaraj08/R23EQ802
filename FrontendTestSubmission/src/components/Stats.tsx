import React from 'react';
import { Paper, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';
import { useStore } from '../store/Store';

export const Stats: React.FC = () => {
  const { state } = useStore();

  return (
    <Paper style={{ padding: 16 }}>
      <Typography variant="h6" gutterBottom>
        URL Statistics
      </Typography>

      {state.links.length === 0 && <Typography>No shortened URLs available.</Typography>}

      <List>
        {state.links.map(link => (
          <div key={link.id}>
            <ListItem>
              <ListItemText
                primary={`${window.location.origin}/r/${link.id}`}
                secondary={`Original: ${link.original} — Clicks: ${link.clicks} — Created: ${new Date(link.createdAt).toLocaleString()}`}
              />
            </ListItem>

            <div style={{ paddingLeft: 16, paddingRight: 16, paddingBottom: 12 }}>
              <Typography variant="subtitle2">Click details</Typography>
              {link.clickDetails.length === 0 && <Typography variant="body2">No clicks yet.</Typography>}
              {link.clickDetails.map((c, idx) => (
                <div key={idx} style={{ fontSize: 13, color: '#333', marginTop: 6 }}>
                  <div><strong>When:</strong> {new Date(c.timestamp).toLocaleString()}</div>
                  <div><strong>Source:</strong> {c.source || 'unknown'}</div>
                  <div><strong>Referrer:</strong> {c.referrer || 'direct'}</div>
                  <div><strong>Geo:</strong> {c.geo ? `${c.geo.city || ''} ${c.geo.country || ''}`.trim() : 'unknown'}</div>
                </div>
              ))}
            </div>
            <Divider />
          </div>
        ))}
      </List>
    </Paper>
  );
};