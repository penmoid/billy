import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@mui/material';

function SettingsDialog({ open, onClose, settings, saveSettings }) {
  const [title, setTitle] = useState(settings.title || 'Billy');
  const [past, setPast] = useState(settings.pastPeriods);
  const [future, setFuture] = useState(settings.futurePeriods);

  useEffect(() => {
    setTitle(settings.title);
    setPast(settings.pastPeriods);
    setFuture(settings.futurePeriods);
  }, [settings]);

  const handleSave = () => {
    saveSettings({ title, pastPeriods: past, futurePeriods: future });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="settings-dialog-title">
      <DialogTitle id="settings-dialog-title">Settings</DialogTitle>
      <DialogContent>
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Past Pay Periods</InputLabel>
          <Select
            label="Past Pay Periods"
            value={past}
            onChange={(e) => setPast(parseInt(e.target.value, 10))}
          >
            {[0, 1, 2, 3].map((n) => (
              <MenuItem key={n} value={n}>
                {n}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel>Future Pay Periods</InputLabel>
          <Select
            label="Future Pay Periods"
            value={future}
            onChange={(e) => setFuture(parseInt(e.target.value, 10))}
          >
            {Array.from({ length: 7 }, (_, i) => i).map((n) => (
              <MenuItem key={n} value={n}>
                {n}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SettingsDialog;
