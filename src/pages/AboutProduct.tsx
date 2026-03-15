import { Link } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'
import styles from '../styles/AboutProduct.module.css'

const IconDoc = () => (
  <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
)
const IconCoffee = () => (
  <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
    <line x1="6" y1="2" x2="6" y2="4" />
    <line x1="10" y1="2" x2="10" y2="4" />
    <line x1="14" y1="2" x2="14" y2="4" />
  </svg>
)
const IconCheck = () => (
  <svg className={styles.iconSmall} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const IconX = () => (
  <svg className={styles.iconSmall} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
const IconExport = () => (
  <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)
const IconSpark = () => (
  <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3z" />
  </svg>
)
const IconTarget = () => (
  <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
)
const IconLetter = () => (
  <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
)

export function AboutProduct() {
  usePageMeta({
    title: 'About',
    description: 'Fast Resume is a free online resume builder and CV maker optimized for ATS (applicant tracking systems). Create an ATS-friendly resume with AI, import PDF resumes, generate cover letters, and export to PDF or DOCX. Resume done before your coffee cools.',
    canonical: '/about',
  })

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>
          Fast Resume
        </Link>
        <nav className={styles.nav}>
          <Link to="/">Resume</Link>
          <Link to="/blog">Blog</Link>
          <span className={styles.navCurrent}>About</span>
        </nav>
      </header>

      <main>
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroIllustration}>
            <IconDoc />
            <IconCoffee />
          </div>
          <h1 id="hero-title" className={styles.heroTitle}>
            Resume done before your coffee cools.
          </h1>
          <p className={styles.heroSubtitle}>
            Build an ATS-friendly resume with step-by-step guidance, AI polish, and one-click export to PDF or Word.
          </p>
          <Link to="/" className={styles.cta}>
            Get Started — Free
          </Link>
        </section>

        <section className={styles.section} aria-labelledby="what-is">
          <h2 id="what-is" className={styles.sectionTitle}>
            What is Fast Resume?
          </h2>
          <p className={styles.sectionLead}>
            Fast Resume is an online resume builder and CV maker designed for job seekers who want to create a professional, ATS-optimized resume quickly. Unlike generic resume templates or basic word processors, Fast Resume guides you through each section—professional summary, work experience, education, skills—and helps you phrase content so it passes applicant tracking system (ATS) filters used by most employers. You can start from scratch, or import your existing resume as a PDF and we convert it into our structured format. Then export your resume as PDF or DOCX with one click, or use our AI cover letter generator to create a tailored cover letter for each job application.
          </p>
        </section>

        <section className={styles.featureStrip}>
          <div className={styles.featureItem}>
            <IconDoc />
            <span>Resume builder &amp; PDF import</span>
          </div>
          <div className={styles.featureItem}>
            <IconTarget />
            <span>ATS-optimized content</span>
          </div>
          <div className={styles.featureItem}>
            <IconExport />
            <span>Export PDF, DOCX, TXT</span>
          </div>
          <div className={styles.featureItem}>
            <IconLetter />
            <span>AI cover letter</span>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="build-faster">
          <h2 id="build-faster" className={styles.sectionTitle}>
            Build your resume faster
          </h2>
          <p className={styles.sectionLead}>
            Answer a few questions in our guided chat, import your existing PDF resume, or start from scratch. Our AI helps you phrase every section—summary, experience bullets, skills—so your resume gets past applicant tracking systems and into a recruiter&apos;s hands. Perfect for job applications, career changes, and anyone who wants a professional CV without spending hours in Word or Google Docs.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="difference">
          <h2 id="difference" className={styles.sectionTitle}>
            Experience the difference
          </h2>
          <p className={styles.sectionLead}>
            See how Fast Resume compares to building a resume manually with basic tools. With our resume builder you get ATS optimization, PDF and Word export, and AI-powered cover letters—all in one place.
          </p>

          <div className={styles.comparison}>
            <div className={styles.columnWithout}>
              <h3 className={styles.columnTitle}>
                <IconX />
                Without Fast Resume
              </h3>
              <ul className={styles.list}>
                <li>
                  <strong>Manual resume building</strong>
                  <span>Spend hours creating your resume from scratch with basic tools.</span>
                </li>
                <li>
                  <strong>Manual customization</strong>
                  <span>Tailor your resume for each job by hand with no AI assistance.</span>
                </li>
                <li>
                  <strong>Limited export options</strong>
                  <span>Stuck copying into Word or hoping PDFs look right.</span>
                </li>
                <li>
                  <strong>Generic one-size-fits-all</strong>
                  <span>Send the same resume everywhere with no ATS optimization.</span>
                </li>
              </ul>
            </div>
            <div className={styles.columnWith}>
              <h3 className={styles.columnTitle}>
                <IconCheck />
                With Fast Resume
              </h3>
              <ul className={styles.list}>
                <li>
                  <strong>Guided builder + PDF import</strong>
                  <span>Build step-by-step in the chat or upload your existing PDF and we map it into our structure.</span>
                </li>
                <li>
                  <strong>ATS Enhance</strong>
                  <span>One click to polish summary and bullets for applicant tracking systems.</span>
                </li>
                <li>
                  <strong>Export in one click</strong>
                  <span>Download your resume as PDF, DOCX, or plain text—ready to send.</span>
                </li>
                <li>
                  <strong>Cover letter with AI</strong>
                  <span>Generate a tailored cover letter from your resume and job details.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="why-choose">
          <h2 id="why-choose" className={styles.sectionTitle}>
            Why job seekers use Fast Resume
          </h2>
          <p className={styles.sectionLead}>
            Fast Resume is built for anyone applying to jobs online: software developers, marketers, designers, and professionals in any field. Applicant tracking systems (ATS) scan your resume before a human sees it—so using the right keywords and a clean, parseable format matters. Our resume builder produces ATS-friendly layouts and helps you highlight skills and achievements that match job descriptions. You can also import your current resume as a PDF, refine it with our ATS Enhance feature, and export a polished PDF or Word document for your next job application. Need a cover letter? Our AI cover letter tool generates a tailored letter based on your resume and the job you&apos;re applying to.
          </p>
          <ul className={styles.bulletList}>
            <li>Free online resume builder—no sign-up required to start</li>
            <li>ATS-optimized resume format and content suggestions</li>
            <li>Import existing resume from PDF</li>
            <li>Export resume as PDF, DOCX, or plain text</li>
            <li>AI-powered cover letter generator</li>
            <li>Step-by-step guided experience for every section</li>
          </ul>
        </section>

        <section className={styles.ctaSection}>
          <IconSpark />
          <h2 className={styles.ctaSectionTitle}>Ready to get started?</h2>
          <p className={styles.ctaSectionLead}>
            Build your resume in minutes. Import a PDF, refine with AI, and export when you&apos;re ready. No account required to try.
          </p>
          <Link to="/" className={styles.cta}>
            Get Fast Resume
          </Link>
        </section>
      </main>

      <footer className={styles.footer}>
        <Link to="/" className={styles.footerLogo}>
          Fast Resume
        </Link>
        <p className={styles.footerCopy}>© {new Date().getFullYear()}</p>
      </footer>
    </div>
  )
}
