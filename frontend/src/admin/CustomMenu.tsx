import { useState } from 'react';
import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Box, Collapse, Typography } from '@mui/material';
import ExpandMore from '@mui/icons-material/ExpandMore';
import EventIcon from '@mui/icons-material/Event';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ListAltIcon from '@mui/icons-material/ListAlt';
import DescriptionIcon from '@mui/icons-material/Description';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import StorefrontIcon from '@mui/icons-material/Storefront';
import EmailIcon from '@mui/icons-material/Email';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import EventNoteIcon from '@mui/icons-material/EventNote';
import CategoryIcon from '@mui/icons-material/Category';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PercentIcon from '@mui/icons-material/Percent';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import BadgeIcon from '@mui/icons-material/Badge';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import CommentIcon from '@mui/icons-material/Comment';
import ArticleIcon from '@mui/icons-material/Article';
import CookieIcon from '@mui/icons-material/Cookie';
import FolderIcon from '@mui/icons-material/Folder';
import DownloadIcon from '@mui/icons-material/Download';
import LinkIcon from '@mui/icons-material/Link';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import PermMediaIcon from '@mui/icons-material/PermMedia';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PaymentIcon from '@mui/icons-material/Payment';

// A fully custom sidebar (plain MUI + react-router NavLink, no react-admin
// <Menu>/<MenuItemLink>) - same approach already used successfully in the
// AcyMailing section. Light background with dark text - a dark sidebar kept
// having contrast problems that were hard to pin down, and dark-on-light
// can't have that problem by construction.
const SIDEBAR_ACCENT = '#0ea5e9';
const SIDEBAR_BG = '#ffffff';
const SIDEBAR_BORDER = '#e2e8f0';
const TEXT_COLOR = '#1e293b';
const ICON_COLOR = '#64748b';

interface Item {
    label: string;
    to: string;
    icon: ReactNode;
}

const TOP_ITEMS: Item[] = [
    { label: 'Dashboard', to: '/admin', icon: <DashboardIcon fontSize="small" /> },
    { label: 'Benutzer', to: '/admin/users', icon: <PeopleIcon fontSize="small" /> },
];

const EVENT_ITEMS: Item[] = [
    { label: 'Dashboard', to: '/admin/events-dashboard', icon: <DashboardIcon fontSize="small" /> },
    { label: 'Buchungs-Formular', to: '/admin/booking-form-config', icon: <ListAltIcon fontSize="small" /> },
    { label: 'Vorlagen', to: '/admin/templates', icon: <DescriptionIcon fontSize="small" /> },
    { label: 'Import', to: '/admin/import', icon: <UploadFileIcon fontSize="small" /> },
    { label: 'Veranstaltungen', to: '/admin/events', icon: <EventNoteIcon fontSize="small" /> },
    { label: 'Benutzerdefinierte Felder', to: '/admin/customFields', icon: <AssignmentIcon fontSize="small" /> },
    { label: 'Veranstaltungsorte', to: '/admin/locations', icon: <LocationOnIcon fontSize="small" /> },
    { label: 'Gutscheine', to: '/admin/vouchers', icon: <LocalOfferIcon fontSize="small" /> },
    { label: 'Gestaffelte Gebühren', to: '/admin/tieredFees', icon: <PercentIcon fontSize="small" /> },
    { label: 'Steuersätze', to: '/admin/taxRates', icon: <ReceiptLongIcon fontSize="small" /> },
    { label: 'Währungen', to: '/admin/currencies', icon: <CurrencyExchangeIcon fontSize="small" /> },
    { label: 'Veranstalter', to: '/admin/organizers', icon: <BadgeIcon fontSize="small" /> },
    { label: 'Kategorien', to: '/admin/categories', icon: <CategoryIcon fontSize="small" /> },
    { label: 'Buchungen', to: '/admin/bookings', icon: <BookOnlineIcon fontSize="small" /> },
    { label: 'PayPal-Einstellungen', to: '/admin/payment-config', icon: <PaymentIcon fontSize="small" /> },
];

