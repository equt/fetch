---
title: combinators/method.ts
nav_order: 6
parent: Modules
---

## method overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [HTTPMethod (type alias)](#httpmethod-type-alias)
  - [withMethod](#withmethod)

---

# utils

## HTTPMethod (type alias)

All possible HTTP methods

**Signature**

```ts
export type HTTPMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'HEAD'
  | 'DELETE'
  | 'OPTION'
  | 'PATCH'
  | (string & Record<never, never>)
```

Added in v1.0.0

## withMethod

Set the request HTTP method.

**Signature**

```ts
export declare const withMethod: <E, A>(method: HTTPMethod) => Combinator<E, A, E, A>
```

Added in v1.0.0
