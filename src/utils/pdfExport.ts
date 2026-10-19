import { jsPDF } from 'jspdf';
import { ChatSession, BotPersona, UserAccount, ChatMessage } from '../types';

/**
 * Strips raw markdown syntax for clean plain-text PDF rendering when needed,
 * while preserving paragraph breaks and bullet structures.
 */
function cleanMarkdownForPdf(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/^#{1,6}\s+/gm, '') // Remove header hashes
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold asterisks
    .replace(/\*(.*?)\*/g, '$1') // Remove italic asterisks
    .replace(/__(.*?)__/g, '$1') // Remove bold underscores
    .replace(/_(.*?)_/g, '$1') // Remove italic underscores
    .replace(/~~(.*?)~~/g, '$1') // Remove strikethrough
    .replace(/`([^`]+)`/g, '$1') // Inline code
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)'); // Convert markdown links to "Text (URL)"
}

interface ExportPdfOptions {
  session: ChatSession;
  persona?: BotPersona;
  currentUser?: UserAccount | null;
}

export function exportConversationToPdf({ session, persona, currentUser }: ExportPdfOptions): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 16;
  const marginTop = 20;
  const marginBottom = 20;
  const usableWidth = pageWidth - marginX * 2;
  const bottomThreshold = pageHeight - marginBottom;

  let cursorY = marginTop;
  let currentPage = 1;

  // Helper to check page break
  const checkPageBreak = (neededHeight: number) => {
    if (cursorY + neededHeight > bottomThreshold) {
      doc.addPage();
      currentPage++;
      cursorY = marginTop;
      drawRunningHeader();
    }
  };

  // Header for page 2+
  const drawRunningHeader = () => {
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, pageWidth, 12, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(0, 12, pageWidth, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Ro AI Companion • ${session.title ? session.title.slice(0, 60) : 'Conversation Export'}`,
      marginX,
      8
    );
  };

  // ----------------------------------------------------
  // COVER / DOCUMENT HEADER ON PAGE 1
  // ----------------------------------------------------
  
  // Decorative top accent gradient bar
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.rect(0, 0, pageWidth, 5, 'F');

  // Brand Badge
  doc.setFillColor(238, 242, 255); // Indigo 50
  doc.roundedRect(marginX, cursorY, 46, 6.5, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(79, 70, 229);
  doc.text('RO AI COMPANION', marginX + 3.5, cursorY + 4.5);

  // Document Type / Date right-aligned
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  const formattedDate = new Date(session.updatedAt || Date.now()).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(formattedDate, pageWidth - marginX, cursorY + 4.5, { align: 'right' });

  cursorY += 12;

  // Session Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // Slate 900
  const titleLines = doc.splitTextToSize(session.title || 'Conversation History', usableWidth);
  doc.text(titleLines, marginX, cursorY);
  cursorY += titleLines.length * 7 + 3;

  // Metadata Card Box
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.roundedRect(marginX, cursorY, usableWidth, 16, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text('Model:', marginX + 4, cursorY + 6);
  doc.text('Persona:', marginX + 4, cursorY + 11.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(79, 70, 229);
  doc.text(session.model || 'gemini-3.7-flash', marginX + 22, cursorY + 6);

  doc.setTextColor(15, 23, 42);
  const personaName = persona?.name || 'Ro (Human Companion)';
  doc.text(personaName, marginX + 22, cursorY + 11.5);

  // Right column of metadata
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('Messages:', marginX + usableWidth - 55, cursorY + 6);
  doc.text('Account:', marginX + usableWidth - 55, cursorY + 11.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${session.messages.length} exchanges`, marginX + usableWidth - 36, cursorY + 6);
  const emailText = currentUser?.email ? currentUser.email : 'Local Session';
  doc.text(emailText.length > 22 ? emailText.slice(0, 20) + '...' : emailText, marginX + usableWidth - 36, cursorY + 11.5);

  cursorY += 23;

  // Divider Line
  doc.setDrawColor(226, 232, 240);
  doc.line(marginX, cursorY, marginX + usableWidth, cursorY);
  cursorY += 8;

  // ----------------------------------------------------
  // MESSAGES STREAM
  // ----------------------------------------------------
  if (session.messages.length === 0) {
    checkPageBreak(20);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text('(No messages recorded in this conversation)', marginX, cursorY);
    cursorY += 15;
  } else {
    session.messages.forEach((msg: ChatMessage, index: number) => {
      const isUser = msg.role === 'user';
      const senderName = isUser ? (currentUser?.name || 'User') : (persona?.name || 'Ro AI Assistant');
      const timeString = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Clean message body
      const rawContent = msg.content || '(Empty message)';
      const cleanedContent = cleanMarkdownForPdf(rawContent);

      // Calculate heights
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      const textLines = doc.splitTextToSize(cleanedContent, usableWidth - 10);
      const textBlockHeight = textLines.length * 4.8;
      const headerHeight = 8;
      const paddingHeight = 8;
      const attachmentNoteHeight = msg.attachments && msg.attachments.length > 0 ? (msg.attachments.length * 4.5 + 4) : 0;
      const totalBubbleHeight = headerHeight + textBlockHeight + paddingHeight + attachmentNoteHeight;

      // Check if we need a page break before starting this message
      checkPageBreak(Math.min(totalBubbleHeight + 8, 45));

      // Draw Message Container Box
      if (isUser) {
        // User Message Styling: Slate 100 card with Indigo accent bar
        doc.setFillColor(241, 245, 249); // Slate 100
        doc.setDrawColor(203, 213, 225); // Slate 300
        doc.roundedRect(marginX, cursorY, usableWidth, totalBubbleHeight, 2, 2, 'FD');

        // Left accent bar
        doc.setFillColor(99, 102, 241); // Indigo 500
        doc.rect(marginX, cursorY, 2.5, totalBubbleHeight, 'F');
      } else {
        // AI Message Styling: Crisp White with subtle Border and Emerald / Purple accent
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(marginX, cursorY, usableWidth, totalBubbleHeight, 2, 2, 'FD');

        // Left accent bar
        doc.setFillColor(16, 185, 129); // Emerald 500
        doc.rect(marginX, cursorY, 2.5, totalBubbleHeight, 'F');
      }

      // Sender Header inside Bubble
      const innerY = cursorY + 5.5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(isUser ? 30 : 15, isUser ? 41 : 23, isUser ? 59 : 42);
      doc.text(senderName, marginX + 6, innerY);

      // Timestamp & Role Badge
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(timeString, marginX + usableWidth - 5, innerY, { align: 'right' });

      // Attachment Notes if present
      let contentOffsetY = innerY + 5;
      if (msg.attachments && msg.attachments.length > 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(79, 70, 229);
        msg.attachments.forEach((att) => {
          const typeLabel = att.isImage ? 'Attached Image' : 'Attached Document';
          doc.text(`[${typeLabel}: ${att.name || 'File'}]`, marginX + 6, contentOffsetY);
          contentOffsetY += 4.5;
        });
      }

      // Message Body Text
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59); // Slate 800
      doc.text(textLines, marginX + 6, contentOffsetY);

      cursorY += totalBubbleHeight + 4.5;
    });
  }

  // ----------------------------------------------------
  // FOOTER ON ALL PAGES
  // ----------------------------------------------------
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(marginX, pageHeight - 12, marginX + usableWidth, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Exported from Ro AI Companion • Generated with Gemini AI',
      marginX,
      pageHeight - 7
    );

    doc.setFont('helvetica', 'bold');
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageHeight > 0 ? marginX + usableWidth : 190,
      pageHeight - 7,
      { align: 'right' }
    );
  }

  // Safe sanitized file name
  const sanitizedTitle = (session.title || 'conversation')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 40)
    .toLowerCase();
  const dateStamp = new Date().toISOString().slice(0, 10);
  const fileName = `Ro-Conversation-${sanitizedTitle}-${dateStamp}.pdf`;

  // Trigger download
  doc.save(fileName);
}
