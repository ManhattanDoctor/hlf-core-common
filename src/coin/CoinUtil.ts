import { ClassType, getUid, MathUtil, MathUtilConfig, UID } from '@ts-core/common';
import { ICoin } from './Coin';
import * as _ from 'lodash';

export class CoinUtil {

    // --------------------------------------------------------------------------
    //
    //  Static Properties
    //
    // --------------------------------------------------------------------------

    public static PREFIX = 'coin';
    public static COIN_ID_PATTERN = `[A-Z]{1,35}`;

    public static UID_REG_EXP = new RegExp(`^${CoinUtil.PREFIX}/[A-Za-z0-9]/${CoinUtil.COIN_ID_PATTERN}$`);
    public static COIN_ID_REG_EXP = new RegExp(`^${CoinUtil.COIN_ID_PATTERN}$`);

    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static create<T extends ICoin>(classType: ClassType<T>, owner: UID, coinId: string, decimals: number): T {
        let item = new classType();
        item.uid = CoinUtil.createUid(owner, coinId);
        item.coinId = coinId;
        item.decimals = decimals;
        item.ownerUid = getUid(owner);
        return item;
    }

    public static createUid(owner: UID, coinId: string): string {
        return `${CoinUtil.PREFIX}/${getUid(owner)}/${coinId}`;
    }

    public static getCoinId<T = string>(coin: UID): T {
        let uid = getUid(coin);
        return !_.isNil(uid) ? _.last(uid.split('/')) as T : null;
    }

    // --------------------------------------------------------------------------
    //
    // 	Transform Methods
    //
    // --------------------------------------------------------------------------

    public static toPercent(amount: string, total: string): number {
        return MathUtil.toNumber(MathUtil.multiply('100', MathUtil.divide(amount, total)));
    }

    public static toCent(amount: string, decimals: number): string {
        if (_.isNil(amount) || _.isNil(decimals)) {
            return null;
        }
        CoinUtil.config = { precision: 100, toExpPos: 100, toExpNeg: -100 };
        let constructor = MathUtil.create();
        let value = MathUtil.pow('10', decimals.toString());
        let item = new constructor(MathUtil.multiply(amount, value)).toDecimalPlaces(0).toString();
        CoinUtil.config = null;
        return item;
    }

    public static fromCent(amount: string, decimals: number): string {
        if (_.isNil(amount) || _.isNil(decimals)) {
            return null;
        }
        CoinUtil.config = { precision: 100, toExpPos: 100, toExpNeg: -100 };
        let value = MathUtil.pow('10', decimals.toString());
        let item = MathUtil.divide(amount, value);
        CoinUtil.config = null;
        return item;
    }

    // --------------------------------------------------------------------------
    //
    // 	Private Static Methods
    //
    // --------------------------------------------------------------------------

    private static get config(): MathUtilConfig {
        return MathUtil.config;
    }

    private static set config(item: MathUtilConfig) {
        MathUtil.config = _.isNil(item) ? { toExpNeg: -100, toExpPos: 100, precision: 100 } : item;
    }
}

