import { IUser } from '../user';
import { IStub } from './IStub';
import * as _ from 'lodash';

export interface IStubHolder {
    readonly stub: IStub;
    destroyAsync(): Promise<void>;
}

export interface IUserStubHolder<T extends IUser = IUser> extends IStubHolder {
    user?: T;
}
