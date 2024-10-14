// src/components/BillList.jsx

import React, { useState } from 'react';
import {
  List,
  ListItem,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditBillForm from './EditBillForm';
import ConfirmationDialog from './ConfirmationDialog';
import BillCard from './BillCard';
import { formatCurrency } from '../utils/numberUtils'; // Import the formatCurrency utility

function BillList({ bills, togglePaid, deleteBill, updateBill, currentPayPeriod }) {
  const [editBill, setEditBill] = useState(null);
  const [billToDelete, setBillToDelete] = useState(null);

  const handleEditClick = (bill) => {
    setEditBill(bill);
  };

  const handleEditClose = () => {
    setEditBill(null);
  };

  const handleDeleteClick = (bill) => {
    if (bill && bill.id) {
      console.log(`Preparing to delete bill: ${bill.name} (ID: ${bill.id})`);
      setBillToDelete(bill);
    } else {
      console.error("Attempted to delete a bill without a valid 'id'.", bill);
    }
  };

  const handleConfirmDelete = () => {
    if (billToDelete && billToDelete.id) {
      console.log(`Deleting bill: ${billToDelete.name} (ID: ${billToDelete.id})`);
      deleteBill(billToDelete.id);
      setBillToDelete(null);
    } else {
      console.error("Cannot confirm delete because 'billToDelete' is undefined or lacks an 'id'.", billToDelete);
      setBillToDelete(null); // Reset state to prevent potential infinite loops
    }
  };

  const handleCancelDelete = () => {
    setBillToDelete(null);
  };

  const handleTogglePaid = (bill) => {
    if (bill && bill.id) {
      console.log(`Toggling paid status for bill: ${bill.name} (ID: ${bill.id})`);
      togglePaid(bill.id, bill.dueDate);
    } else {
      console.error("Attempted to toggle paid status for a bill without a valid 'id'.", bill);
    }
  };

  // Filter out bills without an 'id' and log warnings
  const validBills = bills.filter(bill => {
    if (!bill.id) {
      console.warn(`Bill "${bill.name}" is missing an 'id' and will be excluded.`);
      return false;
    }
    return true;
  });

  // Separate bills into outstanding and completed
  const payPeriodIndex = currentPayPeriod.index;
  const outstandingBills = [];
  const completedBills = [];

  validBills.forEach((bill) => {
    const dueDate = new Date(bill.dueDate);
    if (isNaN(dueDate)) {
      console.warn(`Bill "${bill.name}" has an invalid 'dueDate' and will be treated as outstanding.`);
      outstandingBills.push(bill);
      return;
    }

    const paymentKey = `${payPeriodIndex}_${dueDate.toISOString()}`;
    const isPaid = bill.paymentHistory && bill.paymentHistory[paymentKey];

    if (isPaid) {
      completedBills.push(bill);
    } else {
      outstandingBills.push(bill);
    }
  });

  // Calculate total amounts for each section
  const totalOutstanding = outstandingBills.reduce(
    (sum, bill) => sum + parseFloat(bill.amount),
    0
  );
  const totalCompleted = completedBills.reduce(
    (sum, bill) => sum + parseFloat(bill.amount),
    0
  );

  const renderBills = (billsToRender) =>
    billsToRender.map((bill) => {
      const dueDate = new Date(bill.dueDate);
      const paymentKey = `${payPeriodIndex}_${dueDate.toISOString()}`;
      const isPaid = bill.paymentHistory && bill.paymentHistory[paymentKey];

      return (
        <ListItem key={`${bill.id}_${bill.dueDate}`} disableGutters>
          <BillCard
            bill={bill}
            isPaid={isPaid}
            onTogglePaid={handleTogglePaid}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            isClickable={true}
            displayMode="main" // Ensure displayMode is set to 'main'
            dueDateOverride={bill.dueDate}
          />
        </ListItem>
      );
    });

  return (
    <>
      {/* Flex Container to Stack Accordions with Consistent Spacing */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2, // Defines the spacing between Accordions
          mb: 4,  // Optional: Adds bottom margin to the entire section
        }}
      >
        {/* Outstanding Bills Section */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                flexDirection: { xs: 'column', sm: 'row' }, // Stack vertically on xs
                textAlign: { xs: 'center', sm: 'left' },     // Center text on xs
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: { xs: 1, sm: 0 } }}>
                Outstanding Bills
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {`Total: ${formatCurrency(totalOutstanding)}`}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {outstandingBills.length > 0 ? (
              <List>
                {renderBills(outstandingBills)}
              </List>
            ) : (
              <Typography variant="body1">No outstanding bills.</Typography>
            )}
          </AccordionDetails>
        </Accordion>

        {/* Completed Bills Section */}
        <Accordion defaultExpanded={false}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                flexDirection: { xs: 'column', sm: 'row' }, // Stack vertically on xs
                textAlign: { xs: 'center', sm: 'left' },     // Center text on xs
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: { xs: 1, sm: 0 } }}>
                Completed Bills
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {`Total: ${formatCurrency(totalCompleted)}`}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {completedBills.length > 0 ? (
              <List>
                {renderBills(completedBills)}
              </List>
            ) : (
              <Typography variant="body1">No completed bills.</Typography>
            )}
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* Edit Bill Form */}
      {editBill && (
        <EditBillForm
          bill={editBill}
          updateBill={updateBill}
          handleClose={handleEditClose}
        />
      )}

      {/* Confirmation Dialog for Deletion */}
      {billToDelete && (
        <ConfirmationDialog
          open={!!billToDelete}
          title="Confirm Delete"
          content={`Are you sure you want to delete the bill "${billToDelete.name}"?`}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </>
  );
}

export default BillList;
