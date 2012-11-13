3.1.1 (August 4th, 2012)
========================

Bugfix release. This release is special in that it mainly contains code by other people. Thanks guys!

* Fix bug that could result in a long long overflow (Ole André Vadla Ravnås)
* Make SINGLETON thread safe (Alen Zhou)
* Updated .gitattributes to say that tests are binary files (Phill Baker)
* Fix string formatter warning in new XCode (Andy Brett)
* Fix issue that could lead to "bad access" or zombie errors (jonkean)
* Update links to API docs


3.1 (March 26th, 2012)
=====================

Automatic Reference Counting
----------------------------

3.1 requires Xcode 4.2 to build, because previous versions did
not have ARC support. If you can't use Xcode 4.2, or for some reason
can't use ARC, you need to stick with version 3.0.

To make this move simpler I decided to move to 64-bit only & remove
instance variables for properties.

Miscellaneous
-------------

* Added an optional comparator that is used when sorting keys.
* Be more memory-efficient when parsing long strings containing escaped characters.
* Add a Workspace that includes the sample projects, for ease of browsing.
* Report error for numbers with exponents outside range of -128 to 127.


3.0 (June 18th, 2011)
=====================

JSON Stream Support
-------------------

We now support parsing of documents split into several NSData chunks,
like those returned by *NSURLConnection*. This means you can start
parsing a JSON document before it is fully downloaded. Depending how you
configure the delegates you can chose to have the entire document
delivered to your process when it's finished parsing, or delivered
bit-by-bit as records on a particular level finishes downloading. For
more details see *SBJsonStreamParser* and *SBJsonStreamParserAdapter* in
the [API docs][api].

There is also support for *writing to* JSON streams. This means you can
write huge JSON documents to disk, or an HTTP destination, without
having to hold the entire structure in memory. You can use this to
generate a stream of tick data for a stock trading simulation, for
example. For more information see *SBJsonStreamWriter* in the [API
docs][api].

Parse and write UTF8-encoded NSData
-----------------------------------

The internals of *SBJsonParser* and *SBJsonWriter* have been rewritten
to be NSData based. It is no longer necessary to convert data returned
by NSURLConnection into an NSString before feeding it to the parser. The
old NSString-oriented API methods still exists, but now converts their
inputs to NSData objects and delegates to the new methods.

Project renamed to SBJson
-------------------------

The project was renamed to avoid clashing with Apple's private
JSON.framework. (And to make it easier to Google for.)

* If you copy the classes into your project then all you need to update
is to change the header inclusion from `#import "JSON.h"` to `#import
"SBJson.h"`.
* If you link to the library rather than copy the classes you have to
change the library you link to. On the Mac `JSON.framework` became
`SBJson.framework`. On iOS `libjson.a` became `libsbjson-ios.a`. In both
cases you now have to `#import <SBJson/SBJson.h>` in your code.

API documentation integrated with Xcode
---------------------------------------

The *InstallDocumentation.sh* script allows you to generate [API
documentation][api] from the source and install it into Xcode, so it's
always at your fingertips. (This script requires [Doxygen][] to be
installed.) After running the script from the top-level directory, open
Xcode's documentation window and search for SBJson. (You might have to
close and re-open Xcode for the changes to take effect.)

[api]: http://stig.github.com/json-framework/api/3.0/
[Doxygen]: http://doxygen.org

Example Projects
----------------

These can be found in the Examples folder in the distribution.

* TweetStream: An exampleshowing how to use the new streaming
functionality to interact with Twitter's multi-document streams. This
also shows how to link to the iOS static lib rather than having to copy
the classes into your project.
* DisplayPretty: A small Mac example project showing how to link to an
external JSON framework rather than copying the sources into your
project. This is a fully functional (though simplistic) application that
takes JSON input from a text field and presents it nicely formatted into
another text field.
