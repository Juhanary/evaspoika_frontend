export function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function getNumberParam(value: string | string[] | undefined) {
  const rawValue = getSingleParam(value);
  const parsedValue = rawValue ? Number(rawValue) : Number.NaN;
  return Number.isFinite(parsedValue) ? parsedValue : undefined;
}
