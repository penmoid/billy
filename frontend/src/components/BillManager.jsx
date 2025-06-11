// src/components/BillManager.jsx

import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  List,
  ListItem,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditBillForm from './EditBillForm';
import BillForm from './BillForm';
import { formatNumber } from '../utils/numberUtils';
import ConfirmationDialog from './ConfirmationDialog';
import BillCard from './BillCard';

function BillManager({ bills, deleteBill, updateBill, addBill }) {
  const [editBill, setEditBill] = useState(null);
  const [billToDelete, setBillToDelete] = useState(null);

  const handleEditClick = (bill) => {
    setEditBill(bill);
  };

  const handleEditClose = () => {
    setEditBill(null);
  };

  const handleDeleteClick = (bill) => {
    setBillToDelete(bill);
  };

  const handleConfirmDelete = () => {
    deleteBill(billToDelete.id);
    setBillToDelete(null);
  };

  const handleCancelDelete = () => {
    setBillToDelete(null);
  };

  // Calculate total amount of all bills per month
  const totalAmount = bills.reduce((sum, bill) => {
    const amount = parseFloat(bill.amount);
    let multiplier = 1;
    if (bill.frequency === 'weekly') {
      multiplier = 4;
    } else if (bill.frequency === 'biweekly') {
      multiplier = 2;
    }
    return sum + amount * multiplier;
  }, 0);

  // Sort bills by dueDay in numeric order, secondary sort by amount descending
  const sortedBills = [...bills].sort((a, b) => {
    const parsedADue = parseInt(a.dueDay, 10);
    const parsedBDue = parseInt(b.dueDay, 10);
    const aDue = isNaN(parsedADue) ? Infinity : parsedADue;
    const bDue = isNaN(parsedBDue) ? Infinity : parsedBDue;

    if (aDue !== bDue) {
      return aDue - bDue; // Primary sort by dueDay, treating missing dueDay as largest value
    }
    return parseFloat(b.amount) - parseFloat(a.amount); // Secondary sort by amount descending
  });

  // Group bills by frequency
  const frequencies = ['weekly', 'biweekly', 'monthly'];
  const groupedBills = frequencies.map((freq) => ({
    frequency: freq,
    bills: sortedBills.filter(
      (bill) => (bill.frequency || 'monthly') === freq
    ),
  }));

  return (
    <Box mt={4}>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Bill Manager</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="subtitle1" gutterBottom>
            Total Monthly Expenses: ${formatNumber(totalAmount)}
          </Typography>
          {groupedBills.map((group) => (
            <Box key={group.frequency} sx={{ mb: 2 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}
              >
                {group.frequency === 'weekly'
                  ? 'Weekly Bills'
                  : group.frequency === 'biweekly'
                  ? 'Per Pay Period Bills'
                  : 'Monthly Bills'}
              </Typography>
              <List>
                {group.bills.map((bill) => (
                  <ListItem key={bill.id} disableGutters>
                    <BillCard
                      bill={bill}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteClick}
                      displayMode="manager" // Specify manager display mode
                      // No dueDateOverride passed
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          ))}
          {editBill && (
            <EditBillForm
              bill={editBill}
              updateBill={updateBill}
              handleClose={handleEditClose}
            />
          )}
          {billToDelete && (
            <ConfirmationDialog
              open={!!billToDelete}
              title="Confirm Delete"
              content={`Are you sure you want to delete the bill "${billToDelete.name}"?`}
              onConfirm={handleConfirmDelete}
              onCancel={handleCancelDelete}
            />
          )}
          {/* Include the BillForm within the Bill Manager */}
          <BillForm addBill={addBill} />
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}

export default BillManager;
