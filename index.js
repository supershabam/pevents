var helpers = require('./helpers')
  , L       = require('lodash')


function EventEmitter() {
  // listeners = [
  //   {
  //     evnt     : String,
  //     listener : function,
  //     priority : Integer,
  //     type     : String (['on', 'once'])
  //   }
  // ]
  this._listeners    = []
  this._maxListeners = 10
}

module.exports = EventEmitter
EventEmitter.EventEmitter = EventEmitter

EventEmitter.prototype.addListener = EventEmitter.prototype.on

EventEmitter.prototype.emit = function(evnt) {
  var args  = Array.prototype.slice.call(arguments, 1)
  var chain = L.filter(this._listeners, helpers.match_evnt(evnt)).sort(helpers.sort_priority)
  this._listeners = L.filter(this._listeners, helpers.filter_once(evnt))

  // unhandled error event
  if (evnt === 'error' && chain.length === 0) {
    if (args[0] instanceof Error) {
      throw args[0]
    } else {
      throw new Error('Uncaught, unspecified "error" event.')
    } 
  }

  return helpers.walk(chain, args)
}

EventEmitter.prototype.listeners = function(evnt) {
  return L.pluck(
    L.reduce(this._listeners, helpers.match_evnt),
    'listener'
  )
}

EventEmitter.prototype.on = function(priority, evnt, listener) {
  return this._addListener(priority, evnt, listener, 'on')
}

EventEmitter.prototype.once = function(priority, evnt, listener) {
  return this._addListener(priority, evnt, listener, 'once')
}

EventEmitter.prototype.removeListener = function(evnt, listener) {
  var self = this
  
  if ('string' !== typeof evnt) {
    throw new TypeError('event must be a string')
  }
  if (!L.isFunction(listener)) {
    throw new TypeError('listener must be a function')
  }

  var purged      = L.filter(this._listeners, helpers.match_evnt_listener(evnt, listener))
  this._listeners = L.reject(this._listeners, helpers.match_evnt_listener(evnt, listener))

  L.each(purged, function() {
    self.emit('removeListener', evnt, listener)
  })

  return this
}

EventEmitter.prototype.removeAllListeners = function(evnt) {
  var self = this

  if (arguments.length === 0) {
    L.each(
      L.without(
        helpers.unique_events(this._listeners),
        'removeListener'
      ).append('removeListener'),
      self.removeAllListeners.bind(self)
    )
  } else {
    var purged      = L.filter(this._listeners, helpers.match_evnt(evnt))
    this._listeners = L.reject(this._listeners, helpers.match_evnt(evnt))

    L.each(purged, function(listener) {
      self.emit('removeListener', evnt, listener.listener)
    })
  }

  return this
}


EventEmitter.prototype.setMaxListeners = function(n) {
  if (n % 1 !== 0 || n < 0) {
    throw new TypeError('n must be a positive integer')
  }
  this._maxListeners = n
  return this
}

EventEmitter.prototype._addListener = function(priority, evnt, listener, type) {
  var self = this

  if (L.isFunction(evnt)) {
    listener = evnt
    evnt     = priority
    priority = 0
  }
  if (priority % 1 !== 0) {
    throw new TypeError('priority must be an integer')
  }
  if ('string' !== typeof evnt) {
    throw new TypeError('event must be a string')
  }
  if (!L.isFunction(listener)) {
    throw new TypeError('listener must be a function')
  }

  this.emit('newListener', evnt, listener).then(
    function(){},
    function(reason) {
      self.emit('error', reason)
    }
  )

  this._listeners.push({
    evnt     : evnt,
    listener : listener,
    priority : priority,
    type     : type
  })

  var evnt_count = L.filter(this._listeners, helpers.match_evnt(evnt)).length

  if (this._maxListeners !== 0 && evnt_count === this._maxListeners) {
    console.error('(pevents) warning: possible EventEmitter memory leak detected. %d listeners added. ' +
                  'Use emitter.setMaxListeners() to increase limit.',
                  evnt_count)
    console.trace()
  }

  return this
}

