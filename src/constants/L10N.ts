export namespace L10N {
  export const LAST_QUERIED_STRING =
    'This vehicle was last queried on {} at {}';

  export const LOOKUP_BOROUGH_STRING =
    'Violations by borough for __LICENSE__:\n\n';
  export const LOOKUP_BOROUGH_STRING_CONTD =
    "Violations by borough for {}, cont'd:\n\n";
  export const LOOKUP_RESULTS_DETAIL_STRING =
    '__VIOLATION__COUNT| __VIOLATION_DESCRIPTION__\n';
  export const LOOKUP_SUMMARY_STRING =
    '__STATE__:__PLATE__ has been queried __QUERY_COUNT__ time__PLURAL__.\n\n';
  export const LOOKUP_TICKETS_STRING =
    'Total parking and camera violation tickets: __VIOLATION_COUNT__\n\n';
  export const LOOKUP_TICKETS_STRING_CONTD =
    "Parking and camera violation tickets for __LICENSE__, cont'd:\n\n";
  export const LOOKUP_YEAR_STRING = 'Violations by year for __LICENSE__:\n\n';
  export const LOOKUP_YEAR_STRING_CONTD =
    "Violations by year for __LICENSE__, cont'd:\n\n";

  export const NO_TICKETS_FOUND_STRING =
    "I couldn't find any tickets for {}:{}{}.";

  export const PLATE_TYPES_LOOKUP_STRING = ' (types: __PLATE_TYPES__) ';

  export const PREVIOUS_LOOKUP_STATUS_STRING =
    ' by @{}: https://twitter.com/{}/status/{}.';

  export const REPEAT_CAMERA_OFFENDER_STRING =
    'Featured #RepeatCameraOffender:\n\n';
  '__PLATE__ has received __VIOLATION_COUNT__ camera violations:\n\n';
  '__RED_LIGHT_VIOLATION_COUNT__ | Red Light Camera Violations\n';
  '__SPEED_SAFETY_VIOLATION_COUNT__ | Speed Safety Camera Violations\n\n';
  'This makes __STATE__:__PLATE__ the __STANDING__ camera violator in New York City.';

  export const REPEAT_LOOKUP_STRING =
    ' Since then, __PLATE__ has received __NEW_TICKET_COUNT new ticket__PULURAL__.\n\n';

  export function get_plate_types_string(plate_types: Array<string>): string {
    if (plate_types) {
      return PLATE_TYPES_LOOKUP_STRING.replace(
        '__PLATE_TYPES__',
        plate_types.toString()
      );
    } else {
      return ' ';
    }
  }

  export function format_plate(state: string, plate: string) {
    return `#${state}_${plate}`;
  }

  export function pluralize(num: number): string {
    if (num == 1) {
      return '';
    } else {
      return 's';
    }
  }
}
