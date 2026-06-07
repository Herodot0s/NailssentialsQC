# Client Manual & Handover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a comprehensive, beautiful business operations manual (`docs/CLIENT_MANUAL.md` and `docs/CLIENT_MANUAL.html`) for the client, detailing how to manage managers, staff, customers, catalog, and payroll, plus technical SLA details for Neon and Vercel free tiers, along with a support/warranty statement.

**Architecture:** 
1. Create the markdown source (`docs/CLIENT_MANUAL.md`).
2. Write a Node script (`backend/generate-manual.ts`) to parse the markdown and compile it into a fully-styled, print-friendly HTML document (`docs/CLIENT_MANUAL.html`).
3. Set up a script validation test to ensure the compiler runs successfully and generates the correct output.

**Tech Stack:** TypeScript/Node.js, Markdown, CSS.

---

### Task 1: Create the Markdown Operations Manual
**Files:**
- Create: `docs/CLIENT_MANUAL.md`

- [ ] **Step 1: Write the operations manual in Markdown**
  Create `docs/CLIENT_MANUAL.md` with complete instructions for Managers, Staff, and Customers, including Vercel and Neon SLA estimations (100 GB Vercel bandwidth = ~200,000 page views, Neon 500 MB DB storage = millions of rows, 190 compute hours = auto-suspends in 5 minutes with 3-5s cold starts), and the 3-month support warranty clause.
  
- [ ] **Step 2: Commit manual draft**
  ```bash
  git add docs/CLIENT_MANUAL.md
  git commit -m "docs: add draft client manual markdown source"
  ```

---

### Task 2: Create the HTML Generator Script
**Files:**
- Create: `backend/generate-manual.ts`

- [ ] **Step 1: Implement the generator script**
  Create `backend/generate-manual.ts`. The script will read `docs/CLIENT_MANUAL.md`, parse markdown blocks (headers, code blocks, lists, bold text, links, paragraphs), wrap them in a premium HTML template styled with IBM Plex Sans, cream canvas background (`#eeefe9`), white cards (`#ffffff`), custom borders, yellow CTAs, and print page-breaks, and save the result to `docs/CLIENT_MANUAL.html`.
  
  ```typescript
  import fs from 'fs';
  import path from 'path';

  function parseMarkdown(md: string): string {
    let html = md;
    
    // Escaping HTML characters first
    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Handle code blocks
    html = html.replace(/```(\w*)\n([\s\S]*?)\n```/g, (_, lang, code) => {
      return `<pre class="code-block"><code class="language-${lang}">${code}</code></pre>`;
    });

    // Handle headers
    html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
    html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
    html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');

    // Handle bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Handle lists
    // Ordered list item
    html = html.replace(/^\s*\d+\.\s+(.*?)$/gm, '<li>$1</li>');
    // Unordered list item
    html = html.replace(/^\s*[\-\*]\s+(.*?)$/gm, '<li>$1</li>');

    // Group adjacent <li> tags into <ul>
    html = html.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\s*<ul>/g, '');

    // Handle paragraphs (lines that are not empty and don't start with headers, lists, code block HTML tags)
    const lines = html.split('\n');
    const processedLines = lines.map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('</ul') || trimmed.startsWith('<li') || trimmed.startsWith('<pre') || trimmed.startsWith('</pre') || trimmed.startsWith('<code') || trimmed.startsWith('</code')) {
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
      padding: 40px 20px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    .card {
      background-color: var(--surface-card);
      border: 1px solid var(--hairline);
      border-radius: 6px;
      padding: 32px;
      margin-bottom: 24px;
      box-shadow: none;
    }
    h1, h2, h3 {
      color: var(--ink);
      font-weight: 700;
    }
    h1 {
      font-size: 32px;
      border-bottom: 2px solid var(--primary);
      padding-bottom: 12px;
      margin-top: 0;
    }
    h2 {
      font-size: 24px;
      border-bottom: 1px solid var(--hairline);
      padding-bottom: 8px;
      margin-top: 32px;
      page-break-before: always;
    }
    h3 {
      font-size: 18px;
      margin-top: 24px;
    }
    p {
      font-size: 15px;
      margin: 12px 0;
    }
    strong {
      color: var(--ink);
      font-weight: 600;
    }
    ul, ol {
      padding-left: 20px;
    }
    li {
      margin: 6px 0;
      font-size: 15px;
    }
    .code-block {
      background-color: var(--ink);
      color: #ffffff;
      padding: 16px;
      border-radius: 6px;
      overflow-x: auto;
      font-family: 'Source Code Pro', monospace;
      font-size: 14px;
    }
    .callout {
      border-radius: 6px;
      padding: 16px;
      margin: 20px 0;
    }
    .callout-info {
      background-color: var(--accent-blue-soft);
      border-left: 4px solid #2c84e0;
    }
    .callout-warning {
      background-color: var(--accent-red-soft);
      border-left: 4px solid #cd4239;
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
      .code-block {
        background-color: #f5f5f5;
        color: #000000;
        border: 1px solid #ccc;
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
  ```

- [ ] **Step 2: Commit compiler script**
  ```bash
  git add backend/generate-manual.ts
  git commit -m "feat: add manual HTML compiler script"
  ```

---

### Task 3: Test and Compile Manual
**Files:**
- Create: `backend/src/tests/manual.test.ts` (Mock test verification)
- Modify: `docs/CLIENT_MANUAL.html` (Generated Output)

- [ ] **Step 1: Write compile validation test**
  Create a test script to check that compiling works without errors.
  Create `backend/src/tests/manual.test.ts`:
  
  ```typescript
  import fs from 'fs';
  import path from 'path';
  import { execSync } from 'child_process';

  describe('Manual Compilation Test', () => {
    it('should successfully build CLIENT_MANUAL.html from CLIENT_MANUAL.md', () => {
      const htmlPath = path.join(__dirname, '../../../docs/CLIENT_MANUAL.html');
      
      // Delete existing HTML if present to verify regeneration
      if (fs.existsSync(htmlPath)) {
        fs.unlinkSync(htmlPath);
      }
      
      // Run compiler
      execSync('npx ts-node backend/generate-manual.ts');
      
      // Assert HTML was created
      expect(fs.existsSync(htmlPath)).toBe(true);
      
      // Assert it contains key content
      const html = fs.readFileSync(htmlPath, 'utf-8');
      expect(html).toContain('NailssentialsQC');
      expect(html).toContain('Vercel');
      expect(html).toContain('Neon');
      expect(html).toContain('3-month');
    });
  });
  ```

- [ ] **Step 2: Run compile validation test and verify success**
  Run: `npx jest backend/src/tests/manual.test.ts` (or run it via typescript execution)
  Expected: PASS

- [ ] **Step 3: Run compilation command to generate production files**
  Run: `npx ts-node backend/generate-manual.ts`
  Expected Output: "HTML Manual compiled successfully to docs/CLIENT_MANUAL.html"

- [ ] **Step 4: Commit compiled files**
  ```bash
  git add docs/CLIENT_MANUAL.html
  git commit -m "docs: compile and build client manual HTML"
  ```
