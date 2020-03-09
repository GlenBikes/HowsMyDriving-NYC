import { ICitation } from 'howsmydriving-utils';

export interface INYCFineData {
  FINE_FIELDS: Array<string>;
  fines_assessed: () => boolean;
  max_amount: () => number;

  total_reduced: string;
  total_paid: string;
  total_outstanding: string;
  total_fined: string;
}

export interface INYCSummonsImage {
  description: string;
  url: string;
}

export interface INYCCitationInfo extends ICitation {
  [index: string]: any;
  previous_violation_count: any;
  state: string;
  previous_lookup_date: any;
  plate_types: any;
  times_queried: string;
  camera_streak_data: any;
  fines: INYCFineData;
  violations_count: string;
}

export interface INYCViolation {
  summons_number: string;
  vehicle_expiration_date: string;
  violation_time: string;
  vehicle_color: string;
  penalty_amount: string;
  formatted_time: any;
  violation_post_code: string;
  date_first_observed: string;
  intersecting_street: any;
  feet_from_curb: string;
  house_number: string;
  issuer_code: string;
  issuer_command: string;
  street_name: string;
  interest_amount: string;
  issue_date: string;
  law_section: string;
  plate_id: string;
  vehicle_body_type: string;
  issuing_agency: string;
  violation_code: string;
  amount_due: string;
  fine_amount: string;
  humanized_description: string;
  violation_legal_code: any;
  sub_division: string;
  vehicle_make: string;
  to_hours_in_effect: string;
  violation_location: string;
  fined: string;
  street_code3: string;
  street_code2: string;
  street_code1: string;
  payment_amount: string;
  violation_in_front_of_or_opposite: string;
  plate_type: string;
  summons_image: INYCSummonsImage;
  reduction_amount: string;
  issuer_precinct: string;
  violation_precinct: string;
  registration_state: string;
  vehicle_year: string;
  violation_county: string;
  paid: string;
  location: string;
}
