import CONSTANTS from '../utils/constants';
import { Logger } from '../utils/logger';
import { MarkerConfiguration as MarkerConfiguration } from './markerConfiguration';
import { Flaggable } from '../macros/macroMarkerFlags';

export class MarkerConfigurationFlags {
    private key = 'activeData';
    constructor(private logger: Logger, private macro: Flaggable) { }

    getData(): MarkerConfiguration {
        // duplicate to prevent changing the data in the same reference
        // Foundry will not update data that is the same on the entity
        const flags: MarkerConfiguration = this.macro.getFlag(CONSTANTS.module.name, this.key) || {};
        return duplicate(flags);
    }

    setData(data: MarkerConfiguration): Promise<Flaggable> {
        return this.macro.setFlag(CONSTANTS.module.name, this.key, data);
    }
}
