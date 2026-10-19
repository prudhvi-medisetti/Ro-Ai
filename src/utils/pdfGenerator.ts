import { jsPDF } from 'jspdf';

export interface PdfDocumentOptions {
  title: string;
  subtitle?: string;
  author?: string;
  category?: string;
  duration?: string;
  filename?: string;
}

/**
 * Clean markdown symbols for plain PDF text rendering
 */
function cleanMarkdownText(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // bold
    .replace(/\*(.*?)\*/g, '$1') // italic
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/`([^`]+)`/g, '$1') // inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/^#+\s+/gm, '') // heading hashes
    .replace(/^>\s+/gm, '') // blockquotes
    .trim();
}

/**
 * Generate a beautifully styled, multi-page PDF from markdown/text content
 */
export function generatePdfBlob(content: string, options: PdfDocumentOptions): { blob: Blob; filename: string; url: string } {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 45;
  const contentWidth = pageWidth - margin * 2;

  let cursorY = margin;

  // Clean filename
  const rawTitle = options.title || 'Document';
  const cleanTitle = rawTitle.replace(/[/\\?%*:|"<>]/g, '').trim();
  const filename = options.filename || `${cleanTitle.replace(/\s+/g, '_')}.pdf`;

  // Draw Header Banner / Top Bar
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(margin, cursorY, contentWidth, 54, 'F');

  // Top Accent Stripe
  doc.setFillColor(79, 70, 229); // Indigo-600
  doc.rect(margin, cursorY, contentWidth, 3, 'F');

  // Banner Title & Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  const headerTitle = cleanTitle.length > 50 ? cleanTitle.substring(0, 47) + '...' : cleanTitle;
  doc.text(headerTitle, margin + 14, cursorY + 24);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(199, 210, 254); // Indigo-200
  const subMeta = [
    options.category || 'AI Generated Document',
    options.duration ? `Duration: ${options.duration}` : null,
    new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
  ]
    .filter(Boolean)
    .join('  •  ');
  doc.text(subMeta, margin + 14, cursorY + 42);

  cursorY += 70;

  // Helper for page break
  const checkPageBreak = (neededHeight: number = 20) => {
    if (cursorY + neededHeight > pageHeight - margin - 25) {
      addPageFooter();
      doc.addPage();
      cursorY = margin + 15;
      // Small top header on subsequent pages
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // Slate-400
      doc.text(headerTitle, margin, cursorY);
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, cursorY + 4, pageWidth - margin, cursorY + 4);
      cursorY += 20;
    }
  };

  // Helper to add footer
  const addPageFooter = () => {
    const pageNum = doc.getNumberOfPages();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - margin + 5, pageWidth - margin, pageHeight - margin + 5);
    doc.text('Created with Ro AI Studio', margin, pageHeight - margin + 18);
    doc.text(`Page ${pageNum}`, pageWidth - margin - 30, pageHeight - margin + 18);
  };

  // Parse lines from markdown content
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      cursorY += 8;
      continue;
    }

    // Heading 1 (# Heading)
    if (line.startsWith('# ')) {
      checkPageBreak(35);
      cursorY += 10;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(15, 23, 42); // Slate-900
      const headingText = cleanMarkdownText(line.slice(2));
      const splitHeading = doc.splitTextToSize(headingText, contentWidth);
      doc.text(splitHeading, margin, cursorY);
      cursorY += splitHeading.length * 18 + 4;

      // Decorative underline
      doc.setFillColor(99, 102, 241);
      doc.rect(margin, cursorY - 2, 40, 2, 'F');
      cursorY += 8;
      continue;
    }

    // Heading 2 (## Heading)
    if (line.startsWith('## ')) {
      checkPageBreak(28);
      cursorY += 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(30, 41, 59); // Slate-800
      const headingText = cleanMarkdownText(line.slice(3));
      const splitHeading = doc.splitTextToSize(headingText, contentWidth);
      doc.text(splitHeading, margin, cursorY);
      cursorY += splitHeading.length * 15 + 4;
      continue;
    }

    // Heading 3 (### Heading)
    if (line.startsWith('### ')) {
      checkPageBreak(22);
      cursorY += 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(51, 65, 85); // Slate-700
      const headingText = cleanMarkdownText(line.slice(4));
      const splitHeading = doc.splitTextToSize(headingText, contentWidth);
      doc.text(splitHeading, margin, cursorY);
      cursorY += splitHeading.length * 13 + 3;
      continue;
    }

    // Bullet points (- or * or •)
    if (line.match(/^[-*•]\s+/) || line.match(/^\d+\.\s+/)) {
      checkPageBreak(18);
      const isNumbered = line.match(/^(\d+\.)\s+(.*)/);
      let bulletPrefix = '•';
      let bulletContent = line.replace(/^[-*•]\s+/, '');

      if (isNumbered) {
        bulletPrefix = isNumbered[1];
        bulletContent = isNumbered[2];
      }

      bulletContent = cleanMarkdownText(bulletContent);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(79, 70, 229); // Indigo-600
      doc.text(bulletPrefix, margin + 5, cursorY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85); // Slate-700
      const splitBullet = doc.splitTextToSize(bulletContent, contentWidth - 22);
      doc.text(splitBullet, margin + 20, cursorY);
      cursorY += splitBullet.length * 14 + 3;
      continue;
    }

    // Blockquote (> text)
    if (line.startsWith('>')) {
      checkPageBreak(25);
      const quoteText = cleanMarkdownText(line.replace(/^>\s*/, ''));
      doc.setFillColor(241, 245, 249); // Slate-100
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);

      const splitQuote = doc.splitTextToSize(quoteText, contentWidth - 20);
      const boxHeight = splitQuote.length * 13 + 12;

      doc.rect(margin, cursorY - 4, contentWidth, boxHeight, 'F');
      // Left border bar
      doc.setFillColor(99, 102, 241);
      doc.rect(margin, cursorY - 4, 3, boxHeight, 'F');

      doc.text(splitQuote, margin + 12, cursorY + 6);
      cursorY += boxHeight + 6;
      continue;
    }

    // Markdown Table Row (| col1 | col2 |)
    if (line.startsWith('|') && line.endsWith('|')) {
      // Skip separator rows like |---|---|
      if (line.includes('---')) continue;

      checkPageBreak(20);
      const rawCols = line.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      const colCount = rawCols.length;
      if (colCount > 0) {
        const colWidth = contentWidth / colCount;
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, cursorY - 3, contentWidth, 18, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.rect(margin, cursorY - 3, contentWidth, 18, 'S');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(30, 41, 59);

        rawCols.forEach((col, cIdx) => {
          const cleanCol = cleanMarkdownText(col.trim());
          doc.text(cleanCol, margin + cIdx * colWidth + 6, cursorY + 9);
        });

        cursorY += 20;
        continue;
      }
    }

    // Regular Paragraph
    checkPageBreak(16);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85); // Slate-700
    const cleanPara = cleanMarkdownText(line);
    const splitPara = doc.splitTextToSize(cleanPara, contentWidth);
    doc.text(splitPara, margin, cursorY);
    cursorY += splitPara.length * 14 + 4;
  }

  // Add final footer on the last page
  addPageFooter();

  // Create Blob & Object URL
  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);

  return {
    blob: pdfBlob,
    filename,
    url,
  };
}

/**
 * Trigger immediate browser download of the generated PDF
 */
export function downloadGeneratedPdf(content: string, options: PdfDocumentOptions) {
  const { blob, filename } = generatePdfBlob(content, options);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

/**
 * Detect if message or prompt represents a PDF document/speech/guide and extract metadata
 */
export function detectPdfMetadata(messageContent: string, precedingUserPrompt?: string): {
  isExplicitPdf: boolean;
  title: string;
  filename: string;
  duration?: string;
  category?: string;
} | null {
  const text = messageContent || '';
  const userText = precedingUserPrompt || '';

  const mentionsPdf =
    /(\.pdf|download\s+(the\s+)?.*pdf|created\s+(a\s+)?.*pdf|speech\s+pdf|pdf\s+for|make\s+(a\s+)?pdf|export.*pdf)/i.test(
      text
    ) ||
    /(\bpdf\b|make\s+(a\s+)?pdf|generate\s+(a\s+)?pdf|create\s+(a\s+)?pdf|download.*pdf)/i.test(userText);

  const hasDocumentStructure =
    (text.includes('# ') || text.includes('## ') || text.includes('### ')) &&
    (text.includes('•') || text.includes('- ') || text.includes('|') || text.length > 200);

  if (!mentionsPdf && !hasDocumentStructure && text.length < 150) {
    return null;
  }

  // Extract title
  let title = '';
  const h1Match = text.match(/^#\s+(.+)$/m);
  const h2Match = text.match(/^##\s+(.+)$/m);
  const speechMatch = text.match(/(?:speech\s+(?:on|for)\s+["“]([^"”]+)["”]|["“]([^"”]+)["”]\s+speech)/i);
  const quotesMatch = text.match(/["“]([^"”\n]{5,60})["”]/);
  const userSpeechMatch = userText.match(/(?:difference\s+(?:of|between)\s+([^,]+)|speech\s+(?:for|on)\s+([^,]+)|explain\s+([^,]+))/i);

  if (speechMatch && (speechMatch[1] || speechMatch[2])) {
    title = (speechMatch[1] || speechMatch[2]).trim();
  } else if (h1Match) {
    title = h1Match[1].trim();
  } else if (quotesMatch && quotesMatch[1]) {
    title = quotesMatch[1].trim();
  } else if (h2Match) {
    title = h2Match[1].trim();
  } else if (userSpeechMatch && (userSpeechMatch[1] || userSpeechMatch[2] || userSpeechMatch[3])) {
    title = (userSpeechMatch[1] || userSpeechMatch[2] || userSpeechMatch[3]).trim();
  } else if (userText.length > 5 && userText.length < 60) {
    title = userText.replace(/^(make|create|generate|write|prepare|give me)\s+(a\s+)?(pdf\s+for\s+)?/i, '').trim();
  } else {
    title = 'Document_Report';
  }

  // Duration
  let duration = undefined;
  const durMatch = (text + ' ' + userText).match(/(\d+[- ](?:minute|min|hour))\s*(?:speech|read|presentation|guide)?/i);
  if (durMatch) {
    duration = durMatch[1].replace('-', ' ');
    if (!duration.includes('min') && !duration.includes('hour')) {
      duration += ' min';
    }
  }

  const cleanBaseTitle = title.replace(/[/\\?%*:|"<>]/g, '').trim();
  const cleanFilename = `${cleanBaseTitle.replace(/\s+/g, '_')}${cleanBaseTitle.toLowerCase().endsWith('.pdf') ? '' : '.pdf'}`;

  return {
    isExplicitPdf: mentionsPdf,
    title: cleanBaseTitle,
    filename: cleanFilename,
    duration: duration || (text.length > 800 ? `${Math.max(2, Math.round(text.split(/\s+/).length / 130))} min` : undefined),
    category: duration ? `${duration} Speech & Presentation` : 'Formatted Document',
  };
}
