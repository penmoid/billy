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
  Chip,
} from '@mui/material';
import { format } from 'date-fns-tz';
import { getPayPeriods, calculatePayPeriodIndex } from '../utils/payPeriodUtils';
import { formatNumber } from '../utils/numberUtils';
import DateRangeIcon from '@mui/icons-material/DateRange';

function PayPeriodSelector({ bills, setPayPeriod }) {
  const [payPeriods, setPayPeriods] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState('');
  const timeZone = 'America/Los_Angeles';
  const isFirstRender = useRef(true);
  const currentIndex = calculatePayPeriodIndex(new Date());

  useEffect(() => {
    const periods = getPayPeriods(bills, 3, 1);
    setPayPeriods(periods);

    // On first render, select the current pay period
    if (isFirstRender.current) {
      const currentPeriod = periods.find((p) => p.index === currentIndex);
      if (currentPeriod) {
        setSelectedIndex(currentPeriod.index.toString());
        setPayPeriod([currentPeriod.start, currentPeriod.end]);
      } else if (periods.length > 0) {
        setSelectedIndex(periods[0].index.toString());
        setPayPeriod([periods[0].start, periods[0].end]);
      }
      isFirstRender.current = false;
    } else {
      // If the selectedIndex is still valid, keep it; otherwise, reset
      const selectedPeriod = periods.find((p) => p.index.toString() === selectedIndex);
      if (!selectedPeriod) {
        const currentPeriod = periods.find((p) => p.index === currentIndex);
        if (currentPeriod) {
          setSelectedIndex(currentPeriod.index.toString());
          setPayPeriod([currentPeriod.start, currentPeriod.end]);
        } else if (periods.length > 0) {
          setSelectedIndex(periods[0].index.toString());
          setPayPeriod([periods[0].start, periods[0].end]);
        } else {
          setSelectedIndex('');
          setPayPeriod([null, null]);
        }
      }
    }
  }, [bills, selectedIndex, setPayPeriod, currentIndex]);

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
          renderValue={(selected) => {
            const period = payPeriods.find((p) => p.index.toString() === selected);
            if (!period) return '';
            const status =
              period.index === currentIndex
                ? 'Current'
                : period.index < currentIndex
                ? 'Past'
                : 'Future';
            const color =
              status === 'Current' ? 'success' : status === 'Future' ? 'secondary' : 'default';
            return (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <DateRangeIcon fontSize="small" sx={{ mr: 1 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                  <Typography variant="body1">
                    {format(period.start, 'MMM dd', { timeZone })} -{' '}
                    {format(period.end, 'MMM dd', { timeZone })}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">${formatNumber(period.totalAmount)}</Typography>
                    <Chip label={status} color={color} size="small" />
                  </Box>
                </Box>
              </Box>
            );
          }}
        >
          {payPeriods.map((period) => {
            const status =
              period.index === currentIndex
                ? 'Current'
                : period.index < currentIndex
                ? 'Past'
                : 'Future';
            const color =
              status === 'Current' ? 'success' : status === 'Future' ? 'secondary' : 'default';
            return (
              <MenuItem key={period.index} value={period.index.toString()}>
                <ListItemIcon>
                  <DateRangeIcon fontSize="small" />
                </ListItemIcon>
                <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                  <Typography variant="body1">
                    {format(period.start, 'MMM dd', { timeZone })} -{' '}
                    {format(period.end, 'MMM dd', { timeZone })}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">${formatNumber(period.totalAmount)}</Typography>
                    <Chip label={status} color={color} size="small" />
                  </Box>
                </Box>
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    </Box>
  );
}

export default PayPeriodSelector;