const BOTTOM_ITEMS: Item[] = [
    { label: 'AcyMailing (Newsletter)', to: '/admin/acymailing/dashboard', icon: <EmailIcon fontSize="small" /> },
    { label: 'Kommentare', to: '/admin/comments', icon: <CommentIcon fontSize="small" /> },
    { label: 'Neuigkeiten / Blog', to: '/admin/news', icon: <ArticleIcon fontSize="small" /> },
    { label: 'Download Kategorien', to: '/admin/downloadcategories', icon: <FolderIcon fontSize="small" /> },
    { label: 'Downloads', to: '/admin/files', icon: <DownloadIcon fontSize="small" /> },
    { label: 'Link Kategorien', to: '/admin/weblinkcategories', icon: <FolderIcon fontSize="small" /> },
    { label: 'Links', to: '/admin/links', icon: <LinkIcon fontSize="small" /> },
    { label: 'Werbebanner', to: '/admin/banners', icon: <ViewCarouselIcon fontSize="small" /> },
    { label: 'Seitenmedien', to: '/admin/pagemedia', icon: <PermMediaIcon fontSize="small" /> },
    { label: 'Service Aufträge', to: '/admin/serviceorders', icon: <AssignmentIcon fontSize="small" /> },
    { label: 'Rechtliche Seiten', to: '/admin/legalPages', icon: <ArticleIcon fontSize="small" /> },
    { label: 'Ecwid Settings', to: '/admin/ecwid-config', icon: <StorefrontIcon fontSize="small" /> },
    { label: 'Cookie-Hinweis', to: '/admin/cookie-consent', icon: <CookieIcon fontSize="small" /> },
];

// Inline `style` for color (not just `sx`) so nothing in the app's global
// CSS can ever compete with it, regardless of specificity or layer order.
const SidebarLink = ({ item, isActive, indent }: { item: Item; isActive: boolean; indent?: boolean }) => (
    <Box
        component={NavLink}
        to={item.to}
        style={{ color: isActive ? '#ffffff' : TEXT_COLOR }}
        sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.5,
            textDecoration: 'none',
            px: 2,
            py: 1,
            ml: indent ? 1 : 0.5,
            mr: 0.5,
            mb: 0.25,
            borderRadius: '6px',
            bgcolor: isActive ? SIDEBAR_ACCENT : SIDEBAR_BG,
            '&:hover': {
                bgcolor: isActive ? SIDEBAR_ACCENT : '#f1f5f9'
            }
        }}
    >
        <Box sx={{ display: 'flex', mt: '2px' }} style={{ color: isActive ? '#ffffff' : ICON_COLOR }}>{item.icon}</Box>
        <Typography
            variant="body2"
            style={{ color: isActive ? '#ffffff' : TEXT_COLOR, fontWeight: isActive ? 700 : 500 }}
            sx={{ fontSize: '0.92rem', whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.3 }}
        >
            {item.label}
        </Typography>
    </Box>
);

export const CustomMenu = () => {
    const location = useLocation();
    const [openEvents, setOpenEvents] = useState(true);

    const isActivePath = (to: string) => {
        if (to === '/admin') return location.pathname === '/admin' || location.pathname === '/admin/';
        return location.pathname.startsWith(to);
    };

    return (
        <Box sx={{ py: 1, bgcolor: SIDEBAR_BG, height: '100%' }}>
            <Box sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: `1px solid ${SIDEBAR_BORDER}`, mb: 1 }}>
                <FlightTakeoffIcon sx={{ color: SIDEBAR_ACCENT }} />
                <Typography style={{ color: TEXT_COLOR }} sx={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: 0.3 }}>
                    Hirondelle
                </Typography>
            </Box>

            {TOP_ITEMS.map(item => (
                <SidebarLink key={item.to} item={item} isActive={isActivePath(item.to)} />
            ))}

            <Box
                onClick={() => setOpenEvents(!openEvents)}
                style={{ color: TEXT_COLOR }}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 2,
                    py: 1,
                    mx: 0.5,
                    mb: 0.25,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#f1f5f9' }
                }}
            >
                <Box sx={{ display: 'flex' }} style={{ color: ICON_COLOR }}><EventIcon fontSize="small" /></Box>
                <Typography
                    variant="body2"
                    style={{ color: TEXT_COLOR, fontWeight: 600 }}
                    sx={{ flex: 1, fontSize: '0.92rem' }}
                >
                    Flugschule Events
                </Typography>
                <ExpandMore sx={{ fontSize: 20, transform: openEvents ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }} style={{ color: ICON_COLOR }} />
            </Box>

            <Collapse in={openEvents} timeout="auto" unmountOnExit sx={{ bgcolor: SIDEBAR_BG }}>
                <Box sx={{ bgcolor: SIDEBAR_BG }}>
                    {EVENT_ITEMS.map(item => (
                        <SidebarLink key={item.to} item={item} isActive={isActivePath(item.to)} indent />
                    ))}
                </Box>
            </Collapse>

            <Box sx={{ borderTop: `1px solid ${SIDEBAR_BORDER}`, my: 1, mx: 2 }} />

            <Box sx={{ bgcolor: SIDEBAR_BG }}>
                {BOTTOM_ITEMS.map(item => (
                    <SidebarLink key={item.to} item={item} isActive={isActivePath(item.to)} />
                ))}
            </Box>
        </Box>
    );
};
