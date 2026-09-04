import { useEffect } from 'react';
import { Admin, Resource, fetchUtils, CustomRoutes, defaultTheme } from 'react-admin';
import { Route, Navigate } from 'react-router-dom';
import simpleRestProvider from 'ra-data-simple-rest';
import polyglotI18nProvider from 'ra-i18n-polyglot';
// @ts-ignore
import germanMessages from 'ra-language-german';
import { authProvider } from './authProvider';
import { EventList, EventEdit, EventCreate } from './Events';
import { AcyDashboard } from './AcyMailing/Stubs';
import { AcyConfiguration } from './AcyMailing/Configuration';
import { AcyTemplates } from './AcyMailing/Templates';
import { AcyQueue } from './AcyMailing/Queue';
import { AcySubscribers } from './AcyMailing/Subscribers';
import { AcyEditSubscriber } from './AcyMailing/EditSubscriber';
import { AcyLists } from './AcyMailing/Lists';
import { AcyStatistics } from './AcyMailing/Statistics';
import { AcyEmails } from './AcyMailing/Emails';
import { AcyChooseCampaignType } from './AcyMailing/ChooseCampaignType';
import { AcyChooseTemplate } from './AcyMailing/ChooseTemplate';
import { AcyEditEmail } from './AcyMailing/EditEmail';
import { CommentList, CommentEdit } from './Comments';
import { BookingList, BookingShow } from './Bookings';
import { CategoryList, CategoryEdit, CategoryCreate } from './Categories';
import { OrganizerList, OrganizerEdit, OrganizerCreate } from './Organizers';
import { CustomFieldList, CustomFieldEdit, CustomFieldCreate } from './CustomFields';
import { LocationList, LocationEdit, LocationCreate } from './Locations';
import { VoucherList, VoucherEdit, VoucherCreate } from './Vouchers';
import { TieredFeeList, TieredFeeEdit, TieredFeeCreate } from './TieredFees';
import { TaxRateList, TaxRateEdit, TaxRateCreate } from './TaxRates';
import { CurrencyList, CurrencyEdit, CurrencyCreate } from './Currencies';
import { BookingFormBuilder } from './BookingFormBuilder';
import { NewsList, NewsEdit, NewsCreate } from './News';
import { DownloadCategoryList, DownloadCategoryEdit, DownloadCategoryCreate, DownloadFileList, DownloadFileEdit, DownloadFileCreate } from './Downloads';
import { WebLinkCategoryList, WebLinkCategoryEdit, WebLinkCategoryCreate, WebLinkList, WebLinkEdit, WebLinkCreate } from './WebLinks';
import { AdBannerList, AdBannerEdit, AdBannerCreate } from './Banners';
import { PageMediaList, PageMediaEdit, PageMediaCreate } from './PageMedia';
import { ServiceOrderList, ServiceOrderShow } from './ServiceOrders';
import { TemplatesBuilder } from './TemplatesBuilder';
import { CustomLayout } from './CustomLayout';
import { EventsDashboard } from './EventsDashboard';
import { Import } from './Import';
import { EcwidConfigPage } from './EcwidConfigPage';
import { CookieConsentConfigPage } from './CookieConsentConfigPage';
import { PaymentConfigPage } from './PaymentConfigPage';
import { LegalPageList, LegalPageEdit } from './LegalPages';
import { UserList, UserEdit, UserCreate } from './Users';

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

const dataProvider = simpleRestProvider('/api', httpClient);

const lightTheme = {
    ...defaultTheme,
    palette: {
        mode: 'light' as const,
        primary: {
            main: '#0ea5e9', // matches the AcyMailing section's accent color
        },
        secondary: {
            main: '#1e293b',
        },
        background: {
            default: '#f4f6f8',
        }
    },
    components: {
        ...defaultTheme.components,
        MuiAppBar: {
            styleOverrides: {
                colorSecondary: {
                    backgroundColor: '#fff',
                    color: '#1e293b',
                },
            },
        },
        // The sidebar is an MUI Drawer under the hood - styling its Paper
        // directly guarantees the background always fills the full
        // scrollable height, no matter how many menu items there are.
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#ffffff',
                },
            },
        },
    },
};

