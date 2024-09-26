import { IsString, IsInt, IsPositive } from 'class-validator';

export interface ICoinAmount {
    value: string;
    coinUid: string;
    decimals: number;
}

export class CoinAmount implements ICoinAmount {
    @IsString()
    value: string;

    @IsString()
    coinUid: string;

    @IsInt()
    @IsPositive()
    decimals: number;
}
