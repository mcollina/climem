const blessed = require('blessed')
const contrib = require('blessed-contrib')
const screen = blessed.screen()
const line = contrib.line(
  {
    width: 80,
    height: 30,
    xPadding: 5,
    label: 'Title',
    showLegend: true,
    legend: { width: 12 }
  })
const data = [{
  title: 'us-east',
  x: ['t1', 't2', 't3', 't4'],
  y: [5, 1, 7, 5],
  style: {
    line: 'red'
  }
},
{
  title: 'us-west',
  x: ['t1', 't2', 't3', 't4'],
  y: [2, 4, 9, 8],
  style: { line: 'yellow' }
},
{
  title: 'eu-north-with-some-long-string',
  x: ['t1', 't2', 't3', 't4'],
  y: [22, 7, 12, 1],
  style: { line: 'blue' }
}]

screen.append(line) // must append before setting data
line.setData(data)

screen.key(['escape', 'q', 'C-c'], function (ch, key) {
  return process.exit(0)
})

screen.render()