// We will add custom resources here as we build them on the backend
export const AdminApp = () => {
    useEffect(() => {
        document.body.classList.add('admin-root');
        return () => document.body.classList.remove('admin-root');
    }, []);

    return (
    <Admin basename="/admin" theme={lightTheme} layout={CustomLayout} authProvider={authProvider} dataProvider={dataProvider} i18nProvider={i18nProvider}>
        <Resource name="users" options={{ label: 'Benutzer' }} list={UserList} edit={UserEdit} create={UserCreate} />
        <Resource name="events" options={{ label: 'Veranstaltungen' }} list={EventList} edit={EventEdit} create={EventCreate} />
        <Resource name="customFields" options={{ label: 'Benutzerdefinierte Felder' }} list={CustomFieldList} edit={CustomFieldEdit} create={CustomFieldCreate} />
        <Resource name="locations" options={{ label: 'Veranstaltungsorte' }} list={LocationList} edit={LocationEdit} create={LocationCreate} />
        <Resource name="vouchers" options={{ label: 'Gutscheine' }} list={VoucherList} edit={VoucherEdit} create={VoucherCreate} />
        <Resource name="tieredFees" options={{ label: 'Gestaffelte Gebühren' }} list={TieredFeeList} edit={TieredFeeEdit} create={TieredFeeCreate} />
        <Resource name="taxRates" options={{ label: 'Steuersätze' }} list={TaxRateList} edit={TaxRateEdit} create={TaxRateCreate} />
        <Resource name="currencies" options={{ label: 'Währungen' }} list={CurrencyList} edit={CurrencyEdit} create={CurrencyCreate} />
        <Resource name="organizers" options={{ label: 'Veranstalter' }} list={OrganizerList} edit={OrganizerEdit} create={OrganizerCreate} />
        <Resource name="categories" options={{ label: 'Kategorien' }} list={CategoryList} edit={CategoryEdit} create={CategoryCreate} />
        <Resource name="bookings" options={{ label: 'Buchungen' }} list={BookingList} show={BookingShow} />
        <Resource name="bookingFormConfig" intent="registration" />
        <CustomRoutes>
            <Route path="/events-dashboard" element={<EventsDashboard />} />
            <Route path="/booking-form-config" element={<BookingFormBuilder />} />
            <Route path="/templates" element={<TemplatesBuilder />} />
            <Route path="/import" element={<Import />} />
            <Route path="/ecwid-config" element={<EcwidConfigPage />} />
            <Route path="/cookie-consent" element={<CookieConsentConfigPage />} />
            <Route path="/payment-config" element={<PaymentConfigPage />} />
            {/* Redirect old newsletter routes */}
            <Route path="/newsletters/*" element={<Navigate to="/acymailing/dashboard" replace />} />
            <Route path="/newslettercampaigns/*" element={<Navigate to="/acymailing/dashboard" replace />} />
        </CustomRoutes>
        <CustomRoutes noLayout>
            <Route path="/acymailing/dashboard" element={<AcyDashboard />} />
            <Route path="/acymailing/subscribers" element={<AcySubscribers />} />
            <Route path="/acymailing/subscribers/edit/:email" element={<AcyEditSubscriber />} />
            <Route path="/acymailing/lists" element={<AcyLists />} />
            <Route path="/acymailing/statistics" element={<AcyStatistics />} />
            <Route path="/acymailing/templates" element={<AcyTemplates />} />
            <Route path="/acymailing/emails" element={<AcyEmails />} />
            <Route path="/acymailing/emails/create" element={<AcyChooseCampaignType />} />
            <Route path="/acymailing/emails/create/template" element={<AcyChooseTemplate />} />
            <Route path="/acymailing/emails/create/edit" element={<AcyEditEmail />} />
            <Route path="/acymailing/emails/edit/:id" element={<AcyEditEmail />} />
            <Route path="/acymailing/queue" element={<AcyQueue />} />
            <Route path="/acymailing/configuration" element={<AcyConfiguration />} />
        </CustomRoutes>
        <Resource name="comments" options={{ label: 'Kommentare' }} list={CommentList} edit={CommentEdit} />
        <Resource name="news" options={{ label: 'Neuigkeiten / Blog' }} list={NewsList} edit={NewsEdit} create={NewsCreate} />
        <Resource name="downloadcategories" options={{ label: 'Download Kategorien' }} list={DownloadCategoryList} edit={DownloadCategoryEdit} create={DownloadCategoryCreate} />
        <Resource name="files" options={{ label: 'Downloads' }} list={DownloadFileList} edit={DownloadFileEdit} create={DownloadFileCreate} />
        <Resource name="weblinkcategories" options={{ label: 'Link Kategorien' }} list={WebLinkCategoryList} edit={WebLinkCategoryEdit} create={WebLinkCategoryCreate} />
        <Resource name="links" options={{ label: 'Links' }} list={WebLinkList} edit={WebLinkEdit} create={WebLinkCreate} />
        <Resource name="banners" options={{ label: 'Werbebanner' }} list={AdBannerList} edit={AdBannerEdit} create={AdBannerCreate} />
        <Resource name="pagemedia" options={{ label: 'Seitenmedien' }} list={PageMediaList} edit={PageMediaEdit} create={PageMediaCreate} />
        <Resource name="serviceorders" options={{ label: 'Service Aufträge' }} list={ServiceOrderList} show={ServiceOrderShow} />
        <Resource name="legalPages" options={{ label: 'Rechtliche Seiten' }} list={LegalPageList} edit={LegalPageEdit} />
    </Admin>
    );
};
