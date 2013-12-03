var EE   = require('../')
var test = require('tape')

test('priority', function(t) {
  t.plan(3)

  var emitter = new EE()
  var count = 0
  emitter.on(-100, 'test', function() {
    t.equal(count++, 2)
  })
  emitter.on('test', function() {
    t.equal(count++, 1)
  })
  emitter.on(100, 'test', function() {
    t.equal(count++, 0)
  })
  emitter.emit('test')
})
