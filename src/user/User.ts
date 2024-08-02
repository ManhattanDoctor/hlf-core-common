import { IUIDable } from '@ts-core/common';
import { ICryptoKey } from '../crypto';
import * as _ from 'lodash';

export interface IUser<S = string, R = string> extends IUIDable {
    uid: string;
    created: Date;

    roles?: Array<R>;
    status?: S;
    cryptoKey?: ICryptoKey;
    description?: string;
}
