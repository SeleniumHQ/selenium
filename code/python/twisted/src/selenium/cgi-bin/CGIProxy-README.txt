========================================================================

CGIProxy 2.0.1  (released November 19, 2002)

HTTP/FTP Proxy in a CGI Script

(c) 1996, 1998-2002 by James Marshall, james@jmarshall.com

For the latest, see http://www.jmarshall.com/tools/cgiproxy/

========================================================================

This README contains:

  INTRODUCTION
  LEGAL DISCLAIMER
  INSTALLATION
  SSL SUPPORT
  USAGE
  HELP IMPROVE THIS PROXY BY TELLING ME
  LIMITS AND BUGS

  OPTIONS
  CHANGES

------------------------------------------------------------------------
INTRODUCTION:

This CGI script acts as an HTTP or FTP proxy.  Through it, you can can
retrieve any resource that is accessible from the server this runs on.
This is useful when your own access is limited, but you can reach a server
that can in turn reach others that you can't.  By default, no user info
(except browser type) is sent to the target server, so you can set up your
own anonymous proxy like The Anonymizer (http://www.anonymizer.com/).

Whenever an HTML resource is retrieved, it's modified so that all links
in it point back through the same proxy, including images, form submissions,
and everything else.  Once you're using the proxy, you can browse normally
and (almost) forget it's there.

Configurable options include cookie support, text-only proxying (to save
bandwidth), simple ad filtering, script removal, custom encoding of target
URLs, and more.  See the complete list of configuration options below.

Requires Perl 5.004 or later.

The original seed for this was a program I wrote for Rich Morin's
article in the June 1996 issue of Unix Review, online at
http://www.cfcl.com/tin/P/199606.shtml .

IMPORTANT NOTE ABOUT ANONYMOUS BROWSING:
CGIProxy was originally made for indirect browsing more than anonymity,
but since people are using it for anonymity, I've tried to make it as
anonymous as possible.  Suggestions welcome.  For best anonymity, browse
with JavaScript turned off, or configure CGIProxy to remove script
content (see the options below).  In fact, that's the only reliable way,
in spite of what certain anonymity vendors claim.

Anonymity is pretty good, but may not be bulletproof.  For example, if
even a single JavaScript statement can be run, your anonymity can be
compromised.  I've tried to remove JS from every place it can exist, but
please tell me if I missed any.  Also, browser plugins or other executable
extensions may be able to reveal you to a server.

------------------------------------------------------------------------
LEGAL DISCLAIMER:

Censorship is a controversial subject, and some governments and companies
have rules about what information you should have access to.  If you use
my software to bypass rules that have been imposed on you, you assume all
legal risks and responsibilities involved.  I'm providing the software as
a demonstration and teaching tool, and for when legitimate access is
needed to non-accessible servers.  I won't encourage you to break any
rules, because I would get in trouble if I did.  I can't prevent you from
using this software in illegitimate ways, but I believe the value of it as
a teaching tool is far too great to let a few miscreants ruin it for
everybody.

------------------------------------------------------------------------
INSTALLATION:

To run this, your server must support Non-Parsed Header (NPH) CGI scripts.
Most servers do, but not all.  (Starting in version 1.3.2, there may be a
way to run this script without NPH support; see the $NOT_RUNNING_AS_NPH
option below and read the warnings where it is set in the source code.)

Quick answer:  Put nph-proxy.cgi on a Web server and call it.  Really, that's
  all most people need to do.  To add SSL support, see the "SSL SUPPORT:"
  section below.

Longer answer:

  1) Unpack the distribution.

  2) Set any desired options in nph-proxy.cgi by editing the file.  See all
     the options below; the defaults are probably fine if you don't feel like
     messing with it.  If you have special server or network issues, like an
     SSL server on a non-standard port or an HTTP or SSL proxy you must use,
     then see the section "OPTIONS RELATED TO YOUR SERVER/NETWORK ENVIRONMENT".
       If you don't know Perl, you can guess how to set a value by emulating
     the examples already in there.  Variables starting with "$" hold single
     values, and variables starting with "@" hold lists of values.  Lines
     beginning with "#" are comments and are ignored when the program runs.
     As in most programming languages, 1 means true and 0 means false.
       The reason all the options don't go in a separate configuration file
     is because that would require the script to open and read that file
     with every call, which would put a major load on the CPU.

  3) Install the script like any other CGI script (set permissions and path
     to the Perl interpreter).  Be sure it's installed as an NPH script.  In
     Apache and related servers, do this by starting the filename with "nph-".
       If you've never installed a CGI script before, then I recommend finding
     a simple one somewhere to install first, so you can become familiar with
     the process.  Then install CGIProxy. 

