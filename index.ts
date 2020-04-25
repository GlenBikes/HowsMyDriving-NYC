import { __MODULE_NAME__, __MODULE_VERSION__ } from './src/logging';
import { log } from './src/logging';

export { Factory } from './src/newyorkcity';

log.info(
  `howsmydriving-nyc: Module ${__MODULE_NAME__} version '${__MODULE_VERSION__}' loaded.`
);
