import { IUIDable } from "@ts-core/common";
import { CoinBalance, ICoinBalance } from "./CoinBalance";
import { IsInt, Min, Matches } from 'class-validator';
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

    @Matches(CoinUtil.COIN_ID_REG_EXP)
    public coinId: string;

    @Type(() => CoinBalance)
    public balance: CoinBalance;

    @IsInt()
    @Min(0)
    public decimals: number;

    @Matches(CoinUtil.OWNER_UID_REG_EXP)
    public ownerUid: string;
}


export interface ICoin<T = string, B = ICoinBalance> extends IUIDable {
    uid: string;
    coinId: T;
    balance: B;
    decimals: number;
    ownerUid: string;
}