If you prefer, Zoltan Milosevic has made an automatic installer for CGIProxy,
at http://www.xav.com/cgi-sys/cgiwrap/xav/install.cgi?p=cgiproxy .  Give it
your server and account information, and it places the script for you.

To add SSL support (lets you access secure servers), see the section
"SSL SUPPORT:" below.  You need to install a couple more packages.  Once
these packages are installed, CGIProxy will automatically detect them and
support SSL.  If the packages aren't present, then CGIProxy will still
work fine for everything else except access to secure servers.  If you need
to use an SSL proxy, be sure to set $SSL_PROXY (and possibly $SSL_PROXY_AUTH).

If heavy use of this proxy strains your server's CPU, see "NOTES ON
PERFORMANCE" in the source code.

------------------------------------------------------------------------
SSL SUPPORT:

To retrieve pages from secure servers, you need to install two separate
packages on the server in addition to nph-proxy.cgi:

1) OpenSSL, a freely-available library of SSL and cryptography tools
2) Net::SSLeay, a Perl module to interface with OpenSSL

OpenSSL is already installed on many servers.  You can usually tell which
version you have (if any) by entering "openssl version" at a Unix prompt.
The Net::SSLeay module is not as common, but you can check whether it's
installed and which version you have with:

    perl -MNet::SSLeay -e 'print "$Net::SSLeay::VERSION\n"'

Either you get a version number, or it fails if Net::SSLeay isn't installed.

If you need to install either package, they're at, respectively:

    http://www.openssl.org/
    http://symlabs.com/Net_SSLeay/

Installing these packages is "beyond the scope of this README", but usually
they both install easily with no problems.  If you don't have root access on
your server, you may need to change the default installation directory, maybe
by manually editing the PREFIX setting in Makefile or something like that.  
Once these packages are correctly installed where nph-proxy.cgi can find
them, the script will automatically detect them and support SSL; no changes
to nph-proxy.cgi are needed.  If you have to install Net::SSLeay somewhere
that's not on the standard Perl module path (i.e. @INC), then add a
"use lib" command to nph-proxy.cgi to tell the script where to find
Net::SSLeay, e.g. "use lib 'path/to/your/modules'".

Note that these two packages are completely unaffiliated with CGIProxy, and
may have their own terms of use.

If you need to use an SSL proxy e.g. to get through a firewall, then be sure
to set $SSL_PROXY and $SSL_PROXY_AUTH as needed.

IMPORTANT NOTE:  It is HIGHLY RECOMMENDED that if you install SSL support
for CGIProxy, then CGIProxy itself should be running on a secure server
(i.e. accessed with a URL starting with "https://")!  Otherwise, you open a
serious security hole:  any secure data sent to or from a target server will
be transmitted insecurely between CGIProxy and the browser, undermining the
whole purpose of secure servers.

------------------------------------------------------------------------
USAGE:

Call the script directly to start a browsing session.  Once you've gotten
a page through the proxy, everything it links to will automatically go
through the proxy.  You can bookmark pages you browse to, and your
bookmarks will go through the proxy as they did the first time.

------------------------------------------------------------------------
HELP IMPROVE THIS PROXY BY TELLING ME:
 
1) Any HTML tags with URLs not being converted, including non-standard tags.

2) Any method of introducing JavaScript or other script content that's not
being filtered out.

3) Any script MIME types not being filtered out.

4) Any MIME types other than text/html that contain links that need to be
converted.

5) Any other ways you can find to compromise anonymity.


Please verify you're using the latest version of CGIProxy before emailing me.

------------------------------------------------------------------------
LIMITS AND BUGS:

Anonymity MAY NOT BE PERFECT!!  In particular, there may be some holes where
JavaScript can slip through.  For best anonymity, turn JavaScript off in your
browser.

URLs generated by JavaScript or similar mechanisms won't be re-proxy'ed
correctly.  JavaScript in general may not work as expected, especially if
it accesses the network.

If you browse to many sites with cookies, CGIProxy may drop some, but I
haven't seen this happen yet.

To save CPU time, I took some shortcuts with URL-handling.  I doubt these
will ever affect anything, but tell me if you have problems. (The shortcuts
are listed in the source code.)

I didn't follow the spec on HTTP proxies, and there are violations of the
protocol.  Actually, this whole concept is a violation of the proxy model,
so I'm not too worried.  If any protocol violations cause you problems,
please let me know.

