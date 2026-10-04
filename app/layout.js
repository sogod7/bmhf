import './site.css';
import './horse.css';
import './brand.css';
import './language.css';
import LanguageSwitch from './LanguageSwitch';
import GlobalHeader from './GlobalHeader';

export const metadata = {
  title: 'BMHF | Induction System Engineering',
  description: 'Induction heat treatment, brazing, heating and custom coil engineering.',
};

export default function RootLayout({ children }) {
  return <html lang="en"><body><GlobalHeader />{children}<LanguageSwitch /></body></html>;
}
