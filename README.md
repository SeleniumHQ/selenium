# Selenium git repositories

The authorative master repository of selenium is at https://code.google.com/p/selenium/. It also mirrored on
GitHub, which may be found at https://github.com/SeleniumHQ/selenium.

# Pull requests

We accept pull requests from GitHub. When making the pull request, please indicate that
you have filled in the [CLA](https://spreadsheets.google.com/spreadsheet/viewform?hl=en_US&formkey=dFFjXzBzM1VwekFlOWFWMjFFRjJMRFE6MQ#gid=0)

Merging pull requests cannot be done with the GitHub GUI. The email sent from GitHub can be used on
your local repository or you can use the ["power git checkout"](http://maven.apache.org/developers/conventions/git.html#power-git_checkout).


[Selenium 2.0](http://code.google.com/p/selenium/) builds with
**its own build technology** called
[CrazyFun](http://code.google.com/p/selenium/wiki/CrazyFunBuild) - that's
good for Windows, Linux and Mac.

# Quick intro

In the same directory as this file, do...

```bash
./go
```

The order of building modules is determined by the `go` system itself.
If you want to build an individual module (assuming all dependent modules have
previously been build) try something like:

```bash
./go //javascript/atoms:test:run
```

In this case, `javascript/atoms` is the module directory, and `test` is a target
in that directory's `build.desc` file

As you see 'build targets' scroll past in the log, you may want to run them
individually. `go` can run them individually, by target name as long as `:run`
is appended (see above).

# Requirements

* [Java 6 JDK](http://www.oracle.com/technetwork/java/javase/downloads/index.html)
* `java` and `jar` on the PATH

Although the build system is based on rake it's **strongly advised** to rely on
the version of JRuby in `third_party/` that is invoked by `go`.
The only developer type who would want to deviate from this is the
"build maintainer" who's experimenting with a JRuby upgrade.

Note that all Selenium Java artefacts are **built with Java 6 (mandatory)**.
Those _will work with any Java >= 6_.

## Optional Requirements

* Python 2.6.x to 2.7  (without this, Python tests will be skipped)

## Internet Explorer Driver

If you plan to compile the
[IE driver](http://code.google.com/p/selenium/wiki/InternetExplorerDriver)
you also need:

* [Visual Studio 2008](http://www.microsoft.com/visualstudio/en-gb/products/2008-editions)
* 32 and 64 bit cross compilers

The build will work on any platform, but the tests for IE will be skipped
silently, if you are not building on Windows.

# Common Tasks

For an express build of the binaries we release run the following from the
directory containing the `Rakefile`:

```bash
./go clean release
```

All build output is placed under the `build` directory. The output can be found
under `build/dist`.
If an error occurs while running this task complaining about a missing Albacore
gem, the chances are you're using `rvm`.
If this is the case, switch to the system ruby:

```bash
rvm system
```

Of course, building the entire project can take too long. If you just want to
build a single driver, then you can run one of these targets:

```bash
./go chrome
./go firefox
./go htmlunit
./go ie
./go opera
```

As the build progresses, you'll see it report where the build outputs are being
placed. Of course, just building isn't enough. We should really be able to run
the tests too. Try:

```bash
./go test_chrome
./go test_firefox
./go test_htmlunit
./go test_ie
```

Note that the `test_chrome` target requires that you have the separate
[Chrome Driver](http://code.google.com/p/selenium/wiki/ChromeDriver) binary
available on your `PATH`.

If you are interested in a single language binding, try one of:

```bash
./go test_java
./go test_dotnet
./go test_rb
./go test_javascript
```

To run all the tests just run:

```bash
./go test
```

This will detect your OS and run all the tests that are known to be stable for
every browser that's appropriate to use for all language bindings.
This can take a healthy amount of time to run.

To run the minimal logical Selenium build:

```bash
./go test_javascript test_java
```

To get a list of tasks you could build, do:

```bash
./go -T
```

As a side note, **none of the developers** run tests using
[Cygwin](http://www.cygwin.com/).
It is very unlikely that the build will work as expected if you try and use it.

# Tour

The code base is generally segmented around the languages used to write the
component. Selenium makes extensive use of JavaScript, so let's start there.
Working on the JavaScript is easy. First of all, start the development server:

```bash
./go debug-server
```

Now navigate to [http://localhost:2310/javascript](http://localhost:2310/javascript).
You'll find the contents of the `javascript/` directory being shown.
We use the [Closure Library](https://developers.google.com/closure/library/)
for developing much of the javascript, so now navigate to
[http://localhost:2310/javascript/atoms/test](http://localhost:2310/javascript/atoms/test).

The tests in this directory are normal HTML files with names ending with
`_test.html`. Click on one to load the page and run the test. You can run all
the javascript tests using:

```bash
./go test_javascript
```

# Maven POM files

Ignore the [Maven](http://maven.apache.org/) POM file present in the same
directory. It is only used for releasing to jars to Maven Repository (public or
local), and is not considered the main build mechanism.

Here is the[public Selenium Maven repository](http://repo1.maven.org/maven2/org/seleniumhq/selenium/).

# Build Output

`./go` only makes a top-level `build` directory. Outputs are placed under that
relative to the target name. Which is probably best described with an example.
For the target:

```bash
./go //java/client/src/org/openqa/selenium:selenium-api
```

The output is found under:

```bash
build/java/client/src/org/openqa/selenium/selenium-api.jar
```

If you watch the build, each step should print where its output is going.
Java test outputs appear in one of two places: either under `build/test_logs`
for [JUnit](http://junit.sourceforge.net/) or in `build/build_log.xml`
for [TestNG](http://testng.org/doc/index.html) tests.
If you'd like the build to be chattier, just append `log=true` to the build
command line.

# Help with 'Go'

More general, but basic, help for 'go' ...

```bash
./go --help
```

Remember, `go` is just a wrapper around [Rake](http://rake.rubyforge.org/),
so you can use the standard commands such as `rake -T` to get more information
about available targets.

# Maven _per se_

If it is not clear already, Selenium is not built with Maven, it is built with
[Crazy-Fun](http://code.google.com/p/crazy-fun/) though that is invoked with
`go` as outlined above so you do not really have to learn too much about that.

That said, it is possible to relatively quickly build selenium pieces for Maven
to use. You are only really going to want to do this when you are testing the
cutting-edge of Selenium development (which we welcome) against your
application.  Here is the quickest way to build and deploy into you local maven
repository (`~/.m2/repository`), while skipping Selenium's own tests.

```bash
./go release
cd maven
mvn clean install
```

This sequence will push some seven or so jars into you local Maven repository
with something like 'selenium-server-2.0-SNAPSHOT.jar' as the name.

# Last word on building the bits and pieces of Selenium

Refer [Building Web Driver](http://code.google.com/p/selenium/wiki/BuildingWebDriver)
wiki page.
