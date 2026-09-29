// Old's real field-type catalog (administrator/components/com_visforms/
// forms/visfield.xml's `typefield` dropdown, deep-verified against the real
// live Formularfelder list at fs-hirondelle.de/...&view=visfields&fid=2) -
// 18 real types, INCLUDING submit/reset/fieldsep/image as genuine rows in
// #__visfields (structural fields with no data of their own), not
// hardcoded chrome. Per the same site-side-code verification: fieldsep
// renders inline at its own list position (a real mid-form section break);
// submit/reset are always pulled into a fixed footer regardless of their
// stored `ordering` (only their order relative to EACH OTHER matters -
// reset before submit).
//
// CORRECTION (deep-verified against components/com_visforms/src/Lib/
// Business/ImageFieldBusiness.php's own doc comment: "Visforms field image
// (submit button) business class"): old's real `type="image"` is an
// `<input type="image">`-style IMAGE SUBMIT BUTTON - a decorative
// alternate submit button, NOT a photo/file upload field. Its real
// getFields()/validateRequired() are no-ops, exactly like submit/reset/
// fieldsep. A real photo/file upload uses `type="file"` instead, which
// keeps its actual upload behavior here unchanged.
export type FieldType =
  | 'text' | 'password' | 'email' | 'date' | 'number' | 'url' | 'tel' | 'hidden'
  | 'textarea' | 'checkbox' | 'multicheckbox' | 'radio' | 'select'
  | 'file' | 'image' | 'submit' | 'reset' | 'fieldsep';

// Old's real per-field "Frontend-Anzeige" column (visfields list) - whether/
// where a field shows on the public "Datenanzeige im Frontend" list/detail
// views (see MeineEintraege.tsx). Same 4-value enum as the form-level
// display-mode settings already ported in formSettings.ts.
export type FrontDisplayMode = '0' | '1' | '2' | '3'; // None / List+Detail / List only / Detail only

export interface FormFieldDef {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[]; // radio/select/multicheckbox
  order: number;
  published?: boolean; // old's real per-field publish toggle - true when absent (legacy rows)
  frontDisplay?: FrontDisplayMode; // '0' when absent (legacy rows)
  min?: number; // number/date
  max?: number; // number/date
  // Old Visforms' real per-field "Zusatzinfo" (custominfo) - genuine
  // customer-facing help text shown next to the field (e.g. a surcharge
  // warning, packing instructions), separate from the placeholder.
  helpText?: string;
}

// Fields with no submitted value of their own - excluded from validation,
// email data-blocks, CSV export columns and the frontend data view.
export const STRUCTURAL_TYPES: FieldType[] = ['submit', 'reset', 'fieldsep', 'image'];

export const isDataField = (type: FieldType) => !STRUCTURAL_TYPES.includes(type);

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: 'Text',
  password: 'Passwort',
  email: 'E-Mail',
  date: 'Datum',
  number: 'Zahl',
  url: 'URL',
  tel: 'Telefon',
  hidden: 'Versteckt',
  textarea: 'Mehrzeiliger Text',
  checkbox: 'Checkbox',
  multicheckbox: 'Mehrfachauswahl (Checkboxen)',
  radio: 'Radio-Auswahl',
  select: 'Dropdown-Auswahl',
  file: 'Datei-Upload',
  image: 'Bild-Button (Absenden)',
  submit: 'Absenden-Button',
  reset: 'Zurücksetzen-Button',
  fieldsep: 'Trennlinie / Abschnitt',
};
