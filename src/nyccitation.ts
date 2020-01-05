import { ICitation } from 'howsmydriving-utils';
import { Citation } from 'howsmydriving-utils';
import { INYCCitation } from './interfaces/inyccitation';

import { log } from './logging';

export class NYCCitation extends Citation implements INYCCitation {
  [index: string]: any;
  constructor();
  constructor(citation: INYCCitation);
  constructor(citation?: INYCCitation) {
    super(citation);

    Object.assign(this, citation);
  }

  Citation: number;
  Type: string;
  Status: string;
  ViolationDate: string;
  ViolationLocation: string;
}
