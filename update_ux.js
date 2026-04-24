const fs = require('fs');

// 1. Update App.css
let css = fs.readFileSync('frontend/src/App.css', 'utf8');

css = css.replace(
  `  /* Effects */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-card: 0 4px 24px rgba(0,0,0,0.08);
  --radius: 8px;
}`,
  `  /* Effects */
  --shadow-sm: 0 2px 8px rgba(184, 121, 78, 0.04);
  --shadow-md: 0 8px 24px rgba(184, 121, 78, 0.08);
  --shadow-lg: 0 16px 32px rgba(184, 121, 78, 0.12);
  --shadow-card: 0 12px 36px rgba(184, 121, 78, 0.08);
  --radius: 16px;
}

/* Global Accessibility */
*:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}`
);

css = css.replace(
  `.tab {
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 50px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.tab:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}`,
  `.tab {
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 50px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s, background-color 0.2s, box-shadow 0.2s;
}

.tab:hover {
  border-color: var(--primary-light);
  color: var(--primary-dark);
  background-color: var(--primary-ultra);
}`
);

css = css.replace(
  `.service-card {
  background: white;
  border-radius: var(--radius);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-light);
}`,
  `.service-card {
  background: white;
  border-radius: var(--radius);
  padding: 2rem;
  box-shadow: var(--shadow-sm);
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid transparent;
}

.service-card:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-light);
}`
);

css = css.replace(
  `.btn-select {
  margin-top: 1.5rem;
  width: 100%;
  padding: 0.75rem;
  background: transparent;
  border: 2px solid var(--primary-color);
  color: var(--primary-color);
  font-weight: 700;
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-select:hover {
  background: var(--primary-color);
  color: white;
}`,
  `.btn-select {
  margin-top: 1.5rem;
  width: 100%;
  padding: 0.875rem;
  background: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease, transform 0.2s ease;
}

.btn-select:hover {
  background: var(--primary-color);
  color: white;
  transform: scale(1.02);
}

.btn-select:active {
  transform: scale(0.98);
}`
);

css = css.replace(
  `.service-icon {
  width: 56px;
  height: 56px;
  background: var(--primary-ultra);
  color: var(--primary-color);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
}`,
  `.service-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--primary-ultra) 0%, #ffffff 100%);
  color: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  font-family: var(--font-heading);
  font-style: italic;
  margin-bottom: 1.5rem;
  box-shadow: inset 0 2px 4px rgba(184, 121, 78, 0.1);
  border: 1px solid var(--primary-light);
}`
);

css = css.replace(
  `.duration {
  font-size: 0.875rem;
  color: var(--text-muted);
}`,
  `.duration {
  font-size: 0.875rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
}`
);

fs.writeFileSync('frontend/src/App.css', css);

// 2. Update Services.tsx
let services = fs.readFileSync('frontend/src/pages/Services.tsx', 'utf8');
services = services.replace(
  '<span className="duration">🕒 {svc.duration_minutes} min</span>',
  '<span className="duration"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: \'4px\', verticalAlign: \'text-bottom\'}}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> {svc.duration_minutes} min</span>'
);

services = services.replace(
  `<button 
              className="btn-select"
              onClick={() => navigate(\`/booking?serviceId=\${svc.id}\`)}
            >`,
  `<button 
              type="button"
              className="btn-select"
              onClick={() => navigate(\`/booking?serviceId=\${svc.id}\`)}
            >`
);

services = services.replace(
  `<button 
          className={\`tab \${activeCategoryId === null ? 'active' : ''}\`}
          onClick={() => setActiveCategoryId(null)}
        >`,
  `<button 
          type="button"
          className={\`tab \${activeCategoryId === null ? 'active' : ''}\`}
          onClick={() => setActiveCategoryId(null)}
        >`
);

services = services.replace(
  `<button 
            key={cat.id}
            className={\`tab \${activeCategoryId === cat.id ? 'active' : ''}\`}
            onClick={() => setActiveCategoryId(cat.id)}
          >`,
  `<button 
            type="button"
            key={cat.id}
            className={\`tab \${activeCategoryId === cat.id ? 'active' : ''}\`}
            onClick={() => setActiveCategoryId(cat.id)}
          >`
);

fs.writeFileSync('frontend/src/pages/Services.tsx', services);

// 3. Update Navbar.tsx
let navbar = fs.readFileSync('frontend/src/components/Navbar.tsx', 'utf8');
navbar = navbar.replace(
  '<button onClick={handleLogout} className="btn-logout">Logout</button>',
  '<button type="button" onClick={handleLogout} className="btn-logout">Logout</button>'
);
fs.writeFileSync('frontend/src/components/Navbar.tsx', navbar);

// 4. Update 02-Sprint-Status.md
const statusPath = '_bmad-output/implementation-artifacts/02-Sprint-Status.md';
let statusContent = fs.readFileSync(statusPath, 'utf8');

const updateNotes = `\n
## 5. UI/UX Design Review & Fixes
- **Audit Tool:** bmad-ux-designer applied UI-UX Pro Max & Web Interface Guidelines.
- **Refinements:**
  - **Aesthetics:** Softened card radiuses from 8px to 16px to better fit a relaxing Spa essence. Transformed button styles to pill shapes (50px radius). Introduced lighter elegant drop-shadows with Terracotta hues instead of harsh greys. Redesigned Service Letter-icons into sophisticated circular gradient crests with italicized Serif typography.
  - **Interactions:** Removed aggressive \`translateY(-5px)\` card hovers and \`transition: all\` performance bottlenecks. Adopted subtle 1.02x scaling.
  - **Accessibility:** 
    - Added explicit \`:focus-visible\` global outline for keyboard navigation.
    - Updated all React interactive \`<button>\` elements to explicitly include \`type="button"\` (Navbar.tsx, Services.tsx).
    - Removed structural Emojis (🕒) and replaced them with crisp scalable SVG icons.`;

if (!statusContent.includes('## 5. UI/UX Design Review & Fixes')) {
  fs.writeFileSync(statusPath, statusContent + updateNotes);
}
