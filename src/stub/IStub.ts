import { IPageBookmark, IPaginationBookmark, ClassType, ITransportEvent } from '@ts-core/common';
import { StateQueryIterator, StateQueryResponse } from './IShim';

export interface IStub {
    readonly userId: string;
    readonly userPublicKey: string;

    readonly requestId: string;
    readonly transactionHash: string;
    readonly transactionDate: Date;

    loadKV(iterator: StateQueryIterator): Promise<Array<IKeyValue>>;
    getPaginatedKV(request: IPageBookmark, start: string, finish: string): Promise<IPaginationBookmark<IKeyValue>>;

    getState<U>(key: string, type?: ClassType<U>): Promise<U>;
    getStateRaw(key: string): Promise<string>;

    getStateByRange(startKey: string, endKey: string): Promise<StateQueryIterator>;
    getStateByRangeWithPagination(startKey: string, endKey: string, pageSize: number, bookmark?: string): Promise<StateQueryResponse<StateQueryIterator>>;

    putState<U>(key: string, value: U, options: IPutStateOptions): Promise<U>;
    putStateRaw(key: string, value: string): Promise<void>;

    hasState(key: string): Promise<boolean>;
    removeState(key: string): Promise<void>;

    dispatch<T>(event: ITransportEvent<T>): Promise<void>;
    destroyAsync(): Promise<void>;
}

export interface IPutStateOptions {
    isSortKeys?: boolean;
    isValidate?: boolean;
    isTransform?: boolean;
}

export interface IKeyValue {
    key: string;
    value?: string;
}
