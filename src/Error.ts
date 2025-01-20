import { ExtendedError } from '@ts-core/common';
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

export class CoinAmountMustBeGranterThanZeroError extends Error<void> {
    constructor(message: string, details?: any) {
        super(ErrorCode.COIN_AMOUNT_MUST_BE_GRANTER_THAN_ZERO, message, details)
    }
}
export class CoinBalanceMustBeGranterThanAmountError extends Error<void> {
    constructor(message: string, details?: any) {
        super(ErrorCode.COIN_BALANCE_MUST_BE_GRANTER_THAN_AMOUNT, message, details)
    }
}

export enum ErrorCode {
    COIN_AMOUNT_MUST_BE_GRANTER_THAN_ZERO = 'COIN_AMOUNT_MUST_BE_GRANTER_THAN_ZERO',
    COIN_BALANCE_MUST_BE_GRANTER_THAN_AMOUNT = 'COIN_BALANCE_MUST_BE_GRANTER_THAN_AMOUNT',
}
