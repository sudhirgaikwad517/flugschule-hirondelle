import { isDataField } from './formFields';

// FormConfig.settings shape - one flexible JSON blob per form, matching old
// Visforms' real "Formular bearbeiten" tabs (Ergebnis/E-Mail Optionen/
// Spamschutz/Erweitert/Datenanzeige im Frontend), deep-verified field-by-
// field against administrator/components/com_visforms/forms/visform.xml
// and its real display logic (tmpl/visform/edit.php + ItemViewBase.php).
//
// Old's XML has ~150 fields across these tabs, but the vast majority are
// gated behind `showon="hassub:1..."`/`showon="subexists:1..."` (a paid AEF
// subscription this site never had) or are Joomla bt5/uikit3 TEMPLATE layout
// knobs (button CSS classes, bootstrap grid widths, badge colors for a
// multi-page/progress-bar layout) that have no analog in this app's single,
// hand-built React/Tailwind form design. Those are omitted here for the same
// reason the AEF-gated fields don't render on the real live site: they are
// not applicable, not "missing". Every field below is one that a) genuinely
// renders on old's real edit page without a subscription, and b) has a real
// effect here (with the sole documented exception of the spam-bot/captcha
// sub-settings, which are intentionally settings-only per explicit user
// choice - see FormBuilder.tsx's Spamschutz tab).

export type FrontDisplayMode = '0' | '1' | '2' | '3'; // None / Both / List only / Detail only

export interface FormSettings {
  ergebnis: {
    saveResult: boolean; // old: saveresult
    textResult: string; // old: textresult (rich HTML shown after a successful submit)
    redirectUrl: string; // old: redirecturl
  };
  email: {
    result: EmailBlock & { to: string }; // old: emailresult subtab - notifies the school/admin
    receipt: EmailBlock; // old: emailrecipient subtab - confirms to the submitter (their own email field)
  };
  spam: {
    honeypot: boolean; // old: honeypot - the only genuinely implemented spam defense here
    // Everything below is settings-only (stored, shown in the UI with the
    // same labels/options as old, but not enforced) until real API keys /
    // a captcha widget are wired up - see the Spamschutz tab's inline notice.
    spambotCheckEnabled: boolean;
    spambotCheckIp: boolean;
    spambotCheckEmail: boolean;
    stopforumspamEnabled: boolean;
    stopforumspamMaxFrequency: number;
    projecthoneypotEnabled: boolean;
    projecthoneypotApiKey: string;
    projecthoneypotMaxThreatRating: number;
    spamcopEnabled: boolean;
    allowRegexCheck: boolean;
    allowGenericEmailCheck: boolean;
    whitelistEmail: string;
    blacklistEmail: string;
    whitelistIp: string;
    blacklistIp: string;
    captchaType: '0' | '1' | '3' | '4' | '5'; // None / Viscaptcha / hCaptcha / reCAPTCHA v2 / reCAPTCHA v2 invisible
    captchaLabel: string;
    captchaTipsText: string;
    captchaErrorText: string;
  };
  advanced: {
    csv: {
      separator: ';' | ',';
      includeHeadline: boolean;
      publishedFieldsOnly: boolean;
      publishedDataOnly: boolean;
      includeFieldPublished: boolean;
      includeIp: boolean;
      includeCreated: boolean;
      includeCreatedBy: boolean;
      includeModifiedFlag: boolean; // old: expfieldismfd
      includeModifiedAt: boolean;
      includeId: boolean;
    };
    layout: {
      cssClass: string;
      setFocus: boolean;
      requiredPosition: 'top' | 'captcha' | 'bottom' | 'none';
      requiredAsterisk: boolean;
      requiredTextColor: string;
      requiredAsteriskColor: string;
      showProcessingMessage: boolean;
      processingMessage: string;
    };
    poweredBy: boolean; // old: poweredby
    upload: {
      uploadPath: string;
      maxFileSize: string;
      allowedExtensions: string;
      useSession: boolean; // old: usesession (cache protection)
    };
  };
  frontend: {
    allowFrontendDataView: boolean; // old: allowfedv
    displayIp: FrontDisplayMode;
    displayId: FrontDisplayMode;
    displayCreated: FrontDisplayMode;
    displayCreatedTime: FrontDisplayMode;
    displayModifiedAt: FrontDisplayMode;
    displayModifiedAtTime: FrontDisplayMode;
    displayIsModified: FrontDisplayMode; // old: displayismfd
    autoPublish: boolean;
    displayDetail: boolean;
    detailTitle: string;
    detailLinkIcon: 'download' | 'eye';
    listTitle: string;
    listDescription: string; // rich HTML
  };
}

interface EmailBlock {
  enabled: boolean;
  subject: string;
  fromEmail: string;
  fromName: string;
  cc: string;
  bcc: string;
  bodyHtml: string;
  includeFormTitle: boolean;
  includeCreated: boolean;
  includeData: boolean;
  includeDataRecordId: boolean;
  includeIp: boolean;
}