Only HTTP and FTP are supported so far.

========================================================================

OPTIONS:

Here's a list of all the configuration options in CGIProxy, sorted into rough
categories.  The default settings are in square [] brackets, and should work
fine for almost all situations.  If you have special server or network
considerations, see the options in the category "OPTIONS RELATED TO YOUR
SERVER/NETWORK ENVIRONMENT".  For more information on any option, see the
comments in the source code where it is set, in the user configuration section.


MAIN CONFIGURATION OPTIONS:
---------------------------

$TEXT_ONLY [0]
    Allow only text resources through the proxy, to save bandwidth.

$REMOVE_COOKIES [0]
    Ban all cookies to or from all servers.  To allow and ban cookies by
    specific servers, see @ALLOWED_COOKIE_SERVERS and @BANNED_COOKIE_SERVERS.

$REMOVE_SCRIPTS [1]
    Prevent any script content from any server from reaching the browser.
    This includes script statements within HTML pages, external script
    files, etc.  To allow and ban script content by specific servers,
    see @ALLOWED_SCRIPT_SERVERS and @BANNED_SCRIPT_SERVERS.  Anonymity is
    pretty unreliable if you don't either remove scripts, or browse with
    scripts turned off in your browser.

$FILTER_ADS [0]
    Remove ads from pages, based on the patterns in @BANNED_IMAGE_URL_PATTERNS.
    Also ban ad-related cookies by setting $NO_COOKIE_WITH_IMAGE.

$HIDE_REFERER [1]
    Don't tell servers which link you followed to get to their page.  (Yes,
    it's misspelled on purpose.)

$INSERT_ENTRY_FORM [1]
    At the top of every page, include a small form that lets you enter
    a new URL, change your options, or manage your cookies.

$ALLOW_USER_CONFIG [1]
    Let users set their own $REMOVE_COOKIES, $REMOVE_SCRIPTS, $FILTER_ADS,
    $HIDE_REFERER, and $INSERT_ENTRY_FORM, via checkboxes on the entry form.

sub proxy_encode {}, proxy_decode {}
    (Requires minor programming.)  You can customize the encoding of
    destination URLs by modifying these routines.  The default is a simple
    unobscured URL, but sample obscuring code is included in the comments.

sub cookie_encode {}, cookie_decode {}
    (Requires minor programming.)  You can customize the encoding of cookies
    sent to the user's machine by modifying these routines.  The default is a
    simple unobscured cookie, but sample obscuring code is included in the
    comments.

@ALLOWED_SERVERS, @BANNED_SERVERS  [empty]
    Allow or ban specific servers from being accessed through the proxy, based
    on their hostname.  Each array is a list of patterns (regular expressions)
    to match, not just single servers.

@BANNED_NETWORKS  [('127.0.0.1', '192.168', '10')]
    Ban specific IP addresses or networks from being accessed through the
    proxy.  Recommended for security when this script is run on a firewall.

@ALLOWED_COOKIE_SERVERS, @BANNED_COOKIE_SERVERS  [empty]
    Allow or ban cookies from specific servers.  Each array is a list of
    patterns (regular expressions) to match, not just single servers.

@ALLOWED_SCRIPT_SERVERS, @BANNED_SCRIPT_SERVERS  [empty]
    Allow or ban script content from specific servers.  Each array is a list
    of patterns (regular expressions) to match, not just single servers.

@BANNED_IMAGE_URL_PATTERNS  [sample list in source code]
    If $FILTER_ADS is set, then ban images that match any pattern in this list.

$RETURN_EMPTY_GIF [1]
    If an image is banned, then replace it with a 1x1 transparent GIF to
    show blank space instead of a broken image icon.

$NO_COOKIE_WITH_IMAGE [1]
    Ban all cookies that come with images or other non-text resources.  Those
    are usually just Web bugs, to track you for marketing purposes.

$QUIETLY_EXIT_PROXY_SESSION [0]
    (NOT for use with anonymous browsing!!!)  For VPN-like installations, let
    the user browse directly from proxied pages to unproxied pages, with no
    intermediate warning screens.  See the comments for more info.

$PROXIFY_SCRIPTS [0]
    (Requires major programming.)  Turns on the experimental feature to filter
    all script content through whatever you've programmed in proxify_block().
    See the comments for more info.


OPTIONS RELATED TO YOUR SERVER/NETWORK ENVIRONMENT:
----------------------------------------------------

