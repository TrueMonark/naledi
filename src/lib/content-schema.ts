/**
 * Every editable piece of static page text/imagery lives here.
 * - The admin "Site Content" screen is generated from this list — add a field here and it appears there.
 * - `value` is the default used until an admin changes it (and the fallback if the DB is unreachable).
 * - `npm run db:seed` creates the rows; it never overwrites values an admin has already edited.
 *
 * Types: text (one line) · textarea (paragraph) · list (one item per line) · image · file (PDF)
 */
export type FieldType = "text" | "textarea" | "list" | "image" | "file";
export type FieldDef = { section: string; type: FieldType; label: string; value: string; help?: string };
export type PageDef = { page: string; title: string; description: string; fields: FieldDef[] };

export const CONTENT_SCHEMA: PageDef[] = [
  {
    page: "site",
    title: "School details",
    description: "Name, contacts and social links shown in the header, footer and contact page.",
    fields: [
      { section: "schoolName", type: "text", label: "School name", value: "Naledi Day and Boarding School" },
      { section: "shortName", type: "text", label: "Short name (header)", value: "Naledi School" },
      { section: "motto", type: "text", label: "Motto / tagline", value: "Nurturing Excellence, Building Future Leaders" },
      { section: "logo", type: "image", label: "Logo", value: "", help: "Square image works best. Leave empty to show the star emblem." },
      { section: "phone", type: "text", label: "Phone number", value: "" , help: "Leave blank to hide." },
      { section: "phoneAlt", type: "text", label: "Second phone / WhatsApp", value: "" },
      { section: "email", type: "text", label: "Email address", value: "info@naledischool.org" },
      { section: "address", type: "textarea", label: "Physical address", value: "Zambia" },
      { section: "officeHours", type: "text", label: "Office hours", value: "Monday – Friday, 07:30 – 16:30" },
      { section: "mapEmbedUrl", type: "text", label: "Google Maps embed link", value: "", help: "In Google Maps: Share → Embed a map → copy only the src=\"…\" link." },
      { section: "facebook", type: "text", label: "Facebook page link", value: "" },
      { section: "instagram", type: "text", label: "Instagram link", value: "" },
      { section: "youtube", type: "text", label: "YouTube channel link", value: "" },
      { section: "tiktok", type: "text", label: "TikTok link", value: "" },
    ],
  },
  {
    page: "hero",
    title: "Home – hero slider",
    description: "The three large rotating slides at the top of the home page.",
    fields: [
      { section: "slide1Image", type: "image", label: "Slide 1 – photo", value: "" },
      { section: "slide1Title", type: "text", label: "Slide 1 – title", value: "Welcome to Naledi Day and Boarding School" },
      { section: "slide1Subtitle", type: "text", label: "Slide 1 – subtitle", value: "Nurturing Excellence, Building Future Leaders" },
      { section: "slide2Image", type: "image", label: "Slide 2 – photo", value: "" },
      { section: "slide2Title", type: "text", label: "Slide 2 – title", value: "Academic Excellence" },
      { section: "slide2Subtitle", type: "text", label: "Slide 2 – subtitle", value: "Empowering Students Through Quality Education" },
      { section: "slide3Image", type: "image", label: "Slide 3 – photo", value: "" },
      { section: "slide3Title", type: "text", label: "Slide 3 – title", value: "Celebrating Success" },
      { section: "slide3Subtitle", type: "text", label: "Slide 3 – subtitle", value: "Your Journey to Achievement Starts Here" },
    ],
  },
  {
    page: "home",
    title: "Home – page sections",
    description: "Welcome text, highlights and call-to-action on the home page. (The video has its own screen: Homepage Video.)",
    fields: [
      { section: "welcomeTitle", type: "text", label: "Welcome heading", value: "Welcome to Naledi Day and Boarding School" },
      { section: "welcomeParagraph1", type: "textarea", label: "Welcome paragraph 1", value: "At Naledi, we believe every child has the potential to shine like a star. Our commitment to academic excellence, character development, and holistic education creates an environment where students thrive and reach their full potential." },
      { section: "welcomeParagraph2", type: "textarea", label: "Welcome paragraph 2", value: "With over two decades of educational excellence, we have been nurturing young minds and preparing them for a bright future. Our dedicated faculty, modern facilities, and comprehensive curriculum ensure that every student receives the best possible education." },
      { section: "welcomeImage", type: "image", label: "Welcome section photo", value: "" },
      { section: "stat1Value", type: "text", label: "Highlight 1 – number", value: "20+" },
      { section: "stat1Label", type: "text", label: "Highlight 1 – label", value: "Years of excellence" },
      { section: "stat2Value", type: "text", label: "Highlight 2 – number", value: "Day & Boarding" },
      { section: "stat2Label", type: "text", label: "Highlight 2 – label", value: "Learning options" },
      { section: "stat3Value", type: "text", label: "Highlight 3 – number", value: "Holistic" },
      { section: "stat3Label", type: "text", label: "Highlight 3 – label", value: "Academics, faith & character" },
      { section: "pillarsTitle", type: "text", label: "\"Why Naledi\" heading", value: "Why families choose Naledi" },
      { section: "pillars", type: "list", label: "\"Why Naledi\" points", value: "Academic Excellence | A rigorous curriculum taught by dedicated, qualified teachers.\nChristian Values | Daily devotions and a caring community that shapes character.\nBoarding Life | Safe, supervised boarding with a warm, family atmosphere.\nCo-curricular | Sports, clubs and the arts so every learner finds their strength.", help: "One per line, written as  Title | Description" },
      { section: "ctaTitle", type: "text", label: "Bottom banner – heading", value: "Ready to join the Naledi family?" },
      { section: "ctaText", type: "textarea", label: "Bottom banner – text", value: "Enrolment is open. Find out what you need to apply, or get in touch with our admissions office." },
    ],
  },
  {
    page: "about",
    title: "About page",
    description: "History, mission, vision, values and the head teacher's message.",
    fields: [
      { section: "heroImage", type: "image", label: "Page banner photo", value: "" },
      { section: "intro", type: "textarea", label: "Intro line under the title", value: "A community where every learner is known, challenged and encouraged to shine." },
      { section: "historyTitle", type: "text", label: "Our story – heading", value: "Our Story" },
      { section: "history", type: "textarea", label: "Our story – text", value: "Naledi — meaning \"star\" — was founded on the belief that every child carries a light worth nurturing. For more than two decades we have grown from a small day school into a day and boarding school serving families across the region, while keeping the close-knit, caring spirit we started with." },
      { section: "historyImage", type: "image", label: "Our story – photo", value: "" },
      { section: "mission", type: "textarea", label: "Mission", value: "To provide quality, holistic education grounded in Christian values that develops learners academically, spiritually, socially and physically." },
      { section: "vision", type: "textarea", label: "Vision", value: "To raise disciplined, God-fearing and well-rounded future leaders who shine in their communities and the world." },
      { section: "values", type: "list", label: "Core values", value: "Excellence\nIntegrity\nRespect\nDiscipline\nFaith\nCompassion", help: "One value per line" },
      { section: "headName", type: "text", label: "Head teacher – name", value: "" },
      { section: "headTitle", type: "text", label: "Head teacher – title", value: "Head Teacher" },
      { section: "headPhoto", type: "image", label: "Head teacher – photo", value: "" },
      { section: "headMessage", type: "textarea", label: "Head teacher – message", value: "Welcome to Naledi. Our teachers and staff are committed to walking with every learner, celebrating their strengths and supporting them where they need it most. We look forward to partnering with you in your child's education." },
      { section: "facilities", type: "list", label: "Facilities", value: "Modern classrooms | Bright, well-equipped learning spaces.\nScience laboratory | Hands-on practical work.\nComputer lab | Digital skills for a modern world.\nLibrary | A quiet place to read, research and grow.\nBoarding houses | Safe, supervised and homely.\nSports grounds | Football, netball, athletics and more.", help: "One per line, written as  Name | Short description" },
    ],
  },
  {
    page: "admissions",
    title: "Admissions & requirements",
    description: "How to apply, what to bring, and the downloadable forms.",
    fields: [
      { section: "heroImage", type: "image", label: "Page banner photo", value: "" },
      { section: "intro", type: "textarea", label: "Intro text", value: "We welcome applications throughout the year, subject to space. Here's everything you need to know to join Naledi." },
      { section: "steps", type: "list", label: "How to apply – steps", value: "Visit or contact us | Get in touch with the admissions office or visit the school for a tour.\nCollect or download the application form | Fill it in completely.\nSubmit the form with documents | Attach the required documents listed below.\nAssessment / interview | Your child may be invited for a short placement assessment.\nAcceptance & payment | Receive your offer letter and secure the place.", help: "One per line, written as  Step title | Description" },
      { section: "documents", type: "list", label: "Documents required", value: "Completed application form\nCopy of birth certificate\nLatest school report\nTransfer letter from previous school (if applicable)\nTwo passport-size photos\nCopy of parent/guardian NRC", help: "One per line" },
      { section: "boardingItems", type: "list", label: "Boarding requirements (what to bring)", value: "School uniform (as per the uniform list)\nBedding: blankets, sheets and pillow\nMosquito net\nToiletries\nTrunk or lockable box\nBible\nStationery", help: "One per line" },
      { section: "dayItems", type: "list", label: "Day scholar requirements", value: "School uniform (as per the uniform list)\nStationery\nBible", help: "One per line" },
      { section: "feesNote", type: "textarea", label: "Fees note", value: "For the current fee structure, please contact the school office or download the fees schedule below." },
      { section: "applicationForm", type: "file", label: "Application form (PDF)", value: "" },
      { section: "feesSchedule", type: "file", label: "Fees schedule (PDF)", value: "" },
      { section: "requirementsList", type: "file", label: "Full requirements list (PDF)", value: "" },
      { section: "faq", type: "list", label: "Frequently asked questions", value: "When does the school year start? | Our academic year follows the Zambian school calendar, with three terms starting in January, May and September.\nDo you offer both day and boarding places? | Yes. Learners can join as day scholars or boarders, subject to availability.\nCan we visit before applying? | Absolutely — contact the office to arrange a tour.", help: "One per line, written as  Question | Answer" },
    ],
  },
  {
    page: "pages",
    title: "Page banners",
    description: "Banner photos and intro lines for the Gallery, News, Devotions and Contact pages.",
    fields: [
      { section: "galleryImage", type: "image", label: "Gallery – banner photo", value: "" },
      { section: "galleryIntro", type: "text", label: "Gallery – intro line", value: "Moments from classrooms, sports days, celebrations and boarding life." },
      { section: "blogImage", type: "image", label: "News – banner photo", value: "" },
      { section: "blogIntro", type: "text", label: "News – intro line", value: "Stories, announcements and achievements from around the school." },
      { section: "devotionsImage", type: "image", label: "Devotions – banner photo", value: "" },
      { section: "devotionsIntro", type: "text", label: "Devotions – intro line", value: "Daily reflections to strengthen faith and character." },
      { section: "contactImage", type: "image", label: "Contact – banner photo", value: "" },
      { section: "contactIntro", type: "text", label: "Contact – intro line", value: "We'd love to hear from you. Send us a message or visit the school." },
    ],
  },
];

export type ContentMap = Record<string, string>;

export function defaultsFor(page: string): ContentMap {
  const def = CONTENT_SCHEMA.find((p) => p.page === page);
  return Object.fromEntries((def?.fields ?? []).map((f) => [f.section, f.value]));
}

/** Parses "Title | Description" list rows. */
export function pairs(value: string) {
  return value
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [title, ...rest] = l.split("|");
      return { title: title.trim(), text: rest.join("|").trim() };
    });
}
