import { useLang } from '../context/LangContext';

export default function LanguageToggle() {
  const { lang, toggleLang } = useLang();
  return (
    // <button onClick={toggleLang}
    //   className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-light text-sm font-medium hover:bg-slate-700/50 transition-all"
    // >
    //   {/* <span className="text-lg">{lang === 'en' ? '🇮🇳' : '🇬🇧'}</span>
      // <span>{lang === 'en' ? 'मराठी' : 'English'}</span> */}
    // </button>

    <span></span> 

  );
}
