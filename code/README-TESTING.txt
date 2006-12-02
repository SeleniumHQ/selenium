Selenium Core can be tested in a variety of different ways, depending
on what you're doing at the moment.  The easiest way to test it is to
simply open code/core/TestRunner.html in your browser of choice.  As
you're developing, hit Refresh and click the Play button until the
tests turn green.

The ant script "build.xml" knows how to run tests on a variety of
browsers in a variety of modes.  Currently we support automatically
testing Firefox, IE (Windows only), and Opera.  We also support
testing Firefox in "chrome" mode (aka as a FF extension), which gives
us elevated security privileges.  (Selenium IDE runs in chrome mode.)

The targets to run these tests are: "firefoxTests", "iexploreTests",
"operaTests", and "chromeTests".  So "ant chromeTests" will run the
tests in Firefox/chrome mode.  You can also run our JsUnit tests
(firefox only) by using the "unittests" target.

There are also targets for running tests in Konqueror (konqTests) and
Safari (safariTests), but as of this writing (December 1, 2006) those
targets aren't wired up to be run automatically.  (For Konqueror, this
is due to SEL-342, which crashes konq.  For Safari, this is because we
don't have a Mac build machine.  It would also be nice to resolve
SRC-13 before we officially supported Safari.)

We also have support for running tests in IE HTA mode.  Currently we
only run those tests directly off the filesystem with the
"htaTests-simple" target.  We also have an "iehtaTests" target that
tests iehta mode using selenium-server-coreless, but we don't run
it automatically (as of this writing, December 1, 2006) because of
SEL-390, which crashes iexplore.exe.

The tests have two mode "flags" that can be turned on/off:

* multiWindow: run the AUT in its own window.  In singleWindow mode,
the AUT is a frame within the Selenium window.
* slowResources: server artificially delays responding to each HTTP
request; good for catching page loading bugs.

There are therefore 4 combinations of tests to run: multiWindow/fast,
singleWindow/fast, multiWindow/slow and singleWindow/slow.

If you run "ant all-with-tests", we'll run every test of Selenium Core
that we know how to do on the current operating system.  (On our
official Windows box, that runs the tests in FF, IE, Opera and Chrome
in all four modes; this takes an hour.)  It will also run the JsUnit
unit tests (in Firefox only).

As a developer, you probably don't want to run all of those tests all
of the time.  Here's how you can run just a subsection of the tests
in order to test just what you need to test in an efficient way.

0) One browser, multiWindow/fast: ant firefoxTests
1) All browsers, multiWindow/fast: ant test-allbrowsers
2) One browser, non-standard mode: ant firefoxTests -DmultiWindow=false -DslowResources=true
3) All browsers, non-standard mode: ant test-allbrowsers -DmultiWindow=false -DslowResources=true
4) One browser, all modes: ant test-allmodes -Dallmodes.target=firefoxTests
5) All browsers, all modes: ant test-allmodes

In addition to the above options, you may want to run just one
particular test suite on many browsers: if so, you can specify which
suite by setting the suite property: "-Dsuite=ShortTestSuite" (note no
'.html' extension).  Note that this does need to be a *suite* of
tests; you can't just run TestOpen.html in this way.  (Hence, you may
want to modify ShortTestSuite to include only TestOpen.html, if you
just want to run that one test.)

You can use the "-Dsuite" option together with any of the options
listed above.  So "ant test-allbrowsers -Dsuite=ShortTestSuite" will
run just the ShortTestSuite on all browsers.

If you have questions about this, feel free to post them to our
forums at http://forums.openqa.org

Good luck!

P.S. Do you feel lucky?  try "test-allbrowsers-parallel" or
"test-allmodes-parallel".  It tends to turn up false failures a lot
of the time, but if it passes, you can be pretty confident your
code works.  :-)