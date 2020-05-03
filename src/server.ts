import './util/extend/string-ext';
const crypto = require('crypto');
const http = require('http');
const https = require('https');
const q = require('q');
const rp = require('request-promise');
const url = require('url');

import { log } from './logging';
import { DumpObject } from 'howsmydriving-utils';

import {
  VehicleLookupResponse,
  VehicleLookupData
} from './models/vehicle_lookup_response';

import { FineData } from './models/fine_data';
import { INYCFineData } from './interfaces/inyccitation';
import { CameraStreakData } from './models/camera_streak_data';

import { twitter_constants } from './constants/twitter';
import { L10N } from './constants/L10N';

const googleMapsClient = require('@google/maps').createClient({
  key: process.env.GOOGLE_PLACES_API_KEY,
  Promise: Promise
});

const MAX_USERNAME_LENGTH = 17; // 15 + @ plus space after.

// humanized names for violations
const opacvHumanizedNames = {
  '': 'No Description Given',
  'ALTERING INTERCITY BUS PERMIT': 'Altered Intercity Bus Permit',
  'ANGLE PARKING': 'No Angle Parking',
  'ANGLE PARKING-COMM VEHICLE': 'No Angle Parking',
  'BEYOND MARKED SPACE': 'No Parking Beyond Marked Space',
  'BIKE LANE': 'Blocking Bike Lane',
  'BLUE ZONE': 'No Parking - Blue Zone',
  'BUS LANE VIOLATION': 'Bus Lane Violation',
  'BUS PARKING IN LOWER MANHATTAN': 'Bus Parking in Lower Manhattan',
  'COMML PLATES-UNALTERED VEHICLE': 'Commercial Plates on Unaltered Vehicle',
  CROSSWALK: 'Blocking Crosswalk',
  'DETACHED TRAILER': 'Detached Trailer',
  'DIVIDED HIGHWAY': 'No Stopping - Divided Highway',
  'DOUBLE PARKING': 'Double Parking',
  'DOUBLE PARKING-MIDTOWN COMML': 'Double Parking - Midtown Commercial Zone',
  'ELEVATED/DIVIDED HIGHWAY/TUNNL':
    'No Stopping in Tunnel or on Elevated Highway',
  'EXCAVATION-VEHICLE OBSTR TRAFF':
    'No Stopping - Adjacent to Street Construction',
  'EXPIRED METER': 'Expired Meter',
  'EXPIRED METER-COMM METER ZONE': 'Expired Meter - Commercial Meter Zone',
  'EXPIRED MUNI METER': 'Expired Meter',
  'EXPIRED MUNI MTR-COMM MTR ZN': 'Expired Meter - Commercial Meter Zone',
  'FAIL TO DISP. MUNI METER RECPT': 'Failure to Display Meter Receipt',
  'FAIL TO DSPLY MUNI METER RECPT': 'Failure to Display Meter Receipt',
  'FAILURE TO DISPLAY BUS PERMIT': 'Failure to Display Bus Permit',
  'FAILURE TO STOP AT RED LIGHT': 'Failure to Stop at Red Light',
  'FEEDING METER': 'Feeding Meter',
  'FIRE HYDRANT': 'Fire Hydrant',
  'FRONT OR BACK PLATE MISSING': 'Front or Back Plate Missing',
  IDLING: 'Idling',
  'IMPROPER REGISTRATION': 'Improper Registration',
  "INSP STICKER-MUTILATED/C'FEIT":
    'Inspection Sticker Mutilated or Counterfeit',
  'INSP. STICKER-EXPIRED/MISSING': 'Inspection Sticker Expired or Missing',
  INTERSECTION: 'No Stopping - Intersection',
  'MARGINAL STREET/WATER FRONT': 'No Parking on Marginal Street or Waterfront',
  'MIDTOWN PKG OR STD-3HR LIMIT': 'Midtown Parking or Standing - 3 Hour Limit',
  MISCELLANEOUS: 'Miscellaneous',
  'MISSING EQUIPMENT': 'Missing Required Equipment',
  'NGHT PKG ON RESID STR-COMM VEH':
    'No Nighttime Parking on Residential Street - Commercial Vehicle',
  'NIGHTTIME STD/ PKG IN A PARK': 'No Nighttime Standing or Parking in a Park',
  'NO MATCH-PLATE/STICKER': 'Plate and Sticker Do Not Match',
  'NO OPERATOR NAM/ADD/PH DISPLAY': 'Failure to Display Operator Information',
  'NO PARKING-DAY/TIME LIMITS': 'No Parking - Day/Time Limits',
  'NO PARKING-EXC. AUTH. VEHICLE': 'No Parking - Except Authorized Vehicles',
  'NO PARKING-EXC. HNDICAP PERMIT': 'No Parking - Except Disability Permit',
  'NO PARKING-EXC. HOTEL LOADING': 'No Parking - Except Hotel Loading',
  'NO PARKING-STREET CLEANING': 'No Parking - Street Cleaning',
  'NO PARKING-TAXI STAND': 'No Parking - Taxi Stand',
  'NO STANDING EXCP D/S': 'No Standing - Except Department of State',
  'NO STANDING EXCP DP': 'No Standing - Except Diplomat',
  'NO STANDING-BUS LANE': 'No Standing - Bus Lane',
  'NO STANDING-BUS STOP': 'No Standing - Bus Stop',
  'NO STANDING-COMM METER ZONE': 'No Standing - Commercial Meter Zone',
  'NO STANDING-COMMUTER VAN STOP': 'No Standing - Commuter Van Stop',
  'NO STANDING-DAY/TIME LIMITS': 'No Standing - Day/Time Limits',
  'NO STANDING-EXC. AUTH. VEHICLE': 'No Standing - Except Authorized Vehicle',
  'NO STANDING-EXC. TRUCK LOADING': 'No Standing - Except Truck Loading',
  'NO STANDING-FOR HIRE VEH STOP': 'No Standing - For Hire Vehicle Stop',
  'NO STANDING-HOTEL LOADING': 'No Standing - Hotel Loading',
  'NO STANDING-OFF-STREET LOT': 'No Standing - Off-Street Lot',
  'NO STANDING-SNOW EMERGENCY': 'No Standing - Snow Emergency',
  'NO STANDING-TAXI STAND': 'No Standing - Taxi Stand',
  'NO STD(EXC TRKS/GMTDST NO-TRK)':
    'No Standing - Except Trucks in Garment District',
  'NO STOP/STANDNG EXCEPT PAS P/U':
    'No Stopping or Standing Except for Passenger Pick-Up',
  'NO STOPPING-DAY/TIME LIMITS': 'No Stopping - Day/Time Limits',
  'NON-COMPLIANCE W/ POSTED SIGN': 'Non-Compliance with Posted Sign',
  'OBSTRUCTING DRIVEWAY': 'Obstructing Driveway',
  'OBSTRUCTING TRAFFIC/INTERSECT': 'Obstructing Traffic or Intersection',
  'OT PARKING-MISSING/BROKEN METR':
    'Overtime Parking at Missing or Broken Meter',
  OTHER: 'Other',
  'OVERNIGHT TRACTOR TRAILER PKG': 'Overnight Parking of Tractor Trailer',
  'OVERTIME PKG-TIME LIMIT POSTED': 'Overtime Parking - Time Limit Posted',
  'OVERTIME STANDING DP': 'Overtime Standing - Diplomat',
  'OVERTIME STDG D/S': 'Overtime Standing - Department of State',
  'PARKED BUS-EXC. DESIG. AREA': 'Bus Parking Outside of Designated Area',
  'PEDESTRIAN RAMP': 'Blocking Pedestrian Ramp',
  'PHTO SCHOOL ZN SPEED VIOLATION': 'School Zone Speed Camera Violation',
  'PKG IN EXC. OF LIM-COMM MTR ZN':
    'Parking in Excess of Limits - Commercial Meter Zone',
  'PLTFRM LFTS LWRD POS COMM VEH':
    'Commercial Vehicle Platform Lifts in Lowered Position',
  'RAILROAD CROSSING': 'No Stopping - Railroad Crossing',
  "REG STICKER-MUTILATED/C'FEIT":
    'Registration Sticker Mutilated or Counterfeit',
  'REG. STICKER-EXPIRED/MISSING': 'Registration Sticker Expired or Missing',
  'REMOVE/REPLACE FLAT TIRE': 'Replacing Flat Tire on Major Roadway',
  'SAFETY ZONE': 'No Standing - Safety Zone',
  'SELLING/OFFERING MCHNDSE-METER':
    'Selling or Offering Merchandise From Metered Parking',
  SIDEWALK: 'Parked on Sidewalk',
  'STORAGE-3HR COMMERCIAL': 'Street Storage of Commercial Vehicle Over 3 Hours',
  'TRAFFIC LANE': 'No Stopping - Traffic Lane',
  'TUNNEL/ELEVATED/ROADWAY': 'No Stopping in Tunnel or on Elevated Highway',
  'UNALTERED COMM VEH-NME/ADDRESS': 'Commercial Plates on Unaltered Vehicle',
  'UNALTERED COMM VEHICLE': 'Commercial Plates on Unaltered Vehicle',
  'UNAUTHORIZED BUS LAYOVER': 'Bus Layover in Unauthorized Location',
  'UNAUTHORIZED PASSENGER PICK-UP': 'Unauthorized Passenger Pick-Up',
  'VACANT LOT': 'No Parking - Vacant Lot',
  'VEH-SALE/WSHNG/RPRNG/DRIVEWAY':
    'No Parking on Street to Wash or Repair Vehicle',
  'VEHICLE FOR SALE(DEALERS ONLY)':
    'No Parking on Street to Display Vehicle for Sale',
  'VIN OBSCURED': 'Vehicle Identification Number Obscured',
  'WASH/REPAIR VEHCL-REPAIR ONLY':
    'No Parking on Street to Wash or Repair Vehicle',
  'WRONG WAY': 'No Parking Opposite Street Direction'
};

