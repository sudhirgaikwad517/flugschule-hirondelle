import { Admin, Resource, ListGuesser, fetchUtils } from 'react-admin';
import simpleRestProvider from 'ra-data-simple-rest';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import germanMessages from 'ra-language-german';
import { authProvider } from './authProvider';
import { EventList, EventEdit, EventCreate } from './Events';
import { NewsletterList, NewsletterEdit, NewsletterCreate } from './Newsletters';
import { BookingList, BookingShow } from './Bookings';
import { CategoryList, CategoryEdit, CategoryCreate } from './Categories';
import { CustomLayout } from './CustomLayout';

const i18nProvider = polyglotI18nProvider(() => germanMessages, 'de');

const httpClient = (url: string, options: fetchUtils.Options = {}) => {
    if (!options.headers) {
        options.headers = new Headers({ Accept: 'application/json' });
    }
    const token = localStorage.getItem('auth');
    if (token) {
        (options.headers as Headers).set('Authorization', `Bearer ${token}`);
    }
    return fetchUtils.fetchJson(url, options);
};

const dataProvider = simpleRestProvider('http://localhost:5555/api', httpClient);

// We will add custom resources here as we build them on the backend
export const AdminApp = () => (
    <Admin basename="/admin" layout={CustomLayout} authProvider={authProvider} dataProvider={dataProvider} i18nProvider={i18nProvider}>
        <Resource name="users" options={{ label: 'Benutzer' }} list={ListGuesser} />
        <Resource name="events" options={{ label: 'Termine & Kurse' }} list={EventList} edit={EventEdit} create={EventCreate} />
        <Resource name="categories" options={{ label: 'Kategorien' }} list={CategoryList} edit={CategoryEdit} create={CategoryCreate} />
        <Resource name="bookings" options={{ label: 'Buchungen' }} list={BookingList} show={BookingShow} />
        <Resource name="newsletters" options={{ label: 'Newsletter' }} list={NewsletterList} edit={NewsletterEdit} create={NewsletterCreate} />
    </Admin>
);
