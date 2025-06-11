// src/utils/payPeriodUtils.js

import {
  differenceInCalendarDays,
  addDays,
  startOfDay,
  isWithinInterval,
} from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

export function getPayPeriods(bills, numberOfPeriods = 3, previousPeriods = 0) {
  const timeZone = 'America/Los_Angeles';

  // Initial payday in Pacific Time
  const initialPaydayPT = new Date('2024-09-26T00:00:00');
  const initialPayday = startOfDay(utcToZonedTime(initialPaydayPT, timeZone));

  // Today's date in Pacific Time
  const todayUTC = new Date();
  const todayPT = utcToZonedTime(todayUTC, timeZone);
  const today = startOfDay(todayPT);

  const payPeriodLength = 14; // 14 days for bi-weekly pay periods

  // Calculate the number of days since the initial payday
  const daysSinceInitial = differenceInCalendarDays(today, initialPayday);

  // Determine the current pay period index
  let payPeriodIndex = Math.floor(daysSinceInitial / payPeriodLength);

  // If today is before the initial payday, set index to 0
  if (daysSinceInitial < 0) {
    payPeriodIndex = 0;
  }

  // Generate the pay periods
  const payPeriods = [];
  const totalPeriods = numberOfPeriods + previousPeriods;
  const startingIndex = payPeriodIndex - previousPeriods;
  for (let i = 0; i < totalPeriods; i++) {
    const periodStart = addDays(initialPayday, (startingIndex + i) * payPeriodLength);
    const periodEnd = addDays(periodStart, payPeriodLength - 1);

    let totalAmount = 0;
    let outstandingAmount = 0;

    bills.forEach((bill) => {
      const occurrenceDates = [];
      if (!bill.frequency || bill.frequency === 'monthly') {
        const dueDay = parseInt(bill.dueDay, 10);
        const dueDates = [
          new Date(periodStart.getFullYear(), periodStart.getMonth(), dueDay),
          new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, dueDay),
        ];
        dueDates.forEach((date) => {
          if (isWithinInterval(date, { start: periodStart, end: periodEnd })) {
            occurrenceDates.push(date);
          }
        });
      } else if (bill.frequency === 'weekly') {
        const dayOfWeek = parseInt(bill.dueDay, 10);
        let currentDate = new Date(periodStart);
        while (currentDate <= periodEnd) {
          if (currentDate.getDay() === dayOfWeek) {
            occurrenceDates.push(new Date(currentDate));
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else if (bill.frequency === 'biweekly') {
        occurrenceDates.push(new Date(periodEnd));
      }

      totalAmount += parseFloat(bill.amount) * occurrenceDates.length;

      occurrenceDates.forEach((dueDate) => {
        const paymentKey = `${startingIndex + i}_${dueDate.toISOString()}`;
        const isPaid = bill.paymentHistory && bill.paymentHistory[paymentKey];
        if (!isPaid) {
          outstandingAmount += parseFloat(bill.amount);
        }
      });
    });

    payPeriods.push({
      index: startingIndex + i,
      start: periodStart,
      end: periodEnd,
      totalAmount,
      outstandingAmount,
    });
  }

  return payPeriods;
}

// Function to calculate pay period index based on a date
export function calculatePayPeriodIndex(date) {
  const initialPaydayPT = new Date('2024-09-26T00:00:00');
  const initialPayday = startOfDay(utcToZonedTime(initialPaydayPT, 'America/Los_Angeles'));
  const daysSinceInitial = differenceInCalendarDays(date, initialPayday);
  let payPeriodIndex = Math.floor(daysSinceInitial / 14);
  if (daysSinceInitial < 0) {
    payPeriodIndex = 0;
  }
  return payPeriodIndex;
}
