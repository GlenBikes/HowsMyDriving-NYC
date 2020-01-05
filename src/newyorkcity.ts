import { Citation } from 'howsmydriving-utils';
import { CompareNumericStrings } from 'howsmydriving-utils';
import { ICitation } from 'howsmydriving-utils';
import { CitationIds } from 'howsmydriving-utils';
import { formatPlate } from 'howsmydriving-utils';
import { IRegion } from 'howsmydriving-utils';
import { Region } from 'howsmydriving-utils';
import { createTweet } from 'howsmydriving-utils';
import { DumpObject } from 'howsmydriving-utils';

import { INYCCitation } from './interfaces/inyccitation';
import { NYCCitation } from './nyccitation';
import { __REGION_NAME__ } from './logging';

import { getVehicleResponse } from './server';

import { log } from './logging';

// TODO: Consolidate these.
const parkingAndCameraViolationsText =
    'Total __REGION__ parking and camera violations for #__LICENSE__: __COUNT__',
  violationsByYearText = 'Violations by year for #',
  violationsByStatusText = 'Violations by status for #',
  citationQueryText = 'License #__LICENSE__ has been queried __COUNT__ times.';

export class NewYorkCity extends Region {
  constructor(name: string) {
    super(name);
    log.debug(
      `Creating instance ${this.constructor.name} Region for region ${__REGION_NAME__}.`
    );
  }

  GetCitationsByPlate(plate: string, state: string): Promise<Array<Citation>> {
    log.debug(
      `Getting citations for ${state}:${plate} in region ${__REGION_NAME__}.`
    );

    let vehicle = {
      state: state,
      plate: plate,
      types: null
    };

    let external_data = {
      lookup_source: 'api',
      fingerprint_id: null,
      mixpanel_id: null
    };

    let response = getVehicleResponse(vehicle, null, external_data);

    log.info(`getVehicleResponse: ${DumpObject(response)}`);

    return Promise.resolve([]);
  }

