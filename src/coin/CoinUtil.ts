import { ClassType, getUid, MathUtil, MathUtilConfig, UID } from '@ts-core/common';
import { Coin, ICoin } from './Coin';
import { CoinBalance } from './CoinBalance';
import * as _ from 'lodash';
import { ICoinAmount } from './CoinAmount';

export class CoinUtil {

    // --------------------------------------------------------------------------
    //
    //  Static Properties
    //
    // --------------------------------------------------------------------------

    public static PREFIX = 'coin';
    public static COIN_ID_PATTERN = '[A-Z]{1,10}';
    public static OWNER_UID_PATTERN = '[A-Za-z0-9/]*';
    public static OBJECT_UID_PATTERN = '[A-Za-z0-9/]*';

    public static UID_REG_EXP = new RegExp(`^${CoinUtil.PREFIX}/${CoinUtil.OWNER_UID_PATTERN}/${CoinUtil.COIN_ID_PATTERN}$`);
    public static COIN_ID_REG_EXP = new RegExp(`^${CoinUtil.COIN_ID_PATTERN}$`);
    public static OWNER_UID_REG_EXP = new RegExp(`^${CoinUtil.OWNER_UID_PATTERN}$`);
    public static OBJECT_UID_REG_EXP = new RegExp(`^${CoinUtil.OBJECT_UID_PATTERN}$`);

    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static create<T extends ICoin>(classType: ClassType<T>, coinId: string, decimals: number, owner: UID): T {
        let item = new classType();
        item.uid = CoinUtil.createUid(coinId, owner);
        item.coinId = coinId;
        item.decimals = decimals;
        item.ownerUid = getUid(owner);

        let balance = item.balance = new CoinBalance();
        balance.emitted = balance.burned = balance.held = balance.inUse = '0';
        return item;
    }

    public static createUid(coinId: string, owner: UID): string {
        return `${CoinUtil.PREFIX}/${getUid(owner)}/${coinId}`;
    }

    public static createAmount(value: string, coin: ICoin): ICoinAmount {
        return { coinUid: coin.uid, decimals: coin.decimals, value };
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

