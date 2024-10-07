import { IUIDable } from "@ts-core/common";
import { CoinBalance, ICoinBalance } from "./CoinBalance";
import { IsDefined, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { CoinUtil } from "./CoinUtil";
import * as _ from 'lodash';

export class Coin implements ICoin {
    // --------------------------------------------------------------------------
    //
    //  Static Properties
    //
    // --------------------------------------------------------------------------

    public static PREFIX = 'coin';

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    @Matches(CoinUtil.UID_REG_EXP)
    public uid: string;

    @Type(() => CoinBalance)
    @IsDefined()
    public balance: CoinBalance;
}


export interface ICoin<T = ICoinBalance> extends IUIDable {
    uid: string;
    balance: T;
}
