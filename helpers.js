var L = require('lodash')
  , Q = require('q')


exports.filter_once = function(evnt) {
  return function(listener) {
    return listener.evnt === evnt && listener.type === 'once'
  }
}

exports.filter_priority = function(priority) {
  return function(listener) {
    return listener.priority === priority
  }
}

exports.group_listeners = function(sorted_listeners) {
  var result = []
  var priority
  var filter
  while (sorted_listeners.length > 0) {
    priority = sorted_listeners[0].priority
    filter   = exports.filter_priority(priority)
    result.push(L.filter(sorted_listeners, filter))
    sorted_listeners = L.reject(sorted_listeners, filter)
  }
  return result
}

exports.handle = function(args) {
  return function(listener) {
    return Q().then(function() {
      return listener.listener.apply(null, args)
    })
  }
}

exports.match_evnt = function(evnt) {
  return function(listener) {
    return listener.evnt === evnt
  }
}

exports.match_evnt_listener = function(evnt, listener) {
  return function(listener) {
    return listener.evnt === evnt && listener.listener === listener
  }
}

exports.sort_priority = function(listener_a, listener_b) {
  return listener_b.priority - listener_a.priority
}

exports.unique_events = function(listeners) {
  return L.uniq(L.pluck(listeners, 'evnt'))
}

exports.walk = function(listeners, args) {
  var grouped_listeners = exports.group_listeners(listeners.sort(exports.sort_priority))
  return L.reduce(grouped_listeners, function(memo, listener_group) {
    return memo.then(Q.all(L.map(listener_group, exports.handle(args))))
  }, Q())
}

