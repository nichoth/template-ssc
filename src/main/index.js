// @ts-check
'use strict'

const { system } = require('@socketsupply/ssc-node')
const path = require('path')
const untildify = require('untildify')

class Env {
    get () {
        try {
            return {
                err: null,
                data: {
                    home: untildify('~')
                }
            }
        } catch (err) {
            return { err, data: null }
        }
    }
}

async function main () {
    const screen = await system.getScreenSize()
    const env = new Env()

    await system.setSize({
        window: 0,
        height: Math.min(900, screen.height * 0.80),
        width: Math.min(1440, screen.width * 0.80)
    })

    await system.show({ window: 0 })

    await system.setTitle({
        window: 0,
        value: 'wooo'
    })

    // we only have one possible command -- env.get
    system.receive = function _receive (command, arg) {
        if (command !== 'send') {
            return {
                err: new Error('not send')
            }
        }
        if (!arg) {
            return {
                err: new Error('missing arg')
            }
        }
        if (arg.api !== 'env') {
            return {
                err: new Error(`Unknown method (${arg.api}, ${arg.method})`)
            }
        }
        if (arg.method !== 'get') {
            return {
                err: new Error(`Unknown method (${arg.api}, ${arg.method})`)
            }
        }

        return env.get()
    }

    const resourcesDirectory = path.dirname(process.argv[1])
    const file = path.join(resourcesDirectory, 'index.html')

    // a `file` URL to the index.html of our app
    await system.navigate({ window: 0, value: `file://${file}` })

    system.send({ window: 0, event: 'backend.ready', value: true })
}

main().then(null, err => {
    process.nextTick(() => { throw err })
})
