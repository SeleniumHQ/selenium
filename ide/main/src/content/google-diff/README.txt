Diff, Match and Patch Library
http://code.google.com/p/google-diff-match-patch/
Neil Fraser

This library is currently available in seven different ports, all using the same API.
Every version includes a full set of unit tests.

C++:
* Ported by Mike Slemmer.
* Currently requires the Qt library.

C#:
* Ported by Matthaeus G. Chajdas.

Java:
* Included is both the source and a Maven package.

JavaScript:
* diff_match_patch_uncompressed.js is the human-readable version.
* diff_match_patch.js has been compressed using Google's internal JavaScript compressor.
  External hackers are recommended to use http://dean.edwards.name/packer/

Lua:
* Ported by Duncan Cross.
* Does not support line-mode speedup.

Objective C:
* Ported by Jan Weiss.
* Includes speed test (this is a separate bundle for other languages).

Python:
* Runs 10x faster under PyPy than CPython.

Demos:
* Separate demos for Diff, Match and Patch in JavaScript.
