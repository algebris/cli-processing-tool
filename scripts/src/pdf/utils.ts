import fs from 'node:fs';
import { PDFBlock } from './types';

export const emptyBlock = (): PDFBlock => {
  return { page: 0, header: '', font: '', content: '' };
};

export const saveFile = (filepath: string, content: string): void => {
  fs.writeFileSync(filepath, content, { encoding: 'utf-8' });
};

export const dumpFile = async (
  dumpFile: string,
  callback: (outputStream: fs.WriteStream) => Promise<void>
): Promise<void> => {
  // Delete if file exists and create new one for writing
  if (fs.existsSync(dumpFile)) {
    fs.unlinkSync(dumpFile);
  }
  const outputStream = fs.createWriteStream(dumpFile, { flags: 'a' });

  await callback(outputStream);
  outputStream.end();
};

export const range = (start: number, stop: number, step = 1): number[] =>
  Array.from({ length: Math.floor((++stop - start) / step) }, (_, index) => start + index * step);

type FontType = 'header' | 'paragraph' | undefined;

export const whatIsFont = (fontName: string, fonts: { [key: string]: string }): FontType => {
  const headers = Object.keys(fonts).filter((el) => /^h\d+$/.test(el));
  const paragraphs = Object.keys(fonts).filter((el) => /^p\d+$/.test(el));
  return headers.some((el) => fontName.endsWith(fonts[el]))
    ? 'header'
    : paragraphs.some((el) => fontName.endsWith(fonts[el]))
    ? 'paragraph'
    : undefined;
};
