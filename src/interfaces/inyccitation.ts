import { ICitation } from 'howsmydriving-utils';

export interface INYCCitation extends ICitation {
  [index: string]: any;
  Citation: number;
  Type: string;
  Status: string;
  ViolationDate: string;
  ViolationLocation: string;
}