// humanized names for violations
const fyHumanizedNames = {
  '01': 'Failure to Display Bus Permit',
  '02': 'Failure to Display Operator Information',
  '03': 'Unauthorized Passenger Pick-Up',
  '04': 'Bus Parking in Lower Manhattan - Exceeded 3-Hour limit',
  '04A': 'Bus Parking in Lower Manhattan - Non-Bus',
  '04B': 'Bus Parking in Lower Manhattan - No Permit',
  '06': 'Overnight Parking of Tractor Trailer',
  '08': 'Idling',
  '09': 'Obstructing Traffic or Intersection',
  '10': 'No Stopping or Standing Except for Passenger Pick-Up',
  '11': 'No Parking - Except Hotel Loading',
  '12': 'No Standing - Snow Emergency',
  '13': 'No Standing - Taxi Stand',
  '14': 'No Standing - Day/Time Limits',
  '16': 'No Standing - Except Truck Loading/Unloading',
  '16A': 'No Standing - Except Truck Loading/Unloading',
  '17': 'No Parking - Except Authorized Vehicles',
  '18': 'No Standing - Bus Lane',
  '19': 'No Standing - Bus Stop',
  '20': 'No Parking - Day/Time Limits',
  '20A': 'No Parking - Day/Time Limits',
  '21': 'No Parking - Street Cleaning',
  '22': 'No Parking - Except Hotel Loading',
  '23': 'No Parking - Taxi Stand',
  '24': 'No Parking - Except Authorized Vehicles',
  '25': 'No Standing - Commuter Van Stop',
  '26': 'No Standing - For Hire Vehicle Stop',
  '27': 'No Parking - Except Disability Permit',
  '28': 'Overtime Standing - Diplomat',
  '29': 'Altered Intercity Bus Permit',
  '30': 'No Stopping/Standing',
  '31': 'No Standing - Commercial Meter Zone',
  '32': 'Overtime Parking at Missing or Broken Meter',
  '32A': 'Overtime Parking at Missing or Broken Meter',
  '33': 'Feeding Meter',
  '35': 'Selling or Offering Merchandise From Metered Parking',
  '37': 'Expired Meter',
  '38': 'Failure to Display Meter Receipt',
  '39': 'Overtime Parking - Time Limit Posted',
  '40': 'Fire Hydrant',
  '42': 'Expired Meter - Commercial Meter Zone',
  '43': 'Expired Meter - Commercial Meter Zone',
  '44': 'Overtime Parking - Commercial Meter Zone',
  '45': 'No Stopping - Traffic Lane',
  '46': 'Double Parking',
  '46A': 'Double Parking',
  '46B': 'Double Parking - Within 100 ft. of Loading Zone',
  '47': 'Double Parking - Midtown Commercial Zone',
  '47A': 'Double Parking - Angle Parking',
  '48': 'Blocking Bike Lane',
  '49': 'No Stopping - Adjacent to Street Construction',
  '50': 'Blocking Crosswalk',
  '51': 'Parked on Sidewalk',
  '52': 'No Stopping - Intersection',
  '53': 'No Standing - Safety Zone',
  '55': 'No Stopping in Tunnel or on Elevated Highway',
  '56': 'No Stopping - Divided Highway',
  '57': 'No Parking - Blue Zone',
  '58': 'No Parking on Marginal Street or Waterfront',
  '59': 'No Angle Parking',
  '60': 'No Angle Parking',
  '61': 'No Parking Opposite Street Direction',
  '62': 'No Parking Beyond Marked Space',
  '63': 'No Nighttime Standing or Parking in a Park',
  '64': 'No Standing - Consul or Diplomat',
  '65': 'Overtime Standing - Consul or Diplomat Over 30 Minutes',
  '66': 'Detached Trailer',
  '67': 'Blocking Pedestrian Ramp',
  '68': 'Non-Compliance with Posted Sign',
  '69': 'Failure to Display Meter Receipt',
  '70': 'Registration Sticker Expired or Missing',
  '70A': 'Registration Sticker Expired or Missing',
  '70B': 'Improper Display of Registration',
  '71': 'Inspection Sticker Expired or Missing',
  '71A': 'Inspection Sticker Expired or Missing',
  '71B': 'Improper Safety Sticker',
  '72': 'Inspection Sticker Mutilated or Counterfeit',
  '72A': 'Inspection Sticker Mutilated or Counterfeit',
  '73': 'Registration Sticker Mutilated or Counterfeit',
  '73A': 'Registration Sticker Mutilated or Counterfeit',
  '74': 'Front or Back Plate Missing',
  '74A': 'Improperly Displayed Plate',
  '74B': 'Covered Plate',
  '75': 'Plate and Sticker Do Not Match',
  '77': 'Bus Parking Outside of Designated Area',
  '78': 'Nighttime Parking on Residential Street - Commercial Vehicle',
  '79': 'Bus Layover in Unauthorized Location',
  '80': 'Missing Required Equipment',
  '81': 'No Standing - Except Diplomat',
  '82': 'Commercial Plates on Unaltered Vehicle',
  '83': 'Improper Registration',
  '84': 'Commercial Vehicle Platform Lifts in Lowered Position',
  '85': 'Street Storage of Commercial Vehicle Over 3 Hours',
  '86': 'Midtown Parking or Standing - 3 Hour Limit',
  '89': 'No Standing - Except Trucks in Garment District',
  '91': 'No Parking on Street to Display Vehicle for Sale',
  '92': 'No Parking on Street to Wash or Repair Vehicle',
  '93': 'Replacing Flat Tire on Major Roadway',
  '96': 'No Stopping - Railroad Crossing',
  '98': 'Obstructing Driveway',
  '01-No Intercity Pmt Displ': 'Failure to Display Bus Permit',
  '02-No operator N/A/PH': 'Failure to Display Operator Information',
  '03-Unauth passenger pick-up': 'Unauthorized Passenger Pick-Up',
  '04-Downtown Bus Area,3 Hr Lim':
    'Bus Parking in Lower Manhattan - Exceeded 3-Hour limit',
  '04A-Downtown Bus Area,Non-Bus': 'Bus Parking in Lower Manhattan - Non-Bus',
  '04A-Downtown Bus Area, Non-Bus': 'Bus Parking in Lower Manhattan - Non-Bus',
  '04B-Downtown Bus Area,No Prmt': 'Bus Parking in Lower Manhattan - No Permit',
  '06-Nighttime PKG (Trailer)': 'Overnight Parking of Tractor Trailer',
  '08-Engine Idling': 'Idling',
  '09-Blocking the Box': 'Obstructing Traffic or Intersection',
  '10-No Stopping': 'No Stopping or Standing Except for Passenger Pick-Up',
  '11-No Stand (exc hotel load)': 'No Parking - Except Hotel Loading',
  '12-No Stand (snow emergency)': 'No Standing - Snow Emergency',
  '13-No Stand (taxi stand)': 'No Standing - Taxi Stand',
  '14-No Standing': 'No Standing - Day/Time Limits',
  '16-No Std (Com Veh) Com Plate':
    'No Standing - Except Truck Loading/Unloading',
  '16A-No Std (Com Veh) Non-COM':
    'No Standing - Except Truck Loading/Unloading',
  '17-No Stand (exc auth veh)': 'No Parking - Except Authorized Vehicles',
  '18-No Stand (bus lane)': 'No Standing - Bus Lane',
  '19-No Stand (bus stop)': 'No Standing - Bus Stop',
  '20-No Parking (Com Plate)': 'No Parking - Day/Time Limits',
  '20A-No Parking (Non-COM)': 'No Parking - Day/Time Limits',
  '21-No Parking (street clean)': 'No Parking - Street Cleaning',
  '22-No Parking (exc hotel load)': 'No Parking - Except Hotel Loading',
  '23-No Parking (taxi stand)': 'No Parking - Taxi Stand',
  '24-No Parking (exc auth veh)': 'No Parking - Except Authorized Vehicles',
  '25-No Stand (commutr van stop)': 'No Standing - Commuter Van Stop',
  '26-No Stnd (for-hire veh only)': 'No Standing - For Hire Vehicle Stop',
  '27-No Parking (exc handicap)': 'No Parking - Except Disability Permit',
  '28-O/T STD,PL/Con,0 Mn, Dec': 'Overtime Standing - Diplomat',
  '29-Altered Intercity bus pmt': 'Altered Intercity Bus Permit',
  '30-No stopping/standing': 'No Stopping/Standing',
  '31-No Stand (Com. Mtr. Zone)': 'No Standing - Commercial Meter Zone',
  '32-Overtime PKG-Missing Meter':
    'Overtime Parking at Missing or Broken Meter',
  '32A Overtime PKG-Broken Meter':
    'Overtime Parking at Missing or Broken Meter',
  '33-Feeding Meter': 'Feeding Meter',
  '35-Selling/Offer Merchandise':
    'Selling or Offering Merchandise From Metered Parking',
  '37-Expired Muni Meter': 'Expired Meter',
  '37-Expired Parking Meter': 'Expired Meter',
  '38-Failure to Display Muni Rec': 'Failure to Display Meter Receipt',
  '38-Failure to Dsplay Meter Rec': 'Failure to Display Meter Receipt',
  '39-Overtime PKG-Time Limt Post': 'Overtime Parking - Time Limit Posted',
  '40-Fire Hydrant': 'Fire Hydrant',
  '42-Exp. Muni-Mtr (Com. Mtr. Z)': 'Expired Meter - Commercial Meter Zone',
  '42-Exp Meter (Com Zone)': 'Expired Meter - Commercial Meter Zone',
  '43-Exp. Mtr. (Com. Mtr. Zone)': 'Expired Meter - Commercial Meter Zone',
  '44-Exc Limit (Com. Mtr. Zone)': 'Overtime Parking - Commercial Meter Zone',
  '45-Traffic Lane': 'No Stopping - Traffic Lane',
  '46-Double Parking (Com Plate)': 'Double Parking',
  '46A-Double Parking (Non-COM)': 'Double Parking',
  '46B-Double Parking (Com-100Ft)':
    'Double Parking - Within 100 ft. of Loading Zone',
  '47-Double PKG-Midtown': 'Double Parking - Midtown Commercial Zone',
  '47A-Angle PKG - Midtown': 'Double Parking - Angle Parking',
  '48-Bike Lane': 'Blocking Bike Lane',
  '49-Excavation (obstruct traff)':
    'No Stopping - Adjacent to Street Construction',
  '50-Crosswalk': 'Blocking Crosswalk',
  '51-Sidewalk': 'Parked on Sidewalk',
  '52-Intersection': 'No Stopping - Intersection',
  '53-Safety Zone': 'No Standing - Safety Zone',
  '55-Tunnel/Elevated Roadway': 'No Stopping in Tunnel or on Elevated Highway',
  '56-Divided Highway': 'No Stopping - Divided Highway',
  '57-Blue Zone': 'No Parking - Blue Zone',
  '58-Marginal Street/Water Front':
    'No Parking on Marginal Street or Waterfront',
  '59-Angle PKG-Commer. Vehicle': 'No Angle Parking',
  '60-Angle Parking': 'No Angle Parking',
  '61-Wrong Way': 'No Parking Opposite Street Direction',
  '62-Beyond Marked Space': 'No Parking Beyond Marked Space',
  '63-Nighttime STD/PKG in a Park':
    'No Nighttime Standing or Parking in a Park',
  '64-No STD Ex Con/DPL,D/S Dec': 'No Standing - Consul or Diplomat',
  '65-O/T STD,pl/Con,0 Mn,/S':
    'Overtime Standing - Consul or Diplomat Over 30 Minutes',
  '66-Detached Trailer': 'Detached Trailer',
  '67-Blocking Ped. Ramp': 'Blocking Pedestrian Ramp',
  '68-Not Pkg. Comp. w Psted Sign': 'Non-Compliance with Posted Sign',
  '69-Failure to Disp Muni Recpt': 'Failure to Display Meter Receipt',
  '69-Fail to Dsp Prking Mtr Rcpt': 'Failure to Display Meter Receipt',
  '70-Reg. Sticker Missing (NYS)': 'Registration Sticker Expired or Missing',
  '70A-Reg. Sticker Expired (NYS)': 'Registration Sticker Expired or Missing',
  '70B-Impropr Dsply of Reg (NYS)': 'Improper Display of Registration',
  '71-Insp. Sticker Missing (NYS': 'Inspection Sticker Expired or Missing',
  '71A-Insp Sticker Expired (NYS)': 'Inspection Sticker Expired or Missing',
  '71B-Improp Safety Stkr (NYS)': 'Improper Safety Sticker',
  '72-Insp Stkr Mutilated': 'Inspection Sticker Mutilated or Counterfeit',
  '72A-Insp Stkr Counterfeit': 'Inspection Sticker Mutilated or Counterfeit',
  '73-Reg Stkr Mutilated': 'Registration Sticker Mutilated or Counterfeit',
  '73A-Reg Stkr Counterfeit': 'Registration Sticker Mutilated or Counterfeit',
  '74-Missing Display Plate': 'Front or Back Plate Missing',
  '74A-Improperly Displayed Plate': 'Improperly Displayed Plate',
  '74B-Covered Plate': 'Covered Plate',
  '75-No Match-Plate/Reg. Sticker': 'Plate and Sticker Do Not Match',
  '77-Parked Bus (exc desig area)': 'Bus Parking Outside of Designated Area',
  '78-Nighttime PKG on Res Street':
    'Nighttime Parking on Residential Street - Commercial Vehicle',
  '79-Bus Layover': 'Bus Layover in Unauthorized Location',
  '80-Missing Equipment (specify)': 'Missing Required Equipment',
  '81-No STD Ex C,&D Dec,30 Mn': 'No Standing - Except Diplomat',
  '82-Unaltered Commerc Vehicle': 'Commercial Plates on Unaltered Vehicle',
  '83-Improper Registration': 'Improper Registration',
  '84-Platform lifts in low posit':
    'Commercial Vehicle Platform Lifts in Lowered Position',
  '85-Storage-3 hour Commercial':
    'Street Storage of Commercial Vehicle Over 3 Hours',
  '86-Midtown PKG or STD-3 hr lim':
    'Midtown Parking or Standing - 3 Hour Limit',
  '89-No Stand Exc Com Plate':
    'No Standing - Except Trucks in Garment District',
  '91-Veh for Sale (Dealer Only)':
    'No Parking on Street to Display Vehicle for Sale',
  '92-Washing/Repairing Vehicle':
    'No Parking on Street to Wash or Repair Vehicle',
  '93-Repair Flat Tire (Maj Road)': 'Replacing Flat Tire on Major Roadway',
  '96-Railroad Crossing': 'No Stopping - Railroad Crossing',
  '98-Obstructing Driveway': 'Obstructing Driveway',
  'BUS LANE VIOLATION': 'Bus Lane Violation',
  'FAILURE TO STOP AT RED LIGHT': 'Failure to Stop at Red Light',
  'Field Release Agreement': 'Field Release Agreement',
  'PHTO SCHOOL ZN SPEED VIOLATION': 'School Zone Speed Camera Violation'
};

