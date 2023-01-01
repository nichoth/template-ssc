// @ts-check
'use strict'

export default sleep

function sleep (ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}
