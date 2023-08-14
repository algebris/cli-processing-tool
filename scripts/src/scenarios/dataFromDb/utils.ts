import fs from 'node:fs';
import Ejs, { Data } from 'ejs';

const templatesCache: { [key: string]: string } = {};

export const renderTemplate = (templateFilePath: string, data: Data) => {
  if (!templatesCache[templateFilePath]) {
    if (!fs.existsSync(templateFilePath)) {
      throw new Error(`Template not found: ${templateFilePath}`);
    }
    templatesCache[templateFilePath] = fs.readFileSync(templateFilePath, 'utf8');
  }
  return Ejs.render(templatesCache[templateFilePath], data, { async: true })
    .then((str) => str.replace(/[\r\n]/gm, ''))
    .then((str) => str.replace(/\s\s+/g, ' '))
    .then((str) => str.replace(/\s+\./g, '.'))
    .then((str) => str.trim());
};

export const plural = (singular: string, plural: string, num: number) => (num === 1 ? singular : plural);

export const formatPrice = (price: number, currency: string): string | null =>
  price && currency
    ? price.toLocaleString('en-US', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
      })
    : null;
