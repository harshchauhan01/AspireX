import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to format meeting times consistently
export function formatMeetingTime(dateTimeString: string | Date): string {
  const date = typeof dateTimeString === 'string' ? new Date(dateTimeString) : dateTimeString;
  
  // Format time as 12-hour format with AM/PM
  const time = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  
  return time;
}

// Utility function to format meeting date consistently
export function formatMeetingDate(dateTimeString: string | Date): string {
  const date = typeof dateTimeString === 'string' ? new Date(dateTimeString) : dateTimeString;
  
  // Format date as "Jan 15, 2024"
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  return formattedDate;
}

// Utility function to get meeting date and time together
export function formatMeetingDateTime(dateTimeString: string | Date): { date: string; time: string } {
  return {
    date: formatMeetingDate(dateTimeString),
    time: formatMeetingTime(dateTimeString)
  };
}