// src/components/EditBillForm.jsx

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  FormControlLabel,
  Checkbox,
} from '@mui/material';

function EditBillForm({ bill, updateBill, handleClose }) {
  const [updatedBill, setUpdatedBill] = useState({ ...bill });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateBill(updatedBill);
    handleClose();
  };

  return (
    <Dialog open onClose={handleClose}>
      <DialogTitle>Edit Bill</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            label="Bill Name"
            value={updatedBill.name}
            onChange={(e) => setUpdatedBill({ ...updatedBill, name: e.target.value })}
            required
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Frequency</InputLabel>
            <Select
              label="Frequency"
              value={updatedBill.frequency || 'monthly'}
              onChange={(e) =>
                setUpdatedBill({ ...updatedBill, frequency: e.target.value })
              }
            >
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="biweekly">Per Pay Period</MenuItem>
            </Select>
          </FormControl>
          {updatedBill.frequency === 'monthly' && (
            <TextField
              label="Due Day"
              type="number"
              value={updatedBill.dueDay}
              onChange={(e) =>
                setUpdatedBill({ ...updatedBill, dueDay: e.target.value })
              }
              required
              fullWidth
              margin="normal"
              InputProps={{ inputProps: { min: 1, max: 31 } }}
            />
          )}
          {updatedBill.frequency === 'weekly' && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Day of Week</InputLabel>
              <Select
                label="Day of Week"
                value={updatedBill.dueDay}
                onChange={(e) =>
                  setUpdatedBill({ ...updatedBill, dueDay: e.target.value })
                }
              >
                <MenuItem value="0">Sunday</MenuItem>
                <MenuItem value="1">Monday</MenuItem>
                <MenuItem value="2">Tuesday</MenuItem>
                <MenuItem value="3">Wednesday</MenuItem>
                <MenuItem value="4">Thursday</MenuItem>
                <MenuItem value="5">Friday</MenuItem>
                <MenuItem value="6">Saturday</MenuItem>
              </Select>
            </FormControl>
          )}
          <TextField
            label="Amount"
            type="number"
            value={updatedBill.amount}
            onChange={(e) =>
              setUpdatedBill({ ...updatedBill, amount: e.target.value })
            }
            required
            fullWidth
            margin="normal"
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
              inputProps: { min: 0, step: '1' },
            }}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Transaction Type</InputLabel>
            <Select
              label="Transaction Type"
              value={updatedBill.transactionType || 'EFT'}
              onChange={(e) =>
                setUpdatedBill({ ...updatedBill, transactionType: e.target.value })
              }
            >
              <MenuItem value="EFT">EFT</MenuItem>
              <MenuItem value="Cash">Cash</MenuItem>
              <MenuItem value="Credit/Debit">Credit/Debit</MenuItem>
              <MenuItem value="Internal Transfer">Internal Transfer</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Checkbox
                checked={updatedBill.autoPay ?? true}
                onChange={(e) =>
                  setUpdatedBill({ ...updatedBill, autoPay: e.target.checked })
                }
                name="autoPay"
                color="primary"
              />
            }
            label="Auto-Pay"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            fullWidth
          >
            Save Changes
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default EditBillForm;
