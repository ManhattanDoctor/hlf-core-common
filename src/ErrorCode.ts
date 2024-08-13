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

export class UserRoleForbiddenError extends Error<IUserRoleForbiddenErrorDetails> {
    constructor(user: UID, details: IUserRoleForbiddenErrorDetails) {
        super(ErrorCode.USER_ROLE_FORBIDDEN, `User "${getUid(user)}" roles forbidden`, details)
    }
}
export interface IUserRoleForbiddenErrorDetails {
    has: Array<string>;
    required: Array<string>;
}

export enum ErrorCode {
    COIN_AMOUNT_ERROR = 'HLF_COIN_AMOUNT_ERROR',
    USER_ROLE_FORBIDDEN = 'HLF_USER_ROLE_FORBIDDEN',
}
