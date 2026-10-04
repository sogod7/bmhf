import './site.css';
import './brand.css';

export const metadata = {
  title: 'BMHF | Induction System Engineering',
  description: 'Induction heat treatment, brazing, heating and custom coil engineering.',
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
