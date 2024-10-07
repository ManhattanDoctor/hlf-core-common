import { ClassType, getUid, MathUtil, MathUtilConfig, UID } from '@ts-core/common';
import { ICoin } from './Coin';
import { CoinBalance } from './CoinBalance';
import { ICoinAmount } from './CoinAmount';
import * as _ from 'lodash';

export class CoinUtil {

    // --------------------------------------------------------------------------
    //
    //  Static Properties
    //
    // --------------------------------------------------------------------------

    public static PREFIX = 'coin';
    public static COIN_ID_PATTERN = '[A-Z]{1,10}';
    public static DECIMALS_PATTERN = '[0-9]*';
    public static OWNER_UID_PATTERN = '[A-Za-z0-9/]*';
    public static OBJECT_UID_PATTERN = '[A-Za-z0-9/]*';

    public static UID_REG_EXP = new RegExp(`^${CoinUtil.PREFIX}/${CoinUtil.OWNER_UID_PATTERN}/${CoinUtil.DECIMALS_PATTERN}/${CoinUtil.COIN_ID_PATTERN}$`);
    public static COIN_ID_REG_EXP = new RegExp(`^${CoinUtil.COIN_ID_PATTERN}$`);
    public static OWNER_UID_REG_EXP = new RegExp(`^${CoinUtil.OWNER_UID_PATTERN}$`);
    public static OBJECT_UID_REG_EXP = new RegExp(`^${CoinUtil.DECIMALS_PATTERN}$`);
    public static DECIMALS_UID_REG_EXP = new RegExp(`^${CoinUtil.OBJECT_UID_PATTERN}$`);

    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static create<T extends ICoin>(classType: ClassType<T>, coinId: string, decimals: number, owner: UID): T {
        let item = new classType();
        item.uid = CoinUtil.createUid(coinId, decimals, owner);
        item.balance = CoinBalance.create();
        return item;
    }

    public static createUid(coinId: string, decimals: number, owner: UID): string {
        return `${CoinUtil.PREFIX}/${getUid(owner)}/${decimals}/${coinId}`;
    }

    public static createAmount(value: string, coin: ICoin): ICoinAmount {
        return { coinUid: coin.uid, value };
    }

    public static getCoinId<T = string>(coin: UID): T {
        let { coinId } = CoinUtil.decomposeUid(coin);
        return coinId as T;
    }

    public static getOwnerUid(coin: UID): string {
        let { ownerUid } = CoinUtil.decomposeUid(coin);
        return ownerUid;
    }

    public static getCoinDecimals(coin: UID): number {
        let { decimals } = CoinUtil.decomposeUid(coin);
        return decimals;
    }

    private static decomposeUid(coin: UID): IUidDecomposition {
        let item = { coinId: null, decimals: null, ownerUid: null };
        let uid = getUid(coin);
        if (!_.isEmpty(uid)) {
            let array = uid.split('/');
            let length = array.length;
            item.coinId = array[length - 1];
            item.ownerUid = `${array[1]}/${array[2]}`;
            item.decimals = parseInt(array[length - 2])
        }
        return item;
    }

    // --------------------------------------------------------------------------
    //
    // 	Transform Methods
    //
    // --------------------------------------------------------------------------

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

    public static toPercent(amount: string, total: string): number {
        return MathUtil.toNumber(MathUtil.multiply('100', MathUtil.divide(amount, total)));
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

interface IUidDecomposition {
    coinId: string;
    decimals: number;
    ownerUid: string;
}

