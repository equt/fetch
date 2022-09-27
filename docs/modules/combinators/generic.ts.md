---
title: combinators/generic.ts
nav_order: 3
parent: Modules
---

## generic overview

Added in v2.1.1

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [fail](#fail)
  - [guard](#guard)
  - [inspect](#inspect)
  - [localE](#locale)
  - [when](#when)

---

# utils

## fail

Throw an error

**Signature**

```ts
export declare const fail: <E, A, F>(error: Lazy<F>) => Combinator<E, A, E | F, A>
```

Added in v2.2.1

## guard

Guard the value in the pipeline.

**Signature**

```ts
export declare const guard: <E, F, A, B extends A>(
  refinement: Refinement<A, B>,
  otherwise: MapError<F, A>
) => Combinator<E, A, E | F, B>
```

Added in v2.13.0

## inspect

Inspect the value

**Signature**

```ts
export declare const inspect: <E, A>(inspector: (a: A) => void) => Combinator<E, A, E, A>
```

Added in v3.3.0

## localE

Abuse version of {@link local}, which might raise an error.

**Signature**

```ts
export declare const localE: <E, A, F>(f: (a: Config) => Either<F, Config>) => Combinator<E, A, E | F, A>
```

Added in v2.2.3

## when

Throw if the value meets.

**Signature**

```ts
export declare const when: <E, F, A, B extends A>(
  refinement: Refinement<A, B>,
  then: MapError<F, B>
) => Combinator<E, A, E | F, A>
```

Added in v2.14.0
