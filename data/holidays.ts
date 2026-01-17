// South Korean holidays for 2024, 2025, 2026, 2027, 2028, 2029, and 2030.
// This includes fixed-date holidays and calculated lunar holidays (pre-calculated for simplicity).
const holidays = new Set([
  // 2024
  '2024-01-01', // New Year's Day
  '2024-02-09', // Seollal
  '2024-02-10', // Seollal
  '2024-02-11', // Seollal (Sunday)
  '2024-02-12', // Seollal (Substitute Holiday)
  '2024-03-01', // Independence Movement Day
  '2024-04-10', // 22nd National Assembly Election
  '2024-05-05', // Children's Day (Sunday)
  '2024-05-06', // Children's Day (Substitute Holiday)
  '2024-05-15', // Buddha's Birthday
  '2024-06-06', // Memorial Day
  '2024-08-15', // Liberation Day
  '2024-09-16', // Chuseok
  '2024-09-17', // Chuseok
  '2024-09-18', // Chuseok
  '2024-10-03', // National Foundation Day
  '2024-10-09', // Hangeul Day
  '2024-12-25', // Christmas Day

  // 2025
  '2025-01-01', // New Year's Day
  '2025-01-28', // Seollal
  '2025-01-29', // Seollal
  '2025-01-30', // Seollal
  '2025-03-01', // Independence Movement Day (Saturday)
  '2025-05-05', // Children's Day & Buddha's Birthday
  '2025-05-06', // Children's Day (Substitute Holiday)
  '2025-06-06', // Memorial Day
  '2025-08-15', // Liberation Day
  '2025-10-03', // National Foundation Day
  '2025-10-05', // Chuseok (Sunday)
  '2025-10-06', // Chuseok
  '2025-10-07', // Chuseok
  '2025-10-08', // Chuseok (Substitute Holiday)
  '2025-10-09', // Hangeul Day
  '2025-12-25', // Christmas Day

  // 2026
  '2026-01-01', // New Year's Day
  '2026-02-16', // Seollal
  '2026-02-17', // Seollal
  '2026-02-18', // Seollal
  '2026-03-01', // Independence Movement Day (Sunday)
  '2026-05-05', // Children's Day
  '2026-05-24', // Buddha's Birthday (Sunday)
  '2026-05-25', // Buddha's Birthday (Substitute Holiday)
  '2026-06-06', // Memorial Day (Saturday)
  '2026-08-15', // Liberation Day (Saturday)
  '2026-09-24', // Chuseok
  '2026-09-25', // Chuseok
  '2026-09-26', // Chuseok (Saturday)
  '2026-10-03', // National Foundation Day (Saturday)
  '2026-10-09', // Hangeul Day
  '2026-12-25', // Christmas Day

  // 2027
  '2027-01-01', // New Year's Day
  '2027-02-06', // Seollal (Saturday)
  '2027-02-07', // Seollal (Sunday)
  '2027-02-08', // Seollal
  '2027-02-09', // Seollal (Substitute)
  '2027-03-01', // Independence Movement Day
  '2027-05-05', // Children's Day
  '2027-05-15', // Buddha's Birthday (Saturday)
  '2027-05-17', // Buddha's Birthday (Substitute)
  '2027-06-06', // Memorial Day (Sunday)
  '2027-08-15', // Liberation Day (Sunday)
  '2027-08-16', // Liberation Day (Substitute)
  '2027-09-15', // Chuseok
  '2027-09-16', // Chuseok
  '2027-09-17', // Chuseok
  '2027-10-03', // National Foundation Day (Sunday)
  '2027-10-04', // National Foundation Day (Substitute)
  '2027-10-09', // Hangeul Day (Saturday)
  '2027-10-11', // Hangeul Day (Substitute)
  '2027-12-25', // Christmas Day (Saturday)
  '2027-12-27', // Christmas Day (Substitute)

  // 2028
  '2028-01-01', // New Year's Day (Saturday)
  '2028-01-27', // Seollal
  '2028-01-28', // Seollal
  '2028-01-29', // Seollal (Saturday)
  '2028-03-01', // Independence Movement Day
  '2028-05-04', // Buddha's Birthday
  '2028-05-05', // Children's Day
  '2028-06-06', // Memorial Day
  '2028-08-15', // Liberation Day
  '2028-10-03', // Chuseok & National Foundation Day
  '2028-10-04', // Chuseok
  '2028-10-05', // Chuseok
  '2028-10-06', // Chuseok (Substitute)
  '2028-10-09', // Hangeul Day
  '2028-12-25', // Christmas Day

  // 2029
  '2029-01-01', // New Year's Day
  '2029-02-12', // Seollal
  '2029-02-13', // Seollal
  '2029-02-14', // Seollal
  '2029-03-01', // Independence Movement Day
  '2029-05-05', // Children's Day (Saturday)
  '2029-05-07', // Children's Day (Substitute)
  '2029-05-22', // Buddha's Birthday
  '2029-06-06', // Memorial Day
  '2029-08-15', // Liberation Day
  '2029-09-21', // Chuseok
  '2029-09-22', // Chuseok (Saturday)
  '2029-09-23', // Chuseok (Sunday)
  '2029-09-24', // Chuseok (Substitute)
  '2029-10-03', // National Foundation Day
  '2029-10-09', // Hangeul Day
  '2029-12-25', // Christmas Day

  // 2030
  '2030-01-01', // New Year's Day
  '2030-02-02', // Seollal (Saturday)
  '2030-02-03', // Seollal (Sunday)
  '2030-02-04', // Seollal
  '2030-02-05', // Seollal (Substitute)
  '2030-03-01', // Independence Movement Day
  '2030-05-05', // Children's Day (Sunday)
  '2030-05-06', // Children's Day (Substitute)
  '2030-05-11', // Buddha's Birthday (Saturday)
  '2030-05-13', // Buddha's Birthday (Substitute)
  '2030-06-06', // Memorial Day
  '2030-08-15', // Liberation Day
  '2030-09-11', // Chuseok
  '2030-09-12', // Chuseok
  '2030-09-13', // Chuseok
  '2030-10-03', // National Foundation Day
  '2030-10-09', // Hangeul Day
  '2030-12-25', // Christmas Day
]);

/**
 * Checks if a given date is a South Korean national holiday.
 * @param year The full year (e.g., 2024)
 * @param month The month (1-12)
 * @param day The day of the month (1-31)
 * @returns True if the date is a holiday, false otherwise.
 */
export const isHoliday = (year: number, month: number, day: number): boolean => {
  const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return holidays.has(dateString);
};