// src/App.js

import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  IconButton,
  Box,
  CssBaseline,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { draculaTheme, lightTheme } from './theme'; // Corrected import for named exports
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import axios from 'axios';
import { isWithinInterval, compareAsc, isWeekend, addDays, parseISO } from 'date-fns';
import BillList from './components/BillList';
import BillManager from './components/BillManager';
import PayPeriodSelector from './components/PayPeriodSelector';
import { calculatePayPeriodIndex } from './utils/payPeriodUtils';

function App() {
  const [bills, setBills] = useState([]);
  const [payPeriod, setPayPeriod] = useState([new Date(), new Date()]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [adjustEFT, setAdjustEFT] = useState(true);
  const [sortOption, setSortOption] = useState('date');

  /**
   * Function to filter and sort bills based on current state.
   */
  const filterBills = useCallback(() => {
    const [start, end] = payPeriod;

    let filtered = [];

    bills.forEach((bill) => {
      if (!bill.frequency || bill.frequency === 'monthly') {
        // Monthly bills
        const dueDay = parseInt(bill.dueDay, 10);

        // Generate due dates for both the start month and the next month
        const dueDates = [
          new Date(start.getFullYear(), start.getMonth(), dueDay),
          new Date(start.getFullYear(), start.getMonth() + 1, dueDay),
        ];

        dueDates.forEach((dueDate) => {
          if (isWithinInterval(dueDate, { start, end })) {
            filtered.push({ ...bill, dueDate: dueDate });
          }
        });
      } else if (bill.frequency === 'weekly') {
        // Weekly bills
        const dayOfWeek = parseInt(bill.dueDay, 10); // 0 (Sunday) to 6 (Saturday)
        let currentDate = new Date(start);
        while (currentDate <= end) {
          if (currentDate.getDay() === dayOfWeek) {
            filtered.push({ ...bill, dueDate: new Date(currentDate) });
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else if (bill.frequency === 'biweekly') {
        // Biweekly bills: Assign the last day of the pay period as the due date
        const lastDayOfPayPeriod = end; // 'end' is already the last day of the pay period
        filtered.push({ ...bill, dueDate: lastDayOfPayPeriod });
      }
    });

    // Adjust EFT transactions on weekends
    filtered = filtered.map((bill) => {
      const payPeriodIndex = calculatePayPeriodIndex(payPeriod[0]);
      const paymentKey = `${payPeriodIndex}_${bill.dueDate.toISOString()}`;
      const isPaid = bill.paymentHistory && bill.paymentHistory[paymentKey];

      if (
        adjustEFT &&
        bill.transactionType === 'EFT' &&
        !isPaid &&
        isWeekend(bill.dueDate)
      ) {
        // Move to the following Monday
        bill.dueDate = addDays(bill.dueDate, 8 - bill.dueDate.getDay());
      }
      return bill;
    });

    // Remove duplicates after adjusting dates
    const uniqueBills = [];
    const billKeys = new Set();
    filtered.forEach((bill) => {
      const key = `${bill.id}_${bill.dueDate.toISOString()}`;
      if (!billKeys.has(key)) {
        billKeys.add(key);
        uniqueBills.push(bill);
      }
    });

    // Sorting based on sortOption
    uniqueBills.sort((a, b) => {
      if (sortOption === 'date') {
        return compareAsc(a.dueDate, b.dueDate);
      } else if (sortOption === 'amount') {
        return parseFloat(b.amount) - parseFloat(a.amount);
      } else if (sortOption === 'alphabetical') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    setFilteredBills(uniqueBills);
  }, [bills, payPeriod, adjustEFT, sortOption]);

  // Filter bills whenever dependencies change
  useEffect(() => {
    filterBills();
  }, [filterBills]); // Include filterBills in the dependency array

  // Load bills from the server on mount
  useEffect(() => {
    axios
      .get('/api/bills')
      .then((response) => {
        const parsedBills = response.data.map((bill) => ({
          ...bill,
          dueDate: bill.dueDate ? parseISO(bill.dueDate) : undefined,
          // Add parseISO for other date fields if necessary
        }));
        setBills(parsedBills);
      })
      .catch((error) => {
        console.error('There was an error fetching the bills!', error);
      });
  }, []);

  // Initialize theme based on localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedTheme);
  }, []);

  /**
   * Handler to toggle theme mode and persist the preference.
   */
  const handleThemeToggle = () => {
    setDarkMode((prevMode) => {
      localStorage.setItem('darkMode', !prevMode);
      return !prevMode;
    });
  };

  /**
   * Function to add a new bill.
   * @param {object} bill - The new bill object to add.
   */
  const addBill = (bill) => {
    // Ensure dueDate is a Date object if applicable
    const newBill = {
      ...bill,
      id: Date.now(),
      paymentHistory: {},
      dueDate: bill.dueDate ? parseISO(bill.dueDate.toISOString()) : undefined,
    };
    axios
      .post('/api/bills', newBill)
      .then((response) => {
        console.log(response.data.message);
        setBills([...bills, newBill]);
      })
      .catch((error) => {
        console.error('There was an error adding the bill!', error);
      });
  };

  /**
   * Function to toggle the paid status of a bill.
   * @param {string} id - The ID of the bill to toggle.
   * @param {Date} dueDate - The due date of the bill.
   */
  const togglePaid = (id, dueDate) => {
    const updatedBills = bills.map((bill) => {
      if (bill.id === id) {
        const updatedBill = { ...bill };
        const payPeriodIndex = calculatePayPeriodIndex(payPeriod[0]);

        if (!updatedBill.paymentHistory) {
          updatedBill.paymentHistory = {};
        }
        const paymentKey = `${payPeriodIndex}_${dueDate.toISOString()}`;

        // Toggle payment status for the current pay period and due date
        updatedBill.paymentHistory[paymentKey] = !updatedBill.paymentHistory[paymentKey];

        // Update on the server
        axios
          .put(`/api/bills/${id}`, updatedBill)
          .then((response) => {
            console.log(response.data.message);
          })
          .catch((error) => {
            console.error('There was an error updating the bill!', error);
          });

        return updatedBill;
      }
      return bill;
    });

    setBills(updatedBills);
  };

  /**
   * Function to delete a bill.
   * @param {string} id - The ID of the bill to delete.
   */
  const deleteBill = (id) => {
    axios
      .delete(`/api/bills/${id}`)
      .then((response) => {
        console.log(response.data.message);
        setBills(bills.filter((bill) => bill.id !== id));
      })
      .catch((error) => {
        console.error('There was an error deleting the bill!', error);
      });
  };

  /**
   * Function to update an existing bill.
   * @param {object} updatedBill - The bill object with updated information.
   */
  const updateBill = (updatedBill) => {
    const existingBill = bills.find((bill) => bill.id === updatedBill.id);
    const billToUpdate = { ...existingBill, ...updatedBill };

    // Ensure paymentHistory is preserved
    billToUpdate.paymentHistory = existingBill.paymentHistory;

    // Ensure dueDate is a Date object if it exists
    if (billToUpdate.dueDate && typeof billToUpdate.dueDate === 'string') {
      billToUpdate.dueDate = parseISO(billToUpdate.dueDate);
    }

    const updatedBills = bills.map((bill) =>
      bill.id === updatedBill.id ? billToUpdate : bill
    );
    setBills(updatedBills);

    axios
      .put(`/api/bills/${updatedBill.id}`, billToUpdate)
      .then((response) => {
        console.log(response.data.message);
      })
      .catch((error) => {
        console.error('There was an error updating the bill!', error);
      });
  };

  return (
    <ThemeProvider theme={darkMode ? draculaTheme : lightTheme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ padding: 4 }}>
        {/* Theme Toggle Icon Button */}
        <IconButton
          sx={{ float: 'right' }}
          color="inherit"
          onClick={handleThemeToggle}
          aria-label="toggle dark mode"
        >
          {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>

        {/* Application Title */}
        <Typography variant="h4" align="center" gutterBottom>
          Billy
        </Typography>

        {/* Pay Period Selector */}
        <Box my={4}>
          <PayPeriodSelector bills={bills} setPayPeriod={setPayPeriod} />
        </Box>

        {/* Sorting Options */}
        <Box my={2}>
          <FormControl fullWidth>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              label="Sort By"
            >
              <MenuItem value="date">Date</MenuItem>
              <MenuItem value="amount">Amount</MenuItem>
              <MenuItem value="alphabetical">Alphabetical</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* EFT Adjustment Toggle */}
        <Box my={2}>
          <FormControlLabel
            control={
              <Switch
                checked={adjustEFT}
                onChange={(e) => setAdjustEFT(e.target.checked)}
                name="adjustEFT"
                color="primary"
              />
            }
            label="Adjust EFT Transactions for Weekends"
          />
        </Box>

        {/* Bill List */}
        <BillList
          bills={filteredBills}
          togglePaid={togglePaid}
          deleteBill={deleteBill}
          updateBill={updateBill}
          currentPayPeriod={{ index: calculatePayPeriodIndex(payPeriod[0]) }}
          setBills={setBills}
        />

        {/* Bill Manager */}
        <BillManager
          bills={bills}
          deleteBill={deleteBill}
          updateBill={updateBill}
          addBill={addBill}
        />
      </Container>
    </ThemeProvider>
  );
}

export default App;
