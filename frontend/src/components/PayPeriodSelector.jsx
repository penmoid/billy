// src/components/PayPeriodSelector.jsx

import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ListItemIcon,
  Typography,
} from '@mui/material';
import { format } from 'date-fns-tz';
import { getPayPeriods } from '../utils/payPeriodUtils';
import { formatNumber } from '../utils/numberUtils';
import DateRangeIcon from '@mui/icons-material/DateRange';

function PayPeriodSelector({ bills, setPayPeriod }) {
  const [payPeriods, setPayPeriods] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState('');
  const timeZone = 'America/Los_Angeles';
  const isFirstRender = useRef(true);

  useEffect(() => {
    const periods = getPayPeriods(bills, 3, 1);
    setPayPeriods(periods);

    // On first render, set the selectedIndex to the current pay period
    if (isFirstRender.current) {
      if (periods.length > 0) {
        setSelectedIndex(periods[0].index.toString());
        setPayPeriod([periods[0].start, periods[0].end]);
      }
      isFirstRender.current = false;
    } else {
      // If the selectedIndex is still valid, keep it; otherwise, reset
      const selectedPeriod = periods.find((p) => p.index.toString() === selectedIndex);
      if (!selectedPeriod) {
        if (periods.length > 0) {
          setSelectedIndex(periods[0].index.toString());
          setPayPeriod([periods[0].start, periods[0].end]);
        } else {
          setSelectedIndex('');
          setPayPeriod([null, null]);
        }
      }
    }
  }, [bills, selectedIndex, setPayPeriod]);

  const handleChange = (event) => {
    const index = event.target.value;
    const selectedPeriod = payPeriods.find((p) => p.index.toString() === index);
    setSelectedIndex(index);
    setPayPeriod([selectedPeriod.start, selectedPeriod.end]);
  };

  return (
    <Box mt={2}>
      <FormControl fullWidth variant="outlined">
        <InputLabel>Pay Period</InputLabel>
        <Select
          value={selectedIndex}
          onChange={handleChange}
          label="Pay Period"
          disabled={payPeriods.length === 0}
          color="primary"
        >
          {payPeriods.map((period) => (
            <MenuItem key={period.index} value={period.index.toString()}>
              <ListItemIcon>
                <DateRangeIcon fontSize="small" />
              </ListItemIcon>
              <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                <Typography variant="body1">
                  {format(period.start, 'MMM dd', { timeZone })} -{' '}
                  {format(period.end, 'MMM dd', { timeZone })}
                </Typography>
                <Typography variant="body2">${formatNumber(period.totalAmount)}</Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}

export default PayPeriodSelector;
