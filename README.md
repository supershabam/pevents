pevents
=======

A promising, prioritized event emitter. Attempts to follow Node's EventEmitter API as much as possible.


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
