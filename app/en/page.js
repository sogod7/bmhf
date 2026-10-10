import Link from 'next/link';

const solutions = [
  ['Heat Treatment & Tempering', 'Shafts, gears, hubs and steering components engineered for repeatable induction processing.'],
  ['Induction Brazing', 'Application-focused coils and fixtures for carbide, PCD, end mills, pipes and valve components.'],
  ['Induction Heating', 'Purpose-built heating systems for press fitting, forging, motor cases and production cells.'],
];

export const metadata = {
  title: 'BMHF | Induction System Engineering - Heat Treatment & Brazing',
  description: 'Baek-Ma High Frequency (BMHF) designs precision induction heat treatment, brazing, heating systems and custom coils for industrial manufacturing.',
  keywords: ['Induction Heating', 'Induction Heat Treatment', 'Induction Brazing', 'Custom Induction Coil', 'BMHF', 'Baek-Ma High Frequency'],
  alternates: {
    canonical: '/en',
    languages: {
      'ko-KR': '/',
      'en-US': '/en',
    },
  },
  openGraph: {
    title: 'BMHF | Induction System Engineering',
    description: 'Precision heat. Reliable production. Purpose-built induction systems tailored to your workpiece and process conditions.',
    url: '/en',
  },
};

export default function EnglishHome() {
  return <main>
    <header className="nav"><Link href="/en" className="brand">BMHF</Link><nav><a href="/index.html">한국어</a><Link href="/en/board">News</Link><Link href="/en/resources">Resources</Link><Link className="nav-cta" href="/en/contact">Request a quote</Link></nav></header>
    <section className="hero-en"><div><p className="kicker">INDUCTION SYSTEM ENGINEERING</p><h1>Precision heat.<br />Reliable production.</h1><p>BMHF designs induction systems around your workpiece, process conditions and production requirements.</p><Link className="button" href="/en/contact">Discuss your project</Link></div></section>
    <section className="section"><p className="kicker dark">CAPABILITIES</p><h2>Engineering built around the process.</h2><div className="cards">{solutions.map(([title, text]) => <article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <section className="section dark-band"><p className="kicker">PROJECT APPROACH</p><h2>Analyze. Design. Validate. Integrate.</h2><p>We align power, coil, cooling, fixtures and automation to deliver a production-ready induction process.</p></section>
    <footer className="footer"><img className="footer-logo--white" src="/assets/images/bmhf-logo-footer-white.png" alt="BMHF" />© BEAK-MA HIGH FREQUENCY · <a href="mailto:master@bmhf.co.kr">master@bmhf.co.kr</a></footer>
  </main>;
}
