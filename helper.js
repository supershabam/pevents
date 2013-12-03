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

exports.handle = function(args) {
  return function(listener) {
    return Q().then(function() {
      listener.listener.apply(null, args)
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

exports.walk = function(sorted_listeners, args) {
  var promise = Q()
  while (sorted_listeners.length > 0) {
    var priority  = sorted_listeners[0].priority
    var filter    = exports.filter_priority(priority)
    var listeners = L.filter(sorted_listeners, filter)
    var promises  = L.map(listeners, exports.handle(args))
    var next      = Q.all(promises)
    promise       = promise.then(next)
    sorted_listeners = L.reject(sorted_listeners, filter)
  }
  return promise
}

