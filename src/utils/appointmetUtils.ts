import { format, parseISO, addDays, isToday } from "date-fns";

// Helper formatting functions
export function formatDate(dateTimeStr: string): string {
  try {
    return format(parseISO(dateTimeStr), 'EEE, MMM d, yyyy');
  } catch (e) {
    return 'Invalid date';
  }
}

export function formatDisplayDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    const today = new Date();
    const tomorrow = addDays(today, 1);

    if (isToday(date)) {
      return 'Today, ' + format(date, 'MMMM d, yyyy');
    } else if (
      date.getDate() === tomorrow.getDate() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getFullYear() === tomorrow.getFullYear()
    ) {
      return 'Tomorrow, ' + format(date, 'MMMM d, yyyy');
    } else {
      return format(date, 'EEEE, MMMM d, yyyy');
    }
  } catch (e) {
    return 'Invalid date';
  }
}

export function formatTime(dateTimeStr: string): string {
  try {
    return format(parseISO(dateTimeStr), 'h:mm a');
  } catch (e) {
    return 'Invalid time';
  }
}

export function formatEndTime(dateTimeStr: string, durationMinutes: number): string {
  try {
    const startTime = parseISO(dateTimeStr);
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
    return format(endTime, 'h:mm a');
  } catch (e) {
    return 'Invalid time';
  }
}

// Calendar helper functions
export function generateCalendarDays() {
  // In a real implementation, this would generate the calendar days for the current month view
  // This is a simplified placeholder that shows a week
  const today = new Date();
  const days = [];

  // Start with the previous Sunday to create a full week
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - today.getDay());

  // Generate 28 days (4 weeks) for demo purposes
  for (let i = 0; i < 28; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);

    days.push({
      day: currentDate.getDate(),
      fullDate: format(currentDate, 'yyyy-MM-dd'),
      isCurrentMonth: currentDate.getMonth() === today.getMonth(),
      isToday: isToday(currentDate)
    });
  }

  return days;
}
