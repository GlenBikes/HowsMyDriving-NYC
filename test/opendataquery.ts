const assert = require('assert');

import { DumpObject } from 'howsmydriving-utils';

import { getVehicleResponse } from '../src/server';

import { log } from '../src/logging';

describe('NY Lookup', () => {
  it('return citations with the right keys for NY:HSZ6132', async () => {
    var vehicle = {
      state: 'NY',
      plate: 'HSZ6132',
      types: null
    };

    let external_data = {
      lookup_source: 'api',
      fingerprint_id: null,
      mixpanel_id: null
    };

    getVehicleResponse(vehicle, null, external_data).then(response => {
      log.info(
        `response.vehicle.violations.length: ${response.vehicle.violations.length}`
      );
      assert(response.vehicle.violations.length === 51);
      assert(
        response.vehicle.violations.length === response.vehicle.violations_count
      );
    });

    assert(true);
  });
});
