# node-strsplit: split a string by a regular expression

## strsplit(str, [pattern[, limit]])

Splits a string `str` into fields using `pattern` as the separator, which may be
either a string or a regular expression.  If `pattern` is not specified, then
the regular expression `\s+` is used to split on whitespace.

If `limit` is a positive number, the pattern will be applied at most `limit - 1`
times and the returned array will have at most `limit` elements.  The last
element will contain all of `str` beyond the last separator.  (This is unlike
the JavaScript standard String.split method, which also provides a `limit`
argument to control the number of returned fields.  String.split always applies
the pattern as many times as possible, and only returns the first `limit`
fields, so the rest of the input is lost.  See Notes below for details.)

If `limit` is unspecified, negative, or zero, then there is no limit on the
number of matches or returned fields.  Additionally, if `limit` is zero,
trailing empty fields are discarded.

It's often desirable to skip leading empty fields as well, as awk(1) and bash(1)
do in processing fields.  To do this, use String.trim before calling strsplit.


## Examples

Split a colon-separated list (e.g., a line from /etc/passwd):

    > strsplit('nobody:*:-2:-2:Nobody User:/var/empty:/usr/bin/false', ':');
    [ 'nobody', '*', '-2', '-2', 'Nobody User', '/var/empty', '/usr/bin/false' ]

Split a whitespace-separated list (e.g., output from "ps"):

    > strsplit('86008 ttys000    0:00.05 -bash', /\s+/);
    [ '86008', 'ttys000', '0:00.05', '-bash' ]

Similarly, split a line into words:

    > strsplit('How about a game of chess?', /\s+/)
    [ 'How', 'about', 'a', 'game', 'of', 'chess?' ]

Some tabular data formats allow the last field to contain the delimeter.  The
reader is expected to know how many fields there are to avoid getting confused.
The number of fields can be specified with the `limit` argument:

    > /* 4 Fields: Games, Wins, Losses, Team Name */
    > strsplit('101 55 46 San Francisco Giants', ' ', 4);
    [ '101', '55', '46', 'San Francisco Giants' ]

See [node-tab](https://github.com/davepacheco/node-tab) for a higher-level
interface to read and write tabular data.


## Notes

As described above, `strsplit` is similar to `String.split`, but limits the
number of times the pattern is matched rather than simply the number of matched
fields returned.  If you actually want only the first N matches, then specify no
limit and call `slice` on the result (or just use String.split).  If `limit` is
negative or unspecified, the behavior is exactly identical to
`str.split(pattern)`.

By comparison, here's String.split:

    > 'alpha bravo charlie delta'.split(' ', 3)
    [ 'alpha', 'bravo', 'charlie' ]

and here's strsplit:

    > strsplit('alpha bravo charlie delta', ' ', 3)
    [ 'alpha', 'bravo', 'charlie delta' ]

This is the behavior implemented by `split` in Perl, Java, and Python.

## Background: survey of "split" in Java, Perl, and Python

The tests directory contains test cases and test programs in Java, Perl, and
Python for figuring out what these language's string split function does.
Specifically, this is:

* Java: String.split.
* Perl: split.
* Python: re.split.  While the "split" method on strings may be more common, it
  does not handle regular expressions, while the Java and Perl counterparts do.

For comparison, there's also a test case for this implementation of "strsplit".
in JavaScript.

The test cases here test both a simple string as a splitter (a space) and a
simple regular expression (`\s+`, indicating some non-zero number of whitespace
characters), as well as various values of the optional "limit" parameter.

In summary, in all of the cases tried, the Java and Perl implementations are
identical.  The Python implementation differs in a few ways:

* The "limit" argument is off-by-one relative to the Java and Perl APIs.  It
  represents the maximum number of splits to be made, rather than the maximum
  number of returned fields.
* -1 for "limit" is not special, and seems to mean that at most -1 splits will
  be made, meaning the string is not split at all.  In Java and Perl, -1 means
  there is no limit to the number of returned fields.
* Java and Perl strip trailing empty fields when "limit" is 0.  Python never
  strips trailing empty fields.

JavaScript has a "split" method, but it behaves substantially different than all
of these implementations when "limit" is specified.  This implementation of
"strsplit" for JavaScript mirrors the Java and Perl implementations, as the
differences in Python do not seem substantial or better.

The remaining use case that would be nice to address is splitting fields the way
awk(1) and bash(1) do, which is to strip leading whitespace.  Python's *string*
split also does this, but only if you specify None as the pattern.  strsplit
doesn't support this; just trim the string first if you want that behavior.
