#! /usr/bin/env node

'use strict'

const fs = require('fs')
const net = require('net')
const Readable = require('readable-stream').Readable
const inherits = require('inherits')
const minimist = require('minimist')
const split = require('split2')
const pump = require('pump')
const writer = require('flush-write-stream')
const blessed = require('blessed')
const contrib = require('blessed-contrib')

function Monitor () {
  Readable.call(this)

  var that = this
  this._timer = setInterval(() => {
    that.push(JSON.stringify(process.memoryUsage()))
    that.push('\n')
  }, 500)
}

inherits(Monitor, Readable)

Monitor.prototype._read = function () {
  // nothing to do
}

Monitor.prototype.destroy = function () {
  if (this._timer) {
    clearInterval(this._timer)
    this._timer = null
    this.push(null)
    this.emit('close')
  }
}

function monitor () {
  const server = net.createServer((stream) => {
    stream.unref()
    stream.resume()
    pump(new Monitor(), stream)
  })
  const file = process.env.CLIMEM || 'climem-' + process.pid

  server.unref()
  server.listen(file)

  const exit = () => {
    try {
      fs.unlinkSync(file)
    } catch (err) {}
  }

  process.on('SIGINT', () => {
    exit()
    if (process.listeners('SIGINT').length === 1) {
      process.exit(1)
    }
  })
  process.on('exit', exit)
}

function empty (num) {
  let result = new Array(num)

  for (let i = 0; i < num; i++) {
    result[i] = ' '
  }

  return result
}

function cli () {
  const argv = minimist(process.argv.splice(2), {
    boolean: 'data',
    alias: {
      help: 'h',
      data: 'd'
    }
  })

  let screen
  let line
  const rss = {
    title: 'rss',
    x: empty(80),
    y: empty(80),
    style: {
      line: 'red'
    }
  }
  const heapTotal = {
    title: 'heapTotal',
    x: empty(80),
    y: empty(80),
    style: {
      line: 'yellow'
    }
  }
  const heapUsed = {
    title: 'heapUsed',
    x: empty(80),
    y: empty(80),
    style: {
      line: 'green'
    }
  }

  if (argv.help || !argv._[0]) {
    console.log('Usage: climem FILE')
    console.log('       climem PORT HOST')
    console.log('to enable in any node process, use node -r climem')
    process.exit(1)
  }

  if (!argv.data) {
    screen = blessed.screen()
    line = contrib.line({
      width: 80,
      height: 30,
      xLabelPadding: 3,
      xPadding: 5,
      label: 'Memory (MB)',
      showLegend: true,
      legend: { width: 12 }
    })
    screen.append(line)

    screen.key(['escape', 'q', 'C-c'], () => {
      return process.exit(0)
    })
  }

  pump(net.connect(argv._[0], argv._[1]),
       split(JSON.parse),
       writer.obj(argv.data ? write : plot), (err) => {
    if (err) {
      console.error(err.message)
    } else {
      console.error('stream closed')
    }

    try {
      fs.unlinkSync(argv._[0])
    } catch (err) {
      // nothing to do it might not be a file
    }
  })

  function write (chunk, enc, cb) {
    console.dir(chunk)
    cb()
  }

  function plot (chunk, enc, cb) {
    rss.y.shift()
    rss.y.push(chunk.rss / 1024 / 1024)
    heapTotal.y.shift()
    heapTotal.y.push(chunk.heapTotal / 1024 / 1024)
    heapUsed.y.shift()
    heapUsed.y.push(chunk.heapUsed / 1024 / 1024)
    line.setData([rss, heapTotal, heapUsed])
    screen.render()
    cb()
  }
}

if (require.main === module) {
  cli()
} else {
  monitor()
}
