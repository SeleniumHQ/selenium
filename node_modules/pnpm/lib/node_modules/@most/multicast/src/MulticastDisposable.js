export default class MulticastDisposable {
  constructor (source, sink) {
    this.source = source
    this.sink = sink
    this.disposed = false
  }

  dispose () {
    if (this.disposed) {
      return
    }
    this.disposed = true
    const remaining = this.source.remove(this.sink)
    return remaining === 0 && this.source._dispose()
  }
}
