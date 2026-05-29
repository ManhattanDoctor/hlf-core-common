import { IsOptional, IsString } from "class-validator";

export interface IInitiatedDto {
    initiatorUid?: string;
}

export class InitiatedDto implements IInitiatedDto {
    @IsOptional()
    @IsString()
    public initiatorUid?: string;
}