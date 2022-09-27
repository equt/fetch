---
title: combinators/status.ts
nav_order: 8
parent: Modules
---

## status overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [ensureStatus](#ensurestatus)

---

# utils

## ensureStatus

Guard the {@link Response} status code.

**Signature**

```ts
export declare const ensureStatus: <E, F>(
  statusIsValid: Predicate<number>,
  otherwise: MapError<F, Response>
) => Combinator<E, Response, E | F, Response>
```

Added in v1.0.0
