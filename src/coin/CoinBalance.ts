import { IsNumberString } from 'class-validator';
import { MathUtil } from '@ts-core/common';
import { CoinAccount, ICoinAccount } from './CoinAccount';
import * as _ from 'lodash';

export class CoinBalance extends CoinAccount {

    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static create(): CoinBalance {
        let item = new CoinBalance();
        item.emitted = item.burned = item.held = item.inUse = '0';
        return item;
    }

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    @IsNumberString()
    public burned: string;

    @IsNumberString()
    public emitted: string;

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public emit(amount: string): void {
        super.emit(amount);
        this.emitted = MathUtil.add(this.emitted, amount);
    }

    public burn(amount: string): void {
        super.burn(amount);
        this.burned = MathUtil.add(this.burned, amount);
    }

    public emitHeld(amount: string): void {
        super.emitHeld(amount);
        this.emitted = MathUtil.add(this.emitted, amount);
    }

    public burnHeld(amount: string): void {
        super.burnHeld(amount);
        this.burned = MathUtil.add(this.burned, amount);
    }
}

export interface ICoinBalance extends ICoinAccount {
    burned: string;
    emitted: string;
}
