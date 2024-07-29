import { IUIDable } from '@ts-core/common';
import { ICryptoKey } from '../crypto';
import * as _ from 'lodash';

export interface IUser<S = string, R = string> extends IUIDable {
    uid: string;
    roles?: Array<R>;
    status: S;
    createdDate: Date;
    description: string;
    cryptoKey?: ICryptoKey;
}
