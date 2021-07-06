# on-exit-leak-free

Execute a function on exit without leaking memory, allowing all objects to be garbage collected

## Install

```bash
npm i on-exit-leak-free
```

## Example

```js
'use strict'

const { register, unregister } = require('on-exit-leak-free')
const assert = require('assert')

function setup () {
  const obj = { foo: 'bar' }
  register(obj, shutdown)
  // call unregister(obj) to remove
}

let shutdownCalled = false
function shutdown (obj) {
  shutdownCalled = true
  assert.strictEqual(obj.foo, 'bar')
}

setup()

process.on('exit', function () {
  assert.strictEqual(shutdownCalled, true)
})
```

## License

MIT
