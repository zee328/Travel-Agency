import { promises as fs } from 'fs';
import path from 'path';

const dataDir = path.resolve(process.cwd(), 'backend', 'data');
const files = {
  newsletter: path.join(dataDir, 'newsletter.json')
};

async function ensureFile(file) {
  try {
    await fs.access(file);
  } catch {
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, JSON.stringify({ items: [] }, null, 2));
  }
}

export async function addNewsletterEmail(email) {
  const file = files.newsletter;
  await ensureFile(file);
  const raw = await fs.readFile(file, 'utf8');
  const data = JSON.parse(raw || '{}');
  const items = Array.isArray(data.items) ? data.items : [];
  const exists = items.some(e => (e || '').toLowerCase() === email.toLowerCase());
  if (exists) return { ok: false, status: 409 };
  items.push(email);
  await fs.writeFile(file, JSON.stringify({ items }, null, 2));
  return { ok: true };
}
