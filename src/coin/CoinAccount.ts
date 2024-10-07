
import { getUid, MathUtil, UID, IUIDable } from '@ts-core/common';
import { IsString, IsNumberString } from 'class-validator';
import { CoinAmountError } from '../ErrorCode';
import * as _ from 'lodash';

export class CoinAccount implements ICoinAccount {
    // --------------------------------------------------------------------------
    //
    //  Static Properties
    //
    // --------------------------------------------------------------------------

    public static PREFIX = '→coin~account';

    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static create(coin: UID, owner: UID): CoinAccount {
        let item = new CoinAccount();
        item.uid = CoinAccount.createUid(coin, owner);
        item.held = item.inUse = '0';
        item.ownerUid = getUid(owner);
        return item;
    }

    public static createUid(coin: UID, owner?: UID): string {
        let item = `${CoinAccount.PREFIX}:${getUid(coin)}`;
        return !_.isNil(owner) ? `${item}~${getUid(owner)}` : item;
    }

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    @IsString()
    public uid: string;

    @IsNumberString()
    public held: string;

    @IsNumberString()
    public inUse: string;

    @IsString()
    public ownerUid: string;

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public emit(amount: string): void {
        if (MathUtil.lessThanOrEqualTo(amount, '0')) {
            throw new CoinAmountError('Emitting amount must be granter than zero', amount);
        }
        this.inUse = MathUtil.add(this.inUse, amount);
    }

    public emitHeld(amount: string): void {
        if (MathUtil.lessThanOrEqualTo(amount, '0')) {
            throw new CoinAmountError('Emitting amount must be granter than zero', amount);
        }
        this.held = MathUtil.add(this.held, amount);
    }

    public burn(amount: string): void {
        if (MathUtil.lessThanOrEqualTo(amount, '0')) {
            throw new CoinAmountError('Burning amount must be granter than zero', amount);
        }
        if (MathUtil.greaterThan(amount, this.inUse)) {
            throw new CoinAmountError('Burning amount must be less than "isUse" balance', { inUse: this.inUse, amount });
        }
        this.inUse = MathUtil.subtract(this.inUse, amount);
    }

    public burnHeld(amount: string): void {
        if (MathUtil.lessThanOrEqualTo(amount, '0')) {
            throw new CoinAmountError('Burning amount must be granter than zero', amount);
        }
        if (MathUtil.greaterThan(amount, this.held)) {
            throw new CoinAmountError('Burning amount must be less than "held" balance', { held: this.held, amount });
        }
        this.held = MathUtil.subtract(this.held, amount);
    }

    public hold(amount: string): void {
        if (MathUtil.lessThanOrEqualTo(amount, '0')) {
            throw new CoinAmountError('Holding amount must be granter than zero', amount);
        }
        if (MathUtil.greaterThan(amount, this.inUse)) {
            throw new CoinAmountError('Coin account "inUse" balance less than holding amount', { inUse: this.inUse, amount });
        }
        this.held = MathUtil.add(this.held, amount);
        this.inUse = MathUtil.subtract(this.inUse, amount);
    }

    public unhold(amount: string): void {
        if (MathUtil.lessThanOrEqualTo(amount, '0')) {
            throw new CoinAmountError('Unholding amount must be granter than zero',);
        }
        if (MathUtil.greaterThan(amount, this.held)) {
            throw new CoinAmountError('Coin account "held" balance less than unholding amount', { held: this.held, amount });
        }
        this.held = MathUtil.subtract(this.held, amount);
        this.inUse = MathUtil.add(this.inUse, amount);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public getTotal(): string {
        return MathUtil.add(this.held, this.inUse);
    }

    public isEmpty(): boolean {
        let item = this.getTotal();
        return _.isNil(item) || MathUtil.equals(item, '0');
    }
}

export interface ICoinAccount extends IUIDable {
    uid: string;
    held: string;
    inUse: string;
    ownerUid: string;

    isEmpty(): boolean;
    getTotal(): string;
    
    emit(amount: string): void;
    emitHeld(amount: string): void;
    
    burn(amount: string): void;
    burnHeld(amount: string): void;

    hold(amount: string): void;
    unhold(amount: string): void;
}