To enable access to secure servers:
    Install the separate packages OpenSSL and Net::SSLeay.  If Net::SSLeay
    is not in the standard Perl module path, then add a command like
    "use lib 'path/to/your/modules'" to the script.

$RUNNING_ON_SSL_SERVER ['']
    Set this if the script is running on an SSL server (i.e. accessed with
    an "https://" URL).  Or, the default value of '' means to guess based on
    the server port, which almost always works:  the script assumes SSL if
    and only if the server port is 443.

$NOT_RUNNING_AS_NPH [0]
    Set this if the script is not running as an NPH script (not recommended;
    see comments for possible dangers).

$HTTP_PROXY, $SSL_PROXY, $NO_PROXY  [none]
    If this script has to use an HTTP proxy (like a firewall), then set
    $HTTP_PROXY to that proxy's host (and port if needed).  Set $SSL_PROXY
    similarly when using an SSL proxy.  $NO_PROXY is a comma-separated list
    of servers or domains that should be accessed directly, i.e. NOT through
    the proxies in $HTTP_PROXY and $SSL_PROXY.  Also see $USE_PASSIVE_FTP_MODE
    below when using a firewall.

$PROXY_AUTH, $SSL_PROXY_AUTH  [none]
    If either or both of the proxies in $HTTP_PROXY and $SSL_PROXY require
    authentication, then set these two variables respectively to the required
    credentials.

@PROXY_GROUP  [empty]
    This is an experimental feature which may help with load balancing, or
    may have other creative uses.  Cookies won't work if you use this.
    See the comments for further info.


INSERTING A STANDARD HEADER INTO EACH PAGE:
-------------------------------------------

$INSERT_HTML  [none]
    Insert your own block of HTML into the top of every page.

$INSERT_FILE  [none]
    Insert the contents of the named file into the top of every page.  Can't
    be used with $INSERT_HTML.

$ANONYMIZE_INSERTION [0]
    If $INSERT_HTML or $INSERT_FILE is used, then anonymize that HTML along
    with the rest of the page.

$FORM_AFTER_INSERTION [0]
    If $INSERT_HTML or $INSERT_FILE is used, and $INSERT_ENTRY_FORM is set,
    then put the URL entry form after the inserted HTML instead of before it.

$INSERTION_FRAME_HEIGHT [80 or 50, depending on $ALLOW_USER_CONFIG]
    On pages with frames, make the top frame containing any insertions this
    many pixels high.


MINOR OR SELDOM-USED OPTIONS:
-----------------------------

$SESSION_COOKIES_ONLY [0]
    Force all cookies to expire when the current browser closes.

$MINIMIZE_CACHING [0]
    Try to prevent the user's browser from caching, i.e. from storing anything
    locally.  Better privacy, but consumes more bandwidth and seems slower.

$USER_AGENT  [none]
    Tell servers you're using this browser instead of what you're really using.

$USE_PASSIVE_FTP_MODE [1]
    When doing FTP transfers, use "passive mode" instead of "non-passive mode".
    Passive mode tends to work better when this script runs behind a firewall,
    but that varies by network.

$SHOW_FTP_WELCOME [1]
    When showing FTP directories, always display the FTP welcome message,
    instead of never displaying it.

$PROXIFY_COMMENTS [0]
    Proxify the inside of HTML comments as if it's not inside comments.

$USE_POST_ON_START [1]
    Use POST instead of GET when submitting the URL entry form.

$REMOVE_TITLES [0]
    Remove titles from HTML pages.

$NO_BROWSE_THROUGH_SELF [0]
    Prevent the script from calling itself.

$NO_LINK_TO_START [0]
    Don't link to the start page from error pages.

$MAX_REQUEST_SIZE [4194304 = 4 Meg]
    (Obscure.) The largest request that can be handled in certain rare
    situations involving password-protected sites.


========================================================================


CH'CH'CH'CH'CHANGES:
--------------------


2.0.1, released November 19, 2002:
----------------------------------

This release improves compatibility and installability in a few environments;
it doesn't really add new features.  In particular:

An SSL proxy is now supported with the $SSL_PROXY option, analogous to
$HTTP_PROXY.  Authentication for it is handled with $SSL_PROXY_AUTH,
analogous to $PROXY_AUTH.

The $RUNNING_ON_WINDOWS option is no longer needed, and so no longer exists--
relevant code now determines the OS automatically when needed, or is handled
another way.

