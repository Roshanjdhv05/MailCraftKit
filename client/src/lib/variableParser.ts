/**
 * Extracts unique variable names matching {{var_name}} pattern.
 */
export const parseVariables = (html: string): string[] => {
  if (!html) return [];
  const regex = /{{\s*([a-zA-Z0-9_]+)\s*}}/g;
  const matches = Array.from(html.matchAll(regex));
  const keys = matches.map((m) => m[1]);
  return Array.from(new Set(keys));
};

/**
 * Provides sensible default fallback values for standard variable placeholders.
 */
export const getDefaultVariableValues = (varKeys: string[]): Record<string, string> => {
  const defaults: Record<string, string> = {
    // General Email Defaults
    heading: 'Welcome to Elevi8',
    name: 'Roshan Sunil Jadhav',
    email: 'roshanjdhv114@gmail.com',
    company: 'Elevi8 Systems',
    message: 'Thank you for joining our platform. We are thrilled to help you design and deliver high-converting emails effortlessly.',
    button_text: 'Explore Workspace',
    button_url: 'https://example.com/dashboard',

    // Resume Email Template Variables
    header_eyebrow: 'APPLICATION · FULL STACK DEVELOPMENT',
    role: 'Full Stack Developer · Frontend Specialist',
    phone: '+91 7900127488',
    location: 'Thane, Maharashtra',
    summary: 'Computer Application graduate with hands-on internship experience in full-stack web development. Experienced in building modern, SEO-optimized web applications with React, Next.js, Node.js, and Supabase.',

    portfolio_url: 'https://roshanjdhv.netlify.app',
    portfolio_label: 'Portfolio',
    github_url: 'https://github.com/Roshanjdhv',
    github_label: 'GitHub',
    linkedin_url: 'https://linkedin.com/in/roshanjdhv',
    linkedin_label: 'LinkedIn',

    greeting: 'Dear Hiring Manager,',
    highlights_title: 'At a Glance',
    highlight_1_value: '7.95',
    highlight_1_label: 'BCA CGPA',
    highlight_2_value: '6+',
    highlight_2_label: 'Client projects delivered',
    highlight_3_value: 'Full Stack',
    highlight_3_label: 'Frontend + Backend development',

    technologies_title: 'Core Technologies',
    tech_1_name: 'HTML5',
    tech_1_url: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
    tech_1_icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg',
    tech_1_alt: 'HTML5',

    tech_2_name: 'CSS3',
    tech_2_url: 'https://developer.mozilla.org/en-US/docs/Web/CSS',
    tech_2_icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg',
    tech_2_alt: 'CSS3',

    tech_3_name: 'JavaScript',
    tech_3_url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
    tech_3_icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg',
    tech_3_alt: 'JavaScript',

    tech_4_name: 'React.js',
    tech_4_url: 'https://react.dev',
    tech_4_icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg',
    tech_4_alt: 'React',

    tech_5_name: 'Next.js',
    tech_5_url: 'https://nextjs.org',
    tech_5_icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg',
    tech_5_alt: 'Next.js',

    tech_6_name: 'Node.js',
    tech_6_url: 'https://nodejs.org',
    tech_6_icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg',
    tech_6_alt: 'Node.js',

    tech_7_name: 'MongoDB',
    tech_7_url: 'https://mongodb.com',
    tech_7_icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg',
    tech_7_alt: 'MongoDB',

    tech_8_name: 'Supabase',
    tech_8_url: 'https://supabase.com',
    tech_8_icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/supabase/supabase-original.svg',
    tech_8_alt: 'Supabase',

    skills_note: 'Frontend: HTML5, CSS3, JavaScript, React.js, Next.js · Backend: Node.js, Express.js · Databases: MongoDB, MySQL, Supabase · Tools: Git, GitHub, Figma, Postman',

    experience_section_title: 'Selected Experience',
    experience_1_head: 'Mulund College of Commerce — India',
    experience_1_body: 'Built the official college website from scratch using Next.js, HTML, CSS and Supabase, with a focus on responsive design, SEO and academic/administrative information.',
    experience_1_url: 'https://mccmulund.ac.in',
    experience_1_link_text: 'mccmulund.ac.in',

    experience_2_head: 'RBZ Climate Solutions — Canada',
    experience_2_body: 'Built a full-featured booking website with SEO-focused implementation and a responsive, conversion-oriented booking flow.',
    experience_2_url: 'https://rbzclimatesolutions.com',
    experience_2_link_text: 'rbzclimatesolutions.com',

    experience_3_head: 'Jay Gajanan Geotechnics — India',
    experience_3_body: 'Designed and developed a professional company website with enquiry and booking functionality, focused on clean UI/UX and lead generation.',
    experience_3_url: 'https://jaygajanangeotechnics.com',
    experience_3_link_text: 'jaygajanangeotechnics.com',

    resume_title: 'Resume Attached — Roshan Sunil Jadhav',
    resume_text: 'Please find my resume attached for your consideration. I would welcome the opportunity to discuss how my development skills and project experience could contribute to your team.',
    resume_url: 'https://roshanjdhv.netlify.app',
    resume_link_text: 'Download Resume',

    cta_text: 'View Portfolio',
    cta_url: 'https://roshanjdhv.netlify.app',

    footer_text: 'Thank you for your time and consideration.',
  };

  const result: Record<string, string> = {};
  varKeys.forEach((key) => {
    result[key] = defaults[key] || `${key.replace(/_/g, ' ').toUpperCase()}`;
  });

  return result;
};

/**
 * Safely replaces {{var_name}} in HTML with provided string values.
 * Uses string replacement without unsafe code evaluation.
 */
export const replaceVariables = (
  html: string,
  variables: Record<string, string>
): string => {
  if (!html) return '';
  let processed = html;
  Object.entries(variables).forEach(([key, val]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    processed = processed.replace(regex, val ?? '');
  });
  return processed;
};
