import { IsString } from 'class-validator';

export interface ICoinAmount {
    value: string;
    coinUid: string;
}

export class CoinAmount implements ICoinAmount {
    @IsString()
    value: string;

    @IsString()
    coinUid: string;
}
