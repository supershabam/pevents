var EE   = require('../')
var test = require('tape')
var Q    = require('q')

test('priority', function(t) {
  t.plan(3)

  var emitter = new EE()
  var start   = Date.now()

  emitter.on(9000, 'test', function() {
    t.ok(Date.now() - start < 10, 'handled immediately')
    return Q.delay(50)
  })
  emitter.on('test', function() {
    t.ok(Date.now() - start > 50, 'handled after 50ms')
    return Q.delay(50)
  })
  emitter.on(-9000, 'test', function() {
    t.ok(Date.now() - start > 100, 'handled after 100ms')
    return Q.delay(50)
  })

  emitter.emit('test')
})
