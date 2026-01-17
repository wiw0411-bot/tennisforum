const weekDays = ['월', '화', '수', '목', '금', '토', '일'];

export function formatDays(days?: string[]): string {
  if (!days || days.length === 0) return '';
  if (days.includes('요일 협의')) return '요일 협의';

  // Sort days according to weekDays order
  const sortedDays = [...days].sort((a, b) => weekDays.indexOf(a) - weekDays.indexOf(b));

  if (sortedDays.length <= 2) {
    return sortedDays.join(',');
  }

  const groups: string[][] = [];
  let currentGroup: string[] = [sortedDays[0]];

  for (let i = 1; i < sortedDays.length; i++) {
    const prevDayIndex = weekDays.indexOf(sortedDays[i - 1]);
    const currentDayIndex = weekDays.indexOf(sortedDays[i]);
    if (currentDayIndex === prevDayIndex + 1) {
      currentGroup.push(sortedDays[i]);
    } else {
      groups.push(currentGroup);
      currentGroup = [sortedDays[i]];
    }
  }
  groups.push(currentGroup);

  return groups.map(group => {
    if (group.length >= 3) {
      return `${group[0]}~${group[group.length - 1]}`;
    }
    return group.join(',');
  }).join(',');
}