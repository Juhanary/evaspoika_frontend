const pad2 = (value: number) => String(value).padStart(2, '0');

export const formatDateIso = (date: Date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

export const formatDateDisplay = (date: Date) =>
  `${pad2(date.getDate())}.${pad2(date.getMonth() + 1)}.${date.getFullYear()}`;

export const formatBatchNumber = (date: Date) =>
  `${pad2(date.getDate())}${pad2(date.getMonth() + 1)}${date.getFullYear()}`;

export const addOneYear = (date: Date) => {
  const next = new Date(date);
  next.setFullYear(next.getFullYear() + 1);
  if (next.getMonth() !== date.getMonth()) {
    // Clamp Feb 29 to Feb 28 on non-leap years.
    next.setDate(0);
  }
  return next;
};

export const formatDateDisplayFromIso = (value?: string | null) => {
  if (!value) {
    return '';
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const parsed = new Date(year, month - 1, day);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return formatDateDisplay(parsed);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return formatDateDisplay(parsed);
};
