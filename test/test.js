// @ts-check
'use strict'

import '@socketsupply/ssc-test/test-context' // must be imported first
import { test } from 'tapzero'
import dom from '@socketsupply/test-dom'

test('find an element', async t => {
    const el = await dom.waitFor({
        selector: 'a'
    })

    t.ok(dom.isElementVisible(el), 'should find a visible link tag')
})
