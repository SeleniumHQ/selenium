fs = require('fs')
spawnSync = require('child_process').spawnSync
path = require('path')
_ = require('lodash')

isWindows = (process.platform.lastIndexOf('win') == 0)
runSync = (command) ->
  # Spawn things in a sub-shell so things like io redirection and gsutil work
  if isWindows
    shell = 'cmd.exe'
    args = ['/c', command]
  else
    shell = 'sh'
    args = ['-c', command]
  {status, stdout, stderr} = spawnSync(shell, args, {encoding: 'utf8'})
  if stderr?.length > 0 or status > 0
    console.error("Error running: '#{command}'\n#{stderr}\n#{stdout}\n")
    process.exit(status)
  else
    console.log("Output of running '#{command}'\n#{stdout}\n")
    return stdout

task('clean', 'Deletes .js and .map files', () ->
  folders = ['.']
  for folder in folders
    pathToClean = path.join(__dirname, folder)
    contents = fs.readdirSync(pathToClean)
    for file in contents when (_.endsWith(file, '.js') or _.endsWith(file, '.map'))
      fs.unlinkSync(path.join(pathToClean, file))
)

task('compile', 'Compile CoffeeScript source files to JavaScript', () ->
  process.chdir(__dirname)
  fs.readdir('./', (err, contents) ->
    files = ("#{file}" for file in contents when (file.indexOf('.coffee') > 0))
    command = ['coffee', '-c'].concat(files).join(' ')
    runSync(command)
  )
)

task('test', 'Run the CoffeeScript test suite with nodeunit', () ->
#  invoke('testES6')  # Commented out for now until we use Proxy support in later versions to enable array/
  {reporters} = require('nodeunit')
  process.chdir(__dirname)
  reporters.default.run(['test'], undefined, (failure) -> 
    if failure?
      console.log(failure)
      process.exit(1)
  )
)

task('testES6', 'Run tests in testES6 folder with --harmony-proxies flag', () ->
#  runSync("node --harmony-proxies node_modules/nodeunit/bin/nodeunit testES6/es6Test.coffee")
  runSync("node node_modules/nodeunit/bin/nodeunit testES6/es6Test.coffee")
)

task('publish', 'Publish to npm and add git tags', () ->
  process.chdir(__dirname)
  runSync('cake test')  # Doing this externally to make it synchronous
  process.chdir(__dirname)
  runSync('cake compile')
  console.log('checking git status --porcelain')
  stdout = runSync('git status --porcelain')
  if stdout.length > 0
    console.error('`git status --porcelain` was not clean. Not publishing.')
  else
    console.log('checking origin/master')
    stdout = runSync('git rev-parse origin/master')

    console.log('checking master')
    stdoutOrigin = stdout
    stdout = runSync('git rev-parse master')
    stdoutMaster = stdout

    if stdoutOrigin == stdoutMaster

      console.log('running npm publish')
      runSync('npm publish .')

      try
        stat = fs.statSync('npm-debug.log')
        console.error('`npm publish` failed. See npm-debug.log for details.')
        process.exit(1)

      console.log('creating git tag')
      runSync("git tag v#{require('./package.json').version}")
      runSync("git push --tags")
      invoke("clean")
    else
      console.error('Origin and master out of sync. Not publishing.')
)


