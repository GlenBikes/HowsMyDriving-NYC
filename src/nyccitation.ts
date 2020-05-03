import { ICitation } from 'howsmydriving-utils';
import { Citation } from 'howsmydriving-utils';
import { INYCCitationInfo, INYCFineData } from './interfaces/inyccitation';

import { log } from './logging';

export class NYCCitationInfo extends Citation implements INYCCitationInfo {
  [index: string]: any;
  constructor();
  constructor(citation: INYCCitationInfo);
  constructor(citation?: INYCCitationInfo) {
    super(citation);

    Object.assign(this, citation);
  }

  previous_violation_count: any;
  state: string;
  previous_lookup_date: any;
  plate_types: any;
  times_queried: string;
  camera_streak_data: any;
  fines: INYCFineData;
  violations_count: string;
}