const DEFAULT_EMAIL_BLOCK: EmailBlock = {
  enabled: false,
  subject: '',
  fromEmail: '',
  fromName: '',
  cc: '',
  bcc: '',
  bodyHtml: '',
  includeFormTitle: true,
  includeCreated: true,
  includeData: true,
  includeDataRecordId: true,
  includeIp: true,
};

export const DEFAULT_FORM_SETTINGS: FormSettings = {
  ergebnis: {
    saveResult: true,
    textResult: '<p>Vielen Dank, Ihre Anfrage wurde erfolgreich übermittelt.</p>',
    redirectUrl: '',
  },
  email: {
    result: { ...DEFAULT_EMAIL_BLOCK, to: '' },
    receipt: { ...DEFAULT_EMAIL_BLOCK },
  },
  spam: {
    honeypot: true,
    spambotCheckEnabled: true,
    spambotCheckIp: true,
    spambotCheckEmail: true,
    stopforumspamEnabled: true,
    stopforumspamMaxFrequency: 0,
    projecthoneypotEnabled: false,
    projecthoneypotApiKey: '',
    projecthoneypotMaxThreatRating: 0,
    spamcopEnabled: true,
    allowRegexCheck: false,
    allowGenericEmailCheck: false,
    whitelistEmail: '',
    blacklistEmail: '',
    whitelistIp: '',
    blacklistIp: '',
    captchaType: '0',
    captchaLabel: 'Captcha',
    captchaTipsText: '',
    captchaErrorText: '',
  },
  advanced: {
    csv: {
      separator: ';',
      includeHeadline: true,
      publishedFieldsOnly: true,
      publishedDataOnly: true,
      includeFieldPublished: false,
      includeIp: false,
      includeCreated: false,
      includeCreatedBy: false,
      includeModifiedFlag: false,
      includeModifiedAt: false,
      includeId: false,
    },
    layout: {
      cssClass: '',
      setFocus: true,
      requiredPosition: 'top',
      requiredAsterisk: true,
      requiredTextColor: '#bf1722',
      requiredAsteriskColor: '#bf1722',
      showProcessingMessage: false,
      processingMessage: '',
    },
    poweredBy: false,
    upload: {
      uploadPath: 'tmp',
      maxFileSize: '0',
      allowedExtensions: 'bmp,csv,doc,gif,ico,jpg,jpeg,odg,odp,ods,odt,pdf,png,ppt,swf,txt,xcf,xls',
      useSession: false,
    },
  },
  frontend: {
    allowFrontendDataView: false,
    displayIp: '0',
    displayId: '0',
    displayCreated: '1',
    displayCreatedTime: '0',
    displayModifiedAt: '0',
    displayModifiedAtTime: '0',
    displayIsModified: '0',
    autoPublish: true,
    displayDetail: true,
    detailTitle: '',
    detailLinkIcon: 'eye',
    listTitle: 'Meine Einträge',
    listDescription: '',
  },
};

function deepMerge<T>(base: T, patch: any): T {
  if (patch === undefined || patch === null) return base;
  if (typeof base !== 'object' || Array.isArray(base)) return patch;
  const out: any = { ...base };
  for (const key of Object.keys(patch)) {
    out[key] = deepMerge((base as any)[key], patch[key]);
  }
  return out;
}

// Existing rows (created before a settings sub-key existed) must not lose
// newly-added defaults - always merge over DEFAULT_FORM_SETTINGS rather than
// trusting the stored JSON to already have every key.
export function resolveFormSettings(stored: unknown): FormSettings {
  return deepMerge(DEFAULT_FORM_SETTINGS, stored || {});
}

// Old's real "vis-option-parameter-replacement" fields (subject/from/redirect
// URL/email body etc.) let an admin reference a submitted field's value by
// its id in curly braces, e.g. "Danke, {name}!" - resolved here against the
// actual submission data at send time.
export function replaceTokens(template: string, data: Record<string, any>): string {
  if (!template) return template;
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key) => {
    const value = data[key];
    return value === undefined || value === null || value === '' ? '' : String(value);
  });
}

export function buildDataBlockHtml(
  fields: { id: string; label: string; type: string }[],
  data: Record<string, any>,
  opts: { includeData: boolean }
): string {
  if (!opts.includeData) return '';
  const rows = fields
    .filter((f) => isDataField(f.type as any))
    .map((f) => {
      const raw = data[f.id];
      const value = f.type === 'checkbox' ? (raw ? 'Ja' : 'Nein') : Array.isArray(raw) ? raw.join(', ') : (raw ?? '');
      if (value === '' || value === undefined || value === null) return '';
      return `<tr><td style="padding:4px 10px 4px 0;color:#666;vertical-align:top;"><strong>${f.label}</strong></td><td style="padding:4px 0;vertical-align:top;">${String(value).replace(/\n/g, '<br/>')}</td></tr>`;
    })
    .filter(Boolean);
  if (rows.length === 0) return '';
  return `<table style="border-collapse:collapse;">${rows.join('')}</table>`;
}
