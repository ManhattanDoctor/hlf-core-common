export type StateQueryIterator = CommonIterator<KV>;

export interface StateQueryResponse<T> {
    iterator: T;
    metadata: QueryResponseMetadata;
}

interface CommonIterator<T> {
    next(): Promise<NextResult<T>>;
    close(): Promise<void>;
}

interface QueryResponseMetadata {
    bookmark: string;
    fetchedRecordsCount: number;
}

interface NextResult<T> {
    value: T;
    done: boolean;
}

interface KV {
    key: string;
    value: Uint8Array;
    namespace: string;
}
