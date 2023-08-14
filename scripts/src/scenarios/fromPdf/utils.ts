import fs from 'node:fs';
import path from 'node:path';

export const pdfFiles = () => {
  const srcDir = path.join(__dirname, '../../../files');
  const files = fs.readdirSync(srcDir);
  const pdfFiles = files.filter((file) => file.endsWith('.pdf'));
  return pdfFiles;
};