// mapping humanized naes to violation codes
const namesToCodes = {
  'Failure to Display Bus Permit': '01',
  'Failure to Display Operator Information': '02',
  'Unauthorized Passenger Pick-Up': '03',
  'Bus Parking in Lower Manhattan - Exceeded 3-Hour limit': '04',
  'Bus Parking in Lower Manhattan - Non-Bus': '04A',
  'Bus Parking in Lower Manhattan - No Permit': '04B',
  'Bus Lane Violation': '05',
  'Overnight Parking of Tractor Trailer': '06',
  'Failure to Stop at Red Light': '07',
  Idling: '08',
  'Obstructing Traffic or Intersection': '09',
  'No Stopping or Standing Except for Passenger Pick-Up': '10',
  'No Parking - Except Hotel Loading': '22',
  'No Standing - Snow Emergency': '12',
  'No Standing - Taxi Stand': '13',
  'No Standing - Day/Time Limits': '14',
  'No Standing - Except Truck Loading/Unloading': '16',
  'No Parking - Except Authorized Vehicles': '24',
  'No Standing - Bus Lane': '18',
  'No Standing - Bus Stop': '19',
  'No Parking - Day/Time Limits': '20',
  'No Parking - Street Cleaning': '21',
  'No Parking - Taxi Stand': '23',
  'No Standing - Commuter Van Stop': '25',
  'No Standing - For Hire Vehicle Stop': '26',
  'No Parking - Except Disability Permit': '27',
  'Overtime Standing - Diplomat': '28',
  'Altered Intercity Bus Permit': '29',
  'No Stopping/Standing': '30',
  'No Standing - Commercial Meter Zone': '31',
  'Overtime Parking at Missing or Broken Meter': '32',
  'Feeding Meter': '33',
  'Selling or Offering Merchandise From Metered Parking': '35',
  'School Zone Speed Camera Violation': '36',
  'Expired Meter': '37',
  'Failure to Display Meter Receipt': '69',
  'Overtime Parking - Time Limit Posted': '39',
  'Fire Hydrant': '40',
  'Expired Meter - Commercial Meter Zone': '43',
  'Overtime Parking - Commercial Meter Zone': '44',
  'No Stopping - Traffic Lane': '45',
  'Double Parking': '46',
  'Double Parking - Within 100 ft. of Loading Zone': '46B',
  'Double Parking - Midtown Commercial Zone': '47',
  'Double Parking - Angle Parking': '47A',
  'Blocking Bike Lane': '48',
  'No Stopping - Adjacent to Street Construction': '49',
  'Blocking Crosswalk': '50',
  'Parked on Sidewalk': '51',
  'No Stopping - Intersection': '52',
  'No Standing - Safety Zone': '53',
  'No Stopping in Tunnel or on Elevated Highway': '55',
  'No Stopping - Divided Highway': '56',
  'No Parking - Blue Zone': '57',
  'No Parking on Marginal Street or Waterfront': '58',
  'No Angle Parking': '60',
  'No Parking Opposite Street Direction': '61',
  'No Parking Beyond Marked Space': '62',
  'No Nighttime Standing or Parking in a Park': '63',
  'No Standing - Consul or Diplomat': '64',
  'Overtime Standing - Consul or Diplomat Over 30 Minutes': '65',
  'Detached Trailer': '66',
  'Blocking Pedestrian Ramp': '67',
  'Non-Compliance with Posted Sign': '68',
  'Registration Sticker Expired or Missing': '70',
  'Improper Display of Registration': '70B',
  'Inspection Sticker Expired or Missing': '71',
  'Improper Safety Sticker': '71B',
  'Inspection Sticker Mutilated or Counterfeit': '72',
  'Registration Sticker Mutilated or Counterfeit': '73',
  'Front or Back Plate Missing': '74',
  'Improperly Displayed Plate': '74A',
  'Covered Plate': '74B',
  'Plate and Sticker Do Not Match': '75',
  'Bus Parking Outside of Designated Area': '77',
  'Nighttime Parking on Residential Street - Commercial Vehicle': '78',
  'Bus Layover in Unauthorized Location': '79',
  'Missing Required Equipment': '80',
  'No Standing - Except Diplomat': '81',
  'Commercial Plates on Unaltered Vehicle': '82',
  'Improper Registration': '83',
  'Commercial Vehicle Platform Lifts in Lowered Position': '84',
  'Street Storage of Commercial Vehicle Over 3 Hours': '85',
  'Midtown Parking or Standing - 3 Hour Limit': '86',
  'No Standing - Except Trucks in Garment District': '89',
  'No Parking on Street to Display Vehicle for Sale': '91',
  'No Parking on Street to Wash or Repair Vehicle': '92',
  'Replacing Flat Tire on Major Roadway': '93',
  'No Stopping - Railroad Crossing': '96',
  'Obstructing Driveway': '98'
};

