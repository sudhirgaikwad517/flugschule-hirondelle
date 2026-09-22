import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, Typography, CircularProgress, Box, Table, TableBody, TableCell, TableHead, TableRow, Select, MenuItem, FormControl } from '@mui/material';
import { Title } from 'react-admin';

const MONTH_LABELS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

interface MonthBucket {
    month: number;
    courses: number;
    hits: number;
    bookings: number;
    certificated: number;
    maxpupil: number;
}

interface YearBlock {
    year: number;
    months: MonthBucket[];
    total: Omit<MonthBucket, 'month'>;
}

// Derives the same ratios old Matukio's statistics template computed from
// its raw numbers (average utilisation %, and per-event hits/bookings/
// max-participant ratios) - kept out of the backend response since it's
// pure display math, same division of labour as old's own template.
function utilisation(bookings: number, maxpupil: number): string {
    return maxpupil > 0 ? `${Math.round((bookings * 100) / maxpupil)}%` : '0%';
}
function perEvent(value: number, courses: number): string {
    return courses > 0 ? String(Math.round(value / courses)) : '0';
}

const StatsTable = ({ title, months, total }: { title: string; months: MonthBucket[]; total: Omit<MonthBucket, 'month'> }) => (
    <Card sx={{ mb: 3 }}>
        <CardHeader title={title} />
        <CardContent sx={{ overflowX: 'auto' }}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Monat</TableCell>
                        <TableCell align="right">Veranstaltungen</TableCell>
                        <TableCell align="right">Aufrufe</TableCell>
                        <TableCell align="right">Buchungen</TableCell>
                        <TableCell align="right">Zertifikate</TableCell>
                        <TableCell align="right">Max. Teilnehmer</TableCell>
                        <TableCell align="right">Ø Auslastung</TableCell>
                        <TableCell align="right">Aufrufe / Veranst.</TableCell>
                        <TableCell align="right">Buchungen / Veranst.</TableCell>
                        <TableCell align="right">Max. Teiln. / Veranst.</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {months.map((m) => (
                        <TableRow key={m.month}>
                            <TableCell>{MONTH_LABELS[m.month - 1]}</TableCell>
                            <TableCell align="right">{m.courses}</TableCell>
                            <TableCell align="right">{m.hits}</TableCell>
                            <TableCell align="right">{m.bookings}</TableCell>
                            <TableCell align="right">{m.certificated}</TableCell>
                            <TableCell align="right">{m.maxpupil}</TableCell>
                            <TableCell align="right">{utilisation(m.bookings, m.maxpupil)}</TableCell>
                            <TableCell align="right">{perEvent(m.hits, m.courses)}</TableCell>
                            <TableCell align="right">{perEvent(m.bookings, m.courses)}</TableCell>
                            <TableCell align="right">{perEvent(m.maxpupil, m.courses)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableBody>
                    <TableRow sx={{ '& td': { fontWeight: 'bold', borderTop: '2px solid rgba(224, 224, 224, 1)' } }}>
                        <TableCell>Summe</TableCell>
                        <TableCell align="right">{total.courses}</TableCell>
                        <TableCell align="right">{total.hits}</TableCell>
                        <TableCell align="right">{total.bookings}</TableCell>
                        <TableCell align="right">{total.certificated}</TableCell>
                        <TableCell align="right">{total.maxpupil}</TableCell>
                        <TableCell align="right">{utilisation(total.bookings, total.maxpupil)}</TableCell>
                        <TableCell align="right">{perEvent(total.hits, total.courses)}</TableCell>
                        <TableCell align="right">{perEvent(total.bookings, total.courses)}</TableCell>
                        <TableCell align="right">{perEvent(total.maxpupil, total.courses)}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </CardContent>
    </Card>
);

export const EventStatistics = () => {
    const [data, setData] = useState<{ commonPeriod: MonthBucket[]; years: YearBlock[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');

    useEffect(() => {
        fetch('/api/stats/event-statistics', {
            headers: { Authorization: `Bearer ${localStorage.getItem('auth')}` },
        })
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(setData)
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <>
                <Title title="Statistiken" />
                <CircularProgress sx={{ display: 'block', margin: '40px auto' }} />
            </>
        );
    }

    if (error || !data) {
        return (
            <>
                <Title title="Statistiken" />
                <Typography>Fehler beim Laden der Statistiken.</Typography>
            </>
        );
    }

    const yearsToShow = selectedYear === 'all' ? data.years : data.years.filter((y) => y.year === selectedYear);
    const commonTotal = data.commonPeriod.reduce(
        (t, m) => ({
            courses: t.courses + m.courses,
            hits: t.hits + m.hits,
            bookings: t.bookings + m.bookings,
            certificated: t.certificated + m.certificated,
            maxpupil: t.maxpupil + m.maxpupil,
        }),
        { courses: 0, hits: 0, bookings: 0, certificated: 0, maxpupil: 0 }
    );

    return (
        <>
            <Title title="Statistiken" />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, mt: 1 }}>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                    <Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
                        <MenuItem value="all">Alle Jahre</MenuItem>
                        {data.years.map((y) => (
                            <MenuItem key={y.year} value={y.year}>{y.year}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {selectedYear === 'all' && (
                <StatsTable title="Zeitraum (alle Jahre zusammengefasst, nach Monat)" months={data.commonPeriod} total={commonTotal} />
            )}

            {yearsToShow.map((y) => (
                <StatsTable key={y.year} title={String(y.year)} months={y.months} total={y.total} />
            ))}
        </>
    );
};
