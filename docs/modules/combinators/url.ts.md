---
title: combinators/url.ts
nav_order: 9
parent: Modules
---

## url overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [withBaseURL](#withbaseurl)
  - [withPassword](#withpassword)
  - [withPort](#withport)
  - [withURLSearchParams](#withurlsearchparams)
  - [withUsername](#withusername)

---

# utils

## withBaseURL

Set the base URL for the request.

**Signature**

```ts
export declare function withBaseURL<E, F, A>(url: MaybeURLLike, mapError: MapError<F>): Combinator<E, A, E | F>
export declare function withBaseURL<E, A>(url: MaybeURLLike): Combinator<E, A>
```

Added in v1.0.0

## withPassword

Set password.

If this combinator occurs more than one time in the pipeline, the latter set parameters will
override the previous one.

**Signature**

```ts
export declare const withPassword: <E, A>(password: string) => Combinator<E, A, E, A>
```

Added in v3.3.0

## withPort

Set port.

If this combinator occurs more than one time in the pipeline, the latter set parameters will
override the previous one.

**Signature**

```ts
export declare const withPort: <E, A>(port: number | string) => Combinator<E, A, E, A>
```

Added in v3.3.0

## withURLSearchParams

Set URL search parameters.

If this combinator occurs more than one time in the pipeline, the latter set parameters will
merge into the previous set ones.

**Signature**

```ts
export declare const withURLSearchParams: <E, A>(params: Record<string, string>) => Combinator<E, A, E, A>
```

Added in v2.0.0

## withUsername

Set username.

If this combinator occurs more than one time in the pipeline, the latter set parameters will
override the previous one.

**Signature**

```ts
export declare const withUsername: <E, A>(username: string) => Combinator<E, A, E, A>
```

Added in v3.3.0
