import path from 'node:path';
import { ParsersType } from './types';
import { parser1 } from './parsers';
import { range } from './utils';

export const FILES_FOLDER = path.join(__dirname, '/../../files');
export const SHOULD_DUMP_RAW_PDF = process.env.SHOULD_DUMP_RAW_PDF === 'true';
export const SHOULD_DUMP_PROCESSED_PDF = process.env.SHOULD_DUMP_PROCESSED_PDF === 'true';

const defaultFonts = {
  h1: 'f3',
  h2: 'f2',
  p1: 'f4',
  p2: 'f5',
};

export const Parsers: ParsersType = {
  '4529_Yacht_Brokerage_16_17_Module_1_.pdf': {
    skipPages: [...range(1, 4), ...range(36, 44)],
    fonts: defaultFonts,
    parse: parser1,
    exclude: [
      {
        where: 'header',
        rule: /On completion of this Module you should:/,
      },
    ],
  },
  '4529_Yacht_Brokerage_16_17_Module_2_.pdf': {
    skipPages: [...range(1, 6), ...range(73, 86)],
    fonts: defaultFonts,
    parse: parser1,
  },
  '4529_Yacht_Brokerage_16_17_Module_3_.pdf': {
    skipPages: [...range(1, 5), ...range(36, 50)],
    fonts: defaultFonts,
    parse: parser1,
  },
  '4529_Yacht_Brokerage_16_17_Module_4_.pdf': {
    skipPages: [...range(1, 6), ...range(41, 65)],
    fonts: defaultFonts,
    parse: parser1,
  },
  '4529_Yacht_Brokerage_16_17_Module_5_.pdf': {
    skipPages: [...range(1, 5), ...range(42, 50)],
    fonts: defaultFonts,
    parse: parser1,
  },
  '4529_Yacht_Brokerage_16_17_Module_6_.pdf': {
    skipPages: [...range(1, 5), ...range(27, 33)],
    fonts: defaultFonts,
    parse: parser1,
  },
  '4529_Yacht_Brokerage_16_17_Module_7_.pdf': {
    skipPages: [...range(1, 4), ...range(16, 29)],
    fonts: defaultFonts,
    parse: parser1,
  },
  '4529_Yacht_Brokerage_16_17_Module_8_.pdf': {
    skipPages: [...range(1, 5), ...range(25, 60)],
    fonts: defaultFonts,
    parse: parser1,
  },
  '4529_Yacht_Brokerage_16_17_Module_9_.pdf': {
    skipPages: [...range(1, 5), ...range(43, 46)],
    fonts: defaultFonts,
    parse: parser1,
  },
  '4529_Yacht_Brokerage_16_17_Module_10_.pdf': {
    skipPages: [...range(1, 5), ...range(39, 43)],
    fonts: defaultFonts,
    parse: parser1,
  },
  '4529_Yacht_Brokerage_16_17_Module_11_.pdf': {
    skipPages: [...range(1, 5), ...range(59, 68)],
    fonts: defaultFonts,
    parse: parser1,
  },
  '4529_Yacht_Brokerage_16_17_Module_12_.pdf': {
    skipPages: [...range(1, 4), ...range(41, 42)],
    fonts: defaultFonts,
    parse: parser1,
  },
  '4530_Yacht_and_Small_Craft_Surveying_Modules_16_17_Module_1_.pdf': {
    skipPages: [...range(1, 5), ...range(69, 98)],
    fonts: defaultFonts,
    parse: parser1,
  },
  '4530_Yacht_and_Small_Craft_Surveying_Modules_16_17_Module_2_.pdf': {
    skipPages: [...range(1, 5), ...range(46, 66)],
    fonts: defaultFonts,
    parse: parser1,
  },
  '4530_Yacht_and_Small_Craft_Surveying_Modules_16_17_Module_3_.pdf': {
    skipPages: [...range(1, 6), ...range(73, 80)],
    fonts: defaultFonts,
    parse: parser1,
  },
  '4530_Yacht_and_Small_Craft_Surveying_Modules_16_17_Module_4_.pdf': {
    skipPages: [...range(1, 6), ...range(44, 46)],
    fonts: defaultFonts,
    parse: parser1,
  },
  '4530_Yacht_and_Small_Craft_Surveying_Modules_16_17_Module_5_.pdf': {
    skipPages: [...range(1, 5), ...range(45, 49)],
    fonts: defaultFonts,
    parse: parser1,
  },
  '4530_Yacht_and_Small_Craft_Surveying_Modules_16_17_Module_6_.pdf': {
    skipPages: [...range(1, 6), ...range(67, 70)],
    fonts: defaultFonts,
    parse: parser1,
  },
  '4530_Yacht_and_Small_Craft_Surveying_Modules_16_17_Module_7_.pdf': {
    skipPages: [...range(1, 6), ...range(71, 75)],
    fonts: defaultFonts,
    parse: parser1,
  },
  '4530_Yacht_and_Small_Craft_Surveying_Modules_16_17_Module_8_.pdf': {
    skipPages: [...range(1, 4), ...range(51, 52)],
    fonts: defaultFonts,
    parse: parser1,
  },
  '4530_Yacht_and_Small_Craft_Surveying_Modules_16_17_Module_9_.pdf': {
    skipPages: [...range(1, 5), ...range(67, 71)],
    fonts: defaultFonts,
    parse: parser1,
  },
  '4530_Yacht_and_Small_Craft_Surveying_Modules_16_17_Module_10_.pdf': {
    skipPages: [...range(1, 5), ...range(48, 52)],
    fonts: defaultFonts,
    parse: parser1,
  },
  '4530_Yacht_and_Small_Craft_Surveying_Modules_16_17_Module_11_.pdf': {
    skipPages: [...range(1, 5), ...range(25, 60)],
    fonts: defaultFonts,
    parse: parser1,
  },
  '4530_Yacht_and_Small_Craft_Surveying_Modules_16_17_Module_12_.pdf': {
    skipPages: [...range(1, 4), ...range(16, 31)],
    fonts: defaultFonts,
    parse: parser1,
  },
};
