import { parse as parseQuerystring } from 'querystring';

// react-admin's actual data provider (ra-data-simple-rest) sends list
// requests as `?sort=["field","ASC"]&range=[0,9]&filter={"q":"...","role":"x"}`
// - three JSON-encoded query params - not the flat `_start`/`_end`/`_sort`/
// `_order` + individually-named filter params every route here was written
// to read. That mismatch meant every route silently ignored sort clicks,
// pagination, filters, and ReferenceField/ReferenceInput's getMany lookups
// (`filter={"id":[...]}`), always falling back to its default query.
//
// This has to be a custom Express `query parser` (app.set('query parser', ...)),
// NOT a regular middleware that mutates req.query: in Express 5, req.query is
// a getter with no setter that re-parses the raw query string from scratch on
// every access, so a middleware writing req.query.foo = ... is silently lost
// the moment anything downstream reads req.query again.
//
// Routes that are used as a ReferenceField/ReferenceInput target still need
// one extra check for `req.query.ids` (see events/users/categories/etc.
// routes) since Prisma's `id: { in: [...] }` can't be expressed as a single
// flat string value the same generic way as other filters.
export function raQueryParser(queryString: string): Record<string, any> {
  const parsed = parseQuerystring(queryString) as Record<string, any>;

  try {
    if (typeof parsed.sort === 'string') {
      const s = JSON.parse(parsed.sort);
      if (Array.isArray(s) && s.length === 2) {
        parsed._sort = String(s[0]);
        parsed._order = String(s[1]);
      }
    }
  } catch {
    // malformed sort param - ignore, routes fall back to their default order
  }

  try {
    if (typeof parsed.range === 'string') {
      const r = JSON.parse(parsed.range);
      if (Array.isArray(r) && r.length === 2) {
        parsed._start = String(r[0]);
        parsed._end = String(Number(r[1]) + 1);
      }
    }
  } catch {
    // malformed range param - ignore, routes fall back to their default page
  }

  try {
    if (typeof parsed.filter === 'string') {
      const f = JSON.parse(parsed.filter);
      if (f && typeof f === 'object' && !Array.isArray(f)) {
        for (const [key, value] of Object.entries(f)) {
          if (value === undefined || value === null || value === '') continue;
          if (key === 'id' && Array.isArray(value)) {
            parsed.ids = value.map(String).join(',');
          } else if (!Array.isArray(value)) {
            parsed[key] = String(value);
          }
        }
      }
    }
  } catch {
    // malformed filter param - ignore, routes fall back to unfiltered
  }

  return parsed;
}
