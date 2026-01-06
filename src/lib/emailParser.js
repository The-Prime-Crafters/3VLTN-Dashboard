/**
 * Email Content Parser
 * Cleans email content by removing quoted replies, signatures, and email headers
 */

/**
 * Extract the actual message from email content
 * Removes quoted text, email headers, and signatures
 */
export function parseEmailContent(content) {
  if (!content) return '';

  let lines = content.split('\n');
  let cleanedLines = [];
  let inQuotedSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Skip empty lines at the start
    if (cleanedLines.length === 0 && !trimmedLine) {
      continue;
    }

    // Detect "wrote:" on its own line (continuation of quoted header)
    if (trimmedLine === 'wrote:' || trimmedLine.startsWith('wrote:')) {
      // Check if previous line(s) look like a quoted header
      if (cleanedLines.length > 0) {
        const prevLine = cleanedLines[cleanedLines.length - 1].trim();
        // If previous line has email or starts with "On ", it's a quoted header
        if (prevLine.includes('<') && prevLine.includes('@') && prevLine.includes('>')) {
          cleanedLines.pop(); // Remove the previous line with email
          // Also check line before that
          if (cleanedLines.length > 0 && cleanedLines[cleanedLines.length - 1].trim().startsWith('On ')) {
            cleanedLines.pop();
          }
          inQuotedSection = true;
          break;
        }
      }
    }

    // Detect start of quoted section (Gmail style - single line)
    // Matches: "On [date] at [time] [name] <email> wrote:"
    if (
      (trimmedLine.startsWith('On ') || trimmedLine.startsWith('on ')) &&
      (trimmedLine.includes('wrote:') || 
       trimmedLine.includes('escribió:') ||
       trimmedLine.includes('schrieb:') ||
       trimmedLine.includes('écrit :'))
    ) {
      inQuotedSection = true;
      break; // Stop here, rest is quoted
    }

    // Check for Gmail-style quote header split across lines
    // Format: "On [date] at [time] [name] <email>\nwrote:"
    if ((trimmedLine.startsWith('On ') || trimmedLine.startsWith('on ')) && 
        trimmedLine.includes('<') && trimmedLine.includes('@') && trimmedLine.includes('>')) {
      // Look ahead to see if next line is "wrote:"
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (nextLine === 'wrote:' || nextLine.startsWith('wrote:')) {
          inQuotedSection = true;
          break; // Don't add this line, it's quoted header
        }
      }
    }

    // Check for email addresses in angle brackets (part of quoted headers)
    if (trimmedLine.includes('<') && trimmedLine.includes('@') && trimmedLine.includes('>')) {
      // Check if next line has "wrote:"
      if (i + 1 < lines.length && lines[i + 1].trim().includes('wrote:')) {
        inQuotedSection = true;
        break;
      }
    }

    // Detect quoted lines (starts with >)
    if (trimmedLine.startsWith('>')) {
      inQuotedSection = true;
      continue;
    }

    // Detect email signature separators
    if (trimmedLine === '--' || trimmedLine === '---') {
      break; // Stop at signature
    }

    // Detect common signature patterns
    if (
      trimmedLine.startsWith('Best regards') ||
      trimmedLine.startsWith('Regards') ||
      trimmedLine.startsWith('Thanks') ||
      trimmedLine.startsWith('Thank you') ||
      trimmedLine.startsWith('Sincerely') ||
      trimmedLine.startsWith('Sent from')
    ) {
      // Check if this might be end of actual content
      const remainingContent = lines.slice(i).join('').trim();
      if (remainingContent.length < 100) {
        break; // Likely a signature
      }
    }

    // Skip lines that look like ticket IDs or system messages
    if (
      trimmedLine.startsWith('Ticket ID:') ||
      trimmedLine.startsWith('Ticket #') ||
      trimmedLine.match(/^TICK-\d{8}-[A-Z0-9]+$/)
    ) {
      continue;
    }

    // If not in quoted section, add the line
    if (!inQuotedSection) {
      cleanedLines.push(line);
    }
  }

  // Join and clean up the result
  let result = cleanedLines.join('\n').trim();

  // Remove excessive blank lines (more than 2 consecutive)
  result = result.replace(/\n{3,}/g, '\n\n');

  return result;
}

/**
 * Get a preview/summary of the message (first N characters)
 */
export function getMessagePreview(content, maxLength = 100) {
  const cleaned = parseEmailContent(content);
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  return cleaned.substring(0, maxLength) + '...';
}

/**
 * Remove email headers from content
 */
export function removeEmailHeaders(content) {
  if (!content) return '';

  const lines = content.split('\n');
  const cleanedLines = [];
  let skipHeaders = false;

  for (const line of lines) {
    // Common email headers
    if (
      line.startsWith('From:') ||
      line.startsWith('To:') ||
      line.startsWith('Subject:') ||
      line.startsWith('Date:') ||
      line.startsWith('Cc:') ||
      line.startsWith('Bcc:')
    ) {
      skipHeaders = true;
      continue;
    }

    // If we were skipping headers and hit a blank line, stop skipping
    if (skipHeaders && line.trim() === '') {
      skipHeaders = false;
      continue;
    }

    if (!skipHeaders) {
      cleanedLines.push(line);
    }
  }

  return cleanedLines.join('\n').trim();
}

/**
 * Check if content looks like it has quoted text
 */
export function hasQuotedText(content) {
  if (!content) return false;
  
  return (
    content.includes('wrote:') ||
    content.includes('>') ||
    content.includes('On ') && content.includes('at ') && content.includes('wrote')
  );
}

