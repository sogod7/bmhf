export const navigation = {
  ko: [['회사소개', '/company.html'], ['보유기술', '/technology.html'], ['제품소개', '/products'], ['적용분야', '/applications.html'], ['영상자료', '/videos'], ['공지사항', '/notices'], ['문의', '/contact.html']],
  en: [['Company', '/en/company'], ['Technology', '/en/technology'], ['Products', '/en/products'], ['Applications', '/en/applications'], ['Videos', '/en/videos'], ['News', '/en/notices'], ['Contact', '/en/contact']],
};

const staticRoutes = { company: '/company.html', technology: '/technology.html', solutions: '/solutions.html', applications: '/applications.html', projects: '/projects.html', contact: '/contact.html' };

export function englishPath(pathname = '/') {
  if (pathname === '/' || pathname === '/index.html' || pathname === '/en') return '/en';
  if (pathname.startsWith('/en/')) return pathname;
  if (pathname.startsWith('/products')) return `/en${pathname}`;
  const key = Object.entries(staticRoutes).find(([, value]) => value === pathname)?.[0];
  return key ? `/en/${key}` : `/en${pathname}`;
}

export function koreanPath(pathname = '/') {
  if (!pathname.startsWith('/en')) return pathname;
  const slug = pathname.replace(/^\/en\/?/, '');
  if (!slug) return '/index.html';
  if (slug.startsWith('products')) return `/${slug}`;
  return staticRoutes[slug] || `/${slug}`;
}

