import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

describe('Manual Compilation Test', () => {
  it('should successfully build CLIENT_MANUAL.html from CLIENT_MANUAL.md', () => {
    const projectRoot = path.resolve(__dirname, '../../..');
    const htmlPath = path.join(projectRoot, 'docs/CLIENT_MANUAL.html');
    
    // Delete existing HTML if present to verify regeneration
    if (fs.existsSync(htmlPath)) {
      fs.unlinkSync(htmlPath);
    }
    
    // Run compiler relative to project root
    execSync('npx ts-node backend/generate-manual.ts', { cwd: projectRoot });
    
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
