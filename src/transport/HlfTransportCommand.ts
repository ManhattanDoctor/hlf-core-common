import { TransportCommandAsync, TransportCommand } from '@ts-core/common';

export class HlfTransportCommand<T> extends TransportCommand<T> {
    constructor(name: string, request?: T, id?: string, public isReadonly?: boolean) {
        super(name, request, id);
        this.isReadonly = isReadonly;
    }
}

export class HlfTransportCommandAsync<U, V> extends TransportCommandAsync<U, V> {
    constructor(name: string, request?: U, id?: string, public isReadonly?: boolean) {
        super(name, request, id);
        this.isReadonly = isReadonly;
    }
}
