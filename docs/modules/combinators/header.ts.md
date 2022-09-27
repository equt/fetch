---
title: combinators/header.ts
nav_order: 4
parent: Modules
---

## header overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [merge](#merge)
  - [toRecord](#torecord)
  - [withHeaders](#withheaders)

---

# utils

## merge

Merge two {@link HeadersInit} into one {@link HeadersInit}.

**Signature**

```ts
export declare const merge: (into: HeadersInit, from: HeadersInit) => HeadersInit
```

Added in v1.0.0

## toRecord

Collect {@link HeadersInit} as {@link Record}, where keys and values are both {@link string}

**Signature**

```ts
export declare const toRecord: (headers: HeadersInit) => Record<string, string>
```

Added in v1.0.0

## withHeaders

Set request headers

**Signature**

```ts
export declare const withHeaders: <E, A>(headers: HeadersInit) => Combinator<E, A, E, A>
```

Added in v1.0.0
