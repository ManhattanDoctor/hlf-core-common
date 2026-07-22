import { ExtendedError } from '@ts-core/common';
import * as _ from 'lodash';

export class Error<T = void> extends ExtendedError<T, ErrorCode> {
    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static instanceOf(item: any): item is Error {
        return item instanceof Error || Object.values(ErrorCode).includes(item.code);
    }

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(code: ErrorCode, public details: T, public status: number = ExtendedError.HTTP_CODE_BAD_REQUEST) {
        super('', code, details);
        this.message = this.constructor.name;
    }
}

export class StateKeySegmentInvalidError extends Error<IInvalidValue<string>> {
    constructor(details: IInvalidValue<string>) {
        super(ErrorCode.STATE_KEY_SEGMENT_INVALID, details)
    }
}

export interface IInvalidValue<T = any> {
    name?: string;
    value: T | Array<T>;
    expected?: T | Array<T>;
}

export enum ErrorCode {
    STATE_KEY_SEGMENT_INVALID = 'HLF_STATE_KEY_SEGMENT_INVALID',
}
