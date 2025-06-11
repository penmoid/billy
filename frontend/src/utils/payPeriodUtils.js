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

    // Calculate total amount for this pay period
    const totalAmount = bills.reduce((sum, bill) => {
      let billOccurrences = 0;

      if (!bill.frequency || bill.frequency === 'monthly') {
        const dueDay = parseInt(bill.dueDay, 10);

        // Generate due dates for both the start month and the next month
        const dueDates = [
          new Date(periodStart.getFullYear(), periodStart.getMonth(), dueDay),
          new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, dueDay),
        ];

        // Count the occurrences of the bill within the pay period
        billOccurrences = dueDates.filter((dueDate) =>
          isWithinInterval(dueDate, { start: periodStart, end: periodEnd })
        ).length;
      } else if (bill.frequency === 'weekly') {
        const dayOfWeek = parseInt(bill.dueDay, 10);
        let currentDate = new Date(periodStart);
        while (currentDate <= periodEnd) {
          if (currentDate.getDay() === dayOfWeek) {
            billOccurrences += 1;
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else if (bill.frequency === 'biweekly') {
        // Per Pay Period bills occur once per pay period
        billOccurrences = 1;
      }

      if (billOccurrences > 0) {
        return sum + parseFloat(bill.amount) * billOccurrences;
      }

      return sum;
    }, 0);

    payPeriods.push({
      index: startingIndex + i,
      start: periodStart,
      end: periodEnd,
      totalAmount,
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
