#
# epydoc.css: default epydoc CSS stylesheets
# Edward Loper
#
# Created [01/30/01 05:18 PM]
# $Id: html_css.py 1194 2006-04-09 18:11:11Z edloper $
#

"""
Predefined CSS stylesheets for the HTML outputter (L{epydoc.docwriter.html}).

@type STYLESHEETS: C{dictionary} from C{string} to C{(string, string)}
@var STYLESHEETS: A dictionary mapping from stylesheet names to CSS
    stylesheets and descriptions.  A single stylesheet may have
    multiple names.  Currently, the following stylesheets are defined:
      - C{default}: The default stylesheet (synonym for C{white}).
      - C{white}: Black on white, with blue highlights (similar to
        javadoc).
      - C{blue}: Black on steel blue.
      - C{green}: Black on green.
      - C{black}: White on black, with blue highlights
      - C{grayscale}: Grayscale black on white.
      - C{none}: An empty stylesheet.
"""
__docformat__ = 'epytext en'

import re

############################################################
## Basic stylesheets
############################################################

# [xx] Should I do something like:
#
#    @import url(html4css1.css);
#
# But then where do I get that css file from?  Hm.
# Also, in principle I'm mangling classes, but it looks like I'm
# failing.
#
# Should all epydoc css classes start with epydoc-?
#

# Base stylesheet -- just the layout details
_LAYOUT = """

/* Tables */ 
table.help         { margin-left: auto; margin-right: auto; }
th.summary, th.details, th.index
                   { text-align: left; font-size: 120%; } 
th.group           { text-align: left; font-size: 120%;
                     font-style: italic; } 

/* Documentation page titles */
h2.module          { margin-top: 0.2em; }
h2.class           { margin-top: 0.2em; }
h2.type            { margin-top: 0.2em; }
h2.py-src          { margin-top: 0.2em; }

/* Headings */
h1.help            { text-align: center; }
h1.heading         { font-size: +140%; font-style: italic;
                     font-weight: bold; }
h2.heading         { font-size: +125%; font-style: italic;
                     font-weight: bold; }
h3.heading         { font-size: +110%; font-style: italic;
                     font-weight: normal; }
h1.tocheading      { text-align: center; font-size: 105%; margin: 0;
                     font-weight: bold; padding: 0; }
h2.tocheading      { font-size: 100%; margin: 0.5em 0 0 -0.3em;
                     font-weight: bold; }

/* Table of contents */
p.toc              { margin: 0; padding: 0; }

/* Base tree */
pre.base-tree      { font-size: 80%; margin: 0; }

/* Summary Sections */
p.varlist          { padding: 0 0 0 7em; text-indent: -7em;
                     margin: 0; }
.varlist-header    { font-weight: bold; }
p.imports          { padding: 0 0 0 7em; text-indent: -7em; }
.imports-header    { font-weight: bold; }

/* Details Sections */
table.func-details { border-width: 2px; border-style: groove;
                     padding: 0 1em 0 1em; margin: 0.4em 0 0 0; }
h3.func-detail     { margin: 0 0 1em 0; }
table.var-details  { border-width: 2px; border-style: groove;
                     padding: 0 1em 0 1em; margin: 0.4em 0 0 0; }
h3.var-details     { margin: 0 0 1em 0; }
table.prop-details  { border-width: 2px; border-style: groove;
                     padding: 0 1em 0 1em; margin: 0.4em 0 0 0; }
h3.prop-details     { margin: 0 0 1em 0; }

/* Function signatures */
.sig               { font-weight: bold; }  

/* Doctest blocks */
.py-prompt         { font-weight: bold;}
pre.doctestblock   { padding: .5em; margin: 1em;
                     border-width: 1px; border-style: solid; }
table pre.doctestblock
                   { padding: .5em; margin: 1em;
                     border-width: 1px; border-style: solid; }

/* Variable values */
pre.variable       { padding: .5em; margin: 0;
                     border-width: 1px; border-style: solid; }

/* Navigation bar */ 
table.navbar       { border-width: 2px; border-style: groove; }
.nomargin          { margin: 0; }

/* This is used in <div> sections containing tables of private
values, to make them flow more seamlessly with the table that
comes before them. */
.continue          { border-top: 0; }

/* Links */ 
a.navbar           { text-decoration: none; }  

/* Source Code Listings */
pre.py-src         { border: 2px solid black; }
div.highlight-hdr  { border-top: 2px solid black;
                     border-bottom: 1px solid black; }
div.highlight      { border-bottom: 2px solid black; }
a.pysrc-toggle     { text-decoration: none; }
.py-line           { border-left: 2px solid black; margin-left: .2em;
                     padding-left: .4em; }
.lineno            { font-style: italic; font-size: 90%;
                     padding-left: .5em; }
/*a.py-name          { text-decoration: none; }*/

/* For Graphs */
.graph-without-title  { border: none; }
.graph-with-title     { border: 1px solid black; }
.graph-title          { font-weight: bold; }

/* Lists */
ul { margin-top: 0; }

/* Misc. */
.footer            { font-size: 85%; }
.header            { font-size: 85%; }
.breadcrumbs       { font-size: 85%; font-weight: bold; }
.options           { font-size: 70%; }
.rtype, .ptype, .vtype 
                   { font-size: 85%; }
dt                 { font-weight: bold; }
.small             { font-size: 85%; }

h2 span.codelink { font-size: 58%; font-weight: normal; }
span.codelink { font-size: 85%; font-weight; normal; }
"""

