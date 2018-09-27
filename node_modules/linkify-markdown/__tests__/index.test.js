const execa = require('execa')
const Emitter = require('events')

class TestEmitter extends Emitter {}

const instance = new TestEmitter()

// Avoids memory leak when running all the tests
instance.setMaxListeners(instance.getMaxListeners() + 40)

const single = 'node src/index.js samples/A.md --strong'
const singleDone = '\n✅  Done adding references to your file samples/A.md\n'

const singleEmpty = 'node src/index.js samples/D.md'
const emptyMsg = '\nHmm... seems like the file samples/D.md is empty.\n'

const multiple = 'node src/index.js samples/A.md samples/B.md samples/C.md'
const multipleDone = `\n✅  Done adding references to 2 files:

1. samples/A.md
2. samples/B.md

Skipped processing the file samples/C.md\n`

const multipleSkip =
  'node src/index.js samples/A.md samples/B.md samples/C.md samples/D.md -s'
const skipList = `\n✅  Done adding references to 2 files:

1. samples/A.md
2. samples/B.md

Skipped processing the files 👇

1. samples/C.md
2. samples/D.md\n`

const directory = 'node src/index.js -d samples/'
const dirSkip = `\n✅  Done adding references to 2 files:

1. A.md
2. B.md

Skipped processing the files 👇

1. C.md
2. D.md\n`

const emptyDir = 'node src/index.js -d empty/'
const wasEmpty = `\nHmm... seems like the directory empty/ is empty.\n`

const run = (command, output) => {
  execa.shell(command).then(result => {
    expect(result.stdout).toEqual(output)
  })
}

describe('Linkify your markdown files', () => {
  it('should process single file with or without options', () =>
    run(single, singleDone))

  it('should not process a single file if it is empty', () =>
    run(singleEmpty, emptyMsg))

  it('should process multiple files', () => run(multiple, multipleDone))

  it('should give list of skipped files when multiple files are the input', () =>
    run(multipleSkip, skipList))

  it('should process the whole directory', () => run(directory, dirSkip))

  it('skip processing the directory if it is empty', () =>
    run(emptyDir, wasEmpty))
})