Sockets now work correctly on BSDI and possibly other systems, where before
the script generated messages like "Address family not supported by protocol
family" and possibly others.  It works now because socket address structures
are created with the general pack_sockaddr_in() and inet_aton() functions from
the Socket module, instead of the traditional hard-coded "pack('S n a4 x8')"
method.  The new way is more "correct", given that we're already loading the
Socket module anyway.  It should help for future IPv6 support too.

All page insertions, including the initial "<!-- resource ... -->" comment, are
now inserted *after* any initial <!doctype> declaration, to avoid confusing
MSIE 6.0, which does not allow comments before an initial <!doctype>.  The
problem showed up as subtle errors in page elements (like fonts, etc.) when
using MSIE; some or all of these problems should go away now.

Cache behavior when using a caching HTTP proxy should be correct now, because
Pragma: and Cache-Control: headers (if available) are now passed through to
the outgoing request.  Before, caches would not always refresh as expected,
so page reloads didn't always work.

Fixed a compilation error when using certain older versions of Perl.



2.0, released September 18, 2002:
---------------------------------

This is a MAJOR release, even though most of the changes are internal.  Some
things about the 2.0 script are fundamentally different from the 1.x series.
Here's a list of changes, roughly categorized:


---- Visible new features and changes: ----

Now supports SSL, i.e. can retrieve pages on secure servers.  For this to
work, the separate packages OpenSSL and Net::SSLeay must be installed.  If
they are not installed, then CGIProxy still works but cannot download pages
from secure servers.  Also, it is strongly recommended to run CGIProxy on a
secure server when SSL is supported, or else secure data will be compromised
on the link between the browser and CGIProxy.

The top entry form now has an "UP" link, which links to the parent directory of
the current URL.  The idea comes from the (quite useful) button in Konqueror.

Handling of top insertions has been cleaned up-- FTP directory listings now
include the correct insertions, and other cleaner behavior.


---- New or changed config options: ----

$RUNNING_ON_SSL_SERVER is now a three-way option:  If it's set to '', then
assume an SSL server if and only if port 443 is being used.  Besides being a
good default, this lets you put the script where it can be served by both a
secure server and a non-secure server.

Perl 4 is no longer supported.  CGIProxy should run fine with Perl 5.004 or
later.  Better yet, upgrade to Perl 5.6.1 or later if you can-- future
versions of CGIProxy may require that for some features.

FTP requests now use passive (PASV) mode by default, though you can use
non-passive mode by setting $USE_PASSIVE_FTP_MODE=0.

$HTTP_PROXY and $NO_PROXY are now used instead of $ENV{'http_proxy'} and
$ENV{'no_proxy'}.

For VPN-like installations, there is now a $QUIETLY_EXIT_PROXY_SESSION option
that allows a smooth transition from browsing an intranet through the proxy
to browsing external sites directly, without getting intermediate warning
screens.  It's not meant for any situation where anonymity is important.  See
the comments where it is set for more details.

Set the new $SESSION_COOKIES_ONLY option to make all cookies expire when the
browser closes.

Set the new $MINIMIZE_CACHING option to minimize any caching that may be done
by the browser, by using appropriate HTTP response headers.  Cacheability of
various responses has also been cleaned up in general.

If for some reason you want content (e.g. HTML) inside <!-- --> comments to
be proxified like the rest, set the new $PROXIFY_COMMENTS option.

Improved the sample list of ad servers in @BANNED_IMAGE_URL_PATTERNS.

Cleaner and slightly different handling of $INSERT_HTML and $INSERT_FILE;
see comments in user config section for details.

$FASTER_HTML_LESS_PRIVACY no longer exists, because it's no longer relevant
with the new HTML-parsing structure (see below).


---- For programmers: ----

SSL support was implemented as a package that implements a tied filehandle,
called "SSL_Handle".  The idea came from the Net::SSLeay::Handle module,
which for a couple reasons wasn't suitable to use directly.  The SSL_Handle
package may be useful in other SSL applications, though this version is not
a full implementation.  It does buffer its input, though, which can make it
a much faster alternative to Net::SSLeay's ssl_read_until() routine.

The entire section of code that modifies an HTML response (roughly 20-25% of
the whole program) has been completely rewritten from scratch, and has a new
structure.  It's MUCH cleaner and slightly smaller than before, and is now
encapsulated in the routine proxify_html().  It handles the heterogeneity of
HTML correctly, i.e. non-HTML content that can exist within HTML (like
scripts, stylesheets, comments, or SGML declarations) is correctly separated
out and handled according to type.  Also, tags are fully parsed into
attributes and rebuilt if needed, instead of hacking it with long regular
expressions as before; this removes a family of potential bugs and a lot of
messy code.  Overall, the results are more accurate, and the new structure is
much more solid, flexible, and extensible, and much easier to work with than
before; it should let us solve any new problems in the "right" way when they
arise.  :) :)