# Black on white, with blue highlights.  This is similar to how
# javadoc looks.
_WHITE = _LAYOUT + """
/* Body color */ 
body               { background: #ffffff; color: #000000; } 
 
/* Tables */ 
table.summary, table.details, table.index
                   { background: #e8f0f8; color: #000000; } 
tr.summary, tr.details, tr.index
                   { background: #70b0ff; color: #000000; } 
th.group           { background: #c0e0f8; color: #000000; } 

/* Details Sections */
table.func-details { background: #e8f0f8; color: #000000;
                     border-color: #c0d0d0; }
h3.func-detail     { background: transparent; color: #000000; }
table.var-details  { background: #e8f0f8; color: #000000;
                     border-color: #c0d0d0; }
h3.var-details     { background: transparent; color: #000000; }
table.prop-details  { background: #e8f0f8; color: #000000;
                     border-color: #c0d0d0; }
h3.prop-details     { background: transparent; color: #000000; }

/* Function signatures */
.sig               { background: transparent; color: #000000; }
.sig-name          { background: transparent; color: #006080; }  
.sig-arg, .sig-kwarg, .sig-vararg
                   { background: transparent; color: #008060; }  
.sig-default       { background: transparent; color: #602000; }  
.summary-sig       { background: transparent; color: #000000; }  
.summary-sig-name  { background: transparent; color: #204080; }
.summary-sig-arg, .summary-sig-kwarg, .summary-sig-vararg
                   { background: transparent; color: #008060; }  

/* Souce code listings & doctest blocks */
.py-src            { background: transparent; color: #000000; }
.py-prompt         { background: transparent; color: #005050; }
.py-string         { background: transparent; color: #006030; }
.py-comment        { background: transparent; color: #003060; }
.py-keyword        { background: transparent; color: #600000; }
.py-output         { background: transparent; color: #404040; }
.py-name           { background: transparent; color: #000050; }
.py-name:link      { background: transparent; color: #000050; }
.py-name:visited   { background: transparent; color: #000050; }
.py-number         { background: transparent; color: #005000; }
.py-def-name       { background: transparent; color: #000060;
                     font-weight: bold; }
.py-base-class     { background: transparent; color: #000060; }
.py-param          { background: transparent; color: #000060; }
.py-docstring      { background: transparent; color: #006030; }
.py-decorator      { background: transparent; color: #804020; }

pre.doctestblock   { background: #f4faff; color: #000000; 
                     border-color: #708890; }
table pre.doctestblock
                   { background: #dce4ec; color: #000000; 
                     border-color: #708890; }
div.py-src         { background: #f0f0f0; }
div.highlight-hdr  { background: #d8e8e8; }
div.highlight      { background: #d0e0e0; }


/* Variable values */
pre.variable       { background: #dce4ec; color: #000000;
                     border-color: #708890; }
.variable-linewrap { background: transparent; color: #604000; }
.variable-ellipsis { background: transparent; color: #604000; }
.variable-quote    { background: transparent; color: #604000; }
.re                { background: transparent; color: #000000; }
.re-char           { background: transparent; color: #006030; }
.re-op             { background: transparent; color: #600000; }
.re-group          { background: transparent; color: #003060; }
.re-ref            { background: transparent; color: #404040; }

/* Navigation bar */ 
table.navbar       { background: #a0c0ff; color: #0000ff;
                     border-color: #c0d0d0; }
th.navbar          { background: #a0c0ff; color: #0000ff; } 
th.navselect       { background: #70b0ff; color: #000000; } 

/* Links */ 
a:link             { background: transparent; color: #0000ff; }  
a:visited          { background: transparent; color: #204080; }  
a.navbar:link      { background: transparent; color: #0000ff; }
a.navbar:visited   { background: transparent; color: #204080; }
"""

