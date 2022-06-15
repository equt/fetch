import type { Lazy } from 'fp-ts/function'

export type Lazyable<A> = Lazy<A> | A

const isLazy = <A>(a: Lazyable<A>): a is Lazy<A> => typeof a === 'function'

/**
 * Require the expression to be reduced.
 *
 * @param lazyable A value that might be lazy
 *
 * @since 2.3.0
 */
export const eager = <A>(lazyable: Lazyable<A>): A =>
  isLazy(lazyable) ? lazyable() : lazyable
