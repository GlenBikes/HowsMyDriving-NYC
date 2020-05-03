import { DumpObject } from 'howsmydriving-utils';

const assert = require('assert');

import { getVehicleResponse } from '../src/server';

import { log } from '../src/logging';

describe('NY Lookup', () => {
  describe('Check NY:HSZ6132', () => {
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
        assert(response.vehicle.violations.length === 54);
        assert(
          response.vehicle.violations.length ===
            response.vehicle.violations_count
        );
      });
    });
  });
});
