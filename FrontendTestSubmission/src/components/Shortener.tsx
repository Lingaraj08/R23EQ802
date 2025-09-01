import React, { useState } from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useStore } from '../store/Store';
import { nanoid } from 'nanoid';

type Row = { original: string; validity: string; preferred?: string; error?: string };

const MAX_ROWS = 5;
const SHORTCODE_RE = /^[A-Za-z0-9_-]{3,30}$/;

function defaultRow(): Row {
  return { original: '', validity: '30', preferred: '' };
}

export const Shortener: React.FC = () => {
  const { state, dispatch } = useStore();
  const existingIds = new Set(state.links.map(l => l.id));
  const [rows, setRows] = useState<Row[]>([defaultRow()]);

  const addRow = () => {
    if (rows.length >= MAX_ROWS) return;
    setRows([...rows, defaultRow()]);
  };
  const removeRow = (i: number) => setRows(rows.filter((_, idx) => idx !== i));

  const onChange = (i: number, k: keyof Row, v: string) => {
    const copy = rows.slice();
    copy[i] = { ...copy[i], [k]: v, error: undefined };
    setRows(copy);
  };

  function validateRow(r: Row) {
    try {
      const u = new URL(r.original);
      if (!['http:', 'https:'].includes(u.protocol)) return 'URL must be http or https';
    } catch {
      return 'Invalid URL';
    }
    const m = parseInt(r.validity || '30', 10);
    if (isNaN(m) || m < 0) return 'Validity must be integer >= 0';
    if (r.preferred) {
      if (!SHORTCODE_RE.test(r.preferred)) return 'Preferred shortcode invalid (3-30 alnum/_/-)';
      if (existingIds.has(r.preferred)) return 'Preferred shortcode already in use';
    }
    return null;
  }

  const submitAll = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const validated: Row[] = [];
    for (const r of rows) {
      const err = validateRow(r);
      if (err) {
        setRows(rows.map(rr => (rr === r ? { ...rr, error: err } : rr)));
        return;
      }
      validated.push(r);
    }

    const now = Date.now();
    for (const r of validated) {
      const minutes = Math.max(0, parseInt(r.validity || '30', 10) || 30);
      let id = r.preferred && r.preferred.trim() ? r.preferred.trim() : nanoid(7);
      let attempt = 0;
      while (existingIds.has(id) && attempt < 6) {
        id = id + Math.random().toString(36).slice(2, 5);
        attempt++;
      }
      existingIds.add(id);
      const expiresAt = minutes === 0 ? null : now + minutes * 60_000;
      const item = {
        id,
        original: r.original,
        createdAt: now,
        expiresAt,
        clicks: 0,
        clickDetails: [] as any[],
      };
      dispatch({ type: 'ADD_LINK', payload: item });
    }

    setRows([defaultRow()]);
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Create up to 5 short links
      </Typography>
      <form onSubmit={submitAll}>
        {rows.map((r, i) => (
          <Grid container spacing={1} key={i} alignItems="center" sx={{ mb: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Original URL"
                value={r.original}
                onChange={e => onChange(i, 'original', e.target.value)}
                fullWidth
                error={!!r.error}
                helperText={i === 0 && 'Enter full URL (https://...)'}
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField
                label="Validity (minutes)"
                value={r.validity}
                onChange={e => onChange(i, 'validity', e.target.value)}
                type="number"
                inputProps={{ min: 0 }}
                fullWidth
              />
            </Grid>

            <Grid item xs={5} md={2}>
              <TextField
                label="Preferred shortcode (optional)"
                value={r.preferred}
                onChange={e => onChange(i, 'preferred', e.target.value)}
                fullWidth
              />
            </Grid>

            <Grid item xs={1} md={1}>
              <IconButton size="small" onClick={() => removeRow(i)} disabled={rows.length === 1}>
                <RemoveIcon />
              </IconButton>
            </Grid>

            {r.error && (
              <Grid item xs={12}>
                <Typography color="error" variant="body2">
                  {r.error}
                </Typography>
              </Grid>
            )}
          </Grid>
        ))}

        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addRow}
            disabled={rows.length >= MAX_ROWS}
          >
            Add row
          </Button>
          <Button variant="contained" color="primary" type="submit">
            Shorten ({rows.length})
          </Button>
        </div>
      </form>
    </Paper>
  );
};
