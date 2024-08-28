import { IsString } from 'class-validator';

export interface ICoinAmount {
    value: string;
    coinId: string;
}

export class CoinAmount implements ICoinAmount {
    @IsString()
    value: string;

    @IsString()
    coinId: string;
}
