// CSV field escaping that also guards against formula/DDE injection: a
// leading =, +, -, or @ makes Excel/LibreOffice interpret the cell as a
// formula when opened, so those are prefixed with a leading apostrophe
// (the standard mitigation) in addition to the usual quote-doubling.
export function csvEscape(value: unknown): string {
  let str = String(value ?? '');
  if (/^[=+\-@]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}