# Black on steel blue (old version)
_OLD_BLUE = _LAYOUT + """
/* Body color */ 
body               { background: #88a0a8; color: #000000; } 
 
/* Tables */ 
table.summary, table.details, table.index
                   { background: #a8c0c8; color: #000000; } 
tr.summary         { background: #c0e0e0; color: #000000; }
tr.details, tr.index
                   { background: #c0e0e0; color: #000000; }
th.group           { background: #bad8e0; color: #000000; }

/* Documentation page titles */
h2.module          { margin-top: 0.2em; }
h2.class           { margin-top: 0.2em ; }
 
/* Headings */
h1.heading         { background: transparent; color: #002040; }
h2.heading         { background: transparent; color: #002040; }
h3.heading         { background: transparent; color: #002040; }

/* Details Sections */
table.func-details { background: #a8c0c8; color: #000000;
                     border-color: #c0d0d0; }
h3.func-detail     { background: transparent; color: #000000; }
table.var-details  { background: #a8c0c8; color: #000000;
                     border-color: #c0d0d0; }
h3.var-details     { background: transparent; color: #000000; }
table.prop-details  { background: #a8c0c8; color: #000000;
                     border-color: #c0d0d0; }
h3.prop-details     { background: transparent; color: #000000; }

/* Function signatures */
.sig               { background: transparent; color: #000000; }
.sig-name          { background: transparent; color: #006080; }  
.sig-arg, .sig-kwarg, .sig-vararg
                   { background: transparent; color: #008060; }  
.sig-default       { background: transparent; color: #602000; }  
.summary-sig       { background: transparent; color: #000000; }  
.summary-sig-name  { background: transparent; color: #104060; }
.summary-sig-arg, .summary-sig-kwarg, .summary-sig-vararg
                   { background: transparent; color: #008060; }  

/* Souce code listings & doctest blocks */
.py-src            { background: transparent; color: #000000; }
.py-prompt         { background: transparent; color: #005050; }
.py-string         { background: transparent; color: #006030; }
.py-comment        { background: transparent; color: #003060; }
.py-keyword        { background: transparent; color: #600000; }
.py-output         { background: transparent; color: #404040; }
.py-name           { background: transparent; color: #000050; }
.py-name:link      { background: transparent; color: #000050; }
.py-name:visited   { background: transparent; color: #000050; }
.py-number         { background: transparent; color: #005000; }
.py-def-name       { background: transparent; color: #000060;
                     font-weight: bold; }
.py-base-class     { background: transparent; color: #000060; }
.py-param          { background: transparent; color: #000060; }
.py-docstring      { background: transparent; color: #006030; }
.py-decorator      { background: transparent; color: #804020; }

pre.doctestblock   { background: #90a8b0; color: #000000; }
                     border-color: #708890; }
table pre.doctestblock
                   { background: #b0c8d0; color: #000000; 
                     border-color: #708890; }
div.py-src         { background: #f0f0f0; }
div.highlight-hdr  { background: #d8e8e8; }
div.highlight      { background: #d0e0e0; }
 
/* Variable values */
pre.variable       { background: #b0c8d0; color: #000000; 
                     border-color: #708890; }
.variable-linewrap { background: transparent; color: #604000; }
.variable-ellipsis { background: transparent; color: #604000; }
.variable-quote    { background: transparent; color: #604000; }
.re                { background: transparent; color: #000000; }
.re-char           { background: transparent; color: #006030; }
.re-op             { background: transparent; color: #600000; }
.re-group          { background: transparent; color: #003060; }
.re-ref            { background: transparent; color: #404040; }
 
/* Navigation bar */ 
table.navbar       { background: #607880; color: #b8d0d0;
                     border-color: #c0d0d0; }
th.navbar          { background: #607880; color: #b8d0d0; }
th.navselect       { background: #88a0a8; color: #000000; }
 
/* Links */ 
a:link             { background: transparent; color: #104060; }  
a:visited          { background: transparent; color: #082840; }  
a.navbar:link      { background: transparent; color: #b8d0d0; }
a.navbar:visited   { background: transparent; color: #b8d0d0; }
"""

