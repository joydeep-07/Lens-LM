// Helper to add the correct ordinal suffix (st, nd, rd, th) to the day
function getOrdinalSuffix(day) {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

// Main function to format a date string or Date object
export function formatDate(dateInput) {
  const date = new Date(dateInput);

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }

  const dayNumber = date.getDate();
  const dayWithSuffix = `${dayNumber}${getOrdinalSuffix(dayNumber)}`;

  // Format the month and year
  const monthName = date.toLocaleString("en-US", { month: "long" });
  const year = date.getFullYear();

  return `${dayWithSuffix} ${monthName} ${year}`;
}
