# @hlf-core/common

> TypeScript библиотека с базовыми классами экосистемы hlf-core: ключи состояния, идентификаторы, транспортные команды

[![npm version](https://img.shields.io/npm/v/@hlf-core/common.svg)](https://www.npmjs.com/package/@hlf-core/common)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

Базовые классы и утилиты, общие для всех пакетов экосистемы `@hlf-core`: формирование ключей состояния Hyperledger Fabric, идентификаторы пользователей, криптографические ключи, транспортные команды и доменные ошибки.

Пакет не зависит ни от `fabric-shim`, ни от chaincode-окружения, поэтому используется одинаково в chaincode, backend и frontend.

## Содержание

- [Описание](#описание)
  - [Основные возможности](#основные-возможности)
- [Установка](#установка)
  - [Зависимости](#зависимости)
- [Быстрый старт](#быстрый-старт)
- [Ключи состояния](#ключи-состояния)
  - [Как устроено хранилище Fabric](#как-устроено-хранилище-fabric)
  - [Почему префикс должен заканчиваться разделителем](#почему-префикс-должен-заканчиваться-разделителем)
- [API документация](#api-документация)
  - [StateKey](#statekey)
  - [UserUtil](#userutil)
  - [IUser](#iuser)
  - [CryptoKey](#cryptokey)
  - [HlfTransportCommand](#hlftransportcommand)
  - [InitiatedDto](#initiateddto)
  - [Error](#error)
- [Примеры использования](#примеры-использования)
- [Структура проекта](#структура-проекта)
- [История изменений](#история-изменений)

## Описание

`@hlf-core/common` — нижний уровень экосистемы. Он содержит то, что нужно всем остальным пакетам и не привязано к среде исполнения: правила формирования ключей состояния, схему идентификаторов пользователя, описание криптографического ключа, базовые транспортные команды и каркас доменных ошибок.

### Основные возможности

- **Единая сборка ключей состояния** — `StateKey` формирует ключи и префиксы поиска по одним правилам, с обязательным разделителем и валидацией частей
- **Идентификаторы пользователей** — `UserUtil` создаёт и проверяет `uid` вида `user_<время>_<хэш>`
- **Криптографические ключи** — `CryptoKey` описывает пару «значение + алгоритм» с валидацией
- **Транспортные команды** — `HlfTransportCommand` и `HlfTransportCommandAsync` с признаком `isReadonly` для разделения запросов на чтение и запись
- **Инициатор операции** — `InitiatedDto` добавляет к любому DTO поле `initiatorUid`
- **Доменные ошибки** — базовый `Error` с кодами `ErrorCode`, совместимый с `ExtendedError` из `@ts-core/common`

## Установка

```bash
npm install @hlf-core/common
```

### Зависимости

```json
{
    "@ts-core/common": "~3.0.57"
}
```

Пакет поставляется в двух сборках — ESM (`./esm/public-api.js`) и CommonJS (`./cjs/public-api.js`), выбор происходит автоматически через поле `exports`.

## Быстрый старт

```ts
import { StateKey, UserUtil } from '@hlf-core/common';

// пространство ключей для аккаунтов
let key = new StateKey('→coin~account');

// точный ключ записи
let uid = key.key('coin_user_X_0_RUB', 'user_00000000000000_abc');
// →coin~account:coin_user_X_0_RUB~user_00000000000000_abc

// префикс для перечисления всех аккаунтов монеты
let prefix = key.prefix('coin_user_X_0_RUB');
// →coin~account:coin_user_X_0_RUB~

// идентификатор пользователя
let userUid = UserUtil.createUid(new Date(), hash);
// user_01752065464752_9c6d51852f75...
```

## Ключи состояния

### Как устроено хранилище Fabric

Состояние Hyperledger Fabric — это упорядоченный словарь «ключ → значение». Найти запись можно двумя способами: по точному ключу либо диапазонным запросом (`getStateByRange`), который возвращает всё, что лексикографически попадает между двумя строками. На практике диапазон почти всегда используется как «всё, что начинается с указанной строки».

Отсюда следует главное правило: **вторичный поиск возможен только по левой части ключа**. Поэтому ключи составные — из нескольких частей, от общего к частному:

```
→coin~account:coin_user_X_0_RUB~user_00000000000000_abc
└─ пространство ┘└──── монета ───┘└────── владелец ─────┘
```

Такой ключ обслуживает два сценария сразу: прочитать конкретный аккаунт по полному ключу и перечислить все аккаунты монеты по префиксу.

### Почему префикс должен заканчиваться разделителем

Префикс поиска — это **полный ключ плюс разделитель**, а не «ключ без последней части». Разница принципиальна.

Если собрать префикс без завершающего разделителя, диапазонный запрос захватит соседние записи, чей идентификатор начинается так же:

```
префикс:  →coin~account:coin_user_X_0_RUB

попадает под него:
  →coin~account:coin_user_X_0_RUB~user_abc            нужная запись
  →coin~account:coin_user_X_0_RUB2~user_xyz           ЧУЖАЯ монета RUB2
  →coin~account:coin_user_X_0_RUB.SERIES.1~user_xyz   ЧУЖАЯ серийная монета
```

Строка `coin_user_X_0_RUB` является началом строки `coin_user_X_0_RUB2`, и хранилище честно вернёт обе. Ошибка не проявляется, пока в системе нет монет с идентификатором-префиксом, а затем приводит к операциям над чужими записями.

С завершающим разделителем этого не происходит: у чужой монеты на этой позиции стоит `2` или `.`, а не `~`.

`StateKey` делает такую ошибку невозможной: другого способа получить префикс, кроме метода `prefix()`, у вызывающего кода нет.

## API документация

### StateKey

Сборщик ключей состояния. Создаётся один раз на пространство имён и дальше используется для всех ключей этого пространства.

```ts
import { StateKey } from '@hlf-core/common';

let key = new StateKey('→coin~account');
```

#### Статические свойства

| Свойство | Значение | Назначение |
|---|---|---|
| `StateKey.SEGMENT` | `~` | разделитель частей ключа |
| `StateKey.NAMESPACE` | `:` | разделитель пространства имён и частей |

#### `key(...items: Array<UID>): string`

Возвращает точный ключ записи. Части соединяются разделителем `~`.

```ts
key.key('coin_RUB', 'user_abc');   // →coin~account:coin_RUB~user_abc
key.key('coin_RUB');               // →coin~account:coin_RUB
key.key();                         // →coin~account:
```

Используется там, где адресуется ровно один объект: чтение, запись, удаление.

#### `prefix(...items: Array<UID>): string`

Возвращает префикс для диапазонного запроса — ключ с завершающим разделителем.

```ts
key.prefix('coin_RUB');              // →coin~account:coin_RUB~
key.prefix('coin_RUB', 'user_abc');  // →coin~account:coin_RUB~user_abc~
key.prefix();                        // →coin~account:
```

Вызов без аргументов даёт префикс всего пространства имён — им перечисляются все записи этого вида.

#### `isKey(item: UID): boolean`

Проверяет, принадлежит ли ключ этому пространству имён.

```ts
key.isKey('→coin~account:coin_RUB~user_abc');  // true
key.isKey('→link~account~otc:coin_RUB~...');   // false
```

Полезно, когда по одному диапазону идут записи разных видов.

#### `decompose(item: UID): Array<string>`

Разбирает ключ обратно на части. Возвращает `null`, если ключ принадлежит другому пространству имён.

```ts
key.decompose('→coin~account:coin_RUB~user_abc');  // ['coin_RUB', 'user_abc']
key.decompose('→link~account~otc:coin_RUB~...');   // null
```

Заменяет ручной разбор строки через `split` и `indexOf`.

#### Правила для частей ключа

Каждая часть проверяется перед склейкой. Часть не может быть пустой и не может содержать `~` или `:`:

```ts
key.key('a~b');   // StateKeySegmentInvalidError
key.key('a:b');   // StateKeySegmentInvalidError
key.key('');      // StateKeySegmentInvalidError
```

Причина: разделитель внутри значения сдвигает границу между частями, и ключ бесшумно «разъезжается» — поиск по префиксу начинает возвращать не то, что ожидалось. Лучше упасть на записи, чем получить неверную выборку при чтении.

Само пространство имён не проверяется — оно задаётся разработчиком один раз и может содержать любые символы, включая `~` (например, `→coin~account`).

### UserUtil

Формирование и проверка идентификаторов пользователя.

```ts
public static PREFIX = 'user';
public static UID_REG_EXP = /^user_[0-9]{14}_[0-9a-fA-F]{64}$/;
```

#### `createUid(created: Date, hash: string): string`

Создаёт `uid` вида `user_<время:14>_<хэш:64>`. Время дополняется нулями до фиксированной ширины, поэтому идентификаторы лексикографически упорядочены по дате создания — диапазонный запрос возвращает пользователей в хронологическом порядке.

```ts
UserUtil.createUid(new Date(), stub.transaction.hash);
// user_01752065464752_9c6d51852f751fb8c402d8b676f82cbe...
```

#### `create<T extends IUser>(classType: ClassType<T>, created: Date, hash: string): T`

Создаёт экземпляр пользователя с заполненными `uid` и `created`.

```ts
let user = UserUtil.create(User, stub.transaction.date, stub.transaction.hash);
```

#### `isUser(uid: UID): boolean`

Проверяет соответствие идентификатора формату пользователя.

#### `seed<T extends IUser>(classType: ClassType<T>, created?: Date, hash?: string): T`

Создаёт системного пользователя с нулевыми датой и хэшем — детерминированный `uid`, одинаковый на всех узлах сети. Используется при инициализации канала.

```ts
let seed = UserUtil.seed(User);
// user_00000000000000_0000000000000000000000000000000000000000000000000000000000000000
```

### IUser

Интерфейс пользователя, параметризованный типами статуса и роли.

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

Конкретный проект подставляет свои перечисления:

```ts
class User implements IUser<UserStatus, UserRole> { ... }
```

### CryptoKey

Описание криптографического ключа: значение и алгоритм.

```ts
export class CryptoKey implements ICryptoKey {
    public static PREFIX = 'cryptoKey';

    @IsString() value: string;
    @IsString() algorithm: string;
}
```

Поля размечены декораторами `class-validator`, поэтому объект проверяется теми же средствами, что и остальные сущности при записи в состояние.

### HlfTransportCommand

Транспортные команды с признаком «только чтение».

```ts
export class HlfTransportCommand<T> extends TransportCommand<T> {
    constructor(name: string, request?: T, id?: string, public isReadonly?: boolean);
}

export class HlfTransportCommandAsync<U, V> extends TransportCommandAsync<U, V> {
    constructor(name: string, request?: U, id?: string, public isReadonly?: boolean);
}
```

`isReadonly` позволяет транспорту отличать запросы, не меняющие состояние, и обрабатывать их дешевле — без отправки транзакции на подтверждение.

```ts
export class CoinGetCommand extends HlfTransportCommandAsync<ICoinGetDto, Coin> {
    public static readonly NAME = 'CoinGet';

    constructor(request: ICoinGetDto) {
        super(CoinGetCommand.NAME, request, undefined, true);   // только чтение
    }
}
```

### InitiatedDto

Добавляет к DTO инициатора операции.

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

Используется как база для команд и событий, где нужно знать, от чьего имени выполнено действие — отдельно от того, кто подписал транзакцию.

```ts
export class CoinEmittedEventDto extends InitiatedDto {
    public coinUid: string;
    public value: string;
}
```

### Error

Каркас доменных ошибок пакета.

```ts
export class Error<T = void> extends ExtendedError<T, ErrorCode> {
    public static instanceOf(item: any): item is Error;
    constructor(code: ErrorCode, details: T, status?: number);
}
```

Ошибка несёт машиночитаемый код и детали, а сообщением становится имя класса. Это позволяет обрабатывать её по коду на другой стороне транспорта, где стек уже недоступен.

#### Коды ошибок

| Код | Класс | Когда возникает |
|---|---|---|
| `HLF_STATE_KEY_SEGMENT_INVALID` | `StateKeySegmentInvalidError` | часть ключа пустая или содержит `~` либо `:` |

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

## Примеры использования

### Ключи аккаунтов

```ts
import { StateKey } from '@hlf-core/common';

export class CoinAccountUtil {
    public static PREFIX = '→coin~account';
    public static KEY = new StateKey(CoinAccountUtil.PREFIX);

    // точный ключ аккаунта
    public static createUid(coin: UID, owner: UID): string {
        return CoinAccountUtil.KEY.key(coin, owner);
    }

    // префикс для перечисления всех аккаунтов монеты
    public static createPrefix(coin: UID): string {
        return CoinAccountUtil.KEY.prefix(coin);
    }
}
```

Два режима разведены по разным методам, поэтому перепутать точный ключ с префиксом поиска нельзя.

### Вторичный индекс

Задача: находить ордера по монете и по паре «монета + владелец». Прямого поиска по полю в Fabric нет, поэтому рядом с записью хранится ключ-указатель.

```ts
let index = new StateKey('→otc~hold');

// при создании ордера
await stub.putStateRaw(index.key(coinUid, ownerUid, otcUid), otcUid);

// все ордера по монете
let byCoin = await stub.getStateByRange(index.prefix(coinUid), ...);

// ордера конкретного владельца по этой монете
let byOwner = await stub.getStateByRange(index.prefix(coinUid, ownerUid), ...);

// при удалении ордера
await stub.removeState(index.key(coinUid, ownerUid, otcUid));
```

Один набор ключей обслуживает оба разреза за счёт порядка частей: от общего к частному.

### Разбор ключа

```ts
let key = new StateKey('→coin~account');

let uid = key.key('coin_user_X_0_RUB', 'user_abc');
let items = key.decompose(uid);   // ['coin_user_X_0_RUB', 'user_abc']

let [coinUid, ownerUid] = items;
```

### Порядок частей имеет значение

Поиск возможен только по левой части, поэтому порядок определяет доступные разрезы:

```ts
// ключ (монета, владелец): можно искать по монете и по паре
key.prefix(coinUid);              // все владельцы этой монеты
key.prefix(coinUid, ownerUid);    // конкретная пара

// искать по одному владельцу этим ключом нельзя —
// для такого разреза нужен второй набор ключей с обратным порядком
let byOwner = new StateKey('→coin~owner');
await stub.putStateRaw(byOwner.key(ownerUid, coinUid), uid);
```

## Структура проекта

```
src/
├── Error.ts                      доменные ошибки и коды
├── public-api.ts                 публичный API пакета
├── state/
│   ├── StateKey.ts               сборка ключей состояния
│   └── index.ts
├── user/
│   ├── IUser.ts                  интерфейс пользователя
│   ├── UserUtil.ts               идентификаторы пользователя
│   └── index.ts
├── crypto/
│   ├── ICryptoKey.ts             интерфейс криптографического ключа
│   ├── CryptoKey.ts              реализация с валидацией
│   └── index.ts
└── transport/
    ├── HlfTransportCommand.ts    команды с признаком isReadonly
    ├── IInitiatedDto.ts          инициатор операции
    └── index.ts
```

## История изменений

### 3.2.6

- Добавлен `StateKey` — единая сборка ключей состояния с обязательным разделителем в префиксах и валидацией частей
- Добавлен `Error` с кодами `ErrorCode` и первая ошибка `StateKeySegmentInvalidError`

Изменения только добавляющие, существующий API не затронут. Формат ключей, которые собирает `StateKey`, совпадает с форматом, применявшимся в пакетах экосистемы ранее, поэтому перевод существующего кода на `StateKey` не требует миграции состояния.

## Лицензия

ISC © Renat Gubaev
