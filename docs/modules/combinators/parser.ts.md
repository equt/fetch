---
title: combinators/parser.ts
nav_order: 7
parent: Modules
---

## parser overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [asBlob](#asblob)
  - [asJSON](#asjson)
  - [asText](#astext)
  - [decodeAs](#decodeas)

---

# utils

## asBlob

Parse the {@link Response} body as {@link Blob}

**Signature**

```ts
export declare function asBlob<E, F>(accept: string, mapError: MapError<F>): Combinator<E, Response, E | F, Blob>
export declare function asBlob<E>(accept: string): Combinator<E, Response, E, Blob>
```

Added in v1.0.0

## asJSON

Parse the {@link Response} body as {@link Json}

**Signature**

```ts
export declare function asJSON<E, F>(mapError: MapError<F>): Combinator<E, Response, E | F, Json>
export declare function asJSON<E>(): Combinator<E, Response, E, Json>
```

Added in v1.0.0

## asText

Parse the {@link Response} body as {@link string}

**Signature**

```ts
export declare function asText<E, F>(mapError: MapError<F>): Combinator<E, Response, E | F, string>
export declare function asText<E>(): Combinator<E, Response, E, string>
```

Added in v1.0.0

## decodeAs

Decode a {@link Json} type using [`io-ts`](https://github.com/gcanti/io-ts)

**Signature**

```ts
export declare function decodeAs<E, F, C extends Mixed>(
  codeC: C,
  mapError: MapError<F, Errors>
): Combinator<E, Json, E | F, TypeOf<C>>
export declare function decodeAs<E, C extends Mixed>(codeC: C): Combinator<E, Json, E, TypeOf<C>>
```

Added in v2.5.0