const stateAbbrRegex = /^(99|AB|AK|AL|AR|AZ|BC|CA|CO|CT|DC|DE|DP|FL|FM|FO|GA|GU|GV|HI|IA|ID|IL|IN|KS|KY|LA|MA|MB|MD|ME|MI|MN|MO|MP|MS|MT|MX|NB|NC|ND|NE|NF|NH|NJ|NM|NS|NT|NV|NY|OH|OK|ON|OR|PA|PE|PR|PW|QC|RI|SC|SD|SK|TN|TX|UT|VA|VI|VT|WA|WI|WV|WY|YT)$/;
const registrationTypesRegex = /^(AGC|AGR|AMB|APP|ARG|ATD|ATV|AYG|BOB|BOT|CBS|CCK|CHC|CLG|CMB|CME|CMH|COM|CSP|DLR|FAR|FPW|GAC|GSM|HAC|HAM|HIR|HIS|HOU|HSM|IRP|ITP|JCA|JCL|JSC|JWV|LMA|LMB|LMC|LOC|LTR|LUA|MCD|MCL|MED|MOT|NLM|NYA|NYC|NYS|OMF|OML|OMO|OMR|OMS|OMT|OMV|ORC|ORG|ORM|PAS|PHS|PPH|PSD|RGC|RGL|SCL|SEM|SNO|SOS|SPC|SPO|SRF|SRN|STA|STG|SUP|THC|TOW|TRA|TRC|TRL|USC|USS|VAS|VPL|WUG)$/;

const counties = {
  Bronx: 'Bronx',
  Brook: 'Brooklyn',
  BX: 'Bronx',
  Bx: 'Bronx',
  BK: 'Brooklyn',
  Bk: 'Brooklyn',
  K: 'Brooklyn',
  KINGS: 'Brooklyn',
  MAH: 'Manhattan',
  MANHA: 'Manhattan',
  MN: 'Manhattan',
  NEUY: 'Manhattan',
  NY: 'Manhattan',
  PBX: 'Bronx',
  PK: 'Brooklyn',
  PNY: 'Manhattan',
  Q: 'Queens',
  QN: 'Queens',
  QNS: 'Queens',
  Queen: 'Queens',
  R: 'Staten Island',
  Rich: 'Staten Island',
  ST: 'Staten Island'
};

const issuingAgencies = {
  'DEPARTMENT OF BUSINESS SERVICES': 'NYC SBS',
  'DEPARTMENT OF SANITATION': 'DSNY',
  'DEPARTMENT OF TRANSPORTATION': 'NYC DOT',
  'Fire Department': 'FDNY',
  'HOUSING AUTHORITY': 'NYCHA',
  'LONG ISLAND RAILROAD': 'LIRR',
  'METRO NORTH RAILROAD POLICE': 'MNRR',
  'NYC OFFICE OF THE SHERIFF': 'NYC Sheriff',
  'NYC TRANSIT AUTHORITY MANAGERS': 'NYCTA',
  'NYS COURT OFFICERS': 'NYS Courts',
  'NYS PARKS POLICE': 'NYS Parks',
  'OTHER/UNKNOWN AGENCIES': 'other',
  'PARKING CONTROL UNIT': 'NYC DOT',
  'PARKS DEPARTMENT': 'NYC Parks',
  'POLICE DEPARTMENT': 'NYPD',
  'PORT AUTHORITY': 'PANYNJ',
  'TAXI AND LIMOUSINE COMMISSION': 'TLC',
  TRAFFIC: 'NYPD Traffic',
  'TRANSIT AUTHORITY': 'NYCTA',
  'TRIBOROUGH BRIDGE AND TUNNEL POLICE': 'TBTA',
  T: 'NYPD Traffic',
  V: 'NYC DOT'
};

/*
let initializeConnection = config => {
  let addDisconnectHandler = connection => {
    connection.on('error', error => {
      if (error instanceof Error) {
        let error_code: string = undefined;
        let is_fatal: boolean = false;

        if (error.hasOwnProperty('code')) {
          error_code = (error as any)['code'];
        }

        if (error.hasOwnProperty('fatal')) {
          is_fatal = (error as any)['fatal'];
        }

        if (error_code === 'PROTOCOL_CONNECTION_LOST') {
          console.error(error.stack);
          console.log('Lost connection. Reconnecting...');

          initializeConnection(connection.config);
        } else if (is_fatal) {
          throw error;
        }
      }
    });
  };

  var connection = mysql.createConnection(config);

  connection.promiseQuery = (sql, values) => {
    return new Promise((resolve, reject) => {
      return connection.query(sql, values, (error, results, fields) => {
        if (error) reject(error);
        if (results) resolve(results);
      });
    });
  };

  // Add handlers.
  addDisconnectHandler(connection);

  connection.connect();
  return connection;
};
*/

let detectPlateTypes = potentialPlateTypeString => {
  if (potentialPlateTypeString.indexOf(',') != -1) {
    const parts = potentialPlateTypeString.split(',');
    const bools = parts.map(
      part => !(part.match(registrationTypesRegex) == undefined)
    );
    return bools.some(bool => bool === true);
  } else {
    return !(
      potentialPlateTypeString.match(registrationTypesRegex) == undefined
    );
  }
};

let detectState = potentialStateString => {
  return !(potentialStateString.match(stateAbbrRegex) == undefined);
};