export const englishPages = {
  company: {
    eyebrow: 'ABOUT BMHF',
    title: 'Precision Induction Engineering Built for High-Volume Production.',
    body: 'Baek-Ma High Frequency (BMHF) has delivered dedicated induction heating, heat treatment, brazing, and custom coil systems to global manufacturing and automotive component suppliers for over four decades.',
    sections: [
      {
        heading: 'Engineering Philosophy',
        text: 'We engineer complete induction systems tailored to the exact metallurgical and mechanical specifications of your workpiece, rather than offering rigid standard catalog boxes.',
        points: ['Custom inductor coil geometry & CNC jig tooling', 'Optimized power matching network for repeatable depth of hardness', 'Integrated quenching, cooling and continuous automation handling'],
      },
      {
        heading: 'Facility & Global Reach',
        text: 'Headquartered in the Siheung industrial cluster in Gyeonggi-do, Korea, BMHF provides engineering verification, coil prototyping, pilot test runs, and on-site commissioning services worldwide.',
        points: ['In-house CAD/CAM coil design & fabrication shop', 'Metallurgical hardening validation & temperature profiling', 'Comprehensive spare parts & preventive maintenance support'],
      },
    ],
  },
  technology: {
    eyebrow: 'CORE TECHNOLOGY',
    title: 'Harmonizing RF Power, Impedance Matching, Coil Geometry and Automation.',
    body: 'Induction heating success depends on the unified balance between solid-state power supplies, frequency-tailored matching units, computer-modeled inductor coils, and precision fixtures.',
    sections: [
      {
        heading: 'RF Power Supply & Impedance Matching',
        text: 'From medium frequency (1–10 kHz) deep through-heating to high-frequency (50–400 kHz) surface hardening, we select optimal kilowatt output and matching capacitors for maximum electrical efficiency.',
        points: ['IGBT & MOSFET solid-state high efficiency inverters', 'Fast-acting digital PLC interlocks & temperature feedback control', 'Wide impedance matching range for diverse workpiece alloys'],
      },
      {
        heading: 'Custom Inductor Coil & Fixture Design',
        text: 'Even with identical power ratings, induction heating results are fundamentally dictated by coil shape, magnetic flux concentrators, coupling distance, and rapid quenching nozzles.',
        points: ['Precision CNC machined oxygen-free high-conductivity (OFHC) copper', 'Integrated coaxial water cooling jackets and internal quench sprays', 'Multi-axis pneumatic and servo indexing workpiece handlers'],
      },
    ],
  },
  solutions: {
    eyebrow: 'SYSTEM SOLUTIONS',
    title: 'Complete Production-Ready Solutions for Industrial Processes.',
    body: 'From single-piece prototyping to fully automated continuous transfer lines, BMHF delivers tailored induction equipment across four specialized categories.',
    sections: [
      {
        heading: '01. Induction Heat Treatment & Tempering',
        text: 'Optimized for shafts, cam-shafts, gears, hubs, and steering knuckles requiring selective case depth hardening with minimal distortion.',
        points: ['Vertical and horizontal scanning systems', 'Simultaneous dual-frequency multi-axis hardening', 'Immediate in-line induction tempering integration'],
      },
      {
        heading: '02. Precision Induction Brazing Systems',
        text: 'Engineered for carbide tooling, PCD diamond tips, copper pipes, and automotive air conditioning manifold joints with flux and braze alloy repeatability.',
        points: ['Multi-station rotary indexing tables', 'Argon/protective gas shielding options', 'Controlled localized heating preventing core metallurgy degradation'],
      },
      {
        heading: '03. High Frequency Induction Heaters',
        text: 'Purpose-built for press fitting (shrink fit), motor case expansion, hot forging billeting, and molding inserts.',
        points: ['Uniform circumferential thermal expansion', 'Cycle times measured in seconds with clean zero-emission heating', 'Robotic cell integration and automated pick-and-place'],
      },
      {
        heading: '04. Custom Coils & Re-Engineering',
        text: 'We repair, redesign, and optimize existing worn coils to enhance flux concentration, eliminate cold spots, and extend inductor service life.',
        points: ['Reverse engineering from workpiece drawings or sample parts', 'Optimized silver-brazed high-current terminal connections', 'Rapid turnaround emergency rebuilds'],
      },
    ],
  },
  applications: {
    eyebrow: 'APPLICATIONS',
    title: 'Proven Performance Across Automotive, Tooling & Heavy Industry.',
    body: 'Our systems operate on demanding tier-1 automotive component lines, cutting tool manufacturing plants, and precision machinery workshops.',
    sections: [
      {
        heading: 'Automotive & Drivetrain Components',
        text: 'Shafts, rotor shafts, cam shafts, wheel hubs, outer races, steering rack bars, and transmission gears requiring precise R-curve hardening.',
        points: ['Repeated depth accuracy within ±0.1mm tolerances', 'Automated distortion suppression fixtures', '100% process data logging and traceability'],
      },
      {
        heading: 'Cutting Tools & Mining Equipment',
        text: 'Brazing tungsten carbide inserts, PCD/CBN tips to tool bodies, drill bits, router bits, and circular saw segments.',
        points: ['Zero braze voiding with localized uniform thermal soak', 'High shear strength joints with consistent metallurgical bonding', 'Reduced heating cycle times down to 3–8 seconds'],
      },
      {
        heading: 'Electric Vehicles & Motor Cases',
        text: 'EV stator housing shrink fitting, motor shaft insertion, porous metal sintering, and aluminum casting insert heating.',
        points: ['Even radial temperature distribution preventing oval deformation', 'Energy efficiency exceeding 90% compared to conventional gas ovens', 'Clean, environmentally friendly production cell environment'],
      },
    ],
  },
  projects: {
    eyebrow: 'CASE STUDIES',
    title: 'Engineering Case Studies Shaped by Field Implementation.',
    body: 'Review select examples of BMHF equipment delivered and commissioned in demanding high-volume manufacturing environments.',
    sections: [
      {
        heading: 'Case 01: Automotive Drive Shaft Hardening & Tempering Cell',
        text: 'A fully automated vertical scanner featuring CNC servo control, dual-quench rings, and inline tempering for steering drive shafts.',
        points: ['Cycle time: 24 sec/part with continuous robotic load/unload', 'Consistent 3.5mm case depth across variable diameter steps', 'Integrated optical pyrometer temperature monitoring'],
      },
      {
        heading: 'Case 02: Multi-Station Rotary Tool Brazing System',
        text: 'An 8-station rotary indexing machine designed for high-precision end mill and drill bit carbide insert brazing.',
        points: ['Automatic pneumatic clamp tooling and flux application', 'Dual-frequency preheat and final joining sequence', 'Defect rate reduced by over 98% compared to manual torch brazing'],
      },
    ],
  },
  videos: {
    eyebrow: 'VIDEO LIBRARY',
    title: 'See BMHF Systems and Coil Operations in Action.',
    body: 'Review product operation and process demonstration videos from our Siheung engineering test center.',
    sections: [
      {
        heading: 'Demonstration & Process Verification',
        text: 'We welcome sample workpiece submissions for process trials. Watch our test runs and contact us with your part specifications.',
        points: ['Flange hub hardening videos', 'Automated shaft quenching sequences', 'Rapid multi-tool brazing demonstrations'],
      },
    ],
  },
  notices: {
    eyebrow: 'NEWSROOM',
    title: 'Corporate Announcements and Engineering Updates.',
    body: 'Stay updated with BMHF technical releases, exhibitions, and system delivery announcements.',
    sections: [
      {
        heading: 'Notice Board',
        text: 'Official announcements and technical advisories from Baek-Ma High Frequency engineering management.',
        points: ['Process consultation guidelines', 'Exhibition and technical seminar participation', 'New product line announcements'],
      },
    ],
  },
  support: {
    eyebrow: 'TECHNICAL SUPPORT',
    title: 'Engineering Review and Customer Support Portal.',
    body: 'Connect directly with our engineering team to review part drawings, assess cycle time feasibility, or request system proposals.',
    sections: [
      {
        heading: 'Consultation Requirements',
        text: 'For an expedited technical feasibility report, please prepare your workpiece CAD drawing, base alloy specification, desired hardness profile, and target hourly output.',
        points: ['Workpiece material (e.g. AISI 1045, 4140, Copper, Alloy Steel)', 'Dimensional tolerances and heating zone boundaries', 'Available facility power (Voltage, Frequency, Water Cooling Capacity)'],
      },
    ],
  },
};

