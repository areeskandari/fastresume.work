/**
 * GA4 event tracking. Events only fire when gtag is loaded (e.g. production).
 */

declare global {
  interface Window {
    gtag?: (command: 'event', name: string, params?: Record<string, unknown>) => void
  }
}

function safeGtag(...args: Parameters<NonNullable<typeof window.gtag>>) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag(...args)
  }
}

export const analytics = {
  /** User sent their first chat message (resume flow started). */
  chatStart() {
    safeGtag('event', 'chat_start')
  },

  /** User sent a chat message. */
  chatMessage(sectionId: string) {
    safeGtag('event', 'chat_message', { section_id: sectionId })
  },

  /** User moved to a new section (about → experience → … → review). */
  sectionComplete(sectionId: string) {
    safeGtag('event', 'section_complete', { section_id: sectionId })
  },

  /** User exported resume as PDF. */
  exportPdf() {
    safeGtag('event', 'export_pdf')
  },

  /** User exported resume as DOCX. */
  exportDocx() {
    safeGtag('event', 'export_docx')
  },

  /** User exported resume as Text. */
  exportTxt() {
    safeGtag('event', 'export_txt')
  },

  /** User clicked ATS Enhance and was sent to checkout (no session yet). */
  atsEnhanceCheckoutStart() {
    safeGtag('event', 'ats_enhance_checkout_start')
  },

  /** User applied ATS Enhance (had paid session, clicked to apply). */
  atsEnhanceApplied() {
    safeGtag('event', 'ats_enhance_applied')
  },

  /** User clicked Cover letter and was sent to checkout. */
  coverLetterCheckoutStart() {
    safeGtag('event', 'cover_letter_checkout_start')
  },

  /** User opened cover letter modal (after payment). */
  coverLetterModalOpen() {
    safeGtag('event', 'cover_letter_modal_open')
  },

  /** User generated a cover letter (Pay & create). */
  coverLetterGenerated() {
    safeGtag('event', 'cover_letter_generated')
  },

  /** User opened the job description matching panel. */
  jobDescriptionPanelOpen() {
    safeGtag('event', 'job_description_panel_open')
  },
}
