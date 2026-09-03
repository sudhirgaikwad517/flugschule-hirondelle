import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  de: {
    translation: {
      "nav": {
        "home": "HOME",
        "training": "AUSBILDUNG",
        "performance": "PERFORMANCE",
        "travel": "REISEN",
        "booking_calendar": "BUCHUNGSKALENDER",
        "tandem": "TANDEM",
        "service": "SERVICE",
        "information": "INFOS",
        "shop": "SHOP",
        "registration": "ANMELDUNG"
      },
      "hero": {
        "text": "Vergnügen in den Wolken"
      },
      "home": {
        "card1_title": "FLIEGEN LERNEN",
        "card1_subtitle": "Der Anfang einer neuen Leidenschaft!",
        "card1_text": "Reinschnuppern beim 1-Tageskurs oder Schnupperwochenende",
        "card2_title": "SHOP GEÖFFNET",
        "card2_subtitle": "Donnerstag, 16.7.26 16-19 Uhr:",
        "card2_text": "Alex und Sarah sind für euch in Weinheim im Laden, bitte unbedingt voranmelden!",
        "card3_title": "ON TOUR...",
        "card3_subtitle": "23.1. - 6.2.2027 | Kolumbien:",
        "card3_text": "Fliegen über den grünen Landschaften des Valle del Cauca in den besten Fluggebieten von Cali Richtung Medellin...",
        "news_title": "NEWS",
        "news_widget_placeholder": "[Facebook Social Plugin Widget Platzhalter]",
        "team_title": "HOCH HINAUS",
        "team_subtitle": "...mit dem Team Hirondelle",
        "team_p1": "Willkommen bei der Flugschule Hirondelle, der Gleitschirmflugschule im Rhein-Main-Neckar Raum. Fliegen lernen mit dem ",
        "team_p1_bold": "Team Hirondelle",
        "team_p1_end": " heißt: Persönliche und individuelle Ausbildung, abgestimmt auf jeden einzelnen Flugschüler. Unser Team besteht aus sehr erfahrenen und engagierten Fluglehrern.",
        "team_p2": "Das alles natürlich an traumhaften Übungshängen im Odenwald, Kraichtal, Nahetal und der Pfalz."
      },
      "footer": {
        "newsletter": "Newsletter",
        "tandem_newsletter": "Tandemflüge Newsletter",
        "name": "Name",
        "email": "E-Mail",
        "accept_terms": "Ich akzeptiere die AGB und die Datenschutzerklärung.",
        "subscribe": "Abonnieren",
        "unsubscribe": "Abmelden",
        "home": "Startseite",
        "travel": "Reisen",
        "calendar": "Kalender",
        "training": "Ausbildung",
        "shop": "Shop",
        "checks": "Checks",
        "weather": "Wetter",
        "media": "Medien",
        "terrain": "Gelände",
        "team": "Team",
        "tandem": "Tandem",
        "faq": "FAQ",
        "contact": "Kontakt",
        "imprint": "Impressum",
        "privacy": "Datenschutz"
      }
    }
  },
  en: {
    translation: {
      "nav": {
        "home": "HOME",
        "training": "TRAINING",
        "performance": "PERFORMANCE",
        "travel": "TRAVEL",
        "booking_calendar": "BOOKING CALENDAR",
        "tandem": "TANDEM",
        "service": "SERVICE",
        "information": "INFORMATION",
        "shop": "SHOP",
        "registration": "REGISTRATION"
      },
      "hero": {
        "text": "Pleasure among the clouds"
      },
      "home": {
        "card1_title": "LEARNING TO FLY",
        "card1_subtitle": "The beginning of a new passion!",
        "card1_text": "Get a taste of it with a 1-day course or taster weekend.",
        "card2_title": "SHOP OPEN",
        "card2_subtitle": "Thursday, July 16, 2026, 4-7 pm:",
        "card2_text": "Alex and Sarah will be in the shop in Weinheim for you, please register in advance!",
        "card3_title": "ON TOUR...",
        "card3_subtitle": "January 23 - February 6, 2027 | Colombia:",
        "card3_text": "Flying over the green landscapes of the Valle del Cauca in the best flying areas from Cali towards Medellin...",
        "news_title": "NEWS",
        "news_widget_placeholder": "[Facebook Social Plugin Widget Placeholder]",
        "team_title": "REACHING FOR THE SKY",
        "team_subtitle": "...with the Hirondelle team",
        "team_p1": "Welcome to Hirondelle Flight School, the paragliding school in the Rhine-Main-Neckar region. Learning to fly with ",
        "team_p1_bold": "Team Hirondelle",
        "team_p1_end": " means personalized and individual training tailored to each student. Our team consists of highly experienced and dedicated flight instructors.",
        "team_p2": "All of this, of course, takes place on fantastic training slopes in the Odenwald, Kraichtal, Nahetal and Palatinate regions."
      },
      "footer": {
        "newsletter": "Newsletter",
        "tandem_newsletter": "Tandem flights newsletter",
        "name": "Name",
        "email": "E-mail",
        "accept_terms": "I accept the terms and conditions and the privacy policy.",
        "subscribe": "Subscribe",
        "unsubscribe": "Unsubscribe",
        "home": "Home",
        "travel": "Travel",
        "calendar": "Calendar",
        "training": "Training",
        "shop": "Shop",
        "checks": "Checks",
        "weather": "Weather",
        "media": "Media",
        "terrain": "Terrain",
        "team": "Team",
        "tandem": "Tandem",
        "faq": "FAQ",
        "contact": "Contact",
        "imprint": "Imprint",
        "privacy": "Privacy Policy"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'de', // Always load in German first; a language switcher can call i18n.changeLanguage() later
    fallbackLng: 'de',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