# Black on steel blue (new version: higher contrast)
_BLUE = _LAYOUT + """
/* Body color */
body               { background: #b0c8d0; color: #000000; } 
 
/* Tables */ 
table.summary, table.details, table.index
                   { background: #c8e0e8; color: #000000; } 
tr.summary         { background: #dcf4fc; color: #000000; }
tr.details, tr.index
                   { background: #dcf4fc; color: #000000; }
th.group           { background: #bad8e0; color: #000000; }

/* Documentation page titles */
h2.module          { margin-top: 0.2em; }
h2.class           { margin-top: 0.2em ; }
 
/* Headings */
h1.heading         { background: transparent; color: #002060; }
h2.heading         { background: transparent; color: #002060; }
h3.heading         { background: transparent; color: #002060; }

/* Details Sections */
table.func-details { background: #c8e0e8; color: #000000;
                     border-color: #c0d0d0; }
h3.func-detail     { background: transparent; color: #000000; }
table.var-details  { background: #c8e0e8; color: #000000;
                     border-color: #ffffff; }
h3.var-details     { background: transparent; color: #000000; }
table.prop-details  { background: #c8e0e8; color: #000000;
                     border-color: #ffffff; }
h3.prop-details     { background: transparent; color: #000000; }

/* Function signatures */
.sig               { background: transparent; color: #000000; }
.sig-name          { background: transparent; color: #006080; }  
.sig-arg, .sig-kwarg, .sig-vararg
                   { background: transparent; color: #008060; }  
.sig-default       { background: transparent; color: #602000; }  
.summary-sig       { background: transparent; color: #000000; }  
.summary-sig-name  { background: transparent; color: #082840; }
.summary-sig-arg, .summary-sig-kwarg, .summary-sig-vararg
                   { background: transparent; color: #008060; }  

/* Souce code listings & doctest blocks */
.py-src            { background: transparent; color: #000000; }
.py-prompt         { background: transparent; color: #006070; }
.py-string         { background: transparent; color: #007050; }
.py-comment        { background: transparent; color: #004080; }
.py-keyword        { background: transparent; color: #800000; }
.py-output         { background: transparent; color: #484848; }
.py-name           { background: transparent; color: #000050; }
.py-name:link      { background: transparent; color: #000050; }
.py-name:visited   { background: transparent; color: #000050; }
.py-number         { background: transparent; color: #005000; }
.py-def-name       { background: transparent; color: #000060;
                     font-weight: bold; }
.py-base-class     { background: transparent; color: #000060; }
.py-param          { background: transparent; color: #000060; }
.py-docstring      { background: transparent; color: #006030; }
.py-decorator      { background: transparent; color: #804020; }

pre.doctestblock   { background: #c8e0e8; color: #000000; 
                     border-color: #708890; }
table pre.doctestblock
                   { background: #c0d8e0; color: #000000; 
                     border-color: #708890; }
div.py-src         { background: #f0f0f0; }
div.highlight-hdr  { background: #d8e8e8; }
div.highlight      { background: #d0e0e0; }
 
/* Variable values */
pre.variable       { background: #c0d8e0; color: #000000; 
                     border-color: #708890; }
.variable-linewrap { background: transparent; color: #705000; }
.variable-ellipsis { background: transparent; color: #705000; }
.variable-quote    { background: transparent; color: #705000; }
.re                { background: transparent; color: #000000; }
.re-char           { background: transparent; color: #007050; }
.re-op             { background: transparent; color: #800000; }
.re-group          { background: transparent; color: #004080; }
.re-ref            { background: transparent; color: #484848; }
 
/* Navigation bar */ 
table.navbar       { background: #688088; color: #d8f0f0;
                     border-color: #c0d0d0; }
th.navbar          { background: #688088; color: #d8f0f0; }
th.navselect       { background: #88a0a8; color: #000000; }
 
/* Links */ 
a:link             { background: transparent; color: #104060; }  
a:visited          { background: transparent; color: #082840; }  
a.navbar:link      { background: transparent; color: #d8f0f0; }
a.navbar:visited   { background: transparent; color: #d8f0f0; }
"""

############################################################
## Derived stylesheets
############################################################
# Use some simple manipulations to produce a wide variety of color
# schemes.  In particular, use th _COLOR_RE regular expression to
# search for colors, and to transform them in various ways.

_COLOR_RE = re.compile(r'#(..)(..)(..)')

def _rv(match):
    """
    Given a regexp match for a color, return the reverse-video version
    of that color.

    @param match: A regular expression match.
    @type match: C{Match}
    @return: The reverse-video color.
    @rtype: C{string}
    """
    str = '#'
    for color in match.groups():
        str += '%02x' % (255-int(color, 16))
    return str

# Black-on-green
_OLD_GREEN = _COLOR_RE.sub(r'#\1\3\2', _OLD_BLUE)
_GREEN = _COLOR_RE.sub(r'#\1\3\2', _BLUE)

# White-on-black, with blue highlights.
_BLACK = _COLOR_RE.sub(r'#\3\2\1', _COLOR_RE.sub(_rv, _WHITE))

# Grayscale
_GRAYSCALE = _COLOR_RE.sub(r'#\2\2\2', _WHITE)

############################################################
## Stylesheet table
############################################################

# Leave _OLD_GREEN and _OLD_BLUE out for now.
STYLESHEETS = {
    'white': (_WHITE, "Black on white, with blue highlights"),
    'blue': (_BLUE, "Black on steel blue"),
    'green': (_GREEN, "Black on green"),
    'black': (_BLACK, "White on black, with blue highlights"),
    'grayscale': (_GRAYSCALE, "Grayscale black on white"),
    'default': (_WHITE, "Default stylesheet (=white)"),
    'none': (_LAYOUT, "A base stylesheet (no color modifications)"),
    }
