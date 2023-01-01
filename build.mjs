// @ts-check
import * as path from 'path'
import glob from 'glob'
import { promises as fs } from 'fs'
import * as esbuild from 'esbuild'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

//
// build the app source
//
async function main () {
    await esbuild.build({
        entryPoints: ['src/index.mjs'],
        bundle: true,
        keepNames: true,
        // minify: true,
        outfile: path.join('./public/', 'bundle.js'),
        platform: 'browser'
    })

    // html
    await cp('src/index.html', './public')

    // tests
    if (!buildTests.isTest()) return
    const testDir = path.join(__dirname, '/test')
    const outputDir = path.join(__dirname, '/public')
    await buildTests(testDir, outputDir)
}

main()

function cp (a, b) {
    return fs.copyFile(
        path.resolve(a),
        path.join(b, path.basename(a))
    )
}

async function buildTests (dir, outDir) {
    const isTest = testEnv()
    if (!isTest) return

    glob(path.resolve(dir, '*.mjs'), async (err, files) => {
        if (err) throw err

        await Promise.all(files.map(file => {
            return esbuild.build({
                entryPoints: [file],
                bundle: true,
                keepNames: true,
                minify: false,
                define: { global: 'window' },
                sourcemap: 'inline',
                // outfile is (target dir + /filename.js)
                outfile: path.join(outDir, path.basename(file)),
                platform: 'browser'
            })
        }))
    })
}

buildTests.isTest = testEnv

function testEnv () {
    return process.argv.some(str => str.includes('--test'))
}
