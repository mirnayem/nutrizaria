export const useDateFormatter = (dateStr: string) => {
    const date = new Date(dateStr); // Parse the input date string
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' }; // Define formatting options
    return date.toLocaleDateString('en-GB', options); // Format and return the date
};
  