let detectVehicles = potentialVehicles => {
  return potentialVehicles.map(plate => {
    let vehicle = { original_string: plate };

    let parts = plate
      .toUpperCase()
      .trim()
      .split(':');

    if ([2, 3].includes(parts.length)) {
      let stateBools = parts.map(part => detectState(part));
      let stateIndex = stateBools.indexOf(true);

      let plateTypesBools = parts.map(part => detectPlateTypes(part));
      let plateTypesIndex = plateTypesBools.indexOf(true);

      let haveValidPlate =
        (parts.length === 2 && stateIndex != -1) ||
        (parts.length === 3 && ![plateTypesIndex, stateIndex].includes(-1));

      if (haveValidPlate) {
        let plateIndex = [...Array(parts.length).keys()].filter(
          part => ![stateIndex, plateTypesIndex].includes(part)
        )[0];

        vehicle['state'] = parts[stateIndex];
        vehicle['types'] = parts[plateTypesIndex];
        vehicle['plate'] = parts[plateIndex];
        vehicle['valid_plate'] = true;
      } else {
        vehicle['valid_plate'] = false;
      }
    } else {
      vehicle['valid_plate'] = false;
    }

    return vehicle;
  });
};

let findFilterFields = fieldsString => {
  if (fieldsString == undefined || fieldsString == '') return {};

  let returnFields = {};

  let fields = fieldsString.replace(/(\([^)]*\))/g, '').split(',');

  fields.forEach(field => {
    if (fieldsString[fieldsString.indexOf(field) + field.length] == '(') {
      var re = new RegExp(field + '\\([\\w|,]*\\)', 'g');

      let subfields =
        fieldsString.match(re) == undefined
          ? null
          : fieldsString.match(re)[0].replace(field, '');
      subfields = subfields.substring(1, subfields.length - 1);

      if (subfields) {
        returnFields[field] = findFilterFields(
          subfields.replace(/[\(|\)]/g, '')
        );
      } else if (subfields == '') {
        returnFields[field] = {};
      }
    } else {
      returnFields[field] = {};
    }
  });

  return returnFields;
};

let findMaxCameraViolationsStreak = violationTimes => {
  if (violationTimes.length) {
    let maxStreak = 0;
    let streakEnd = null;
    let streakStart = null;

    violationTimes.forEach(date => {
      let yearLater = new Date(date).setFullYear(date.getFullYear() + 1);

      let yearLongTickets = violationTimes.filter(
        otherDate => otherDate >= date && otherDate <= yearLater
      );

      let thisStreak = yearLongTickets.length;

      if (thisStreak > maxStreak) {
        maxStreak = thisStreak;
        streakEnd = yearLongTickets[0];
        streakStart = yearLongTickets[yearLongTickets.length - 1];
      }
    });

    return {
      max_streak: maxStreak,
      streak_end: streakEnd,
      streak_start: streakStart
    };
  } else {
    return null;
  }
};

export let getVehicleResponse = (
  vehicle,
  selectedFields,
  externalData
): Promise<VehicleLookupResponse> => {
  return new Promise((resolve, reject) => {
    let plate = vehicle.plate;
    let state = vehicle.state;
    let plateTypes =
      vehicle.types == undefined
        ? null
        : vehicle.types.split(',').map(part => part.trim());

    let lookupSource = externalData.lookup_source;
    let fingerprintID = externalData.fingerprint_id;
    let mixpanelID = externalData.mixpanel_id;

    if (plate && state) {
      let apiPromises = makeOpenDataRequests(plate, state, plateTypes);

      q.all(apiPromises).then(endpointResponses => {
        let newPromises = [];

        endpointResponses.forEach(response => {
          newPromises = newPromises.concat(
            normalizeViolations(JSON.parse(response))
          );
        });

        q.all(newPromises).then(violations => {
          violations = mergeDuplicateViolationRecords(violations);

          modifyViolationsForResponse(violations);

          const reducer = (accumulator, currentValue) =>
            accumulator + currentValue;

          const totalFined = violations
            .map(obj => obj.fined || 0)
            .reduce(reducer, 0);

          const totalPaid = violations
            .map(obj => obj.paid || 0)
            .reduce(reducer, 0);

          const totalReduced = violations
            .map(obj => obj.reduced || 0)
            .reduce(reducer, 0);

          const totalOutstanding = violations
            .map(obj => obj.outstanding || 0)
            .reduce(reducer, 0);

          let fines = new FineData({
            total_fined: totalFined,
            total_paid: totalPaid,
            total_reduced: totalReduced,
            total_outstanding: totalOutstanding
          } as INYCFineData);

          let cameraViolations = violations.filter(
            violation =>
              violation.humanized_description ==
                'School Zone Speed Camera Violation' ||
              violation.humanized_description == 'Failure to Stop at Red Light'
          );

          const streakData = findMaxCameraViolationsStreak(
            cameraViolations.map(function(violation) {
              return violation.formatted_time;
            })
          );

          let frequencyLookup = {
            plate: plate,
            state: state
          };

          let searchQueryString =
            plateTypes == undefined
              ? 'select count(*) as frequency from plate_lookups where plate = ? and state = ? and count_towards_frequency = 1; select num_tickets, created_at from plate_lookups where plate = ? and state = ? and count_towards_frequency = 1 ORDER BY created_at DESC LIMIT 1'
              : 'select count(*) as frequency from plate_lookups where plate = ? and state = ? and plate_types = ? and count_towards_frequency = 1; select num_tickets, created_at from plate_lookups where plate = ? and state = ? and plate_types = ? and count_towards_frequency = 1 ORDER BY created_at DESC LIMIT 1';

          let searchQueryArgs =
            plateTypes == undefined
              ? [plate, state, plate, state]
              : [
                  plate,
                  state,
                  plateTypes.join(),
                  plate,
                  state,
                  plateTypes.join()
                ];

          queryForLookups(
            searchQueryString,
            searchQueryArgs,
            (error, results, fields) => {
              if (error) throw error;

              let frequency = lookupSource == null ? 0 : 1;
              let newLookup = {
                plate: plate,
                state: state,
                plate_types: plateTypes == undefined ? null : plateTypes.join(),
                observed: null,
                message_id: null,
                lookup_source: lookupSource == undefined ? 'api' : lookupSource,
                created_at: new Date(),
                external_username: null,
                count_towards_frequency:
                  lookupSource == undefined ? false : true,
                num_tickets: violations.length,
                boot_eligible: (streakData && streakData.max_streak >= 5) || 0,
                fingerprint_id: fingerprintID,
                mixpanel_id: mixpanelID,
                responded_to: true
              };
              let previous_count = null;
              let previous_date = null;

              if (
                results &&
                results[0] &&
                results[0][0] &&
                results[1] &&
                results[1][0]
              ) {
                frequency =
                  results[0][0].frequency + (lookupSource == null ? 0 : 1);
                previous_count = results[1][0].num_tickets;
                previous_date = results[1][0].created_at;
              }

              /*
              insertNewLookup(newLookup, (error, results, fields) => {
                if (error) throw error;
              });
              */

              let returnVehicle = new VehicleLookupData({
                camera_streak_data: streakData,
                fines: fines,
                plate: plate,
                plate_types: plateTypes,
                previous_lookup_date: previous_date,
                previous_violation_count: previous_count,
                state: state,
                times_queried: frequency,
                violations: violations,
                violations_count: violations.length
              });
              let returnObject = new VehicleLookupResponse({
                vehicle: returnVehicle,
                successful_lookup: false
              });

              returnObject.vehicle = stripReturnData(
                returnObject.vehicle,
                selectedFields
              );

              returnObject['successful_lookup'] = true;

              resolve(returnObject);
            }
          );
        });
      });
    } else {
      resolve({
        vehicle: {},
        error_string:
          'Sorry, a plate and state could not be inferred from ' +
          vehicle.original_string,
        successful_lookup: false
      });
    }
  });
};

/*
let insertNewLookup = (newLookup, callback) => {
  connection.query('insert into plate_lookups set ?', newLookup, callback);
};
*/

