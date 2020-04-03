Selenium [![Travis Status](https://travis-ci.com/SeleniumHQ/selenium.svg?branch=master)](//travis-ci.com/SeleniumHQ/selenium/builds) [![AppVeyor Status](https://ci.appveyor.com/api/projects/status/pg1f99p1aetp9mk9/branch/master?svg=true)](https://ci.appveyor.com/project/SeleniumHQ/selenium/branch/master)
========
<a href="https://selenium.dev"><img src="https://selenium.dev/images/selenium_logo_square_green.png" width="180" alt="Selenium"/></a>

Selenium is an umbrella project encapsulating a variety of tools and
libraries enabling web browser automation. Selenium specifically
provides infrastructure for the [W3C WebDriver specification](https://w3c.github.io/webdriver/)
— a platform and language-neutral coding interface compatible with all
major web browsers.

The project is made possible by volunteer contributors who've
generously donated thousands of hours in code development and upkeep.

Selenium's source code is made available under the [Apache 2.0 license](https://github.com/SeleniumHQ/selenium/blob/master/LICENSE).

## Documentation

Narrative documentation:

* [User Manual](https://selenium.dev/documentation/)

API documentation:

* [C#](https://seleniumhq.github.io/selenium/docs/api/dotnet/)
* [JavaScript](https://seleniumhq.github.io/selenium/docs/api/javascript/)
* [Java](https://seleniumhq.github.io/selenium/docs/api/java/index.html)
* [Python](https://seleniumhq.github.io/selenium/docs/api/py/)
* [Ruby](https://seleniumhq.github.io/selenium/docs/api/rb/)

## Pull Requests

Please read [CONTRIBUTING.md](https://github.com/SeleniumHQ/selenium/blob/master/CONTRIBUTING.md)
before submitting your pull requests.

## Building

In order to build Selenium, you'll generally use the `./go` command. `./go` is a Rake script,
which wraps the main build too, `bazel`.

### Bazel

[Bazel](https://bazel.build/) was built by the fine folks at Google. Bazel manages dependency 
downloads, generates the Selenium binaries, executes tests and does it all rather quickly.

More detailed instructions for getting Bazel running are below, but if you can successfully get
the java and javascript folders to build without errors, you should be confident that you have the 
correct binaries on your system.

### Before Building

Ensure that you have Chrome installed and the
[`chromedriver` ](https://chromedriver.chromium.org/downloads) that matches
your Chrome version available on your `$PATH`. You may have to update this from time to time.

### Common Build Targets

To build the most commonly-used modules of Selenium from source, execute this command from the root
project folder:

```sh
bazel build java/...
```

If you have some extra time on your hands, you can run this command to get extra confidence
that your build is successful. This will do a lot more work to build all the javascript artifacts:

```sh
bazel build java/... javascript/...
```

If you're making changes to the java/ or javascript/ folders in this project, and this command
executes without errors, you should be able to create a PR of your changes. (See also CONTRIBUTING.md)

### Build Details ###

- Bazel files are called BUILD.bazel
- [crazyfun](https://github.com/SeleniumHQ/selenium/wiki/Crazy-Fun-Build) build files are called 
*build.desc*. This is an older build system, still in use in the project
- There is also a main Rakefile

The order the modules are built is determined by the build system. If you want to build an 
individual module (assuming all dependent modules have previously been built), try the following:

```sh
./go javascript/atoms:test:run
```

In this case, `javascript/atoms` is the module directory,
`test` is a target in that directory's `build.desc` file,
and `run` is the action to run on that target.

As you see *build targets* scroll past in the log,
you may want to run them individually. crazyfun can run them individually,
by target name, as long as `:run` is appended (see above).

To list all available targets, you can append the `-T` flag:

```sh
./go -T
```

## Requirements

* The latest version of the [Java 11 OpenJDK](http://www.oracle.com/technetwork/java/javase/downloads/index.html)
* `java` and `jar` on the PATH (make sure you use `java` executable from JDK but not JRE). 
  * To test this, try running the command `javac`. This command won't exist if you only have the JRE
  installed. If you're met with a list of command-line options, you're referencing the JDK properly.
* [Python](https://www.python.org/)
* `python` on the PATH
* [The Requests Library](http://python-requests.org) for Python: `pip install requests`
* MacOS users should have the latest version of Xcode installed, including the command-line tools.
The following command should work:

```bash
xcode-select --install
```

Although the build system is based on rake, it's **strongly advised**
to rely on the version of JRuby in `third_party/` that is invoked by
`go`.  The only developer type who would want to deviate from this is
the “build maintainer” who's experimenting with a JRuby upgrade.

### Optional Requirements

* Python 3.5+ (if you want to run Python tests for this version)
* Ruby 2.0

### Internet Explorer Driver

If you plan to compile the
[IE driver](https://github.com/SeleniumHQ/selenium/wiki/InternetExplorerDriver),
you also need:

* [Visual Studio 2008](https://www.visualstudio.com/)
* 32 and 64 bit cross compilers

The build will work on any platform, but the tests for IE will be
skipped silently if you are not building on Windows.

## Common Tasks (Bazel)

To build the bulk of the Selenium binaries from source, run the 
following command from the root folder:

```sh
bazel build java/... javascript/...
```

To build the grid deployment jar, run this command:

```sh
bazel build grid
```

To run tests within a particular area of the project, use the "test" command, followed
by the folder or target. Tests are tagged with "small", "medium", or "large", and can be filtered
with the `--test_size_filters` option:

```sh
bazel test --test_size_filters=small,medium java/...
```

Bazel's "test" command will run *all* tests in the package, including integration tests. Expect
the ```test java/...``` to launch browsers and consume a considerable amount of time and resources.

## Tour

The code base is generally segmented around the languages used to
write the component.  Selenium makes extensive use of JavaScript, so
let's start there.  Working on the JavaScript is easy.  First of all,
start the development server:

```sh
./go debug-server
```

Now, navigate to
[http://localhost:2310/javascript](http://localhost:2310/javascript).
You'll find the contents of the `javascript/` directory being shown.
We use the [Closure
Library](https://developers.google.com/closure/library/) for
developing much of the JavaScript, so now navigate to
[http://localhost:2310/javascript/atoms/test](http://localhost:2310/javascript/atoms/test).

The tests in this directory are normal HTML files with names ending
with `_test.html`.  Click on one to load the page and run the test. You
can run all the JavaScript tests using:

```sh
./go test_javascript
```

## Maven POM files

Here is the [public Selenium Maven
repository](https://repo1.maven.org/maven2/org/seleniumhq/selenium/).

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

# Help with `go`

More general, but basic, help for `go`…

```sh
./go --help
```

`go` is just a wrapper around
[Rake](http://rake.rubyforge.org/), so you can use the standard
commands such as `rake -T` to get more information about available
targets.

## Maven _per se_

If it is not clear already, Selenium is not built with Maven. It is
built with `bazel`, though that is invoked with `go` as outlined above, 
so you do not really have to learn too much about that.

That said, it is possible to relatively quickly build Selenium pieces
for Maven to use. You are only really going to want to do this when
you are testing the cutting-edge of Selenium development (which we
welcome) against your application.  Here is the quickest way to build
and deploy into your local maven repository (`~/.m2/repository`), while
skipping Selenium's own tests.

```sh
./go maven-install
```

The maven jars should now be in your local `~/.m2/repository`.

## Useful Resources

Refer to the [Building Web
Driver](https://github.com/SeleniumHQ/selenium/wiki/Building-WebDriver)
wiki page for the last word on building the bits and pieces of Selenium.

## Bazel Installation/Troubleshooting

### MacOS

#### bazelisk 

Bazelisk is a Mac-friendly launcher for Bazel. To install, follow these steps:

```sh
brew tap bazelbuild/tap && \
brew uninstall bazel; \
brew install bazelbuild/tap/bazelisk
```

#### Xcode

If you're getting errors that mention Xcode, you'll need to install the command-line tools.

Bazel for Mac requires some additional steps to configure properly. First things first: use
the Bazelisk project (courtesy of philwo), a pure golang implementation of Bazel. In order to 
install Bazelisk, first verify that your Xcode will cooperate: execute the following command:

`xcode-select -p`

If the value is `/Applications/Xcode.app/Contents/Developer/`, you can proceed with bazelisk
installation. If, however, the return value is `/Library/Developer/CommandLineTools/`, you'll
need to redirect the Xcode system to the correct value. 

```
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer/
sudo xcodebuild -license
```

The first command will prompt you for a password. The second step requires you to read a new Xcode 
license, and then accept it by typing "agree".

(Thanks to [this thread](https://github.com/bazelbuild/bazel/issues/4314) for these steps)

