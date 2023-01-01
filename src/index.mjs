// @ts-check
'use strict'

import Tonic from '@socketsupply/tonic'
import * as fs from '@socketsupply/io/fs.js'
import * as os from '@socketsupply/io/os.js'

class AppContainer extends Tonic {
    constructor () {
        super()
        this.id = 'root'
        this.state = { n: 0 }
    }

    static async create () {
        const container = new AppContainer()
        container.state = { n: 0 }

        try {
            const n = parseInt(await container.read())
            container.state = { n }
        } catch (err) {
            if (err.toString().includes('no such file')) {
                await container.write() // make the file
            } else {
                console.log('err reading', err)
                throw err
            }
        }

        return container
    }

    async plus () {
        this.state.n += 1
        await this.write()
        this.reRender()
    }

    read () {
        const filename = os.tmpdir() + '/ssc-test.txt'
        return fs.promises.readFile(filename)
    }

    write () {
        const dir = os.tmpdir()
        const filename = dir + '/ssc-test.txt'
        return fs.promises.writeFile(filename, '' + this.state.n)
    }

    click (ev) {
        if (!ev.target.matches('.plus')) return
        this.plus()
    }

    render () {
        return this.html`
            <p id="hello">hello, world</p>
            <p>count: ${'' + this.state.n}</p>
            <div>
                <button class="plus">plus one</button>
            </div>
        `
    }
}

Tonic.add(AppContainer)

window.onload = async () => {
    const app = await AppContainer.create()
    document.body.appendChild(app)
}
