'use strict'

function getWrap (ref, fn) {
  function wrap () {
    const obj = ref.deref()
    // This should alway happen, however GC is
    // undeterministic so it might happen.
    /* istanbul ignore else */
    if (obj !== undefined) {
      fn(obj)
    }
  }

  return wrap
}

const registry = new FinalizationRegistry(clear)
const map = new WeakMap()

function clear (fn) {
  process.removeListener('exit', fn)
}

function register (obj, fn) {
  if (obj === undefined) {
    throw new Error('the object can\'t be undefined')
  }
  const ref = new WeakRef(obj)
  const wrap = getWrap(ref, fn)
  map.set(obj, wrap)
  registry.register(obj, wrap)
  process.on('exit', wrap)
}

function unregister (obj) {
  const fn = map.get(obj)
  map.delete(obj)
  process.removeListener('exit', fn)
  registry.unregister(obj)
}

module.exports = {
  register,
  unregister
}
