'use strict'

const array = []
setInterval(() => array.push(Buffer.allocUnsafe(1024 * 1024).toString()), 100)
