export const toRecord = (x: HeadersInit): Record<string, string> => {
  if (Array.isArray(x)) {
    return Object.fromEntries(x)
  } else if (x instanceof Headers) {
    const obj: Record<string, string> = {}
    x.forEach((v, k) => (obj[k] = v))
    return obj
  } else {
    return x
  }
}

export const union = (into: HeadersInit, from: HeadersInit): HeadersInit => ({
  ...toRecord(into),
  ...toRecord(from),
})

// export const withHeader = <E extends Error, A>(
//   hs: HeadersInit
// ): Combinator<E, A> =>
//   pipe(
//     local(
//       ({ input, init }): Config => ({
//         input,
//         init: {},
//       })
//     )
//   )
