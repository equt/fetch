---
title: index.ts
nav_order: 10
parent: Modules
---

## index overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [Combinator (type alias)](#combinator-type-alias)
  - [Config (type alias)](#config-type-alias)
  - [FetchM (type alias)](#fetchm-type-alias)
  - [InspectError (type alias)](#inspecterror-type-alias)
  - [InspectReturn (type alias)](#inspectreturn-type-alias)
  - [MapError (type alias)](#maperror-type-alias)
  - [bail](#bail)
  - [mkRequest](#mkrequest)
  - [request](#request)
  - [runFetchM](#runfetchm)
  - [runFetchMFlipped](#runfetchmflipped)
  - [runFetchMFlippedP](#runfetchmflippedp)
  - [runFetchMFlippedPT](#runfetchmflippedpt)
  - [runFetchMFlippedPTL](#runfetchmflippedptl)
  - [runFetchMP](#runfetchmp)
  - [runFetchMPT](#runfetchmpt)
  - [runFetchMPTL](#runfetchmptl)

---

# utils

## Combinator (type alias)

Transform from one {@link FetchM} to another {@link FetchM}.

A combinator is an alias for a function mapping from one {@link FetchM} to
another {@link FetchM}.

Before 2.2.0, previous errors union will always get preserved. But starting
from 2.2.0, the type signature is relaxed to allow you to create combinators that
recover the errors, or conditionally applied.

**Signature**

```ts
export type Combinator<E1, A, E2 = E1, B = A> = (m: FetchM<E1, A>) => FetchM<E2, B>
```

Added in v1.0.0

## Config (type alias)

{@link FetchM} Monad Environment.

This is the same as the parameters of the {@link fetch} function.

**Signature**

```ts
export type Config = [string, RequestInit]
```

Added in v1.0.0

## FetchM (type alias)

Main Monad of this package. The stack contains

- A Reader of {@link Config}
- A {@link TaskEither} represents an asynchronous computation which can yield result `A` or raise an Error of type `E` eventually.

**Signature**

```ts
export type FetchM<E, A> = ReaderTaskEither<Config, E, A>
```

Added in v1.0.0

## InspectError (type alias)

Inspect the error type for a {@link FetchM}.

**Signature**

```ts
export type InspectError<M> = M extends FetchM<infer E, unknown> ? E : never
```

Added in v2.10.0

## InspectReturn (type alias)

Inspect the return type for a {@link FetchM}.

**Signature**

```ts
export type InspectReturn<M> = M extends FetchM<unknown, infer A> ? A : never
```

Added in v2.10.0

## MapError (type alias)

A mapping from type `S` to an arbitrary error type `E`.

**Signature**

```ts
export type MapError<E, S = unknown> = (s: S) => E
```

Added in v1.0.0

## bail

A built-in instance for {@link MapError}.

**Signature**

```ts
export declare const bail: MapError<never, unknown>
```

Added in v1.0.0

## mkRequest

Create an instance of {@link FetchM} by providing how to map possible errors and optional {@link fetch} implementation.

**Signature**

```ts
export declare const mkRequest: <E>(
  mapError: MapError<E, unknown>,
  fetchImpl?: typeof fetch | undefined
) => FetchM<E, Response>
```

Added in v1.0.0

## request

A special instance of {@link FetchM} which always {@link bail}s errors and utilizes global {@link fetch}.

**Signature**

```ts
export declare const request: FetchM<never, Response>
```

Added in v1.0.0

## runFetchM

Run the main Monad {@link FetchM}.

This is the same as calling {@link fetch} function, or the Monad {@link FetchM} itself.

**Signature**

```ts
export declare const runFetchM: <E, A>(
  input: string,
  init?: RequestInit | undefined
) => (m: FetchM<E, A>) => TaskEither<E, A>
```

Added in v1.0.0

## runFetchMFlipped

The flipped version of {@link runFetchM}.

**Signature**

```ts
export declare const runFetchMFlipped: <E, A>(
  m: FetchM<E, A>
) => (input: string, init?: RequestInit | undefined) => TaskEither<E, A>
```

Added in v2.7.0

## runFetchMFlippedP

Call {@link runFetchMFlipped} returned {@link TaskEither} to produce a {@link Promise}.

**Signature**

```ts
export declare const runFetchMFlippedP: <E, A>(
  m: FetchM<E, A>
) => (input: string, init?: RequestInit | undefined) => Promise<Either<E, A>>
```

Added in v2.9.0

## runFetchMFlippedPT

Throw the left value from {@link runFetchMFlippedP}.

**Signature**

```ts
export declare const runFetchMFlippedPT: <E, A>(
  m: FetchM<E, A>
) => (input: string, init?: RequestInit | undefined) => Promise<A>
```

Added in v2.9.0

## runFetchMFlippedPTL

Lazy version of {@link runFetchMFlippedP}.

**Signature**

```ts
export declare const runFetchMFlippedPTL: <E, A>(
  m: FetchM<E, A>
) => (input: string, init?: RequestInit | undefined) => () => Promise<A>
```

Added in v2.15.0

## runFetchMP

Call {@link runFetchM} returned {@link TaskEither} to produce a {@link Promise}.

**Signature**

```ts
export declare const runFetchMP: <E, A>(
  input: string,
  init?: RequestInit | undefined
) => (m: FetchM<E, A>) => Promise<Either<E, A>>
```

Added in v2.11.0

## runFetchMPT

Throw the left value from {@link runFetchMP}.

**Signature**

```ts
export declare const runFetchMPT: <E, A>(
  input: string,
  init?: RequestInit | undefined
) => (m: FetchM<E, A>) => Promise<A>
```

Added in v2.11.0

## runFetchMPTL

Lazy version of {@link runFetchMPT}.

**Signature**

```ts
export declare const runFetchMPTL: <E, A>(
  input: string,
  init?: RequestInit | undefined
) => (m: FetchM<E, A>) => () => Promise<A>
```

Added in v2.15.0
