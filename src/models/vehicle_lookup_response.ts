import { FineData } from './fine_data';
import { CameraStreakData } from './camera_streak_data';

export class VehicleLookupData {
  constructor(params) {
    this.camera_streak_data = params['camera_streak_data'];
    this.fines = params['fines'];
    this.plate = params['plate'];
    this.plate_types = params['plate_types'];
    this.previous_lookup_date = params['previous_lookup_date'];
    this.previous_violation_count = params['previous_violation_count'];
    this.state = params['state'];
    this.times_queried = params['times_queried'];
    this.violations = params['violations'];
    this.violations_count = params['violations_count'];
  }

  camera_streak_data?: CameraStreakData;
  fines?: FineData;
  plate?: string;
  plate_types?: string;
  previous_lookup_date?: number;
  previous_violation_count?: number;
  state?: string;
  times_queried?: number;
  violations?: Array<any>;
  violations_count?: number;
}

export class VehicleLookupResponse {
  constructor(params) {
    this.vehicle = params['vehicle'];
    this.error_string = params['error_string'];
    this.successful_lookup = params['successful_lookup'];
  }

  vehicle: VehicleLookupData;
  error_string?: string;
  successful_lookup: boolean;
}
