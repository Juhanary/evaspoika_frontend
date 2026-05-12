const pad2 = (value: number) => String(value).padStart(2, '0');

export const parseDateSafe = (value: string): Date | null => {
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (isoMatch) {
    const d = new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
    if (!isNaN(d.getTime())) return d;
  }
  const fiMatch = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(value);
  if (fiMatch) {
    const d = new Date(Number(fiMatch[3]), Number(fiMatch[2]) - 1, Number(fiMatch[1]));
    if (!isNaN(d.getTime())) return d;
  }
  // DDMMYYYY compact (same format as batch_number, e.g. "07082025")
  const compactMatch = /^(\d{2})(\d{2})(\d{4})$/.exec(value);
  if (compactMatch) {
    const month = Number(compactMatch[2]);
    if (month >= 1 && month <= 12) {
      const d = new Date(Number(compactMatch[3]), month - 1, Number(compactMatch[1]));
      if (!isNaN(d.getTime())) return d;
    }
  }
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

export const formatDateIso = (date: Date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

export const formatDateDisplay = (date: Date) =>
  `${pad2(date.getDate())}.${pad2(date.getMonth() + 1)}.${date.getFullYear()}`;

export const formatBatchNumber = (date: Date) =>
  `${pad2(date.getDate())}${pad2(date.getMonth() + 1)}${date.getFullYear()}`;

export const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export const addOneYear = (date: Date) => {
  const next = new Date(date);
  next.setFullYear(next.getFullYear() + 1);
  if (next.getMonth() !== date.getMonth()) {
    // Clamp Feb 29 to Feb 28 on non-leap years.
    next.setDate(0);
  }
  return next;
};

export const formatDateFi = (value?: string | null): string | null => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('fi-FI', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const formatTimeFi = (value?: string | null): string | null => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' });
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
