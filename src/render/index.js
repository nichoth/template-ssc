// @ts-check
'use strict'

import { render } from 'preact'
import { html } from 'htm/preact'
import addTest from '@socketsupply/ssc-test'

//
// We have two bundles, src & test.
// If we need to share data between them,
// we can expose things as global variables
//
Reflect.set(window, 'TEST_example', 'example')

function Demonstration () {
    return html`<div class="demo">
        <h1>hello, world</h1>
        <a href="/hello">hello</a>
    </div>`
}

render(html`<${Demonstration} />`, document.body)
addTest()

// window.addEventListener('backend.ready', () => {
//     render(html`<${Demonstration} />`, document.body)
//     addTest()
// }, { once: true })
