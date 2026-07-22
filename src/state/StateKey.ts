import { getUid, UID } from '@ts-core/common';
import { StateKeySegmentInvalidError } from '../Error';
import * as _ from 'lodash';

export class StateKey {
    // --------------------------------------------------------------------------
    //
    //  Static Properties
    //
    // --------------------------------------------------------------------------

    public static SEGMENT = '~';
    public static NAMESPACE = ':';

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    protected namespace: string;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(namespace: string) {
        this.namespace = namespace;
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected getSegment(item: UID): string {
        let value = getUid(item);
        if (_.isEmpty(value) || value.includes(StateKey.SEGMENT) || value.includes(StateKey.NAMESPACE)) {
            throw new StateKeySegmentInvalidError({ value, expected: `without "${StateKey.SEGMENT}" and "${StateKey.NAMESPACE}"` });
        }
        return value;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public key(...items: Array<UID>): string {
        let value = `${this.namespace}${StateKey.NAMESPACE}`;
        return !_.isEmpty(items) ? `${value}${items.map(item => this.getSegment(item)).join(StateKey.SEGMENT)}` : value;
    }

    public prefix(...items: Array<UID>): string {
        let value = this.key(...items);
        return !_.isEmpty(items) ? `${value}${StateKey.SEGMENT}` : value;
    }

    public isKey(item: UID): boolean {
        return getUid(item).startsWith(this.key());
    }

    public decompose(item: UID): Array<string> {
        let value = getUid(item);
        return this.isKey(value) ? value.substring(this.key().length).split(StateKey.SEGMENT) : null;
    }
}
