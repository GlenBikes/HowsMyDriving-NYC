import { FineData } from './models/fine_data';
import { CameraStreakData } from './models/camera_streak_data';

// Represents the results of a plate query submitted to the open data apis
export class OpenDataServicePlateLookup {
  boroughs: Array<[string, number]>;
  fines: FineData;
  num_violations: number;
  plate: string;
  plate_types?: string;
  state: string;
  violations: Array<[string, number]>;
  years: Array<[string, number]>;

  camera_streak_data?: CameraStreakData;
}
