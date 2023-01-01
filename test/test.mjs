// @ts-check
'use strict'

import { test, GLOBAL_TEST_RUNNER } from 'tapzero'
import '@socketsupply/io/redirectOutput.js'
import sleep from './sleep.js'

const pollTimeout = setTimeout(function poll () {
    if (GLOBAL_TEST_RUNNER.completed) {
        clearTimeout(pollTimeout)
        // @ts-ignore
        window.__ipc.postMessage('ipc://exit?value=0')
    }

    setTimeout(poll, 500)
}, 500)

test('example', async t => {
    t.ok('example')

    // wait for the app to render
    await sleep(100)

    const hello = document.getElementById('hello')
    if (!hello) return t.fail('missing element')
    t.equal(hello.textContent, 'hello, world', 'should have expected text')
})
