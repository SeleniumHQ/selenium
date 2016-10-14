Selenium [![Build Status](https://travis-ci.org/SeleniumHQ/selenium.svg)](//travis-ci.org/SeleniumHQ/selenium)
========
[![SeleniumHQ](http://www.seleniumhq.org/images/big-logo.png)](http://www.seleniumhq.org/)




Selenium is an umbrella project encapsulating a variety of tools and
libraries enabling web browser automation. Selenium specifically
provides infrastructure for the [W3C WebDriver specification](https://dvcs.w3.org/hg/webdriver/raw-file/tip/webdriver-spec.html)
— a platform and language-neutral coding interface compatible with all
major web browsers.

The project is made possible by volunteer contributors who've
generously donated thousands of hours in code development and upkeep.

Selenium's source code is made available under the [Apache 2.0 license](https://github.com/SeleniumHQ/selenium/blob/master/LICENSE).

## Documentation

Narrative documentation:

* [User Manual](http://docs.seleniumhq.org/docs/)
* [New Handbook](https://seleniumhq.github.io/docs/) (work in progress)

API documentation:

* [C#](http://seleniumhq.github.io/selenium/docs/api/dotnet/)
* [JavaScript](http://seleniumhq.github.io/selenium/docs/api/javascript/)
* [Java](http://seleniumhq.github.io/selenium/docs/api/java/index.html)
* [Python](http://seleniumhq.github.io/selenium/docs/api/py/)
* [Ruby](http://seleniumhq.github.io/selenium/docs/api/rb/)

## Pull Requests

Please read [CONTRIBUTING.md](https://github.com/SeleniumHQ/selenium/blob/master/CONTRIBUTING.md)
before submitting your pull requests.

## Building

Selenium uses a custom build system aptly named
[crazyfun](https://github.com/SeleniumHQ/selenium/wiki/Crazy-Fun-Build)
available on all fine platforms (Linux, Mac, Windows).  We are in the
process of replacing crazyfun with
[buck](http://facebook.github.io/buck/), so don't be alarmed if you
see directories carrying multiple build directive files.
For reference, crazyfun's build files are named *build.desc*,
while buck's are named simply *BUCK*.

Before building ensure that you have the
[most recent `chromedriver` ](https://sites.google.com/a/chromium.org/chromedriver/downloads)
available on your `$PATH`.  

To build Selenium, in the same directory as this file:

```sh
./go build
```

The order of building modules is determined by the build system.
If you want to build an individual module
(assuming all dependent modules have previously been built),
try the following:

```sh
./go //javascript/atoms:test:run
```

In this case, `javascript/atoms` is the module directory,
`test` is a target in that directory's `build.desc` file,
and `run` is the action to run on that target.

As you see *build targets* scroll past in the log,
you may want to run them individually.
crazyfun can run them individually,
by target name as long as `:run` is appended (see above).

To list all available targets, you can append the `-T` flag:

```sh
./go -T
```

### Buck

Although the plan is to return to a vanilla build of Buck as soon as
possible, we currently use a fork hosted at
https://github.com/SeleniumHQ/buck To build using Buck, first clone that
repo and build using ant. Then add Buck's "bin" directory to your
PATH.

To obtain a list of all available targets:

```sh
buck targets
```

And build a particular file:

```sh
buck build //java/client/src/org/openqa/selenium:webdriver-api
```

There are aliases for commonly invoked targets in the `.buckconfig`
file, and these aliases can be invoked directly:

```sh
buck build htmlunit
```

All buck output is stored under "buck-out", with the outputs of build
rules in `buck-out/gen`.

If you are doing a number of incremental builds, then you may want to
use `buckd`, which starts a long-lived buck process to watch outputs
and input files. If you do this, consider using `watchman` too, since
the Java 7 file watcher isn't terribly efficient. This can be cloned
from https://github.com/facebook/watchman

## Requirements

* [Java 8 JDK](http://www.oracle.com/technetwork/java/javase/downloads/index.html)
* `java` and `jar` on the PATH

Although the build system is based on rake it's **strongly advised**
to rely on the version of JRuby in `third_party/` that is invoked by
`go`.  The only developer type who would want to deviate from this is
the “build maintainer” who's experimenting with a JRuby upgrade.

Note that all Selenium Java artefacts are **built with Java 8
(mandatory)**.  Those _will work with any Java >= 8_.

### Optional Requirements

* Python 2.6.x to 2.7 (without this, Python tests will be skipped)
* Ruby 1.9.3

### Internet Explorer Driver

If you plan to compile the
[IE driver](https://github.com/SeleniumHQ/selenium/wiki/InternetExplorerDriver)
you also need:

* [Visual Studio 2008](http://www.microsoft.com/visualstudio/en-gb/products/2008-editions)
* 32 and 64 bit cross compilers

The build will work on any platform, but the tests for IE will be
skipped silently, if you are not building on Windows.

## Common Tasks

For an express build of the binaries we release run the following from
the directory containing the `Rakefile`:

```sh
./go release
```

All build output is placed under the `build` directory. The output can
be found under `build/dist`.  If an error occurs while running this
task complaining about a missing Albacore gem, the chances are you're
using `rvm`.  If this is the case, switch to the system ruby:

```sh
rvm system
```

Of course, building the entire project can take too long. If you just
want to build a single driver, then you can run one of these targets:

```sh
./go chrome
./go firefox
./go htmlunit
./go ie
```

As the build progresses, you'll see it report where the build outputs
are being placed.  Of course, just building isn't enough.  We should
really be able to run the tests too.  Try:

```sh
./go test_chrome
./go test_firefox
./go test_htmlunit
./go test_ie
```

Note that the `test_chrome` target requires that you have the separate
[Chrome Driver](https://github.com/SeleniumHQ/selenium/wiki/ChromeDriver)
binary available on your `PATH`.

If you are interested in a single language binding, try one of:

```sh
./go test_java
./go test_dotnet
./go test_rb
./go test_javascript
```

To run all the tests just run:

```sh
./go test
```

This will detect your OS and run all the tests that are known to be
stable for every browser that's appropriate to use for all language
bindings.  This can take a healthy amount of time to run.

To run the minimal logical Selenium build:

```sh
./go test_javascript test_java
```

As a side note, **none of the developers** run tests using
[Cygwin](http://www.cygwin.com/).  It is very unlikely that the build
will work as expected if you try and use it.

## Tour

The code base is generally segmented around the languages used to
write the component.  Selenium makes extensive use of JavaScript, so
let's start there.  Working on the JavaScript is easy.  First of all,
start the development server:

```sh
./go debug-server
```

Now navigate to
[http://localhost:2310/javascript](http://localhost:2310/javascript).
You'll find the contents of the `javascript/` directory being shown.
We use the [Closure
Library](https://developers.google.com/closure/library/) for
developing much of the javascript, so now navigate to
[http://localhost:2310/javascript/atoms/test](http://localhost:2310/javascript/atoms/test).

The tests in this directory are normal HTML files with names ending
with `_test.html`.  Click on one to load the page and run the test. You
can run all the javascript tests using:

```sh
./go test_javascript
```

## Maven POM files

Here is the [public Selenium Maven
repository](http://repo1.maven.org/maven2/org/seleniumhq/selenium/).

## Build Output

`./go` only makes a top-level `build` directory.  Outputs are placed
under that relative to the target name. Which is probably best
described with an example.  For the target:

```sh
./go //java/client/src/org/openqa/selenium:selenium-api
```

The output is found under:

```sh
build/java/client/src/org/openqa/selenium/selenium-api.jar
```

If you watch the build, each step should print where its output is
going.  Java test outputs appear in one of two places: either under
`build/test_logs` for [JUnit](http://junit.org/) or in
`build/build_log.xml` for [TestNG](http://testng.org/doc/index.html)
tests.  If you'd like the build to be chattier, just append `log=true`
to the build command line.

# Help with *go*

More general, but basic, help for *go*…

```sh
./go --help
```

Remember, *go* is just a wrapper around
[Rake](http://rake.rubyforge.org/), so you can use the standard
commands such as `rake -T` to get more information about available
targets.

## Maven _per se_

If it is not clear already, Selenium is not built with Maven, it is
built with [Buck](https://github.com/SeleniumHQ/buck),
though that is invoked with *go* as outlined above so you do not really
have to learn too much about that.

That said, it is possible to relatively quickly build selenium pieces
for Maven to use. You are only really going to want to do this when
you are testing the cutting-edge of Selenium development (which we
welcome) against your application.  Here is the quickest way to build
and deploy into you local maven repository (`~/.m2/repository`), while
skipping Selenium's own tests.

```sh
./go maven-install
```

The maven jars should now be in your local ~/.m2/repository. You can also publish
directly using Buck:

```sh
buck publish -r your-repo //java/client/src/org/openqa/selenium:selenium
```

This sequence will push some seven or so jars into your local Maven
repository with something like 'selenium-server-3.0.0.jar' as
the name.

## Useful Resources

Refer to the [Building Web
Driver](https://github.com/SeleniumHQ/selenium/wiki/Building-WebDriver)
wiki page for the last word on building the bits and pieces of Selenium.
