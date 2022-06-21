'use strict'

let refs = []
const registry = new FinalizationRegistry(clear)

function install () {
  if (refs.length > 0) {
    return
  }

  process.on('exit', onExit)
  process.on('beforeExit', onBeforeExit)

  process.on('newListener', function (event, listener) {
    if (listener === onExit || listener === onBeforeExit) {
      return
    }

    // Make sure this is always last
    process.removeListener('exit', onExit)
    process.removeListener('beforeExit', onBeforeExit)
    process.on('exit', onExit)
    process.on('beforeExit', onBeforeExit)
  })
}

function uninstall () {
  if (refs.length > 0) {
    return
  }
  process.removeListener('exit', onExit)
  process.removeListener('beforeExit', onBeforeExit)
}

function onExit () {
  callRefs('exit')
}

function onBeforeExit () {
  callRefs('beforeExit')
}

function callRefs (event) {
  for (const ref of refs) {
    const obj = ref.deref()
    const fn = ref.fn

    // This should always happen, however GC is
    // undeterministic so it might not happen.
    /* istanbul ignore else */
    if (obj !== undefined) {
      fn(obj, event)
    }
  }

  refs = []
}

function clear (ref) {
  const index = refs.indexOf(ref)
  refs.splice(index, index + 1)
  uninstall()
}

function register (obj, fn) {
  if (obj === undefined) {
    throw new Error('the object can\'t be undefined')
  }
  install()
  const ref = new WeakRef(obj)
  ref.fn = fn

  registry.register(obj, ref)
  refs.push(ref)
}

function unregister (obj) {
  registry.unregister(obj)
  refs = refs.filter((ref) => {
    const _obj = ref.deref()
    return _obj && _obj !== obj
  })
  uninstall()
}

module.exports = {
  register,
  unregister
}
