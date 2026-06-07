import fs from 'fs';
import path from 'path';

function parseMarkdown(md: string): string {
  let html = md;
  
  // Escaping HTML characters first (to prevent code injection)
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Restore linebreaks for parsing
  html = html.replace(/\r\n/g, '\n');

  // Handle headers
  html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
  html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');

  // Handle bold and emphasis
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Handle inline code chips
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // Handle unordered list items
  // Match lines starting with optional whitespace, followed by * or -, and a space
  html = html.replace(/^\s*[\-\*]\s+(.*?)$/gm, '<li>$1</li>');

  // Handle ordered list items
  html = html.replace(/^\s*\d+\.\s+(.*?)$/gm, '<li>$1</li>');

  // Group adjacent <li> tags into <ul> tags
  // Replace list items that are adjacent with a single ul wrapper
  html = html.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>');
  html = html.replace(/<\/ul>\s*<ul>/g, '');

  // Handle paragraphs (lines that are not empty and don't start with headers, lists, code block HTML tags)
  const lines = html.split('\n');
  const processedLines = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    // Skip wrapping if it is already an HTML tag structure we generated
    if (
      trimmed.startsWith('<h') ||
      trimmed.startsWith('<ul') ||
      trimmed.startsWith('</ul') ||
      trimmed.startsWith('<li') ||
      trimmed.startsWith('<pre') ||
      trimmed.startsWith('</pre') ||
      trimmed.startsWith('<code') ||
      trimmed.startsWith('</code') ||
      trimmed.startsWith('---')
    ) {
      if (trimmed === '---') {
        return '<hr />';
      }
      return line;
    }
    return `<p>${line}</p>`;
  });
  html = processedLines.join('\n');

  return html;
}

function generateHtml() {
  const mdPath = path.join(__dirname, '../docs/CLIENT_MANUAL.md');
  const htmlOutputPath = path.join(__dirname, '../docs/CLIENT_MANUAL.html');
  
  if (!fs.existsSync(mdPath)) {
    console.error('Markdown manual file not found!');
    process.exit(1);
  }
  
  const mdContent = fs.readFileSync(mdPath, 'utf-8');
  const parsedBody = parseMarkdown(mdContent);

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NailssentialsQC - Operations Manual & Technical Handover</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700;800&family=Source+Code+Pro&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #B8794E;
      --canvas: #eeefe9;
      --ink: #23251d;
      --body: #4d4f46;
      --surface-card: #ffffff;
      --hairline: #bfc1b7;
      --accent-blue-soft: #dceaf6;
      --accent-red-soft: #f7d6d3;
    }
    body {
      background-color: var(--canvas);
      color: var(--body);
      font-family: 'IBM Plex Sans', sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 60px 20px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    .card {
      background-color: var(--surface-card);
      border: 1px solid var(--hairline);
      border-radius: 6px;
      padding: 48px;
      margin-bottom: 24px;
      box-shadow: none;
    }
    h1, h2, h3 {
      color: var(--ink);
      font-weight: 700;
      margin-top: 0;
    }
    h1 {
      font-size: 32px;
      font-weight: 800;
      border-bottom: 2px solid var(--primary);
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    h2 {
      font-size: 22px;
      border-bottom: 1px solid var(--hairline);
      padding-bottom: 8px;
      margin-top: 40px;
      margin-bottom: 16px;
    }
    h3 {
      font-size: 17px;
      margin-top: 24px;
      margin-bottom: 12px;
    }
    p {
      font-size: 15px;
      margin: 14px 0;
      color: var(--body);
    }
    strong {
      color: var(--ink);
      font-weight: 600;
    }
    ul, ol {
      padding-left: 24px;
      margin: 12px 0;
    }
    li {
      margin: 8px 0;
      font-size: 15px;
    }
    .inline-code {
      background-color: #e5e7e0;
      color: var(--ink);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Source Code Pro', monospace;
      font-size: 13.5px;
    }
    hr {
      border: none;
      border-top: 1px solid var(--hairline);
      margin: 32px 0;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      font-size: 12px;
      color: var(--body);
    }
    
    @media print {
      body {
        background-color: #ffffff;
        color: #000000;
        padding: 0;
      }
      .card {
        border: none;
        padding: 0;
        margin: 0;
      }
      h2 {
        page-break-before: always;
      }
      .inline-code {
        background-color: #f0f0f0;
        border: 1px solid #ddd;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      ${parsedBody}
    </div>
    <div class="footer">
      NailssentialsQC Operating Manual &copy; 2026. Generated on ${new Date().toLocaleDateString()}.
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync(htmlOutputPath, fullHtml, 'utf-8');
  console.log('HTML Manual compiled successfully to docs/CLIENT_MANUAL.html');
}

generateHtml();
