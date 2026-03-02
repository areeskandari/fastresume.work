import { jsPDF } from "jspdf";
import type { ResumeData } from "../types/resume";

const MARGIN = 40;
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MAX_WIDTH = PAGE_WIDTH - MARGIN * 2;

export function exportResumeToPdf(
  data: ResumeData,
  filename = "resume.pdf"
): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  let y = MARGIN;

  const drawText = (text: string, opts?: { link?: string; fontSize?: number }) => {
    const fontSize = opts?.fontSize ?? 11;
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, MAX_WIDTH);
    for (const line of lines) {
      if (y > PAGE_HEIGHT - MARGIN) {
        doc.addPage();
        y = MARGIN;
      }
      if (opts?.link && typeof (doc as unknown as { textWithLink?: (t: string, x: number, y: number, o: { url: string }) => number }).textWithLink === "function") {
        (doc as unknown as { textWithLink: (t: string, x: number, y: number, o: { url: string }) => number }).textWithLink(line, MARGIN, y, { url: opts.link });
      } else {
        doc.text(line, MARGIN, y);
      }
      y += fontSize * 0.45;
    }
    return y;
  };

  const space = (pt: number) => {
    y += pt;
    if (y > PAGE_HEIGHT - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  };

  doc.setFont("helvetica", "normal");

  // Name
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  const nameLines = doc.splitTextToSize(data.about.fullName || "Your Name", MAX_WIDTH);
  for (const line of nameLines) {
    if (y > PAGE_HEIGHT - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
    doc.text(line, MARGIN, y);
    y += 11;
  }
  doc.setFont("helvetica", "normal");
  space(8);

  // Contact line with links
  const contact = data.about.contact;
  const contactParts: { text: string; link?: string }[] = [];
  if (contact.location) contactParts.push({ text: contact.location });
  if (contact.email) contactParts.push({ text: contact.email, link: `mailto:${contact.email}` });
  if (contact.phone) contactParts.push({ text: contact.phone });
  if (contact.linkedin) contactParts.push({ text: contact.linkedin, link: /^https?:\/\//i.test(contact.linkedin) ? contact.linkedin : `https://${contact.linkedin}` });
  if (contact.portfolio) contactParts.push({ text: contact.portfolio, link: /^https?:\/\//i.test(contact.portfolio) ? contact.portfolio : `https://${contact.portfolio}` });

  if (contactParts.length > 0) {
    doc.setFontSize(10);
    const fullLine = contactParts.map((p) => p.text).join(" | ");
    const lineWidth = doc.getTextWidth(fullLine);
    if (lineWidth <= MAX_WIDTH) {
      let x = MARGIN;
      for (let i = 0; i < contactParts.length; i++) {
        const p = contactParts[i];
        const seg = p.text + (i < contactParts.length - 1 ? " | " : "");
        const w = doc.getTextWidth(seg);
        if (p.link && (doc as unknown as { textWithLink?: (t: string, x: number, y: number, o: { url: string }) => number }).textWithLink) {
          (doc as unknown as { textWithLink: (t: string, x: number, y: number, o: { url: string }) => number }).textWithLink(seg, x, y, { url: p.link });
        } else {
          doc.text(seg, x, y);
        }
        x += w;
      }
      y += 10;
    } else {
      y = drawText(fullLine, contact.email ? { link: `mailto:${contact.email}` } : undefined);
    }
  }
  space(12);

  // Summary
  if (data.about.professionalSummary) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Professional Summary", MARGIN, y);
    y += 10;
    doc.setFont("helvetica", "normal");
    const sumLines = doc.splitTextToSize(data.about.professionalSummary, MAX_WIDTH);
    for (const line of sumLines) {
      if (y > PAGE_HEIGHT - MARGIN) {
        doc.addPage();
        y = MARGIN;
      }
      doc.text(line, MARGIN, y);
      y += 5.5;
    }
    space(14);
  }

  // Experience
  if (data.experience.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Work Experience", MARGIN, y);
    y += 12;
    doc.setFont("helvetica", "normal");
    for (const e of data.experience) {
      if (y > PAGE_HEIGHT - MARGIN) {
        doc.addPage();
        y = MARGIN;
      }
      doc.setFont("helvetica", "bold");
      doc.text(`${e.company} — ${e.role}`, MARGIN, y);
      y += 8;
      doc.setFont("helvetica", "normal");
      const start = [e.startMonth, e.startYear].filter(Boolean).join(" ");
      const end = e.isCurrent ? "Present" : [e.endMonth, e.endYear].filter(Boolean).join(" ");
      doc.text(`${start} – ${end}`, MARGIN, y);
      y += 10;
      for (const b of e.bullets) {
        const bulletLines = doc.splitTextToSize("• " + b, MAX_WIDTH - 15);
        for (const line of bulletLines) {
          if (y > PAGE_HEIGHT - MARGIN) {
            doc.addPage();
            y = MARGIN;
          }
          doc.text(line, MARGIN + 15, y);
          y += 5.5;
        }
      }
      space(10);
    }
  }

  // Education
  if (data.education.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.text("Education", MARGIN, y);
    y += 12;
    doc.setFont("helvetica", "normal");
    for (const ed of data.education) {
      doc.setFont("helvetica", "bold");
      doc.text(`${ed.institution} — ${ed.degree}`, MARGIN, y);
      y += 8;
      doc.setFont("helvetica", "normal");
      doc.text(`${ed.startYear} – ${ed.endYear}`, MARGIN, y);
      y += 12;
    }
  }

  // Skills
  if (data.skills.technical.length || data.skills.tools.length || data.skills.soft.length) {
    space(8);
    doc.setFont("helvetica", "bold");
    doc.text("Skills", MARGIN, y);
    y += 10;
    doc.setFont("helvetica", "normal");
    if (data.skills.technical.length) {
      doc.text("Technical: " + data.skills.technical.join(", "), MARGIN, y);
      y += 7;
    }
    if (data.skills.tools.length) {
      doc.text("Tools: " + data.skills.tools.join(", "), MARGIN, y);
      y += 7;
    }
    if (data.skills.soft.length) {
      doc.text("Soft: " + data.skills.soft.join(", "), MARGIN, y);
      y += 10;
    }
  }

  // Projects
  if (data.projects.length > 0) {
    space(8);
    doc.setFont("helvetica", "bold");
    doc.text("Projects", MARGIN, y);
    y += 12;
    doc.setFont("helvetica", "normal");
    for (const p of data.projects) {
      const title = p.name + (p.url ? " — " + p.url : "");
      doc.setFont("helvetica", "bold");
      const projLines = doc.splitTextToSize(title, MAX_WIDTH);
      for (const line of projLines) {
        if (y > PAGE_HEIGHT - MARGIN) {
          doc.addPage();
          y = MARGIN;
        }
        doc.text(line, MARGIN, y);
        y += 7;
      }
      doc.setFont("helvetica", "normal");
      if (p.description) {
        const descLines = doc.splitTextToSize(p.description, MAX_WIDTH);
        for (const line of descLines) {
          if (y > PAGE_HEIGHT - MARGIN) {
            doc.addPage();
            y = MARGIN;
          }
          doc.text(line, MARGIN, y);
          y += 5.5;
        }
      }
      if (p.bullets?.length) {
        for (const b of p.bullets) {
          const bl = doc.splitTextToSize("• " + b, MAX_WIDTH - 15);
          for (const line of bl) {
            if (y > PAGE_HEIGHT - MARGIN) {
              doc.addPage();
              y = MARGIN;
            }
            doc.text(line, MARGIN + 15, y);
            y += 5.5;
          }
        }
      }
      space(8);
    }
  }

  doc.save(filename);
}
