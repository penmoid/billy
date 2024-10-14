// src/components/BillCard.jsx

import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes for type checking
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import MoneyIcon from '@mui/icons-material/Money';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import SyncDisabledIcon from '@mui/icons-material/SyncDisabled';
import { format, parseISO, isValid } from 'date-fns';
import { formatNumber } from '../utils/numberUtils';
import { useTheme } from '@mui/material/styles';

/**
 * BillCard Component
 * Displays information about a single bill, including amount, name, due date, transaction type, and payment status.
 * Allows editing and deleting the bill.
 */
function BillCard({
  bill,
  isPaid,
  onTogglePaid,
  onEdit,
  onDelete,
  dueDateOverride,
  isClickable = false,
  displayMode = 'main',
  cardProps = {},
}) {
  const theme = useTheme();

  let dueDateObj;

  // Parse dueDate based on displayMode and handle errors
  try {
    if (displayMode === 'main') {
      if (dueDateOverride) {
        dueDateObj = dueDateOverride instanceof Date ? dueDateOverride : parseISO(dueDateOverride);
      } else if (bill.dueDate) {
        dueDateObj = bill.dueDate instanceof Date ? bill.dueDate : parseISO(bill.dueDate);
      }
    } else if (displayMode === 'manager') {
      dueDateObj = null;
    }

    if (dueDateObj && !isValid(dueDateObj)) {
      throw new Error('Invalid Date');
    }
  } catch (error) {
    console.error(`Error parsing dueDate for bill ID ${bill.id}:`, error);
    dueDateObj = null;
  }

  // Format due date based on displayMode
  let dueDateFormatted;

  if (displayMode === 'main') {
    dueDateFormatted = dueDateObj
      ? format(dueDateObj, 'EEEE, MMM dd')
      : bill.frequency === 'monthly' || !bill.frequency
      ? `Day ${bill.dueDay}`
      : bill.frequency === 'weekly'
      ? [
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ][parseInt(bill.dueDay, 10)]
      : 'Per Pay Period';
  } else if (displayMode === 'manager') {
    dueDateFormatted =
      bill.frequency === 'monthly' || !bill.frequency
        ? `Day ${bill.dueDay}`
        : bill.frequency === 'weekly'
        ? [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
          ][parseInt(bill.dueDay, 10)]
        : 'Per Pay Period';
  }

  // Handle card click to toggle paid status
  const handleCardClick = (e) => {
    if (
      isClickable &&
      e.target.type !== 'button' &&
      e.target.type !== 'svg' &&
      e.target.type !== 'path' &&
      e.target.type !== 'input'
    ) {
      onTogglePaid && onTogglePaid(bill);
    }
  };

  // Handle key press for accessibility (Enter and Space keys)
  const handleKeyPress = (e) => {
    if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
      onTogglePaid && onTogglePaid(bill);
    }
  };

  return (
    <Card
      variant="outlined"
      sx={{
        width: '100%',
        mb: 2,
        cursor: isClickable ? 'pointer' : 'default',
        backgroundColor: isPaid ? theme.palette.action.hover : 'inherit',
        transition: 'background-color 0.3s ease', // Smooth background transition
      }}
      onClick={handleCardClick}
      onKeyPress={handleKeyPress}
      {...cardProps}
      role="button"
      aria-pressed={isPaid}
      tabIndex={isClickable ? 0 : -1}
    >
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column', // Stack elements vertically
          alignItems: 'flex-start',
          paddingRight: '16px',
        }}
      >
        {/* Bill Amount */}
        <Box sx={{ mb: 1 }}>
          <Typography
            variant="h5" // Adjusted font size for responsiveness
            sx={{
              fontWeight: 'bold',
              color: isPaid ? theme.palette.success.main : theme.palette.primary.main,
              textDecoration: isPaid ? 'line-through' : 'none',
              textAlign: 'left',
              fontSize: {
                xs: '1.5rem',  // Mobile devices
                sm: '1.75rem', // Small tablets
                md: '1.25rem',  // Medium devices (desktop)
                lg: '1.25rem',  // Large desktops
              },
              transition: 'color 0.3s ease', // Smooth color transition
            }}
          >
            ${formatNumber(bill.amount)}
          </Typography>
        </Box>

        {/* Container for Bill Details and Action Buttons */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            width: '100%',
          }}
        >
          {/* Bill Details */}
          <Box sx={{ flexGrow: 1 }}>
            {/* Bill Name */}
            <Typography
              variant="h6"
              sx={{
                textDecoration: isPaid ? 'line-through' : 'none',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                color: theme.palette.text.primary,
                wordBreak: 'break-word', // Allows long words to break
                maxWidth: '100%',        // Ensures text doesn't overflow
              }}
            >
              {bill.name}
            </Typography>

            {/* Bill Information */}
            <Box
              sx={{
                display: 'flex',
                mt: 1,
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: { xs: 1, sm: 2 },
              }}
            >
              {/* Due Date */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EventIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.text.primary }} />
                <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                  {dueDateFormatted}
                </Typography>
              </Box>

              {/* Transaction Type */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {bill.transactionType === 'EFT' && (
                  <AccountBalanceIcon
                    fontSize="small"
                    sx={{ mr: 0.5, color: theme.palette.text.primary }}
                    titleAccess="EFT"
                  />
                )}
                {bill.transactionType === 'Cash' && (
                  <MoneyIcon
                    fontSize="small"
                    sx={{ mr: 0.5, color: theme.palette.text.primary }}
                    titleAccess="Cash"
                  />
                )}
                {bill.transactionType === 'Credit/Debit' && (
                  <CreditCardIcon
                    fontSize="small"
                    sx={{ mr: 0.5, color: theme.palette.text.primary }}
                    titleAccess="Credit/Debit"
                  />
                )}
                {bill.transactionType === 'Internal Transfer' && (
                  <SwapHorizIcon
                    fontSize="small"
                    sx={{ mr: 0.5, color: theme.palette.text.primary }}
                    titleAccess="Internal Transfer"
                  />
                )}
                <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                  {bill.transactionType}
                </Typography>
              </Box>

              {/* Auto Pay Status */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {bill.autoPay ? (
                  <>
                    <AutorenewIcon
                      fontSize="small"
                      sx={{ mr: 0.5, color: theme.palette.text.primary }}
                      titleAccess="Auto Pay"
                    />
                    <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                      Auto Pay
                    </Typography>
                  </>
                ) : (
                  <>
                    <SyncDisabledIcon
                      fontSize="small"
                      sx={{ mr: 0.5, color: theme.palette.text.primary }}
                      titleAccess="Manual Pay"
                    />
                    <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                      Manual Pay
                    </Typography>
                  </>
                )}
              </Box>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              ml: 2, // Add margin-left for spacing from details
            }}
          >
            {onEdit && (
              <IconButton
                edge="end"
                aria-label={`edit ${bill.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(bill);
                }}
                sx={{ marginRight: 1 }}
              >
                <EditIcon sx={{ color: theme.palette.secondary.main }} />
              </IconButton>
            )}
            {onDelete && (
              <IconButton
                edge="end"
                aria-label={`delete ${bill.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(bill); // Ensure the entire bill object is passed
                }}
              >
                <DeleteIcon sx={{ color: theme.palette.error.main }} />
              </IconButton>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// Define PropTypes for better type checking
BillCard.propTypes = {
  bill: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    dueDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    transactionType: PropTypes.string,
    autoPay: PropTypes.bool,
    paymentHistory: PropTypes.object,
    frequency: PropTypes.string,
    dueDay: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  isPaid: PropTypes.bool.isRequired,
  onTogglePaid: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  dueDateOverride: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  isClickable: PropTypes.bool,
  displayMode: PropTypes.string,
  cardProps: PropTypes.object,
};

export default BillCard;
