'use strict'

var array = []
setInterval(() => array.push(new Buffer(1024 * 1024).toString()), 100)
