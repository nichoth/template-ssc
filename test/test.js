// @ts-check
'use strict'
const { test } = require('tapzero')
const dom = require('@socketsupply/test-dom')
const uuid = require('uuid').v4
const path = require('path-browserify')
const Harness = require('@socketsupply/ssc-test/harness')

test('setup', async t => {
    const harness = await Harness.create({ bootstrap })
    t.ok(harness, 'should create harness')
})

test('find an element', async t => {
    const el = await dom.waitFor({
        selector: 'a'
    })

    t.ok(dom.isElementVisible(el), 'should find a visible link tag')
})

function bootstrap (harness, system, env) {
    const _dialog = system.dialog.bind(system)
    const mocks = harness.mocks
    mocks.folder = uuid()

    // this way we can mock calls to the app menu
    system.dialog = function (args) {
        if (args.title === 'Add Workspace Folder' && args.type === 'open') {
            const _path = path.join(env.home, 'ssc-test', mocks.folder)

            return system.send({
                api: 'fs',
                method: 'mkdirp',
                arguments: [_path]
            })
                .then(() => ([_path]))
        }

        // if we don't need to mock this call, return the standard dialog
        return _dialog(args)
    }
}