let makeOpenDataRequests = (plate, state, plateTypes) => {
  const fy_endpoints = [
    'https://data.cityofnewyork.us/resource/j7ig-zgkq.json',
    'https://data.cityofnewyork.us/resource/aagd-wyjz.json',
    'https://data.cityofnewyork.us/resource/avxe-2nrn.json',
    'https://data.cityofnewyork.us/resource/2bnn-yakx.json',
    'https://data.cityofnewyork.us/resource/9wgk-ev5c.json',
    'https://data.cityofnewyork.us/resource/faiq-9dfq.json',
    'https://data.cityofnewyork.us/resource/pvqr-7yc4.json'
  ];

  var violations = [];

  // Checking for selected fields for violations
  // const fieldsForExternalRequests = 'violations' in selectedFields ? Object.keys(selectedFields['violations']) : {}

  // Fiscal Year Databases
  let promises = fy_endpoints.map(endpoint => {
    let queryString =
      endpoint +
      '?plate_id=' +
      encodeURIComponent(plate.toUpperCase()) +
      '&registration_state=' +
      state.toUpperCase();

    if (plateTypes) {
      let plateTypesQuery = plateTypes
        .map(item => '%27' + item.toUpperCase().trim() + '%27')
        .join();

      queryString += '&$where=plate_type%20in(' + plateTypesQuery + ')';
    }

    // if (fieldsForExternalRequests) {
    //   queryString += '&$select=' + fieldsForExternalRequests.join(',')
    // }

    queryString += '&$limit=10000&$$app_token=q198HrEaAdCJZD4XCLDl2Uq0G';

    return rp(queryString);
  });

  // Open Parking & Camera Violations Database
  let opacvQueryString =
    'https://data.cityofnewyork.us/resource/uvbq-3m68.json' +
    '?plate=' +
    encodeURIComponent(plate.toUpperCase()) +
    '&state=' +
    state.toUpperCase();

  if (plateTypes) {
    let plateTypesQuery = plateTypes
      .map(item => '%27' + item.toUpperCase().trim() + '%27')
      .join();

    opacvQueryString += '&$where=license_type%20in(' + plateTypesQuery + ')';
  }

  // if (fieldsForExternalRequests) {
  //   opacvQueryString += '&$select=' + fieldsForExternalRequests.join(',')
  // }

  opacvQueryString += '&$limit=10000&$$app_token=q198HrEaAdCJZD4XCLDl2Uq0G';

  promises.push(rp(opacvQueryString));

  return promises;
};

let mergeDuplicateViolationRecords = violations => {
  let accum = [];

  violations.forEach(object => {
    let existing = accum.filter((violation, i) => {
      return violation.summons_number == object.summons_number;
    });
    if (existing.length) {
      let existingIndex = accum.indexOf(existing[0]);
      let existingItem = accum[existingIndex];

      let mergedObject = {};

      Object.keys(existingItem).forEach(key => {
        mergedObject[key] = existingItem[key] || object[key];
      });

      Object.keys(object).forEach(key => {
        mergedObject[key] = existingItem[key] || object[key];
      });

      accum[existingIndex] = mergedObject;
    } else {
      accum.push(object);
    }
  });

  return accum;
};

