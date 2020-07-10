import CONSTANTS from '../utils/constants';
import { Logger } from '../utils/logger';
import { MarkerConfiguration as MarkerConfiguration } from './markerConfiguration';
import { Flaggable } from '../macros/macroMarkerFlags';

export class MarkerConfigurationFlags {
    private key = 'activeData';
    constructor(private logger: Logger, private macro: Flaggable) { }

    getData(): MarkerConfiguration {
        return this.macro.getFlag(CONSTANTS.module.name, this.key) || {};
    }

    setData(data: MarkerConfiguration): Promise<Flaggable> {
        return this.macro.unsetFlag(CONSTANTS.module.name, this.key)
            .then(entity => entity.setFlag(CONSTANTS.module.name, this.key, data));
    }
}
