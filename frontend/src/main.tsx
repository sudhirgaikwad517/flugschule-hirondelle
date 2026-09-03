import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n' // Import i18n

// No StrictMode: its dev-only double-mount/double-effect behavior triggers a
// known TipTap crash (destroyed editor instance still referenced by a stale
// keyboard-shortcut handler -> "Cannot read properties of null (reading
// 'commands')"), most visible on pages that mount several RichTextInputs at
// once (e.g. the Events create form). StrictMode has no effect in production.
createRoot(document.getElementById('root')!).render(
  <App />,
)
