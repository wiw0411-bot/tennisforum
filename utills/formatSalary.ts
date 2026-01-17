export function formatSalary(salary?: string): string {
  if (!salary) return '';

  const parts = salary.split(' ');
  if (parts.length >= 2) {
    const type = parts[0];
    const valueAndUnit = parts.slice(1).join(' ');

    if (type === '월급' || type === '시급') {
      const numberMatch = valueAndUnit.match(/^(\d+)/);
      if (numberMatch) {
        const numberStr = numberMatch[1];
        const unit = valueAndUnit.substring(numberStr.length);
        const number = parseInt(numberStr, 10);
        if (!isNaN(number)) {
          return `${type} ${number.toLocaleString('ko-KR')}${unit}`;
        }
      }
    }
  }

  return salary;
}