Many other sections of code have been partially or entirely rewritten, and
behavior is generally cleaner.

Global variables are now handled much more cleanly, especially regarding
their persistence when using mod_perl.  Variables are now (almost) completely
divided between UPPER_CASE constants which retain their values between runs,
and lower_case variables which are reset for each run.  After the user config
section is a constant initialization section; both are run only during the
first run of the script, and are skipped for efficiency during subsequent
runs under mod_perl.  The config and initialization sections have been
arranged more carefully than before, for clarity and other reasons.  Several
variables have had their semantics clarified.

NOTE: If you modified the code in an earlier version and used certain config
variables, you should review the new code before inserting the same changes.
For example, a variable like $REMOVE_SCRIPTS should normally be replaced by
$e_remove_scripts; the former is the config setting that never changes
anymore, while the latter reflects the value used for this run of the program
(which the user might change via a checkbox).  There are several similar
variables.  Also, avoid modifying UPPER_CASE variables, because those will
retain their values between runs under mod_perl... unless that's what you
want.


---- Other stuff: ----

The HTTP client in CGIProxy now uses HTTP/1.1 if the browser uses HTTP/1.1.
Before, only certain HTTP/1.1 features like the Host: header were supported;
now, all required HTTP/1.1 client features are supported, so CGIProxy is
"conditionally compliant" with HTTP/1.1 regarding its client functions, as
per the HTTP spec.  CGIProxy can't control all server functions, but for
those that it does (such as the Date: header), it complies with HTTP/1.1.

Improved detection of text vs. non-text when supporting $NO_COOKIE_WITH_IMAGE,
which makes some pages behave better.

Many changes to take advantage of Perl 5, such as "use strict", better
regular expressions, references, and cleaner code all over the place.

Various other bugs fixed, privacy holes closed, performance improvements, UI
improvements, code rearrangement, and cleanup.



1.5.1, released February 7, 2002:
---------------------------------

Headers are no longer split on commas, which among other things means that
cookies work again.  :P

A couple other minor bug fixes.



1.5, released November 26, 2001:
--------------------------------

Many changes this time around, some major, some minor.  The code is about
50% larger.  Here's a list of changes, roughly categorized:


---- Most visible new features and changes: ----

A new cookie management screen lets the user view and selectively delete any
cookies being sent through the proxy.

On pages with frames, any insertion (such as the small URL entry form) is now
in its own top frame.

Cookies may now be encoded with the cookie_encode() and cookie_decode()
routines, similar in concept to proxy_encode() and proxy_decode().


---- Making more pages work: ----

Referrer information, required by some servers, is now optionally sent to
the server.

Certain pages with Flash or other embedded objects now work better.

HTTP URLs which include authentication in them (e.g. "username:password")
are now supported.

Links to "javascript:" URLs are handled in a more friendly way.

Inline frames (i.e. <iframe> tags) are now handled like frames with regard
to insertions.


---- New config options: ----

If you're running this on or inside a firewall, use @BANNED_NETWORKS to ban
access to single hosts and whole networks by IP address.  This is more
reliable than banning by hostname.

Set $REMOVE_TITLES to remove titles from HTML pages.

Error pages now link to the starting page, unless $NO_LINK_TO_START is set.


---- For programmers: ----

There's now a simple framework for handling any arbitrary MIME types that
may need modification (e.g. changing embedded links); see proxify_block().
To add handling for a MIME type, add code in proxify_block() and add your
MIME type into @TYPES_TO_HANDLE (and @OTHER_TYPES_TO_REGISTER if needed).

Additionally, a framework to proxify script content is in place:  All script
content will be routed through the MIME type handler if $PROXIFY_SCRIPTS is
set.  You need to add your own code to proxify_block() for this to actually
do anything.

Parsing of the flag segment of PATH_INFO has been encapsulated into the
routines pack_flags() and unpack_flags().


---- Invisible, or bug fixes: ----

Style sheets are handled much better, including <style> elements, "style"
attributes, and external style sheets.  CSS is explicitly handled, but the
framework is in place for other types.

Certain tags in HTML specify the expected MIME type of the resource they
link to; this is now handled better.

The list of script MIME types is now more complete.

Cookies with the "secure" clause are now supported, though it's never
actually used without SSL support.

