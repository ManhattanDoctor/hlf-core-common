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
export class UserForbiddenError extends Error<void> {
    constructor(message: string, details?: any) {
        super(ErrorCode.USER_ROLE_FORBIDDEN, message, details)
    }
}
export class ObjectNotFoundError extends Error<void> {
    constructor(item: UID, message?: string) {
        super(ErrorCode.OBJECT_NOT_FOUND, !_.isNil(message) ? message : `Ledger object "${getUid(item)}" is nil`)
    }
}

export enum ErrorCode {
    OBJECT_NOT_FOUND = 'HLF_OBJECT_NOT_FOUND',
    COIN_AMOUNT_ERROR = 'HLF_COIN_AMOUNT_ERROR',
    USER_ROLE_FORBIDDEN = 'HLF_USER_ROLE_FORBIDDEN',
}
