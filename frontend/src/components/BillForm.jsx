// src/components/BillForm.jsx

import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  InputAdornment,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from '@mui/material';

function BillForm({ addBill }) {
  const [bill, setBill] = useState({
    name: '',
    dueDay: '',
    amount: '',
    frequency: 'monthly', // Default frequency
    transactionType: 'EFT', // Default transaction type
    autoPay: true, // Default autoPay
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newBill = {
      ...bill,
      id: Date.now(),
      paymentHistory: {},
    };
    addBill(newBill);
    setBill({
      name: '',
      dueDay: '',
      amount: '',
      frequency: 'monthly',
      transactionType: 'EFT',
      autoPay: true,
    });
  };

  return (
    <Box mt={4}>
      <Typography variant="h6">Add a New Bill</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          label="Bill Name"
          value={bill.name}
          onChange={(e) => setBill({ ...bill, name: e.target.value })}
          required
          fullWidth
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Frequency</InputLabel>
          <Select
            label="Frequency"
            value={bill.frequency}
            onChange={(e) => setBill({ ...bill, frequency: e.target.value })}
          >
            <MenuItem value="monthly">Monthly</MenuItem>
            <MenuItem value="weekly">Weekly</MenuItem>
            <MenuItem value="biweekly">Per Pay Period</MenuItem>
          </Select>
        </FormControl>
        {bill.frequency === 'monthly' && (
          <TextField
            label="Due Day"
            type="number"
            value={bill.dueDay}
            onChange={(e) => setBill({ ...bill, dueDay: e.target.value })}
            required
            fullWidth
            margin="normal"
            InputProps={{ inputProps: { min: 1, max: 31 } }}
          />
        )}
        {bill.frequency === 'weekly' && (
          <FormControl fullWidth margin="normal">
            <InputLabel>Day of Week</InputLabel>
            <Select
              label="Day of Week"
              value={bill.dueDay}
              onChange={(e) => setBill({ ...bill, dueDay: e.target.value })}
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
          value={bill.amount}
          onChange={(e) => setBill({ ...bill, amount: e.target.value })}
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
            value={bill.transactionType}
            onChange={(e) => setBill({ ...bill, transactionType: e.target.value })}
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
              checked={bill.autoPay}
              onChange={(e) => setBill({ ...bill, autoPay: e.target.checked })}
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
          Add Bill
        </Button>
      </Box>
    </Box>
  );
}

export default BillForm;