Strengthened $NO_COOKIE_WITH_IMAGE support by requiring an appropriate Accept:
header, to guard against certain sneaky Web bugs like at zdnet.com.

The script's URL is now generated using the Host: header if available,
instead of SERVER_NAME; this tends to have better results.

Any resource with an unidentified MIME type is now treated as text/html,
like Netscape does.  This is safest.

<a href> attributes containing character entities are now handled better when
proxy_encode()'ing is used.

FTP URLs with spaces in them are now handled better, in a couple of ways.

Various tags, attributes, and HTTP headers that require special treatment
are now handled more correctly.

Various regex fixes, other minor bug fixes, and cleanup.



1.4.1 and 1.4.1-SSL, released March 8, 2001:
--------------------------------------------

CPU load was decreased 15% with two simple changes that I should have thought
of long ago.

Fixed error with <meta> "refresh" tags that caused proxy to loop through
itself.

Fixed problem with user-chosen URL entry form.



1.4-SSL, released February 22, 2001:
------------------------------------

This is a special version that can retrieve pages from SSL servers.  It
is based on version 1.4, and otherwise works pretty identically to that
release.



1.4, released February 10, 2001:
----------------------------------

You can now optionally insert a compact version of the initial entry form
into the top of every downloaded page, by setting $INSERT_ENTRY_FORM=1.  The
form also displays the URL you're currently viewing.  This is selectable by
the user like the three original user-selectable options.  Frames are handled
correctly, i.e. it's not inserted in frames, because that would be really
ugly.  That was the hard part.

You can also insert your own block of HTML if desired: specify it either as a
fixed string in $INSERT_HTML, or name a file to be inserted in $INSERT_FILE.

For consistency, the URL format was changed slightly-- the initial flags in
PATH_INFO are always there and are now five in number.  So any bookmarks
saved through the proxy will have to be converted or recreated.  If there's
enough demand, I can write a simple converter each time I change the URL
format.

The user-entered hostname is now always lowercased, since host names are
case-insensitive.

Fixed a minor bug in 1.3.2 having to do with PATH_INFO encoding.



1.3.2, released February 3, 2001:
---------------------------------

By popular demand, you can now restrict which servers the proxy can access,
like the online demo does.  This is configured with the lists
@ALLOWED_SERVERS and @BANNED_SERVERS.

For FTP transfers, a "Content-Length:" header is now returned when
guessable.  This lets some browsers show you the percentage progress.

Pseudo-headers created by <meta http-equiv> tags are now handled like real
HTTP headers.  Internally, the handling of HTTP headers has been cleaned up.

If you absolutely, truly, can't run NPH scripts on your server, there is
now an option to run as best as possible as a normal non-NPH CGI script.
For this to work, your server MUST support the "Status:" CGI response
header.  All servers are supposed to support it, but not all do.

There is now a $NO_BROWSE_THROUGH_SELF option which prevents the proxy from
calling itself, which is usually a mistake anyway.

Proxy authentication (the "Proxy-Authorization:" request header) is now
supported in a limited way, with $PROXY_AUTH.

Regexes have been improved to match tag attributes better, and a related
privacy hole was fixed.

URLs with spaces (which are a bad idea anyway) are now more likely to be
handled as expected.



1.3.1, released June 6, 2000:
-----------------------------

Script now runs correctly under mod_perl (requires at least Perl 5.004).

Script now runs correctly on an SSL server, if $RUNNING_ON_SSL_SERVER is set.

Main URL-conversion loop runs almost twice as fast (40% less CPU time), with
a fix I should have noticed a long time ago.

Login for HTTP Basic authentication is now submitted with POST instead of
GET, for better security.

Fixed privacy hole when servers didn't return Content-Type: header.



1.3, released April 8, 2000:
-----------------------------

Anonymity has been improved, especially regarding JavaScript or other
script content.  Before it was an afterthought; now it's being implemented
as completely as possible.  If you know any anonymity holes, please tell
me.  I'm especially interested in knowing any MIME types that identify
scripts.

In particular:

. Much more JavaScript is filtered out than before.  As far as I know, all
  of it is removed:  in <script> blocks, in style sheets, in HTML attributes,
  wherever indicated by HTTP headers, and other places.

. By default, $REMOVE_SCRIPTS is set to true.

. A potential privacy hole from a bug in Internet Explorer is protected.

You can now select which servers to allow scripts from, by setting
@ALLOWED_SCRIPT_SERVERS and @BANNED_SCRIPT_SERVERS.


