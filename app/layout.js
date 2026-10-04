import './site.css';
import './fonts.css';
import './horse.css';
import './brand.css';
import './language.css';
import LanguageSwitch from './LanguageSwitch';
import GlobalHeader from './GlobalHeader';
import GlobalAiSupport from './GlobalAiSupport';

export const metadata = {
  title: 'BMHF | Induction System Engineering',
  description: 'Induction heat treatment, brazing, heating and custom coil engineering.',
};

export default function RootLayout({ children }) {
  return <html lang="en"><body><GlobalHeader />{children}<GlobalAiSupport /><LanguageSwitch /></body></html>;
}
