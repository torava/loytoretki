import type { Language } from '../utils';

import './LanguageSelector.css';

export function LanguageSelector({
  language,
  setLanguage,
  text,
}: {
  language: Language;
  setLanguage: (language: Language) => void;
  text: Record<string, string>;
}) {
  return (
    <label className="language-selector">
      {text.language}
      <select
        onChange={(event) =>
          setLanguage(event.target.value === 'en' ? 'en' : 'fi')
        }
        value={language}
      >
        <option value="fi">Suomi</option>
        <option value="en">English</option>
      </select>
    </label>
  );
}