  ProcessCitationsForRequest(
    citations: ICitation[],
    query_count: number
  ): Array<string> {
    var categorizedCitations: { [request_id: string]: number } = {};
    // TODO: Does it work to convert Date's to string for sorting? Might have to use epoch.
    var chronologicalCitations: {
      [violation_date: string]: Array<ICitation>;
    } = {};
    var violationsByYear: { [violation_year: string]: number } = {};
    var violationsByStatus: { [status: string]: number } = {};

    if (!citations || Object.keys(citations).length == 0) {
      // Should never happen. There is always at least a "no citations found" citation.
      throw new Error(
        'Jurisdiction modules must return at least one citation, a dummy one if there are none.'
      );
    }

    var license: string;
    var region: string;

    for (var i = 0; i < citations.length; i++) {
      var citation = citations[i];
      var year: number = 1970;
      var violationDate = new Date(Date.now());

      // All citations are from the same license
      if (license == null) {
        license = citation.license;
      }

      if (region == null) {
        region = citation.region;
      }

      try {
        violationDate = new Date(Date.parse(citation.ViolationDate));
      } catch (e) {
        // TODO: refactor error handling to a separate file
        throw new Error(e);
      }

      // TODO: Is it possible to have more than 1 citation with exact same time?
      // Maybe throw an exception if we ever encounter it...
      if (!(violationDate.getTime().toString() in chronologicalCitations)) {
        chronologicalCitations[
          violationDate.getTime().toString()
        ] = new Array();
      }

      chronologicalCitations[violationDate.getTime().toString()].push(citation);

      if (!(citation.Type in categorizedCitations)) {
        categorizedCitations[citation.Type] = 0;
      }
      categorizedCitations[citation.Type]++;

      if (!(citation.Status in violationsByStatus)) {
        violationsByStatus[citation.Status] = 0;
      }
      violationsByStatus[citation.Status]++;

      year = violationDate.getFullYear();

      if (!(year.toString() in violationsByYear)) {
        violationsByYear[year.toString()] = 0;
      }

      violationsByYear[year.toString()]++;
    }

    var general_summary = parkingAndCameraViolationsText
      .replace('__LICENSE__', formatPlate(license))
      .replace('__REGION__', region)
      .replace('__COUNT__', Object.keys(citations).length.toString());

    Object.keys(categorizedCitations).forEach(key => {
      var line = key + ': ' + categorizedCitations[key];

      // Max twitter username is 15 characters, plus the @
      general_summary += '\n';
      general_summary += line;
    });

    general_summary += '\n\n';
    general_summary += citationQueryText
      .replace('__LICENSE__', formatPlate(license))
      .replace('__COUNT__', query_count.toString());

    var detailed_list = '';

    var sortedChronoCitationKeys = Object.keys(chronologicalCitations).sort(
      function(a: string, b: string) {
        //return new Date(a).getTime() - new Date(b).getTime();
        return CompareNumericStrings(a, b); //(a === b) ? 0 : ( a < b ? -1 : 1);
      }
    );

    var first = true;

    for (var i = 0; i < sortedChronoCitationKeys.length; i++) {
      var key: string = sortedChronoCitationKeys[i];

      chronologicalCitations[key].forEach(citation => {
        if (first != true) {
          detailed_list += '\n';
        }
        first = false;
        detailed_list += `${citation.ViolationDate}, ${citation.Type}, ${citation.ViolationLocation}, ${citation.Status}`;
      });
    }

    var temporal_summary: string =
      violationsByYearText + formatPlate(license) + ':';
    Object.keys(violationsByYear).forEach(key => {
      temporal_summary += '\n';
      temporal_summary += `${key}: ${violationsByYear[key].toString()}`;
    });

    var type_summary = violationsByStatusText + formatPlate(license) + ':';
    Object.keys(violationsByStatus).forEach(key => {
      type_summary += '\n';
      type_summary += `${key}: ${violationsByStatus[key]}`;
    });

    // Return them in the order they should be rendered.
    return [general_summary, detailed_list, type_summary, temporal_summary];
  }
}

function CitationType(): string {
  const citation_types = [
    'PARKING',
    'TRAFFIC CAMERA',
    'INFRACTION',
    'EXPLODING CAR',
    'G@SSHOLE DRIVIST',
    'PARKING IN BIKE LANE',
    'BOOMER ENTITLEMENT'
  ];

  return citation_types[Math.floor(Math.random() * citation_types.length)];
}

function CitationStatus(): string {
  const citation_statuses = [
    'PAID',
    'ACTIVE',
    'DISPOSED',
    'COLLECTIONS',
    'BUDDYS_A_JUDGE'
  ];

  return citation_statuses[
    Math.floor(Math.random() * citation_statuses.length)
  ];
}

function CitationValidationDate(): string {
  const days_in_month = {
    1: 31,
    2: 28,
    3: 31,
    4: 30,
    5: 31,
    6: 30,
    7: 31,
    8: 31,
    9: 30,
    10: 31,
    11: 30,
    12: 31
  };
  var month = Math.floor(Math.random() * 12) + 1;
  var day = Math.floor(Math.random() * days_in_month[month]) + 1;
  var year = Math.floor(Math.random() * 10) + 2010;

  return `${month}/${day}/${year}`;
}

function CitationValidationLocation(): string {
  const directions = ['NE', 'NW', 'SE', 'SW'];
  const street_types = ['St', 'Ave', 'Blvd', 'Circle', 'Ct'];
  var num = Math.floor(Math.random() * 100000) + 1;
  var dir = directions[Math.floor(Math.random() * 4)];
  var street = Math.floor(Math.random() * 145) + 1;
  var street_type =
    street_types[Math.floor(Math.random() * street_types.length)];

  return `${num} ${dir} ${street}th ${street_type}`;
}

var RegionInstance: IRegion;

RegionInstance = new NewYorkCity(__REGION_NAME__);

export { RegionInstance as default };
export { RegionInstance as Region };
