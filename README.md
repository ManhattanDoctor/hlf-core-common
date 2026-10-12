**English** · [Русский](./README.ru.md)

# @hlf-core/common

> TypeScript library with the base classes of the hlf-core ecosystem: state keys, identifiers, transport commands

[![npm version](https://img.shields.io/npm/v/@hlf-core/common.svg)](https://www.npmjs.com/package/@hlf-core/common)
[![Docs](https://img.shields.io/badge/docs-hlf.gnosisai.ru-1f6feb)](https://hlf.gnosisai.ru/docs/packages/common)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

Full documentation: https://hlf.gnosisai.ru/docs/packages/common

Base classes and utilities shared by every package in the `@hlf-core` ecosystem: Hyperledger Fabric state key construction, user identifiers, cryptographic keys, transport commands, and domain errors.

The package depends neither on `fabric-shim` nor on the chaincode runtime, so it works identically in chaincode, backend, and frontend.

## Table of Contents

- [Overview](#overview)
  - [Key Features](#key-features)
- [Installation](#installation)
  - [Dependencies](#dependencies)
- [Quick Start](#quick-start)
- [State Keys](#state-keys)
  - [How Fabric storage works](#how-fabric-storage-works)
  - [Why a prefix must end with a separator](#why-a-prefix-must-end-with-a-separator)
- [API Reference](#api-reference)
  - [StateKey](#statekey)
  - [UserUtil](#userutil)
  - [IUser](#iuser)
  - [CryptoKey](#cryptokey)
  - [HlfTransportCommand](#hlftransportcommand)
  - [InitiatedDto](#initiateddto)
  - [Error](#error)
- [Usage Examples](#usage-examples)
- [Project Structure](#project-structure)
- [Changelog](#changelog)

## Overview

`@hlf-core/common` is the lowest layer of the ecosystem. It holds what every other package needs and what is not tied to the runtime environment: the rules for building state keys, the user identifier schema, the cryptographic key description, the base transport commands, and the domain error framework.

### Key Features

- **Unified state key construction** — `StateKey` builds keys and search prefixes by the same rules, with a mandatory separator and segment validation
- **User identifiers** — `UserUtil` creates and validates a `uid` of the form `user_<time>_<hash>`
- **Cryptographic keys** — `CryptoKey` describes a "value + algorithm" pair with validation
- **Transport commands** — `HlfTransportCommand` and `HlfTransportCommandAsync` with an `isReadonly` flag to separate read requests from write requests
- **Operation initiator** — `InitiatedDto` adds an `initiatorUid` field to any DTO
- **Domain errors** — a base `Error` with `ErrorCode` codes, compatible with `ExtendedError` from `@ts-core/common`

## Installation

```bash
npm install @hlf-core/common
```

### Dependencies

```json
{
    "@ts-core/common": "~3.0.57"
}
```

The package ships in two builds — ESM (`./esm/public-api.js`) and CommonJS (`./cjs/public-api.js`) — and the right one is selected automatically through the `exports` field.

## Quick Start

```ts
import { StateKey, UserUtil } from '@hlf-core/common';

// key namespace for accounts
let key = new StateKey('→coin~account');

// exact record key
let uid = key.key('coin_user_X_0_RUB', 'user_00000000000000_abc');
// →coin~account:coin_user_X_0_RUB~user_00000000000000_abc

// prefix to enumerate every account of a coin
let prefix = key.prefix('coin_user_X_0_RUB');
// →coin~account:coin_user_X_0_RUB~

// user identifier
let userUid = UserUtil.createUid(new Date(), hash);
// user_01752065464752_9c6d51852f75...
```

## State Keys

### How Fabric storage works

Hyperledger Fabric state is an ordered "key → value" dictionary. A record can be found in two ways: by its exact key, or with a range query (`getStateByRange`) that returns everything lexicographically falling between two strings. In practice, a range is almost always used as "everything that starts with the given string".

From this follows the main rule: **secondary lookup is only possible on the left part of the key**. That is why keys are composite — made of several segments, from the general to the specific:

```
→coin~account:coin_user_X_0_RUB~user_00000000000000_abc
└─ namespace ───┘└───── coin ────┘└─────── owner ───────┘
```

Such a key serves two scenarios at once: reading a specific account by its full key and enumerating every account of a coin by prefix.

### Why a prefix must end with a separator

A search prefix is **the full key plus a separator**, not "the key without its last segment". The difference is fundamental.

If you build a prefix without the trailing separator, the range query will capture neighboring records whose identifier starts the same way:

```
prefix:  →coin~account:coin_user_X_0_RUB

matched by it:
  →coin~account:coin_user_X_0_RUB~user_abc            the intended record
  →coin~account:coin_user_X_0_RUB2~user_xyz           ANOTHER coin RUB2
  →coin~account:coin_user_X_0_RUB.SERIES.1~user_xyz   ANOTHER serial coin
```

The string `coin_user_X_0_RUB` is the beginning of the string `coin_user_X_0_RUB2`, and the store faithfully returns both. The bug stays invisible until the system has coins whose identifier is a prefix of another, and then it leads to operations on records that belong to someone else.

With a trailing separator this does not happen: at that position another coin has a `2` or a `.`, not a `~`.

`StateKey` makes such a mistake impossible: the calling code has no way to obtain a prefix other than the `prefix()` method.

## API Reference

### StateKey

A state key builder. It is created once per namespace and then used for every key in that namespace.

```ts
import { StateKey } from '@hlf-core/common';

let key = new StateKey('→coin~account');
```

#### Static properties

| Property | Value | Purpose |
|---|---|---|
| `StateKey.SEGMENT` | `~` | separator between key segments |
| `StateKey.NAMESPACE` | `:` | separator between the namespace and the segments |

#### `key(...items: Array<UID>): string`

Returns the exact record key. Segments are joined with the `~` separator.

```ts
key.key('coin_RUB', 'user_abc');   // →coin~account:coin_RUB~user_abc
key.key('coin_RUB');               // →coin~account:coin_RUB
key.key();                         // →coin~account:
```

Used wherever exactly one object is addressed: read, write, delete.

#### `prefix(...items: Array<UID>): string`

Returns the prefix for a range query — a key with a trailing separator.

```ts
key.prefix('coin_RUB');              // →coin~account:coin_RUB~
key.prefix('coin_RUB', 'user_abc');  // →coin~account:coin_RUB~user_abc~
key.prefix();                        // →coin~account:
```

A call with no arguments yields the prefix of the whole namespace — use it to enumerate every record of this kind.

#### `isKey(item: UID): boolean`

Checks whether a key belongs to this namespace.

```ts
key.isKey('→coin~account:coin_RUB~user_abc');  // true
key.isKey('→link~account~otc:coin_RUB~...');   // false
```

Useful when records of different kinds share a single range.

#### `decompose(item: UID): Array<string>`

Splits a key back into its segments. Returns `null` if the key belongs to a different namespace.

```ts
key.decompose('→coin~account:coin_RUB~user_abc');  // ['coin_RUB', 'user_abc']
key.decompose('→link~account~otc:coin_RUB~...');   // null
```

Replaces manual string parsing with `split` and `indexOf`.

#### Rules for key segments

Each segment is validated before being joined. A segment cannot be empty and cannot contain `~` or `:`:

```ts
key.key('a~b');   // StateKeySegmentInvalidError
key.key('a:b');   // StateKeySegmentInvalidError
key.key('');      // StateKeySegmentInvalidError
```

The reason: a separator inside a value shifts the boundary between segments, and the key silently drifts — a prefix search starts returning something other than what was expected. It is better to fail on write than to get an incorrect selection on read.

The namespace itself is not validated — it is set once by the developer and may contain any characters, including `~` (for example, `→coin~account`).

### UserUtil

Building and validating user identifiers.

```ts
public static PREFIX = 'user';
public static UID_REG_EXP = /^user_[0-9]{14}_[0-9a-fA-F]{64}$/;
```

#### `createUid(created: Date, hash: string): string`

Creates a `uid` of the form `user_<time:14>_<hash:64>`. The time is zero-padded to a fixed width, so identifiers are lexicographically ordered by creation date — a range query returns users in chronological order.

```ts
UserUtil.createUid(new Date(), stub.transaction.hash);
// user_01752065464752_9c6d51852f751fb8c402d8b676f82cbe...
```

#### `create<T extends IUser>(classType: ClassType<T>, created: Date, hash: string): T`

Creates a user instance with `uid` and `created` filled in.

```ts
let user = UserUtil.create(User, stub.transaction.date, stub.transaction.hash);
```

#### `isUser(uid: UID): boolean`

Checks whether an identifier matches the user format.

#### `seed<T extends IUser>(classType: ClassType<T>, created?: Date, hash?: string): T`

Creates a system user with a zero date and hash — a deterministic `uid` that is identical on every node of the network. Used when initializing a channel.

```ts
let seed = UserUtil.seed(User);
// user_00000000000000_0000000000000000000000000000000000000000000000000000000000000000
```

### IUser

The user interface, parameterized by status and role types.

```ts
export interface IUser<S = string, R = string> extends IUIDable {
    uid: string;
    created: Date;

    roles?: Array<R>;
    status?: S;
    cryptoKey?: ICryptoKey;
    description?: string;
}
```

A specific project plugs in its own enumerations:

```ts
class User implements IUser<UserStatus, UserRole> { ... }
```

### CryptoKey

A description of a cryptographic key: value and algorithm.

```ts
export class CryptoKey implements ICryptoKey {
    public static PREFIX = 'cryptoKey';

    @IsString() value: string;
    @IsString() algorithm: string;
}
```

The fields are annotated with `class-validator` decorators, so the object is validated with the same tooling as the rest of the entities when written to state.

### HlfTransportCommand

Transport commands with a "read-only" flag.

```ts
export class HlfTransportCommand<T> extends TransportCommand<T> {
    constructor(name: string, request?: T, id?: string, public isReadonly?: boolean);
}

export class HlfTransportCommandAsync<U, V> extends TransportCommandAsync<U, V> {
    constructor(name: string, request?: U, id?: string, public isReadonly?: boolean);
}
```

`isReadonly` lets the transport distinguish requests that do not change state and handle them more cheaply — without sending a transaction for endorsement.

```ts
export class CoinGetCommand extends HlfTransportCommandAsync<ICoinGetDto, Coin> {
    public static readonly NAME = 'CoinGet';

    constructor(request: ICoinGetDto) {
        super(CoinGetCommand.NAME, request, undefined, true);   // read-only
    }
}
```

### InitiatedDto

Adds an operation initiator to a DTO.

```ts
export interface IInitiatedDto {
    initiatorUid?: string;
}

export class InitiatedDto implements IInitiatedDto {
    @IsOptional()
    @IsString()
    public initiatorUid?: string;
}
```

Used as a base for commands and events where you need to know on whose behalf an action was performed — separately from who signed the transaction.

```ts
export class CoinEmittedEventDto extends InitiatedDto {
    public coinUid: string;
    public value: string;
}
```

### Error

The package's domain error framework.

```ts
export class Error<T = void> extends ExtendedError<T, ErrorCode> {
    public static instanceOf(item: any): item is Error;
    constructor(code: ErrorCode, details: T, status?: number);
}
```

An error carries a machine-readable code and details, while its message is the class name. This makes it possible to handle it by code on the other side of the transport, where the stack is no longer available.

#### Error Codes

| Code | Class | When it occurs |
|---|---|---|
| `HLF_STATE_KEY_SEGMENT_INVALID` | `StateKeySegmentInvalidError` | a key segment is empty or contains `~` or `:` |

```ts
try {
    key.key(ticker);
}
catch (error) {
    if (Error.instanceOf(error)) {
        console.log(error.code);      // HLF_STATE_KEY_SEGMENT_INVALID
        console.log(error.details);   // { value: 'RUB~2', expected: 'without "~" and ":"' }
    }
}
```

## Usage Examples

### Account keys

```ts
import { StateKey } from '@hlf-core/common';

export class CoinAccountUtil {
    public static PREFIX = '→coin~account';
    public static KEY = new StateKey(CoinAccountUtil.PREFIX);

    // exact account key
    public static createUid(coin: UID, owner: UID): string {
        return CoinAccountUtil.KEY.key(coin, owner);
    }

    // prefix to enumerate every account of a coin
    public static createPrefix(coin: UID): string {
        return CoinAccountUtil.KEY.prefix(coin);
    }
}
```

The two modes are split across separate methods, so there is no way to confuse an exact key with a search prefix.

### Secondary index

The task: find orders by coin and by the "coin + owner" pair. Fabric has no direct lookup by field, so a pointer key is stored next to the record.

```ts
let index = new StateKey('→otc~hold');

// when an order is created
await stub.putStateRaw(index.key(coinUid, ownerUid, otcUid), otcUid);

// all orders for a coin
let byCoin = await stub.getStateByRange(index.prefix(coinUid), ...);

// orders of a specific owner for this coin
let byOwner = await stub.getStateByRange(index.prefix(coinUid, ownerUid), ...);

// when an order is deleted
await stub.removeState(index.key(coinUid, ownerUid, otcUid));
```

A single set of keys serves both slices thanks to the order of the segments: from the general to the specific.

### Decomposing a key

```ts
let key = new StateKey('→coin~account');

let uid = key.key('coin_user_X_0_RUB', 'user_abc');
let items = key.decompose(uid);   // ['coin_user_X_0_RUB', 'user_abc']

let [coinUid, ownerUid] = items;
```

### Segment order matters

Lookup is only possible on the left part, so the order determines which slices are available:

```ts
// key (coin, owner): you can search by coin and by the pair
key.prefix(coinUid);              // all owners of this coin
key.prefix(coinUid, ownerUid);    // a specific pair

// you cannot search by a single owner with this key —
// such a slice needs a second set of keys with the reverse order
let byOwner = new StateKey('→coin~owner');
await stub.putStateRaw(byOwner.key(ownerUid, coinUid), uid);
```

## Project Structure

```
src/
├── Error.ts                      domain errors and codes
├── public-api.ts                 the package's public API
├── state/
│   ├── StateKey.ts               state key construction
│   └── index.ts
├── user/
│   ├── IUser.ts                  user interface
│   ├── UserUtil.ts               user identifiers
│   └── index.ts
├── crypto/
│   ├── ICryptoKey.ts             cryptographic key interface
│   ├── CryptoKey.ts              implementation with validation
│   └── index.ts
└── transport/
    ├── HlfTransportCommand.ts    commands with the isReadonly flag
    ├── IInitiatedDto.ts          operation initiator
    └── index.ts
```

## Changelog

### 3.2.6

- Added `StateKey` — unified state key construction with a mandatory separator in prefixes and segment validation
- Added `Error` with `ErrorCode` codes and the first error, `StateKeySegmentInvalidError`

The changes are additive only; the existing API is untouched. The key format produced by `StateKey` matches the one previously used across the ecosystem packages, so migrating existing code to `StateKey` requires no state migration.

## License

ISC

## Author

**Renat Gubaev**
- Email: renat.gubaev@gmail.com
- GitHub: [@ManhattanDoctor](https://github.com/ManhattanDoctor)

## Links

- [GitHub Repository](https://github.com/ManhattanDoctor/hlf-core-common)
- [NPM Package](https://www.npmjs.com/package/@hlf-core/common)
- [Issue Tracker](https://github.com/ManhattanDoctor/hlf-core-common/issues)
- [Hyperledger Fabric Documentation](https://hyperledger-fabric.readthedocs.io/)

## Support

If you found a bug or have a suggestion for improvement, please open an issue in [GitHub Issues](https://github.com/ManhattanDoctor/hlf-core-common/issues).
