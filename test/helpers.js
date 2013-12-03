var helpers = require('../helpers')
var L       = require('lodash')
var test    = require('tape')
var Q       = require('q')

var listeners = [
  {
    evnt     : 'test',
    priority : -200,
    listener : function() {},
    type     : 'on'
  },
  {
    evnt     : 'test',
    priority : 0,
    listener : function() {},
    type     : 'once'
  },
  {
    evnt     : 'another',
    priority : 9001,
    listener : function() {},
    type     : 'on'
  },
  {
    evnt     : 'another',
    priority : 0,
    listener : function() {},
    type     : 'once'
  }
]

test('filter_once', function(t) {
  var filtered_test        = L.reject(listeners, helpers.filter_once('test'))
  var filtered_another     = L.reject(listeners, helpers.filter_once('another'))
  var filtered_nonexistant = L.reject(listeners, helpers.filter_once('nonexistant'))

  t.plan(4)

  t.looseEqual(L.pluck(filtered_test, 'evnt'), ['test', 'another', 'another'])
  t.equal(L.pluck(filtered_test, 'type')[0], 'on')
  t.looseEqual(L.pluck(filtered_another, 'evnt'), ['test', 'test', 'another'])
  t.looseEqual(L.pluck(filtered_nonexistant, 'evnt'), ['test', 'test', 'another', 'another'])
})

test('handle', function(t) {
  t.plan(3)

  var listener = {
    evnt     : 'test',
    priority : 0,
    listener : function(arg1, arg2) {
      t.equal(arg1, 'arg1')
      t.equal(arg2, 'arg2')
      return 'value'
    },
    type     : 'on'
  }
  var handle  = helpers.handle(['arg1', 'arg2'])
  var promise = handle(listener)
  promise.then(function(result) {
    t.equal(result, 'value')
  })
})

test('sort', function(t) {
  t.plan(1)

  var sorted = listeners.sort(helpers.sort_priority)
  t.looseEqual(L.pluck(sorted, 'priority'), [9001, 0, 0, -200])
})

test('group_listeners', function(t) {
  t.plan(4)

  var sorted = listeners.sort(helpers.sort_priority)
  var grouped = helpers.group_listeners(sorted)
  t.equal(grouped.length, 3)
  t.looseEqual(L.pluck(grouped[0], 'priority'), [9001])
  t.looseEqual(L.pluck(grouped[1], 'priority'), [0, 0])
  t.looseEqual(L.pluck(grouped[2], 'priority'), [-200])
})

test('empty walk', function(t) {
  t.plan(1)

  helpers.walk([], ['arg1', 'arg2']).then(function() {
    t.pass('promise is called')
  })
})

test('one item walk', function(t) {
  t.plan(3)

  var listener = {
    evnt     : 'test',
    priority : 0,
    listener : function(arg1, arg2) {
      t.equal(arg1, 'arg1')
      t.equal(arg2, 'arg2')
      return Q.delay(50).then(function() {
        return 'value'
      })
    },
    type     : 'on'
  }

  helpers.walk([listener], ['arg1', 'arg2']).then(function() {
    t.pass('promise is called')
  })
})

test('delayed walk', function(t) {
  t.plan(8)

  var count = 0
  var start = Date.now()
  var listeners = [
    {
      evnt     : 'test',
      priority : 0,
      listener : function(arg1, arg2) {
        t.equal(arg1, 'arg1')
        t.equal(arg2, 'arg2')
        t.equal(count, 1)
        t.ok(Date.now() - start >= 50, 'waits for previous listener to finish')
        count = count + 1
      },
      type     : 'on'
    },
    {
      evnt     : 'test',
      priority : 200,
      listener : function(arg1, arg2) {
        t.equal(arg1, 'arg1')
        t.equal(arg2, 'arg2')
        t.equal(count, 0)
        count = count + 1
        return Q.delay(50)
      },
      type     : 'on'
    }
  ]

  helpers.walk(listeners, ['arg1', 'arg2']).then(function() {
    t.pass('promise is called')
  })
})