let modifyViolationsForResponse = (violations /*, selectedFields*/) => {
  return violations.map(violation => {
    let violationDate = violation.issue_date;
    let violationTime = violation.violation_time;

    let date;
    let dateMatch;

    if (violationDate) {
      dateMatch = violationDate.split('T');
      if (dateMatch) {
        date = dateMatch[0];
      }
    }

    if (violationTime) {
      let isAM = violationTime.includes('A');
      let isPM = violationTime.includes('P');

      let timeMatch = violationTime.match(/\d{4}/);

      let hour;
      let minute;

      if (timeMatch) {
        hour = timeMatch[0].substring(0, 2);
        minute = timeMatch[0].substring(2, 4);

        if (isPM && parseInt(hour) < 12) {
          hour = (parseInt(hour) + 12).toString();
        } else if (isAM && hour == 12) {
          hour = (parseInt(hour) - 12).toString();
        }
      } else if ((timeMatch = violationTime.match(/\d{2}:\d{2}/))) {
        hour = timeMatch[0].split(':')[0];
        minute = timeMatch[0].split(':')[1];
      }

      if (hour) {
        if (isPM && parseInt(hour) < 12) {
          hour = (parseInt(hour) + 12).toString();
        } else if (isAM && hour == 12) {
          hour = (parseInt(hour) - 12).toString();
        }
      }

      // console.log(violation.summons_number)
      // console.log(violation.street_name)
      // console.log(violation.intersecting_street)
      // console.log(' ')

      if (violationDate.match(/\d{2}\/\d{2}\/\d{4}/)) {
        date = date.replace(/\//g, '-');
        violation.formatted_time = new Date(date + ' ' + hour + ':' + minute);
      } else {
        violation.formatted_time = new Date(date + 'T' + hour + ':' + minute);
      }
    } else {
      date = date.replace(/\//g, '-');
      violation.formatted_time = new Date(date + ' 00:00');
    }

    let fined = null;

    if (violation.fine_amount) {
      fined = parseFloat(violation.fine_amount);
    }
    if (violation.penalty_amount) {
      fined += parseFloat(violation.penalty_amount);
    }
    if (violation.interest_amount) {
      fined += parseFloat(violation.interest_amount);
    }
    if (fined) {
      violation.fined = fined;
    }

    if (violation.payment_amount) {
      violation.paid = parseFloat(violation.payment_amount);
    }

    if (violation.reduction_amount) {
      violation.reduced = parseFloat(violation.reduction_amount);
    }

    if (violation.outstanding_amount) {
      violation.outstanding = parseFloat(violation.outstanding_amount);
    }
  });
};

let normalizeViolations = violations => {
  const that = this;

  const returnViolations = [];

  violations.forEach(violation => {
    let promise;

    const newViolation = {
      amount_due: isNaN(parseFloat(violation.amount_due))
        ? null
        : parseFloat(violation.amount_due),
      date_first_observed: violation.date_first_observed || null,
      feet_from_curb: violation.feet_from_curb || null,
      fine_amount: isNaN(parseFloat(violation.fine_amount))
        ? null
        : parseFloat(violation.fine_amount),
      to_hours_in_effect: violation.from_hours_in_effect || null,
      house_number: violation.house_number || null,
      humanized_description:
        fyHumanizedNames[
          violation.violation_description || violation.violation_code
        ] ||
        opacvHumanizedNames[violation.violation] ||
        null,
      interest_amount: isNaN(parseFloat(violation.interest_amount))
        ? null
        : parseFloat(violation.interest_amount),
      intersecting_street: violation.intersecting_street || null,
      issue_date: violation.issue_date || null,
      issuer_code: violation.issuer_code || null,
      issuer_command: violation.issuer_command || null,
      issuer_precinct: isNaN(parseInt(violation.issuer_precinct))
        ? null
        : parseInt(violation.issuer_precinct),
      issuing_agency: issuingAgencies[violation.issuing_agency] || null,
      law_section: violation.law_section || null,
      payment_amount: isNaN(parseFloat(violation.payment_amount))
        ? null
        : parseFloat(violation.payment_amount),
      penalty_amount: isNaN(parseFloat(violation.penalty_amount))
        ? null
        : parseFloat(violation.penalty_amount),
      plate_id: violation.plate_id || violation.plate || null,
      plate_type: violation.plate_type || violation.license_type || null,
      reduction_amount: isNaN(parseFloat(violation.reduction_amount))
        ? null
        : parseFloat(violation.reduction_amount),
      registration_state: violation.registration_state || null,
      street_code1: violation.street_code1 || null,
      street_code2: violation.street_code2 || null,
      street_code3: violation.street_code3 || null,
      street_name: violation.street_name || null,
      sub_division: violation.sub_division || null,
      summons_image: violation.summons_image || null,
      summons_number: violation.summons_number || null,
      //to_hours_in_effect: violation.to_hours_in_effect || null,
      vehicle_body_type: violation.vehicle_body_type || null,
      vehicle_color: violation.vehicle_color || null,
      vehicle_expiration_date: violation.vehicle_expiration_date || null,
      vehicle_make: violation.vehicle_make || null,
      vehicle_year: violation.vehicle_year || null,
      violation_code:
        violation.violation_code ||
        namesToCodes[
          fyHumanizedNames[
            violation.violation_description || violation.violation_code
          ] || opacvHumanizedNames[violation.violation]
        ] ||
        null,
      violation_county:
        counties[violation.violation_county || violation.county] || null,
      violation_in_front_of_or_opposite:
        violation.violation_in_front_of_or_opposite || null,
      violation_legal_code: violation.violation_legal_code || null,
      violation_location: violation.violation_location || null,
      violation_post_code: violation.violation_post_code || null,
      violation_precinct: isNaN(
        parseInt(violation.violation_precinct || violation.precinct)
      )
        ? null
        : parseInt(violation.violation_precinct || violation.precinct),
      violation_time: violation.violation_time || null,
      location: violation.location || null
    };

    let fullStreet;

    let houseNumber = newViolation.house_number;
    let street1 = newViolation.street_name;
    let street2 = newViolation.intersecting_street;

    if (street1 && street2) {
      if (street1.length == 20 && street1.charAt(street1.length - 1) != ' ') {
        fullStreet = street1 + street2;
      } else {
        fullStreet = street1 + ' ' + street2;
      }
    } else if (street1 && houseNumber) {
      if (
        houseNumber.length == 20 &&
        houseNumber.charAt(houseNumber.length - 1) != ' '
      ) {
        fullStreet = houseNumber + street1;
      } else {
        fullStreet = houseNumber + ' ' + street1;
      }
    } else if (street1) {
      fullStreet = street1;
    }

    if (fullStreet) {
      fullStreet = fullStreet
        .split(' ')
        .map(strPart => strPart.toLowerCase())
        .map(strPart => strPart.charAt(0).toUpperCase() + strPart.substr(1))
        .join(' ');
      newViolation.location = fullStreet;
    }

    let lookup_boroughs = false;

    if (newViolation.violation_county == null) {
      if (newViolation.location && lookup_boroughs) {
      } else {
        newViolation.violation_county = 'No Borough Available';
        promise = Promise.resolve(newViolation);
      }

      returnViolations.push(promise);
    } else {
      returnViolations.push(Promise.resolve(newViolation));
    }
  });

  return returnViolations;
};

let queryForLookups = (queryString, queryArgs, callback) => {
  callback(null /* Error */, null /* results */, null /* fields */);
  //connection.query(queryString, queryArgs, callback);
};

let stripReturnData = (obj, selectedFields) => {
  // Return only what we want.
  const fieldNames = Object.getOwnPropertyNames(obj);

  if (selectedFields && Object.keys(selectedFields).length > 0) {
    fieldNames.forEach(field => {
      if (field in selectedFields) {
        if (
          obj[field] != undefined &&
          Object.keys(selectedFields[field]).length > 0
        ) {
          stripReturnData(obj[field], selectedFields[field]);
        }
      } else {
        delete obj[field];
      }
    });
  }
  return obj;
};

/*
var connection = initializeConnection({
  host: 'localhost',
  user: process.env.MYSQL_DATABASE_USER,
  password: process.env.MYSQL_DATABASE_PASSWORD,
  database: 'traffic_violations',
  multipleStatements: true
});
*/

http.createServer(function(req, res) {
  // console.log(req.url);

  if (req.url.match('/webhook/twitter')) {
    if (req.method == 'POST') {
      var body: Array<any> = [];
      var body_str: string;
      req
        .on('data', chunk => {
          body.push(chunk);
        })
        .on('end', () => {
          body_str = Buffer.concat(body).toString();
          // at this point, `body` has the entire request body stored in it as a string

          console.log(body_str);

          const hmac = crypto.createHmac(
            'sha256',
            process.env.TWITTER_CONSUMER_SECRET
          );
          let expectedSHA = 'sha256=' + hmac.update(body_str).digest('base64');

          if (req.headers['x-twitter-webhooks-signature'] === expectedSHA) {
            let json = JSON.parse(body_str);

            if (json.tweet_create_events) {
              console.log('We have a new tweet');

              json.tweet_create_events.forEach(event => {
                if (
                  !event.retweeted_status &&
                  event.user &&
                  event.user.screen_name != 'HowsMyDrivingNY'
                ) {
                  let text;
                  let userMentions = null;
                  let photoURLs = [];

                  if (event.extended_tweet) {
                    let et = event.extended_tweet;
                    text = et.full_text;

                    if (et.entities.user_mentions) {
                      userMentions = et.entities.user_mentions
                        .map(mention =>
                          text.includes(mention.screen_name)
                            ? mention.screen_name
                            : ''
                        )
                        .join(' ')
                        .trim();
                    }

                    if (et.extended_entities) {
                      let ee = et.extended_entities;

                      if (ee.media) {
                        let media = ee.media;

                        media.map(med => {
                          if (med.type == 'photo') {
                            photoURLs.push(med.media_url_https);
                          }
                        });
                      }
                    }
                  } else {
                    text = event.text;

                    if (event.entities) {
                      let entities = event.entities;

                      if (entities.user_mentions) {
                        userMentions = entities.user_mentions
                          .map(mention =>
                            text.includes(mention.screen_name)
                              ? mention.screen_name
                              : ''
                          )
                          .join(' ')
                          .trim();
                      }
                    }

                    if (event.extended_entities) {
                      let ee = event.extended_entities;

                      if (ee.media) {
                        let media = ee.media;

                        media.map(med => {
                          if (med.type == 'photo') {
                            photoURLs.push(med.media_url_https);
                          }
                        });
                      }
                    }
                  }

                  let newEvent = {
                    event_type: 'status',
                    event_id: event.id_str,
                    user_handle: event.user.screen_name,
                    user_id: event.user.id,
                    user_mentions:
                      userMentions == null
                        ? null
                        : userMentions.substring(userMentions.length - 560),
                    event_text: text.substring(text.length - 560),
                    created_at: event.timestamp_ms,
                    in_reply_to_message_id: event.in_reply_to_status_id_str,
                    location:
                      event.place && event.place.full_name
                        ? event.place.full_name
                        : null,
                    responded_to: false
                  };

                  console.log('newEvent: ');
                  console.log(newEvent);

                  /*
                    connection.query(
                      'insert into twitter_events set ?',
                      newEvent,
                      (error, results, fields) => {
                        if (error) throw error;

                        if (results && photoURLs.length > 0) {
                          const insertID = results.insertId;

                          let mediaObjects = photoURLs.map(photoURL => {
                            return {
                              url: photoURL,
                              type: 'photo',
                              twitter_event_id: insertID
                            };
                          });

                          connection.query(
                            'insert into twitter_media_objects set ?',
                            mediaObjects,
                            (error, results, fields) => {
                              if (error) throw error;
                            }
                          );
                        }
                      }
                    );
                    */
                }
              });
            } else if (json.direct_message_events) {
              console.log('We have a new direct message');

              json.direct_message_events.forEach(event => {
                if (event.type === 'message_create') {
                  let message_create_data = event.message_create;
                  let photoURL = null;

                  let recipient_id = message_create_data.target.recipient_id;
                  let sender_id = message_create_data.sender_id;

                  let sender = json.users[sender_id];

                  // photo_url data
                  if (message_create_data.message_data) {
                    let md = message_create_data.message_data;

                    if (md.attachment) {
                      let att = md.attachment;

                      if (att.media) {
                        let media = att.media;

                        if (media.type == 'photo') {
                          photoURL = media.media_url_https;
                        }
                      }
                    }
                  }

                  if (
                    sender &&
                    event.message_create.target.recipient_id ===
                      '976593574732222465'
                  ) {
                    let newEvent = {
                      event_type: 'direct_message',
                      event_id: event.id,
                      user_handle: sender.screen_name,
                      user_id: sender.id,
                      event_text: message_create_data.message_data.text,
                      created_at: event.created_timestamp,
                      in_reply_to_message_id: null,
                      location: null,
                      responded_to: false
                    };

                    /*
                      connection.query(
                        'insert into twitter_events set ?',
                        newEvent,
                        (error, results, fields) => {
                          if (error) throw error;

                          if (results && photoURL != null) {
                            const insertID = results.insertId;

                            let mediaObject = {
                              url: photoURL,
                              type: 'photo',
                              twitter_event_id: insertID
                            };

                            connection.query(
                              'insert into twitter_media_objects set ?',
                              mediaObject,
                              (error, results, fields) => {
                                if (error) throw error;
                              }
                            );
                          }
                        }
                      );
                      */
                  }
                }
              });
            }
          }
        });
    } else if (req.method == 'GET') {
      var query = url.parse(req.url, true).query;

      console.log(query);

      const crc_token = query.crc_token || '';
      // creates HMAC SHA-256 hash from incomming token and your consumer secret
      // construct response data with base64 encoded hash
      const hmac = crypto.createHmac(
        'sha256',
        process.env.TWITTER_CONSUMER_SECRET
      );

      let response = {
        response_token: 'sha256=' + hmac.update(crc_token).digest('base64')
      };

      // returns properly formatted json response
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(JSON.stringify(response));

      return;
    }
  } else if (req.url.match('/api/v1')) {
    var parser = url.parse(req.url, true);

    var query = parser.query;

    var fields = findFilterFields(query.fields);
    var potentialVehicles: Array<string>;

    if (query.plate == undefined) {
      potentialVehicles = [];
    } else if (query.plate instanceof Array) {
      potentialVehicles = query.plate;
    } else {
      potentialVehicles = [query.plate];
    }

    if (query.plate_id instanceof Array || query.state instanceof Array) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.writeHead(422, { 'Content-Type': 'application/javascript' });
      res.end(
        JSON.stringify({
          error:
            "To look up multiple vehicles, use 'plate=<STATE>:<PLATE>', ex: 'api.howsmydrivingny.nyc/api/v1?plate=abc1234:ny'"
        })
      );

      return;
    }

    var plate = (query.plate_id || '').toUpperCase();
    var state = (query.state || '').toUpperCase();
    var plateTypes =
      query.plate_types == undefined
        ? null
        : query.plate_types
            .split(',')
            .map(item => item.toUpperCase().trim())
            .sort();

    if (plate && state) {
      potentialVehicles.push(
        plate + ':' + state + (plateTypes == undefined ? '' : ':' + plateTypes)
      );
    }

    const vehicles = detectVehicles(potentialVehicles);

    let externalData = {
      lookup_source: query.lookup_source,
      fingerprint_id: query.fingerprint_id,
      mixpanel_id: query.mixpanel_id
    };

    if (parser.pathname.match(/\/lookup/)) {
      var apiKey = query.api_key;

      if (apiKey == undefined) {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.writeHead(401, { 'Content-Type': 'application/javascript' });
        res.end(
          JSON.stringify({
            error:
              "You must supply an api key to perform a recorded lookup, e.g. '&api_key=xxx' "
          })
        );

        return;
      } else {
        /*
          let _ = connection.query(
            'select * from authorized_external_users where api_key = ?',
            [apiKey],
            (error, results, fields) => {
              if (error) throw error;

              if (results.length == 0) {
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.writeHead(403, {
                  'Content-Type': 'application/javascript'
                });
                res.end(
                  JSON.stringify({ error: 'You supplied an invalid api key.' })
                );

                return;
              } else {
                //let lookupSource = 'external';
              }
            }
          );
          */
      }
    }

    Promise.all(
      vehicles.map(vehicle => getVehicleResponse(vehicle, fields, externalData))
    ).then(allResponses => {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.writeHead(200, { 'Content-Type': 'application/javascript' });

      res.end(JSON.stringify({ data: allResponses }));

      return;
    });

    // res.setHeader('Content-Type', 'application/json');
    // res.setHeader('Access-Control-Allow-Origin', '*');
    // res.writeHead(200, {'Content-Type': 'application/javascript'});s

    // res.setHeader('Content-Type', 'application/json');
    // res.setHeader('Access-Control-Allow-Origin', '*');
    // res.writeHead(422, {'Content-Type': 'application/javascript'});
    // res.end(JSON.stringify({error: "Missing either plate_id or state, both of which are required, ex: 'api.howsmydrivingny.nyc/api/v1?plate_id=abc1234&state=ny'"}));
  }
});
//.listen(8080);

export function _form_plate_lookup_response_parts(
  borough_data: Array<[string, number]>,
  frequency: number,
  fine_data: INYCFineData,
  plate: string,
  plate_types: Array<string>,
  state: string,
  violations: Array<[string, number]>,
  year_data: Array<[string, number]>,
  camera_streak_data: CameraStreakData = null,
  previous_lookup: any = null
) {
  // response_chunks holds tweet-length-sized parts of the response
  // to be tweeted out or appended into a single direct message.
  let response_chunks: Array<string> = [];
  let violations_string: string = '';

  // Get total violations
  let total_violations: number = violations.length;
  log.debug(`total_violations: ${total_violations}`);

  // Append to initially blank string to build tweet.
  violations_string += L10N.LOOKUP_SUMMARY_STRING.replace('__STATE__', state)
    .replace('__PLATE__', plate)
    .replace('__QUERY_COUNT__', frequency.toString())
    .replace('__PLURALIZE__', L10N.pluralize(frequency));

  // If this vehicle has been queried before...
  if (previous_lookup) {
    let previous_num_violations: number = previous_lookup.num_tickets;

    violations_string += this._create_repeat_lookup_string(
      total_violations - previous_num_violations,
      plate,
      previous_lookup,
      state
    );
  }

  response_chunks = response_chunks.concat(
    _handle_response_part_formation(
      'count',
      violations,
      L10N.LOOKUP_TICKETS_STRING_CONTD.replace(
        '__LICENSE__',
        L10N.format_plate(state, plate)
      ),
      'title',
      'No Year Available',
      L10N.LOOKUP_TICKETS_STRING.replace(
        '__VIOLATION_COUNT__',
        total_violations.toString()
      ),
      L10N.LOOKUP_RESULTS_DETAIL_STRING
    )
  );

  if (borough_data) {
    response_chunks = response_chunks.concat(
      _handle_response_part_formation(
        'count',
        borough_data,
        L10N.LOOKUP_BOROUGH_STRING_CONTD.replace(
          '__LICENSE__',
          L10N.format_plate(state, plate)
        ),
        'title',
        'No Borough Available',
        L10N.LOOKUP_BOROUGH_STRING.replace(
          '__LICENSE__',
          L10N.format_plate(state, plate)
        ),
        L10N.LOOKUP_RESULTS_DETAIL_STRING
      )
    );
  }

  if (fine_data && fine_data.fines_assessed()) {
    let cur_string = 'Known fines for ${L10N.format_plate(state, plate)}:\n\n';

    let max_count_length = fine_data.max_amount().toFixed(2).length;
    let spaces_needed = max_count_length * 2 + 1;

    fine_data.FINE_FIELDS.forEach(fine_type => {
      let amount = fine_data[fine_type] ? fine_data[fine_type] : 0;
      let currency_string: string = amount.toFixed(2);
      let count_length: number = currency_string.length;

      // e.g., if spaces_needed is 5, and count_length is 2, we need
      // to pad to 3.
      let left_justify_amount: number = spaces_needed - count_length;

      // formulate next string part
      let next_part =
        currency_string.lpad(' ', left_justify_amount) +
        '| ' +
        fine_type.replace('_', ' '); // What is .title{}???

      next_part = `${currency_string.lpad(
        '0',
        left_justify_amount
      )}| ${fine_type.replace('_', ' ')}.title()\n"`; // TODO (GlenBikes): What is .title() on a string?

      // determine current string length if necessary
      let potential_response_length = (
        MAX_USERNAME_LENGTH +
        ' ' +
        cur_string +
        next_part
      ).length;

      // If username, space, violation string so far and new part are less or
      // equal than 280 characters, append to existing tweet string.
      if (
        potential_response_length <= twitter_constants.MAX_TWITTER_STATUS_LENGTH
      ) {
        cur_string += next_part;
      } else {
        response_chunks.push(cur_string);

        cur_string = "Known fines for #{}_{}, cont'd:\n\n";
        cur_string += next_part;
      }
    });

    // add to container
    response_chunks.push(cur_string);
  }

  if (camera_streak_data) {
    if (camera_streak_data.max_streak && camera_streak_data.max_streak >= 5) {
      // formulate streak string
      let streak_string =
        `Under @bradlander's proposed legislation, ` +
        `this vehicle could have been booted or impounded ` +
        `due to its ${camera_streak_data.max_streak} camera violations ` +
        `(>= 5/year) from ${camera_streak_data.min_streak_date} ` +
        `to ${camera_streak_data.max_streak_date}.\n`;

      // add to container
      response_chunks.push(streak_string);
    }
  }

  // Send it back!
  return response_chunks;
}

function _handle_response_part_formation(
  count: string,
  collection: Record<string, any>,
  continued_format_string: string,
  description: string,
  default_description: string,
  prefix_format_string: string,
  result_format_string: string
) {
  // collect the responses
  let response_container: Array<string> = [];

  let cur_string = '';

  if (prefix_format_string) {
    cur_string += prefix_format_string;
  }

  let max_item_count = 0;
  collection.forEach(item => {
    if (item[count] > max_item_count) {
      max_item_count = item[count];
    }
  });

  let max_count_length = max_item_count.toString().length;
  let spaces_needed = max_count_length * 2 + 1;

  // Grab item
  collection.forEach(item => {
    // Titleize for readability.
    log.info(`About to call title() on ${item[description]}.`);
    let violation_description = item[description]
      ? item[description].title()
      : '';
    log.info(`Called title() on ${item[description]}.`);

    // Use a default description if need be
    if (violation_description.length == 0) {
      violation_description = default_description;
    }

    let violation_count = item[count] ? item[count] : 0;
    let count_length = violation_count.toString().length;

    // e.g., if spaces_needed is 5, and count_length is 2, we need to
    // pad to 3.
    let left_justify_amount = spaces_needed - count_length;

    // formulate next string part
    let next_part = result_format_string
      .replace(
        '__VIOLATION_COUNT',
        violation_count.toString().lpad(' ', left_justify_amount)
      )
      .replace('__VIOLATION_DESCRIPTION__', violation_description);

    // determine current string length
    let potential_response_length =
      `${cur_string}${next_part}`.length + MAX_USERNAME_LENGTH;

    // If username, space, violation string so far and new part are less or
    // equal than 280 characters, append to existing tweet string.
    if (
      potential_response_length <= twitter_constants.MAX_TWITTER_STATUS_LENGTH
    ) {
      cur_string += next_part;
    } else {
      response_container.push(cur_string);

      if (continued_format_string) {
        cur_string = continued_format_string;
      } else {
        cur_string = '';
      }

      cur_string += next_part;
    }
  });

  // If we finish the list with a non-empty string,
  // append that string to response parts
  if (cur_string.length != 0) {
    // Append ready string into parts for response.
    response_container.push(cur_string);
  }

  // Return parts
  return response_container;
}
