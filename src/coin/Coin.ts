import { IUIDable } from "@ts-core/common";
import { ICoinBalance } from "./CoinBalance";
import * as _ from 'lodash';

export interface ICoin<T = string, B = ICoinBalance> extends IUIDable {
    uid: string;
    coinId: T;
    balance: B;
    decimals: number;
    ownerUid: string;
}
