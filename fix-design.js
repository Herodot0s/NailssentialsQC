const fs = require('fs');
let content = fs.readFileSync('DESIGN.md', 'utf8');
content = content.replace(/PostHog/gi, 'NailssentialsQC');
content = content.replace(/hedgehog/gi, 'lotus');
const frontmatter = `---
name: NailssentialsQC
description: Salon management system
colors:
  primary: "#B8794E"
  canvas: "#eeefe9"
  ink: "#23251d"
  body: "#4d4f46"
typography:
  display-xl:
    fontFamily: "IBM Plex Sans Variable"
    fontSize: "36px"
    fontWeight: 700
rounded:
  md: "6px"
spacing:
  section: "80px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
---

`;
fs.writeFileSync('DESIGN.md', frontmatter + content);
