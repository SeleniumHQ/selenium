# JSON Framework Changes

## Version 3.1alpha3 (October 17th, 2011)

Support for Automatic Reference counting now that Xcode 4.2 is officially released. Note that this release *requires* ARC to avoid leaking memory. Fixes [Issue #79][#79], [Issue #82][#82], [Issue #101][], and [Issue #103][].

## Version 3.1alpha2 (August 28th, 2011)

* Revert fix to [Issue 83][#83]. People are already using the low-level protocol.
* [Issue 88][#88]: Fix parsing of -0 into the integer 0.
* [Issue 86][#86]: Make framework compile on Leopard.
* [Issue 91][#91]: Fix leak of error string in certain situations.

## Version 3.1alpha1 (July 30th, 2011)

* [Issue 9][#9]: Improve writing speed in samsoffes' benchmark.
* [Issue 79][#79]: Automatic Reference Counting (ARC) Support.

## Version 3.0.2 (July 27th, 2011)

* [Issue 88][#88]: Fix parsing of -0 into the integer 0.
* [Issue 86][#86]: Make framework compile on Leopard.

## Version 3.0.1 (July 1st, 2011)

* [Issue 80][#80]: Kill memory leak reported by DinosaurDad.
* Fix typo in Readme

## Version 3.0 (June 18th, 2011)

* Bump version number

## Version 3.0beta3 (June 11th, 2011)

### Changes

* Fleshed out the [API documentation][api].
* Remove the (admittedly rather cool) JavaScript hack from the Contrib directory, as I don't want to get stuck maintaining JavaScript I don't understand after 3.0.
* Moved content of Installation file to Readme.
* [Issue 73][#73]: Project rename, to avoid clashing with Apple's internal JSON.framework
  * Renamed Mac framework to SBJson.framework
  * Renamed iOS static lib to sbjson-ios.
  * Changed name of main header to be SBJson.h rather than JSON.h. A backward compatibility header is included, but this will be removed in the future.
* Expanded the Mac example app to be a fully functional application
that reformats JSON you put into a text field.
* Removed the header indirection hack by making more headers public.
* Detect if NSCache is available and only use it if it is. This lets us support iOS versions prior to 4.0.

### Bug Fixes

* [Issue 43][#43]: Don't crash on parsing broken UTF8.
* [Issue 70][#70]: SBStateStack breaks when running with GC. This was
fixed by removing it and just using an NSMutableArray. This turns out
to have very little measurable effect on performance.


## Version 3.0beta2 (May 24th, 2011)

### Changes

* The parser used to always return NSMutableStrings, but may now return NSString instead, for strings with no escapes in them. This change speeded up the parser by about 30% on samsoffes' benchmark.
* Recent refactoring to clean up the code had negative impact on the performance in samsoffes' comparative benchmark. Most of this was reclaimed, but we are still a bit slower than beta1 in his test. Particularly for writing. (We are, however, not slowest.)

### Enhancements

* [Issue 40][#40]: Remove unnecessary script phase build
* [Issue 55][#55]: SBJsonStreamWriter stringCache is now using NSCache instead of NSMutableDictionary. This firstly means it is now thread-safe, and secondly that it will free up memory automatically if the OS requests it.

[#40]: http://github.com/stig/json-framework/issues/40

### Bug Fixes
* [Issue 64][#64]: Handle really long integers better.
* [Issue 66][#66]: Parser fails to ignore trailing garbage
* [Issue 42][#42]: Fix bug in handling of Unicode Surrogate Pairs.
* [Issue 48][#48]: Increase precision when writing floating-point numbers so NSTimeInterval instances since epoch can be represented fully.

## Version 3.0beta1 (January 30th, 2011)

### Bug Fixes
* [Issue 36][#36]: Fix bug in build script that caused it to break if $SRCROOT has spaces.

### Changes

* Remove the hacky dataToHere method in favour of just exposing the internal NSMutableData buffer.
* Added a minimal Mac example project showing how to link to an external JSON framework rather than copying the sources into your project.

## Version 3.0alpha3 (January 2nd, 2011)

* Added documentation to the TwitterStream sample project.
* Fixed a few warnings, bugs & a memory leak reported by Andy Warwick.

## Version 3.0alpha2 (December 28th, 2010)

### Changes

* Minor changes to formatting when the HumanReadable flag is set. Empty arrays and objects are no longer special-cased to appear on a single line. The separator between key and value in an object has changed to ': ' rather than ' : '.
* [Issue 25][#25]: Simplified error handling.

### New Features

* [Issue 16][#16]: Added support for parsing a UTF8 data stream. This means you can start parsing huge documents before it's all downloaded. Supports skipping the outer-most layer of huge arrays/objects or parsing multiple whitespace-separated completed documents.
* [Issue 12][#12]: Added support for writing JSON to a data stream. This means you can write huge JSON documents to disk, or an HTTP destination, without having to hold the entire structure in memory. You can even generate it as you go, and just stream snapshots to an external process.
* [Issue 18][#18] & [27][#27]: Re-orient API to be NSData-based. The NSString-oriented API methods now delegates to this.

### Enhancements

* [Issue 9][#9]: Improve performance of the SBJsonWriter. This implementation is nearly twice as fast as 2.3.x on Sam Soffes' [benchmarks][bench].
* [Issue 30][#30]: Added *TwitterStream* example project showing how to interact with Twitter's multi-document stream. (See `Examples/TwitterStream` in the distribution.)


## Version 2.3.1 (September 25th, 2010)

### Changes

* Move to host releases on Github rather than Google code.
* Renamed .md files to .markdown.
* Removed bench target--use [Sam Soffes's benchmarks][bench] instead.
* Releases are no longer a munged form of the source tree, but identical to the tagged source.

### Bug fixes

* [Issue 2][#2]: Linkage not supported by default distribution.
* [Issue 4][#4]: Writer reported to occasionally fail infinity check.
* [Issue 8][#8]: Installation.markdown refers to missing JSON folder.

[#2]: http://github.com/stig/json-framework/issues/2
[#4]: http://github.com/stig/json-framework/issues/4
[#8]: http://github.com/stig/json-framework/issues/8

## Version 2.3 (August 7, 2010)

* Renamed README.md to Readme.md
* Updated version number

## Version 2.3beta1 (July 31, 2010)

### Changes

* **Parsing performance improvements.**
[Issue 56][issue-56]: Dewvinci & Tobias Höhmann came up with a patch to improve parsing of short JSON texts with lots of numbers by over 60%.
* **Refactored tests to be more data-driven.**
This should make the source leaner and easier to maintain.
* **Removed problematic SDK**
[Issue 33][issue-33], [58][issue-58], [63][issue-63], and [64][issue-64]: The vast majority of the issues people are having with this framework were related to the somewhat mystical Custom SDK. This has been removed in this version.
* **Removed the deprecated SBJSON facade**
[Issue 71][issue-71]: You should use the SBJsonParser or SBJsonWriter classes, or the category methods, instead. This also let us remove the SBJsonParser and SBJsonWriter categories; these were only there to support the facade, but made the code less transparent.
* **Removed the deprecated fragment support**
[Issue 70][issue-70]: Fragments were a bad idea from the start, but deceptively useful while writing the framework's test suite. This has now been rectified.

[issue-56]: http://code.google.com/p/json-framework/issues/detail?id=56
[issue-33]: http://code.google.com/p/json-framework/issues/detail?id=33
[issue-58]: http://code.google.com/p/json-framework/issues/detail?id=58
[issue-63]: http://code.google.com/p/json-framework/issues/detail?id=63
[issue-64]: http://code.google.com/p/json-framework/issues/detail?id=64
[issue-70]: http://code.google.com/p/json-framework/issues/detail?id=70
[issue-71]: http://code.google.com/p/json-framework/issues/detail?id=71


### Bug Fixes

* [Issue 38][issue-38]: Fixed header-inclusion issue.
* [Issue 74][issue-74]: Fix bug in handling of Infinity, -Infinity & NaN.
* [Issue 68][issue-68]: Fixed documentation bug

[issue-38]: http://code.google.com/p/json-framework/issues/detail?id=39
[issue-74]: http://code.google.com/p/json-framework/issues/detail?id=74
[issue-68]: http://code.google.com/p/json-framework/issues/detail?id=68


## Version 2.2.3 (March 7, 2010)

* **Added -all_load to libjsontests linker flags.**
This allows the tests to run with more recent versions of GCC.
* **Unable to do a JSONRepresentation for a first-level proxy object.**
[Issue 54][issue-54] & [60][issue-60]: Allow the -proxyForJson method to be called for first-level proxy objects, in addition to objects that are embedded in other objects.

[issue-54]: http://code.google.com/p/json-framework/issues/detail?id=54
[issue-60]: http://code.google.com/p/json-framework/issues/detail?id=60

## Version 2.2.2 (September 12, 2009)

* **Fixed error-reporting logic in category methods.**
Reported by Mike Monaco.
* **iPhone SDK built against iPhoneOS 3.0.**
This has been updated from 2.2.1.

## Version 2.2.1 (August 1st, 2009)

* **Added svn:ignore property to build directory.**
Requested by Rony Kubat.
* **Fixed potential corruption in category methods.**
If category methods were used in multiple threads they could potentially cause a crash. Reported by dprotaso / Relium.

## Version 2.2 (June 6th, 2009)

No changes since 2.2beta1.

## Version 2.2beta1 (May 30th, 2009)

* **Renamed method for custom object support**
Renamed the -jsonRepresentationProxy method to -proxyForJson.

## Version 2.2alpha5 (May 25th, 2009)

* **Added support for custom objects (generation only)**
Added an optional -jsonRepresentationProxy method that you can implement (either directly or as category) to enable JSON.framework to create a JSON representation of any object type. See the Tests/ProxyTest.m file for more information on how this works.
* **Moved maxDepth to SBJsonBase**
Throw errors when the input is nested too deep for writing json as well as parsing. This allows us to exit cleanly rather than break the stack if someone accidentally creates a recursive structure.

## Version 2.2alpha4 (May 21st, 2009)

* **Renamed protocols and moved method declarations**
Renamed SBJsonWriterOptions and SBJsonParserOptions protocols to be the same as their primary implementations and moved their one public method there.
* **Implemented proxy methods in SBJSON**
This facade now implements the same methods as the SBJsonWriter and SBJsonParser objects, and simply forwards to them.
* **Extracted private methods to private protocol**
Don't use these please.
* **Improved documentation generation**
Classes now inherit documentation from their superclasses and protocols they implement.

## Version 2.2alpha3 (May 16th, 2009)

* **Reintroduced the iPhone Custom SDK**
For the benefit of users who prefer not to copy the JSON source files into their project. Also updated it to be based on iPhoneOS v2.2.1.
* **Deprecated methods for dealing with fragments**
Tweaked the new interface classes to support the old fragment-methods one more version.

## Version 2.2alpha2 (May 11th, 2009)

* **Added a Changes file.**
So people can see what the changes are for each version without having to go to the project home page.
* **Updated Credits.**
Some people that have provided patches (or other valuable contributions) had been left out. I've done my best to add those in. (If you feel that you or someone else are still missing, please let me know.)
* **Removed .svn folders from distribution.**
The JSON source folder had a .svn folder in it, which could have caused problems when dragging it into your project.

## Version 2.2alpha1 (May 10th, 2009)

* **Improved installation instructions, particularly for the iPhone.**
Getting the SDK to work properly in all configurations has proved to be a headache. Therefore the SDK has been removed in favour of instructions for simply copying the source files into your project.
* **Split the SBJSON class into a writer and parser class.**
SBJSON remains as a facade for backwards compatibility. This refactoring also quashed warnings reported by the Clang static analyser.
* **Improved interface for dealing with errors.**
Rather than having to pass in a pointer to an NSError object, you can now simply call a method to get the error stack back if there was an error. (The NSError-based API remains in the SBJSON facade, but is not present in the new classes.)
* **Documentation updates.**
Minor updates to the documentation.

Release notes for earlier releases can be found here:
http://code.google.com/p/json-framework/wiki/ReleaseNotes



[Issue #200]: https://github.com/stig/json-framework/issues/200
[Issue #199]: https://github.com/stig/json-framework/issues/199
[Issue #198]: https://github.com/stig/json-framework/issues/198
[Issue #197]: https://github.com/stig/json-framework/issues/197
[Issue #196]: https://github.com/stig/json-framework/issues/196
[Issue #195]: https://github.com/stig/json-framework/issues/195
[Issue #194]: https://github.com/stig/json-framework/issues/194
[Issue #193]: https://github.com/stig/json-framework/issues/193
[Issue #192]: https://github.com/stig/json-framework/issues/192
[Issue #191]: https://github.com/stig/json-framework/issues/191
[Issue #190]: https://github.com/stig/json-framework/issues/190
[Issue #189]: https://github.com/stig/json-framework/issues/189
[Issue #188]: https://github.com/stig/json-framework/issues/188
[Issue #187]: https://github.com/stig/json-framework/issues/187
[Issue #186]: https://github.com/stig/json-framework/issues/186
[Issue #185]: https://github.com/stig/json-framework/issues/185
[Issue #184]: https://github.com/stig/json-framework/issues/184
[Issue #183]: https://github.com/stig/json-framework/issues/183
[Issue #182]: https://github.com/stig/json-framework/issues/182
[Issue #181]: https://github.com/stig/json-framework/issues/181
[Issue #180]: https://github.com/stig/json-framework/issues/180
[Issue #179]: https://github.com/stig/json-framework/issues/179
[Issue #178]: https://github.com/stig/json-framework/issues/178
[Issue #177]: https://github.com/stig/json-framework/issues/177
[Issue #176]: https://github.com/stig/json-framework/issues/176
[Issue #175]: https://github.com/stig/json-framework/issues/175
[Issue #174]: https://github.com/stig/json-framework/issues/174
[Issue #173]: https://github.com/stig/json-framework/issues/173
[Issue #172]: https://github.com/stig/json-framework/issues/172
[Issue #171]: https://github.com/stig/json-framework/issues/171
[Issue #170]: https://github.com/stig/json-framework/issues/170
[Issue #169]: https://github.com/stig/json-framework/issues/169
[Issue #168]: https://github.com/stig/json-framework/issues/168
[Issue #167]: https://github.com/stig/json-framework/issues/167
[Issue #166]: https://github.com/stig/json-framework/issues/166
[Issue #165]: https://github.com/stig/json-framework/issues/165
[Issue #164]: https://github.com/stig/json-framework/issues/164
[Issue #163]: https://github.com/stig/json-framework/issues/163
[Issue #162]: https://github.com/stig/json-framework/issues/162
[Issue #161]: https://github.com/stig/json-framework/issues/161
[Issue #160]: https://github.com/stig/json-framework/issues/160
[Issue #159]: https://github.com/stig/json-framework/issues/159
[Issue #158]: https://github.com/stig/json-framework/issues/158
[Issue #157]: https://github.com/stig/json-framework/issues/157
[Issue #156]: https://github.com/stig/json-framework/issues/156
[Issue #155]: https://github.com/stig/json-framework/issues/155
[Issue #154]: https://github.com/stig/json-framework/issues/154
[Issue #153]: https://github.com/stig/json-framework/issues/153
[Issue #152]: https://github.com/stig/json-framework/issues/152
[Issue #151]: https://github.com/stig/json-framework/issues/151
[Issue #150]: https://github.com/stig/json-framework/issues/150
[Issue #149]: https://github.com/stig/json-framework/issues/149
[Issue #148]: https://github.com/stig/json-framework/issues/148
[Issue #147]: https://github.com/stig/json-framework/issues/147
[Issue #146]: https://github.com/stig/json-framework/issues/146
[Issue #145]: https://github.com/stig/json-framework/issues/145
[Issue #144]: https://github.com/stig/json-framework/issues/144
[Issue #143]: https://github.com/stig/json-framework/issues/143
[Issue #142]: https://github.com/stig/json-framework/issues/142
[Issue #141]: https://github.com/stig/json-framework/issues/141
[Issue #140]: https://github.com/stig/json-framework/issues/140
[Issue #139]: https://github.com/stig/json-framework/issues/139
[Issue #138]: https://github.com/stig/json-framework/issues/138
[Issue #137]: https://github.com/stig/json-framework/issues/137
[Issue #136]: https://github.com/stig/json-framework/issues/136
[Issue #135]: https://github.com/stig/json-framework/issues/135
[Issue #134]: https://github.com/stig/json-framework/issues/134
[Issue #133]: https://github.com/stig/json-framework/issues/133
[Issue #132]: https://github.com/stig/json-framework/issues/132
[Issue #131]: https://github.com/stig/json-framework/issues/131
[Issue #130]: https://github.com/stig/json-framework/issues/130
[Issue #129]: https://github.com/stig/json-framework/issues/129
[Issue #128]: https://github.com/stig/json-framework/issues/128
[Issue #127]: https://github.com/stig/json-framework/issues/127
[Issue #126]: https://github.com/stig/json-framework/issues/126
[Issue #125]: https://github.com/stig/json-framework/issues/125
[Issue #124]: https://github.com/stig/json-framework/issues/124
[Issue #123]: https://github.com/stig/json-framework/issues/123
[Issue #122]: https://github.com/stig/json-framework/issues/122
[Issue #121]: https://github.com/stig/json-framework/issues/121
[Issue #120]: https://github.com/stig/json-framework/issues/120
[Issue #119]: https://github.com/stig/json-framework/issues/119
[Issue #118]: https://github.com/stig/json-framework/issues/118
[Issue #117]: https://github.com/stig/json-framework/issues/117
[Issue #116]: https://github.com/stig/json-framework/issues/116
[Issue #115]: https://github.com/stig/json-framework/issues/115
[Issue #114]: https://github.com/stig/json-framework/issues/114
[Issue #113]: https://github.com/stig/json-framework/issues/113
[Issue #112]: https://github.com/stig/json-framework/issues/112
[Issue #111]: https://github.com/stig/json-framework/issues/111
[Issue #110]: https://github.com/stig/json-framework/issues/110
[Issue #109]: https://github.com/stig/json-framework/issues/109
[Issue #108]: https://github.com/stig/json-framework/issues/108
[Issue #107]: https://github.com/stig/json-framework/issues/107
[Issue #106]: https://github.com/stig/json-framework/issues/106
[Issue #105]: https://github.com/stig/json-framework/issues/105
[Issue #104]: https://github.com/stig/json-framework/issues/104
[Issue #103]: https://github.com/stig/json-framework/issues/103
[Issue #102]: https://github.com/stig/json-framework/issues/102
[Issue #101]: https://github.com/stig/json-framework/issues/101
[Issue #100]: https://github.com/stig/json-framework/issues/100
[#99]: http://github.com/stig/json-framework/issues/99
[#98]: http://github.com/stig/json-framework/issues/98
[#97]: http://github.com/stig/json-framework/issues/97
[#96]: http://github.com/stig/json-framework/issues/96
[#95]: http://github.com/stig/json-framework/issues/95
[#94]: http://github.com/stig/json-framework/issues/94
[#93]: http://github.com/stig/json-framework/issues/93
[#92]: http://github.com/stig/json-framework/issues/92
[#91]: http://github.com/stig/json-framework/issues/91
[#90]: http://github.com/stig/json-framework/issues/90
[#89]: http://github.com/stig/json-framework/issues/89
[#88]: http://github.com/stig/json-framework/issues/88
[#87]: http://github.com/stig/json-framework/issues/87
[#86]: http://github.com/stig/json-framework/issues/86
[#85]: http://github.com/stig/json-framework/issues/85
[#84]: http://github.com/stig/json-framework/issues/84
[#83]: http://github.com/stig/json-framework/issues/83
[#82]: http://github.com/stig/json-framework/issues/82
[#81]: http://github.com/stig/json-framework/issues/81
[#80]: http://github.com/stig/json-framework/issues/80
[#79]: http://github.com/stig/json-framework/issues/79
[#78]: http://github.com/stig/json-framework/issues/78
[#77]: http://github.com/stig/json-framework/issues/77
[#76]: http://github.com/stig/json-framework/issues/76
[#75]: http://github.com/stig/json-framework/issues/75
[#74]: http://github.com/stig/json-framework/issues/74
[#73]: http://github.com/stig/json-framework/issues/73
[#72]: http://github.com/stig/json-framework/issues/72
[#71]: http://github.com/stig/json-framework/issues/71
[#70]: http://github.com/stig/json-framework/issues/70
[#69]: http://github.com/stig/json-framework/issues/69
[#68]: http://github.com/stig/json-framework/issues/68
[#67]: http://github.com/stig/json-framework/issues/67
[#66]: http://github.com/stig/json-framework/issues/66
[#65]: http://github.com/stig/json-framework/issues/65
[#64]: http://github.com/stig/json-framework/issues/64
[#63]: http://github.com/stig/json-framework/issues/63
[#62]: http://github.com/stig/json-framework/issues/62
[#61]: http://github.com/stig/json-framework/issues/61
[#60]: http://github.com/stig/json-framework/issues/60
[#59]: http://github.com/stig/json-framework/issues/59
[#58]: http://github.com/stig/json-framework/issues/58
[#57]: http://github.com/stig/json-framework/issues/57
[#56]: http://github.com/stig/json-framework/issues/56
[#55]: http://github.com/stig/json-framework/issues/55
[#54]: http://github.com/stig/json-framework/issues/54
[#53]: http://github.com/stig/json-framework/issues/53
[#52]: http://github.com/stig/json-framework/issues/52
[#51]: http://github.com/stig/json-framework/issues/51
[#50]: http://github.com/stig/json-framework/issues/50
[#49]: http://github.com/stig/json-framework/issues/49
[#48]: http://github.com/stig/json-framework/issues/48
[#47]: http://github.com/stig/json-framework/issues/47
[#46]: http://github.com/stig/json-framework/issues/46
[#45]: http://github.com/stig/json-framework/issues/45
[#44]: http://github.com/stig/json-framework/issues/44
[#43]: http://github.com/stig/json-framework/issues/43
[#42]: http://github.com/stig/json-framework/issues/42
[#41]: http://github.com/stig/json-framework/issues/41
[#40]: http://github.com/stig/json-framework/issues/40
[#39]: http://github.com/stig/json-framework/issues/39
[#38]: http://github.com/stig/json-framework/issues/38
[#37]: http://github.com/stig/json-framework/issues/37
[#36]: http://github.com/stig/json-framework/issues/36
[#35]: http://github.com/stig/json-framework/issues/35
[#34]: http://github.com/stig/json-framework/issues/34
[#33]: http://github.com/stig/json-framework/issues/33
[#32]: http://github.com/stig/json-framework/issues/32
[#31]: http://github.com/stig/json-framework/issues/31
[#30]: http://github.com/stig/json-framework/issues/30
[#29]: http://github.com/stig/json-framework/issues/29
[#28]: http://github.com/stig/json-framework/issues/28
[#27]: http://github.com/stig/json-framework/issues/27
[#26]: http://github.com/stig/json-framework/issues/26
[#25]: http://github.com/stig/json-framework/issues/25
[#24]: http://github.com/stig/json-framework/issues/24
[#23]: http://github.com/stig/json-framework/issues/23
[#22]: http://github.com/stig/json-framework/issues/22
[#21]: http://github.com/stig/json-framework/issues/21
[#20]: http://github.com/stig/json-framework/issues/20
[#19]: http://github.com/stig/json-framework/issues/19
[#18]: http://github.com/stig/json-framework/issues/18
[#17]: http://github.com/stig/json-framework/issues/17
[#16]: http://github.com/stig/json-framework/issues/16
[#15]: http://github.com/stig/json-framework/issues/15
[#14]: http://github.com/stig/json-framework/issues/14
[#13]: http://github.com/stig/json-framework/issues/13
[#12]: http://github.com/stig/json-framework/issues/12
[#11]: http://github.com/stig/json-framework/issues/11
[#10]: http://github.com/stig/json-framework/issues/10
[#9]: http://github.com/stig/json-framework/issues/9
[#8]: http://github.com/stig/json-framework/issues/8
[#7]: http://github.com/stig/json-framework/issues/7
[#6]: http://github.com/stig/json-framework/issues/6
[#5]: http://github.com/stig/json-framework/issues/5
[#4]: http://github.com/stig/json-framework/issues/4
[#3]: http://github.com/stig/json-framework/issues/3
[#2]: http://github.com/stig/json-framework/issues/2
[#1]: http://github.com/stig/json-framework/issues/1

[bench]: http://github.com/samsoffes/json-benchmarks
[api]: http://stig.github.com/json-framework/api/3.0
