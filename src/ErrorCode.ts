import { ExtendedError, getUid, UID } from '@ts-core/common';
import * as _ from 'lodash';

export class Error<C, D = any> extends ExtendedError<D, C | ErrorCode> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(code: C | ErrorCode, message: string = '', details?: D) {
        super(message, code, details);
    }
}

export class CoinAmountError extends Error<void> {
    constructor(message: string, details?: any) {
        super(ErrorCode.COIN_AMOUNT_ERROR, message, details)
    }
}

export enum ErrorCode {
    COIN_AMOUNT_ERROR = 'COIN_AMOUNT_ERROR'
}
