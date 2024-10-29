const asRegExp = (test: string | RegExp | ReadonlyArray<string | RegExp>): RegExp | ReadonlyArray<string | RegExp> => {
  if (typeof test === 'string') {
    test = new RegExp('^' + test.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'))
  }
  return test
}

const matchPart = (str: string, test: string | RegExp | ReadonlyArray<string | RegExp>) => {
  if (!test) return true
  test = asRegExp(test)
  if (Array.isArray(test)) {
    return test.map(asRegExp).some((regExp) => (regExp as RegExp).test(str))
  } else {
    return (test as RegExp).test(str)
  }
}

export interface mathOptions {
  test?: string
  include?: string | RegExp | ReadonlyArray<string | RegExp> | undefined
  /**
   * Exclude file paths or patterns. Takes precedence over include. Defaults to no excluding.
   */
  exclude?: string | RegExp | ReadonlyArray<string | RegExp> | undefined
}

export default function matchObject(obj: mathOptions, str: string) {
  if (obj.test) {
    if (!matchPart(str, obj.test)) {
      return false
    }
  }
  if (obj.include) {
    if (!matchPart(str, obj.include)) {
      return false
    }
  }
  if (obj.exclude) {
    if (matchPart(str, obj.exclude)) {
      return false
    }
  }
  return true
}
