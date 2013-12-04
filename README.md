pevents
=======

A promising, prioritized event emitter. Attempts to follow Node's EventEmitter API as much as possible.

## Why

Because I've wanted a prioritized event emitter on multiple occasions. In order to ensure priority, you need to know when previous priority levels finish executing. Promises provide a clean and powerful way to extend the EventEmitter for listeners that need to do asynchronous activities to finish.

## Specs

* Should operate as a drop-in replacement to Node's EventEmitter class
* Provide A+ promises
* Expect A+ promises or values in listeners

## Edge cases

Now that we're going from finishing a priority level to the next level, we have some interesting cases.

### race condition to once

* several event handlers are set on "test" with high priority
* one event handler set to execute once on "test" with normal priority
* event "test" happens, and because of the data with test takes a while to process
* second event "test" happens, and because of data with test takes a short time to process
* even though the second event "test" made it to the normal priority handlers before the first "test" event it does not fire the normal once handler
* the first "test" event triggers the once normal handler (even though the second "test" event has already finished propagating through the event chain)

### race condition to removeListener

* several event handlers are set on "test" with high priority
* one event handler set on "test" with normal priority
* event "test" occurs but takes time to finish the high-priority handlers
* the normal priority event handler is removed with removeListener
* event "test" fires on normal priority handler because the event was triggered at the time the handler was valid

## Class: pevents.EventEmitter

### emitter.addListener(event, [priority = 0], promising_listener)
### emitter.on(event, [priority = 0], promising_listener)

Priority is by default set to zero. Larger integers indicate higher priority, and priority may be both positive and negative.

The promising_listener is a function to be executed when an event is emitted. This function may return an A+ promise.

Listeners with the same priority are executed in parallel, but listeners of differing priority are executed from highest to lowest priority in series.

```javascript
emitter.on('submit', -100, function(data) {
  console.log('executing low-priority handler')
})

emitter.on('submit', function(data) {
  console.log('executing normal-priority handler 1')
  return Q.delay(500).then(function() {
    console.log('done executing normal-priority handler 1')
  })
})

emitter.on('submit', 100, function(data) {
  console.log('executing high-priority handler')
  return Q.delay(500).then(function() {
    console.log('done executing high-priority handler')
  })
})

emitter.on('submit', function(data) {
  console.log('executing normal-priority handler 2')
})

console.log('emitting submit event')
emitter.emit('submit', {value: 'value'}).then(function() {
  console.log('done handling submit event')
}, function(reason) {
  console.error('something went wrong', reason)
})
```

The output of the above example would be:

```
// emitting submit event
// executing high-priority handler
// done executing high-priority handler
// executing normal-priority handler 1
// executing normal-priority handler 2
// done executing normal-priority handler 1
// executing low-priority handler
// done handling submit event
```

## LICENSE

MIT
