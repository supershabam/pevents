pevents
=======

A promising, prioritized event emitter. Attempts to follow Node's EventEmitter API as much as possible.

## Why

Because I've wanted a prioritized event emitter on multiple occasions. In order to ensure priority, you need to know when previous priority levels finish executing. Promises provide a clean and powerful way to extend the EventEmitter for listeners that need to do asynchronous activities to finish.

## Specs

* Should operate as a drop-in replacement to Node's EventEmitter class
* Provide A+ promises
* Expect A+ promises or values in listeners

## Class: pevents.EventEmitter

### emitter.addListener([priority = 0], event, promising_listener)
### emitter.on([priority = 0], event, promising_listener)

Priority is by default set to zero. Larger integers indicate higher priority, and priority may be both positive and negative.

The promising_listener is a function to be executed when an event is emitted. This function may return an A+ promise.

Listeners with the same priority are executed in parallel, but listeners of differing priority are executed from highest to lowest priority in series.

```javascript
emitter.on(-100, 'submit', function(data) {
  console.log('executing low-priority handler')
})

emitter.on('submit', function(data) {
  console.log('executing normal-priority handler 1')
})

emitter.on(100, 'submit', function(data) {
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
// executing low-priority handler
// done handling submit event
```

## LICENSE

MIT
