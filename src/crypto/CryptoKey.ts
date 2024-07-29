import { IsString } from 'class-validator';
import { ICryptoKey } from './ICryptoKey';

export class CryptoKey implements ICryptoKey {
    // --------------------------------------------------------------------------
    //
    //  Static Properties
    //
    // --------------------------------------------------------------------------

    public static PREFIX = 'cryptoKey';

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    @IsString()
    value: string;

    @IsString()
    algorithm: string;
}