If several people share a proxy, they can customize their own settings if
you set $ALLOW_USER_CONFIG.

Large files and streaming media are now supported, by transmitting the
data from the server as it arrives, rather than receiving the whole
resource before sending it to the client.  This works for both HTTP and
FTP.

HTTP Basic authentication is now supported.  (I sure hope people use it,
because it's the most elaborate and convoluted hack of the whole program.)

There's an experimental load-balancing feature.  If you set @PROXY_GROUP
to a set of URL's of cooperating proxies, they'll randomly distribute the
load among them.  This may help or hinder privacy, and it may have other
uses too.  Let me know if you find those uses.

For those who like to mess with the code, there are some neat new internal
mechanisms.  Cookies have now been extended to handle multiple tasks (had
to for Basic authentication), and there's a new internally-handled URL
scheme "x-proxy" that lets you plug in whatever magic functionality you
want (had to for Basic authentication).

There is no longer a startproxy.cgi.  It was swallowed by the main script.
It was becoming a vanishingly small percentage of the overall code.

More HTML tags are transformed, whichever non-standard tags people
reported to me (thanks!).

A couple of non-standard HTTP headers with URLs are now transformed
correctly.

If you're running on Windows, you can now set a configuration flag, and
CGIProxy will work around a couple problems on that platform.

$SUPPORT_COOKIES has been reversed, and renamed to $REMOVE_COOKIES.  This
makes it more analogous to $REMOVE_SCRIPTS, and each have their
@ALLOWED...  and @BANNED... server lists.

@BANNED_COOKIE_SERVERS and $NO_COOKIE_WITH_IMAGE have changed slightly--
they now take effect even when $FILTER_ADS isn't set.  They're more
associated with the $REMOVE_COOKIES flag now.

The initial URL-entry form may now submit using POST instead of GET,
based on the setting of $USE_POST_ON_START.  This is because some
filters apparently search outgoing URIs, but not POST request bodies.

FTP now follows symbolic links correctly, and another FTP bug or two were
fixed.



1.2, released September 11, 1999:
---------------------------------

The internal structure was rearranged in a big way, to support multiple
protocols more cleanly.  Previously, HTTP was ingrained throughout; now
it's more modular.

FTP is now supported.

@ALLOWED_COOKIE_SERVERS lets you only accept cookies from certain servers.

@BANNED_COOKIE_SERVERS and @ALLOWED_COOKIE_SERVERS are now lists of Perl
patterns (regular expressions) to match, rather than literal host names.
This lets you allow or forbid whole sets of servers rather than listing
each server individually.  For more information on Perl patterns, read the
Perl documentation.  nph-proxy.cgi has a note in the user config section
that may help enough.

You can remove scripts from HTML pages by setting $REMOVE_SCRIPTS=1.  This
helps with anonymity somewhat by removing some JavaScript (but not all!).
It also removes most popup ads.  :)

The HEAD method is now supported more cleanly.

Rare net_path form of relative URL (i.e. like "//host.com/path/etc") is
now supported, for completeness and safety.

The default lists of cookie and ad servers are a bit better.



1.1, released March 9, 1999:
----------------------------

The whole format of the target URL in PATH_INFO was restructured.  It can
be encoded however the user wishes.  This gets around PATH_INFO clashes in
various servers, solving most problems regarding server incompatibilities
I've heard about.

Cookies are now optionally supported (but off by default).

Banner ads can be filtered out.  Only a simple set of URL patterns are
filtered out by default, but it's easy to add more entries to
@BANNED_IMAGE_URL_PATTERNS.

Cookies from ad servers are filtered out (at least the main ones).  Again,
the default list in @BANNED_COOKIE_SERVERS is simple, but you can easily
add more.

Binary files are no longer getting messed up on Windows.

More HTTP headers are fixed to point back through the proxy.

Under some conditions in 1.0, extra processes would hang around for hours
and drag the system.  Alex Freed added a timeout to solve this for now.  I
can't reproduce the problem, so any info is appreciated.  [9-9-1999: It
may be a bug in older Apaches, fixed by upgrading to Apache 1.3.6 or
better.  Julian Haight reports the same problem with other scripts on
Apache 1.3.3, but not with Apache 1.3.6.]

Internally: code was cleaned up, URL-parsing was improved, and relative
URL calculation was redone.



1.0, released August 3, 1998:
-----------------------------

Initial release.


========================================================================

Last Modified: November 19, 2002
http://www.jmarshall.com/tools/cgiproxy/

