#
# epydoc.html: HTML colorizers
# Edward Loper
#
# Created [10/16/02 09:49 PM]
# $Id: html_colorize.py 1195 2006-04-09 18:12:40Z edloper $
#

"""
Functions to produce colorized HTML code for various objects.
Currently, C{colorize} defines functions to colorize regular
expressions and doctest blocks.

@group Regular Expression Tags: *_TAG
"""
__docformat__ = 'epytext en'

import sys, sre_parse, sre, re, codecs
import sre_constants
from epydoc import log
from epydoc.util import decode_with_backslashreplace, plaintext_to_html
from epydoc.util import py_src_filename
from epydoc.apidoc import *

######################################################################
## Regular expression colorizer
######################################################################

# HTML tags for colorize_re

RE_TAG         = 're'
r'''The CSS class for colorizing regular expressions.'''

ANY_TAG        = 're-char'
r'''The CSS class for colorizing C{"."} in regexps.'''

ESCAPE_TAG     = 're-char'
r'''The CSS class for colorizing escaped characters (such as C{r"\("})
in regexps.'''

CATEGORY_TAG   = 're-char'
r'''The CSS class for colorizing character categories (such as
C{r"\d"})) in regexps.'''

AT_TAG         = 're-char'
r'''The CSS class for colorizing character locations (such as C{"^"})
in regexps.'''

BRANCH_TAG     = 're-op'
r'''The CSS class for colorizing C{"|"} in regexps.'''

STAR_TAG       = 're-op'
r'''The CSS class for colorizing C{"*"} and C{"*?"} in regexps.'''

PLUS_TAG       = 're-op'
r'''The CSS class for colorizing C{"+"} and C{"+?"} in regexps.'''

QMRK_TAG       = 're-op'
r'''The CSS class for colorizing C{"?"} and C{"??"} in regexps.'''

RNG_TAG        = 're-op'
r'''The CSS class for colorizing repeat ranges (such as C{"a{3,8}"}) in
regexps.'''

PAREN_TAG      = 're-group'
r'''The CSS class for colorizing parenthases in regexps.'''

CHOICE_TAG     = 're-group'
r'''The CSS class for colorizing character choice expressions (such as
C{"[abc]"}) in regexps.'''

ASSERT_TAG     = 're-group'
r'''The CSS class for colorizing assertions (such as C{"(?=abc)"}) in
regexps.'''

REF_TAG        = 're-ref'
r'''The CSS class for colorizing references (such as C{r"\1"}) in
regexps.'''

def colorize_re(regexp):
    r"""
    @return: The HTML code for a colorized version of the pattern for
        the given SRE regular expression.  If C{colorize_re} can't
        figure out how to colorize the regexp, then it will simply return
        the (uncolorized) pattern, with C{'&'}, C{'<'}, and C{'>'}
        escaped as HTML entities.  The colorized expression includes
        spans with the following css classes:
          - X{re}: The entire regular expression.
          - X{re-char}: Special characters (such as C{'.'}, C{'\('}), 
            character categories (such as C{'\w'}), and locations
            (such as C{'\b'}).
          - X{re-op}: Operators (such as C{'*'} and C{'|'}).
          - X{re-group}: Grouping constructs (such as C{'(...)'}).
          - X{re-ref} References (such as C{'\1'})
    @rtype: C{string}
    @param regexp: The regular expression to colorize.
    @type regexp: C{SRE_Pattern} or C{string}
    @raise sre_constants.error: If regexp is not a valid regular
        expression.
    """
    if isinstance(regexp, str):
        pat = decode_with_backslashreplace(regexp)
        tree = sre_parse.parse(pat)
        
    elif isinstance(regexp, unicode):
        tree = sre_parse.parse(regexp)
        
    elif hasattr(regexp, 'pattern') and hasattr(regexp, 'flags'):
        if isinstance(regexp.pattern, str):
            pat = decode_with_backslashreplace(regexp.pattern)
            tree = sre_parse.parse(pat, regexp.flags)
            
        elif isinstance(regexp.pattern, unicode):
            tree = sre_parse.parse(regexp.pattern, regexp.flags)
            
        else:
            raise TypeError("Bad regexp object -- pattern is not a string")
    else:
        raise TypeError("Expected a regexp or a string")

    return ('<span class="%s">%s</span>' %
            (RE_TAG, _colorize_re(tree, 1)))
    
def _colorize_re(tree, noparen=0):
    """
    Recursively descend the given regexp parse tree to produce the
    HTML code for a colorized version of the regexp.

    @param tree: The regexp parse tree for the regexp that should be
        colorized.
    @type tree: L{sre_parse.SubPattern}
    @param noparen: If true, then don't include parenthases around the
        expression in C{tree}, even if it contains multiple elements.
    @type noparen: C{boolean}
    @return: The HTML code for a colorized version of C{tree}
    @rtype: C{string}
    """
    result = []
    out = result.append
    
    if len(tree) > 1 and not noparen:
        out('<span class="%s">(</span>' % PAREN_TAG)
    for elt in tree:
        op = elt[0]
        args = elt[1]

        if op == sre_constants.LITERAL:
            c = unichr(args)
            if c == '\t': out(r'<span class="%s">\t</span>' % ESCAPE_TAG)
            elif c == '\n': out(r'<span class="%s">\n</span>' % ESCAPE_TAG)
            elif c == '\r': out(r'<span class="%s">\r</span>' % ESCAPE_TAG)
            elif c == '\f': out(r'<span class="%s">\f</span>' % ESCAPE_TAG)
            elif c == '\v': out(r'<span class="%s">\v</span>' % ESCAPE_TAG)
            elif ord(c)<32 or ord(c)>=127:
                if c < 256: template = r'<span class="%s">\x%02x</span>'
                else: template = r'<span class="%s">\u%04x</span>'
                out(template % (ESCAPE_TAG,ord(c)))
            elif c in '.^$\\*+?{}[]|()':
                out(r'<span class="%s">\%c</span>' % (ESCAPE_TAG, c))
            else: out(plaintext_to_html(unichr(args)))
            continue
        
        elif op == sre_constants.ANY:
            out('<span class="%s">.</span>' % ANY_TAG)
            
        elif op == sre_constants.BRANCH:
            if args[0] is not None:
                raise ValueError('Branch expected None arg but got %s'
                                 % args[0])
            VBAR = '<span class="%s">|</span>' % BRANCH_TAG
            out(VBAR.join([_colorize_re(item,1) for item in args[1]]))
            
        elif op == sre_constants.IN:
            if (len(args) == 1 and args[0][0] == sre_constants.CATEGORY):
                out(_colorize_re(args))
            else:
                out('<span class="%s">[</span>' % CHOICE_TAG)
                out(_colorize_re(args, 1))
                out('<span class="%s">]</span>' % CHOICE_TAG)
                
        elif op == sre_constants.CATEGORY:
            out('<span class="%s">' % CATEGORY_TAG)
            if args == sre_constants.CATEGORY_DIGIT: out(r'\d')
            elif args == sre_constants.CATEGORY_NOT_DIGIT: out(r'\D')
            elif args == sre_constants.CATEGORY_SPACE: out(r'\s')
            elif args == sre_constants.CATEGORY_NOT_SPACE: out(r'\S')
            elif args == sre_constants.CATEGORY_WORD: out(r'\w')
            elif args == sre_constants.CATEGORY_NOT_WORD: out(r'\W')
            else: raise ValueError('Unknown category %s' % args)
            out('</span>')
            
        elif op == sre_constants.AT:
            out('<span class="%s">' % AT_TAG)
            if args == sre_constants.AT_BEGINNING_STRING: out(r'\A')
            elif args == sre_constants.AT_BEGINNING: out(r'^')
            elif args == sre_constants.AT_END: out(r'$')
            elif args == sre_constants.AT_BOUNDARY: out(r'\b')
            elif args == sre_constants.AT_NON_BOUNDARY: out(r'\B')
            elif args == sre_constants.AT_END_STRING: out(r'\Z')
            else: raise ValueError('Unknown position %s' % args)
            out('</span>')
            
        elif op == sre_constants.MAX_REPEAT:
            min = args[0]
            max = args[1]
            if max == sre_constants.MAXREPEAT:
                if min == 0:
                    out(_colorize_re(args[2]))
                    out('<span class="%s">*</span>' % STAR_TAG)
                elif min == 1:
                    out(_colorize_re(args[2]))
                    out('<span class="%s">+</span>' % PLUS_TAG)
                else:
                    out(_colorize_re(args[2]))
                    out('<span class="%s">{%d,}</span>' % (RNG_TAG, min))
            elif min == 0:
                if max == 1:
                    out(_colorize_re(args[2]))
                    out('<span class="%s">?</span>' % QMRK_TAG)
                else:
                    out(_colorize_re(args[2]))
                    out('<span class="%s">{,%d}</span>' % (RNG_TAG, max))
            elif min == max:
                out(_colorize_re(args[2]))
                out('<span class="%s">{%d}</span>' % (RNG_TAG, max))
            else:
                out(_colorize_re(args[2]))
                out('<span class="%s">{%d,%d}</span>' % (RNG_TAG, min, max))

        elif op == sre_constants.MIN_REPEAT:
            min = args[0]
            max = args[1]
            if max == sre_constants.MAXREPEAT:
                if min == 0:
                    out(_colorize_re(args[2]))
                    out('<span class="%s">*?</span>' % STAR_TAG)
                elif min == 1:
                    out(_colorize_re(args[2]))
                    out('<span class="%s">+?</span>' % PLUS_TAG)
                else:
                    out(_colorize_re(args[2]))
                    out('<span class="%s">{%d,}?</span>' % (RNG_TAG, min))
            elif min == 0:
                if max == 1:
                    out(_colorize_re(args[2]))
                    out('<span class="%s">??</span>' % QMRK_TAG)
                else:
                    out(_colorize_re(args[2]))
                    out('<span class="%s">{,%d}?</span>' % (RNG_TAG, max))
            elif min == max:
                out(_colorize_re(args[2]))
                out('<span class="%s">{%d}?</span>' % (RNG_TAG, max))
            else:
                out(_colorize_re(args[2]))
                out('<span class="%s">{%d,%d}?</span>'%(RNG_TAG, min, max))

        elif op == sre_constants.SUBPATTERN:
            if args[0] is None:
                out('<span class="%s">(?:</span>' % PAREN_TAG)
            elif isinstance(args[0], (int, long)):
                # This is cheating:
                out('<span class="%s">(</span>' % PAREN_TAG)
            else:
                out('<span class="%s">(?P&lt;</span>' % PAREN_TAG)
                out('<span class="%s">%s</span>' %
                    (REF_TAG, plaintext_to_html(args[0])))
                out('<span class="%s">&gt;</span>' % PAREN_TAG)
            out(_colorize_re(args[1], 1))
            out('<span class="%s">)</span>' % PAREN_TAG)

        elif op == sre_constants.GROUPREF:
            out('<span class="%s">\\%d</span>' % (REF_TAG, args))

        elif op == sre_constants.RANGE:
            start = _colorize_re( ((sre_constants.LITERAL, args[0]),) )
            end = _colorize_re( ((sre_constants.LITERAL, args[1]),) )
            out('%s<span class="%s">-</span>%s' % (start, CHOICE_TAG, end))
            
        elif op == sre_constants.NEGATE:
            out('<span class="%s">^</span>' % CHOICE_TAG)

        elif op == sre_constants.ASSERT:
            if args[0]: out('<span class="%s">(?=</span>' % ASSERT_TAG)
            else: out('<span class="%s">(?&lt;=</span>' % ASSERT_TAG)
            out(''.join(_colorize_re(args[1], 1)))
            out('<span class="%s">)</span>' % ASSERT_TAG)
                           
        elif op == sre_constants.ASSERT_NOT:
            if args[0]: out('<span class="%s">(?!</span>' % ASSERT_TAG)
            else: out('<span class="%s">(?&lt;!</span>' % ASSERT_TAG)
            out(''.join(_colorize_re(args[1], 1)))
            out('<span class="%s">)</span>' % ASSERT_TAG)

        elif op == sre_constants.NOT_LITERAL:
            lit = _colorize_re( ((sre_constants.LITERAL, args),) )
            out('<span class="%s">[^</span>%s<span class="%s">]</span>' %
                (CHOICE_TAG, lit, CHOICE_TAG))
        else:
            log.error("Error colorizing regexp: unknown elt %r" % elt)
    if len(tree) > 1 and not noparen: 
        out('<span class="%s">)</span>' % PAREN_TAG)
    return u''.join(result)

######################################################################
## Doctest block colorizer
######################################################################

# Regular expressions for colorize_doctestblock
_KEYWORDS = ["del", "from", "lambda", "return", "and", "or", "is", 
             "global", "not", "try", "break", "else", "if", "elif", 
             "while", "class", "except", "import", "pass", "raise",
             "continue", "finally", "in", "print", "def", "for"]
_KEYWORD = '|'.join([r'(\b%s\b)' % _KW for _KW in _KEYWORDS])
_STRING = '|'.join([r'("""("""|.*?((?!").)"""))', r'("("|.*?((?!").)"))',
                    r"('''('''|.*?[^\\']'''))", r"('('|.*?[^\\']'))"])
_STRING = _STRING.replace('"', '&quot;') # Careful with this!
_COMMENT = '(#.*?$)'
_PROMPT = r'(^\s*(&gt;&gt;&gt;|\.\.\.)(\s|$))'

_PROMPT_RE = re.compile(_PROMPT, re.MULTILINE | re.DOTALL)
'''The regular expression used to find Python prompts (">>>" and
"...") in doctest blocks.'''

_DOCTEST_RE = re.compile('|'.join([_STRING, _COMMENT, _KEYWORD]),
                          re.MULTILINE | re.DOTALL)
'''The regular expression used by L{_doctest_sub} to colorize doctest
blocks.'''

del _KEYWORDS, _KEYWORD, _STRING, _COMMENT, _PROMPT, _KW

def colorize_doctestblock(str):
    """
    @return: The HTML code for a colorized version of a given doctest
        block.  In particular, this identifies spans with the
        following css classes:
          - X{py-src}: The Python source code.
          - X{py-prompt}: The ">>>" and "..." prompts.
          - X{py-string}: Strings in the Python source code.
          - X{py-comment}: Comments in the Python source code.
          - X{py-keyword}: Keywords in the Python source code.
          - X{py-output}: Python's output (lines without a prompt).
        The string that is passed to colorize_doctest should already
        have HTML characters escaped (e.g., C{">"} should be encoded
        as C{"&gt;"}).
    @type str: C{string}
    @param str: The contents of the doctest block to be colorized.
    @rtype: C{string}
    """
    pysrc = pyout = ''
    outstr = ''
    for line in str.split('\n')+['\n']:
        if _PROMPT_RE.match(line):
            if pyout:
                outstr += ('<span class="py-output">%s</span>\n\n' %
                           pyout.strip())
                pyout = ''
            pysrc += line+'\n'
        else:
            if pysrc:
                # Prompt over-rides other colors (incl string)
                pysrc = _DOCTEST_RE.sub(_doctest_sub, pysrc)
                pysrc = _PROMPT_RE.sub(r'<span class="py-prompt">'+
                                       r'\1</span>', pysrc)
                outstr += ('<span class="py-src">%s</span>\n'
                           % pysrc.strip())
                pysrc = ''
            pyout += line+'\n'
    if pyout.strip():
        outstr += ('<span class="py-output">%s</span>\n' %
                   pyout.strip())
    return outstr.strip()
    
def _doctest_sub(match):
    """
    This helper function is used by L{colorize_doctestblock} to
    add colorization to matching expressions.  It is called by
    C{_DOCTEST_RE.sub} with an expression that matches
    C{_DOCTEST_RE}.

    @return: The HTML code for the colorized expression.
    @rtype: C{string}
    @see: L{_DOCTEST_RE}
    """
    str = match.group()
    if str[:1] == "'" or str[:6] == '&quot;':
        return '<span class="py-string">%s</span>' % str
    elif str[:1] in '#':
        return '<span class="py-comment">%s</span>' % str
    else:
        return '<span class="py-keyword">%s</span>' % str

######################################################################
## Python source colorizer
######################################################################
"""
Goals:
  - colorize tokens appropriately (using css)
  - optionally add line numbers
  - 
"""

#: Javascript code for the PythonSourceColorizer
PYSRC_JAVASCRIPTS = '''\
function expand(id) {
  var elt = document.getElementById(id+"-expanded");
  if (elt) elt.style.display = "block";
  var elt = document.getElementById(id+"-expanded-linenums");
  if (elt) elt.style.display = "block";
  var elt = document.getElementById(id+"-collapsed");
  if (elt) { elt.innerHTML = ""; elt.style.display = "none"; }
  var elt = document.getElementById(id+"-collapsed-linenums");
  if (elt) { elt.innerHTML = ""; elt.style.display = "none"; }
  var elt = document.getElementById(id+"-toggle");
  if (elt) { elt.innerHTML = "-"; }
}

function collapse(id) {
  var elt = document.getElementById(id+"-expanded");
  if (elt) elt.style.display = "none";
  var elt = document.getElementById(id+"-expanded-linenums");
  if (elt) elt.style.display = "none";
  var elt = document.getElementById(id+"-collapsed-linenums");
  if (elt) { elt.innerHTML = "<br/>"; elt.style.display="block"; }
  var elt = document.getElementById(id+"-toggle");
  if (elt) { elt.innerHTML = "+"; }
  var elt = document.getElementById(id+"-collapsed");
  if (elt) {
    elt.style.display = "block";
    
    var indent = elt.indent;
    var pad = elt.pad;
    var s = "<span class=\'lineno\'>";
    for (var i=0; i<pad.length; i++) { s += "&nbsp;" }
    s += "</span>";
    s += "&nbsp;&nbsp;<span class=\'py-line\'>";
    for (var i=0; i<indent.length; i++) { s += "&nbsp;" }
    s += "<a href=\'#\' onclick=\'expand(\\"" + id;
    s += "\\");return false\'>...</a></span><br />";
    elt.innerHTML = s;
  }
}

function toggle(id) {
  elt = document.getElementById(id+"-toggle");
  if (elt.innerHTML == "-")
      collapse(id); 
  else
      expand(id);
}
function highlight(id) {
  var elt = document.getElementById(id+"-def");
  if (elt) elt.className = "highlight-hdr";
  var elt = document.getElementById(id+"-expanded");
  if (elt) elt.className = "highlight";
  var elt = document.getElementById(id+"-collapsed");
  if (elt) elt.className = "highlight";
}

function num_lines(s) {
  var n = 1;
  var pos = s.indexOf("\\n");
  while ( pos > 0) {
    n += 1;
    pos = s.indexOf("\\n", pos+1);
  }
  return n;
}

// Collapse all blocks that mave more than `min_lines` lines.
function collapse_all(min_lines) {
  var elts = document.getElementsByTagName("div");
  for (var i=0; i<elts.length; i++) {
    var elt = elts[i];
    var split = elt.id.indexOf("-");
    if (split > 0)
      if (elt.id.substring(split, elt.id.length) == "-expanded")
        if (num_lines(elt.innerHTML) > min_lines)
          collapse(elt.id.substring(0, split));
  }
}

function expandto(href) {
  var start = href.indexOf("#")+1;
  if (start != 0) {
    if (href.substring(start, href.length) != "-") {
      collapse_all(4);
      pos = href.indexOf(".", start);
      while (pos != -1) {
        var id = href.substring(start, pos);
        expand(id);
        pos = href.indexOf(".", pos+1);
      }
      var id = href.substring(start, href.length);
      expand(id);
      highlight(id);
    }
  }
}

function kill_doclink(id) {
  if (id) {
    var parent = document.getElementById(id);
    parent.removeChild(parent.childNodes.item(0));
  }
  else if (!this.contains(event.toElement)) {
    var parent = document.getElementById(this.parentID);
    parent.removeChild(parent.childNodes.item(0));
  }
}

function doclink(id, name, targets) {
  var elt = document.getElementById(id);

  // If we already opened the box, then destroy it.
  // (This case should never occur, but leave it in just in case.)
  if (elt.childNodes.length > 1) {
    elt.removeChild(elt.childNodes.item(0));
  }
  else {
    // The outer box: relative + inline positioning.
    var box1 = document.createElement("div");
    box1.style.position = "relative";
    box1.style.display = "inline";
    box1.style.top = 0;
    box1.style.left = 0;
  
    // A shadow for fun
    var shadow = document.createElement("div");
    shadow.style.position = "absolute";
    shadow.style.left = "-1.3em";
    shadow.style.top = "-1.3em";
    shadow.style.background = "#404040";
    
    // The inner box: absolute positioning.
    var box2 = document.createElement("div");
    box2.style.position = "relative";
    box2.style.border = "1px solid #a0a0a0";
    box2.style.left = "-.2em";
    box2.style.top = "-.2em";
    box2.style.background = "white";
    box2.style.padding = ".3em .4em .3em .4em";
    box2.style.fontStyle = "normal";
    box2.onmouseout=kill_doclink;
    box2.parentID = id;

    var links = "";
    target_list = targets.split(",");
    for (var i=0; i<target_list.length; i++) {
        var target = target_list[i].split("=");
        links += "<li><a href=\'" + target[1] + 
               "\' style=\'text-decoration:none\'>" +
               target[0] + "</a></li>";
    }
  
    // Put it all together.
    elt.insertBefore(box1, elt.childNodes.item(0));
    //box1.appendChild(box2);
    box1.appendChild(shadow);
    shadow.appendChild(box2);
    box2.innerHTML =
        "Which <b>"+name+"</b> do you want to see documentation for?" +
        "<ul style=\'margin-bottom: 0;\'>" +
        links + 
        "<li><a href=\'#\' style=\'text-decoration:none\' " +
        "onclick=\'kill_doclink(\\""+id+"\\");return false;\'>"+
        "<i>None of the above</i></a></li></ul>";
  }
}
'''

PYSRC_EXPANDTO_JAVASCRIPT = '''\
<script type="text/javascript">
<!--
expandto(location.href);
// -->
</script>
'''


import tokenize, sys, token, cgi, keyword
try: from cStringIO import StringIO
except: from StringIO import StringIO

class PythonSourceColorizer:
    """
    A class that renders a python module's source code into HTML
    pages.  These HTML pages are intended to be provided along with
    the API documentation for a module, in case a user wants to learn
    more about a particular object by examining its source code.
    Links are therefore generated from the API documentation to the
    source code pages, and from the source code pages back into the
    API documentation.

    The HTML generated by C{PythonSourceColorizer} has several notable
    features:

      - CSS styles are used to color tokens according to their type.
        (See L{CSS_CLASSES} for a list of the different token types
        that are identified).
        
      - Line numbers are included to the left of each line.

      - The first line of each class and function definition includes
        a link to the API source documentation for that object.

      - The first line of each class and function definition includes
        an anchor that can be used to link directly to that class or
        function.

      - If javascript is enabled, and the page is loaded using the
        anchor for a class or function (i.e., if the url ends in
        C{'#I{<name>}'}), then that class or function will automatically
        be highlighted; and all other classes and function definition
        blocks will be 'collapsed'.  These collapsed blocks can be
        expanded by clicking on them.

      - Unicode input is supported (including automatic detection
        of C{'coding:'} declarations).

    """
    #: A look-up table that is used to determine which CSS class
    #: should be used to colorize a given token.  The following keys
    #: may be used:
    #:   - Any token name (e.g., C{'STRING'})
    #:   - Any operator token (e.g., C{'='} or C{'@'}).
    #:   - C{'KEYWORD'} -- Python keywords such as C{'for'} and C{'if'}
    #:   - C{'DEFNAME'} -- the name of a class or function at the top
    #:     of its definition statement.
    #:   - C{'BASECLASS'} -- names of base classes at the top of a class
    #:     definition statement.
    #:   - C{'PARAM'} -- function parameters
    #:   - C{'DOCSTRING'} -- docstrings
    #:   - C{'DECORATOR'} -- decorator names
    #: If no CSS class can be found for a given token, then it won't
    #: be marked with any CSS class.
    CSS_CLASSES = {
        'NUMBER':       'py-number',
        'STRING':       'py-string',
        'COMMENT':      'py-comment',
        'NAME':         'py-name',
        'KEYWORD':      'py-keyword',
        'DEFNAME':      'py-def-name',
        'BASECLASS':    'py-base-class',
        'PARAM':        'py-param',
        'DOCSTRING':    'py-docstring',
        'DECORATOR':    'py-decorator',
        'OP':           'py-op',
        '@':            'py-decorator',
        }

    #: HTML code for the beginning of a collapsable function or class
    #: definition block.  The block contains two <div>...</div>
    #: elements -- a collapsed version and an expanded version -- and
    #: only one of these elements is visible at any given time.  By
    #: default, all definition blocks are expanded.
    #:
    #: This string should be interpolated with the following values::
    #:   (name, indentation, name)
    #: Where C{name} is the anchor name for the function or class; and
    #: indentation is a string of whitespace used to indent the
    #: ellipsis marker in the collapsed version.
    START_DEF_BLOCK = (
        '<div id="%s-collapsed" style="display:none;" '
        'pad="%s" indent="%s"></div>'
        '<div id="%s-expanded">')

    #: HTML code for the end of a collapsable function or class
    #: definition block.
    END_DEF_BLOCK = '</div>'

    #: A regular expression used to pick out the unicode encoding for
    #: the source file.
    UNICODE_CODING_RE = re.compile(r'.*?\n?.*?coding[:=]\s*([-\w.]+)')

    #: A configuration constant, used to determine whether or not to add
    #: collapsable <div> elements for definition blocks.
    ADD_DEF_BLOCKS = True

    #: A configuration constant, used to determine whether or not to
    #: add line numbers.
    ADD_LINE_NUMBERS = True

    #: A configuration constant, used to determine whether or not to
    #: add tooltips for linked names.
    ADD_TOOLTIPS = True

    #: If true, then try to guess which target is appropriate for
    #: linked names; if false, then always open a div asking the
    #: user which one they want.
    GUESS_LINK_TARGETS = True

    def __init__(self, module_filename, module_name,
                 docindex=None, api_docs=None, url_func=None):
        """
        Create a new HTML colorizer for the specified module.

        @param module_filename: The name of the file containing the
            module; its text will be loaded from this file.
        @param module_name: The dotted name of the module; this will
            be used to create links back into the API source
            documentation.
        """
        # Get the source version, if possible.
        try: module_filename = py_src_filename(module_filename)
        except: pass
        
        #: The filename of the module we're colorizing.
        self.module_filename = module_filename
        
        #: The dotted name of the module we're colorizing.
        self.module_name = module_name

        self.docindex = docindex

        #: A mapping from short names to lists of ValueDoc.
        self.name_to_docs = {}
        for api_doc in api_docs:
            if (api_doc.canonical_name is not None and
                url_func(api_doc) is not None):
                name = api_doc.canonical_name[-1]
                self.name_to_docs.setdefault(name,set()).add(api_doc)
            
        #: A function that maps APIDoc -> URL
        self.url_func = url_func

        #: The index in C{text} of the last character of the last
        #: token we've processed.
        self.pos = 0

        #: A list that maps line numbers to character offsets in
        #: C{text}.  In particular, line C{M{i}} begins at character
        #: C{line_offset[i]} in C{text}.  Since line numbers begin at
        #: 1, the first element of C{line_offsets} is C{None}.
        self.line_offsets = []

        #: A list of C{(toktype, toktext)} for all tokens on the
        #: logical line that we are currently processing.  Once a
        #: complete line of tokens has been collected in C{cur_line},
        #: it is sent to L{handle_line} for processing.
        self.cur_line = []

        #: A list of the names of the class or functions that include
        #: the current block.  C{context} has one element for each
        #: level of indentation; C{context[i]} is the name of the class
        #: or function defined by the C{i}th level of indentation, or
        #: C{None} if that level of indentation doesn't correspond to a
        #: class or function definition.
        self.context = []

        #: A list of indentation strings for each of the current
        #: block's indents.  I.e., the current total indentation can
        #: be found by taking C{''.join(self.indents)}.
        self.indents = []

        #: The line number of the line we're currently processing.
        self.lineno = 0

        #: The name of the class or function whose definition started
        #: on the previous logical line, or C{None} if the previous
        #: logical line was not a class or function definition.
        self.def_name = None

        
    def find_line_offsets(self):
        """
        Construct the L{line_offsets} table from C{self.text}.
        """
        # line 0 doesn't exist; line 1 starts at char offset 0.
        self.line_offsets = [None, 0]
        # Find all newlines in `text`, and add an entry to
        # line_offsets for each one.
        pos = self.text.find('\n')
        while pos != -1:
            self.line_offsets.append(pos+1)
            pos = self.text.find('\n', pos+1)
        # Add a final entry, marking the end of the string.
        self.line_offsets.append(len(self.text))

    def lineno_to_html(self):
        template = '%%%ds' % self.linenum_size
        n = template % self.lineno
        return '<span class="lineno">%s</span>' % n

    def colorize(self):
        """
        Return an HTML string that renders the source code for the
        module that was specified in the constructor.
        """
        # Initialize all our state variables
        self.pos = 0
        self.cur_line = []
        self.context = []
        self.indents = []
        self.lineno = 1
        self.def_name = None

        # Load the module's text.
        self.text = open(self.module_filename).read()
        self.text = self.text.expandtabs().rstrip()+'\n'

        # Construct the line_offsets table.
        self.find_line_offsets()

        num_lines = self.text.count('\n')+1
        self.linenum_size = len(`num_lines+1`)
        
        # Call the tokenizer, and send tokens to our `tokeneater()`
        # method.  If anything goes wrong, then fall-back to using
        # the input text as-is (with no colorization).
        try:
            output = StringIO()
            self.out = output.write
            tokenize.tokenize(StringIO(self.text).readline, self.tokeneater)
            html = output.getvalue()
        except tokenize.TokenError, ex:
            html = self.text

        # Check for a unicode encoding declaration.
        m = self.UNICODE_CODING_RE.match(self.text)
        if m: coding = m.group(1)
        else: coding = 'iso-8859-1'

        # Decode the html string into unicode, and then encode it back
        # into ascii, replacing any non-ascii characters with xml
        # character references.
        try:
            html = html.decode(coding).encode('ascii', 'xmlcharrefreplace')
        except LookupError:
            coding = 'iso-8859-1'
            html = html.decode(coding).encode('ascii', 'xmlcharrefreplace')

        # Call expandto.
        html += PYSRC_EXPANDTO_JAVASCRIPT

        return html

    def tokeneater(self, toktype, toktext, (srow,scol), (erow,ecol), line):
        """
        A callback function used by C{tokenize.tokenize} to handle
        each token in the module.  C{tokeneater} collects tokens into
        the C{self.cur_line} list until a complete logical line has
        been formed; and then calls L{handle_line} to process that line.
        """
        # If we encounter any errors, then just give up.
        if toktype == token.ERRORTOKEN:
            raise tokenize.TokenError, toktype

        # Did we skip anything whitespace?  If so, add a pseudotoken
        # for it, with toktype=None.  (Note -- this skipped string
        # might also contain continuation slashes; but I won't bother
        # to colorize them.)
        startpos = self.line_offsets[srow] + scol
        if startpos > self.pos:
            skipped = self.text[self.pos:startpos]
            self.cur_line.append( (None, skipped) )

        # Update our position.
        self.pos = startpos + len(toktext)

        # Update our current line.
        self.cur_line.append( (toktype, toktext) )

        # When we reach the end of a line, process it.
        if toktype == token.NEWLINE or toktype == token.ENDMARKER:
            self.handle_line(self.cur_line)
            self.cur_line = []

    _next_uid = 0
    
    def handle_line(self, line):
        """
        Render a single logical line from the module, and write the
        generated HTML to C{self.out}.

        @param line: A single logical line, encoded as a list of
            C{(toktype,tokttext)} pairs corresponding to the tokens in
            the line.
        """
        # def_name is the name of the function or class defined by
        # this line; or None if no funciton or class is defined.
        def_name = None

        in_base_list = False
        in_param_list = False
        in_param_default = 0
        at_module_top = (self.lineno == 1)

        ended_def_blocks = 0

        # The html output.
        if self.ADD_LINE_NUMBERS:
            s = self.lineno_to_html()
            self.lineno += 1
        else:
            s = ''
        s += '  <span class="py-line">'

        # Loop through each token, and colorize it appropriately.
        for i, (toktype, toktext) in enumerate(line):
            # For each token, determine its css class and whether it
            # should link to a url.
            css_class = None
            url = None
            tooltip = None
            onclick = uid = None # these 3 are used together.

            # Is this token the class name in a class definition?  If
            # so, then make it a link back into the API docs.
            if i>=2 and line[i-2][1] == 'class':
                in_base_list = True
                css_class = self.CSS_CLASSES['DEFNAME']
                def_name = toktext
                if None not in self.context:
                    cls_name = '.'.join(self.context+[def_name])
                    url = self.name2url(cls_name)
                    s = self.mark_def(s, cls_name)

            # Is this token the function name in a function def?  If
            # so, then make it a link back into the API docs.
            elif i>=2 and line[i-2][1] == 'def':
                in_param_list = True
                css_class = self.CSS_CLASSES['DEFNAME']
                def_name = toktext
                if None not in self.context:
                    cls_name = '.'.join(self.context)
                    func_name = '.'.join(self.context+[def_name])
                    url = self.name2url(cls_name, def_name)
                    s = self.mark_def(s, func_name)

            # For each indent, update the indents list (which we use
            # to keep track of indentation strings) and the context
            # list.  If this indent is the start of a class or
            # function def block, then self.def_name will be its name;
            # otherwise, it will be None.
            elif toktype == token.INDENT:
                self.indents.append(toktext)
                self.context.append(self.def_name)

            # When we dedent, pop the last elements off the indents
            # list and the context list.  If the last context element
            # is a name, then we're ending a class or function def
            # block; so write an end-div tag.
            elif toktype == token.DEDENT:
                self.indents.pop()
                if self.context.pop():
                    ended_def_blocks += 1

            # If this token contains whitespace, then don't bother to
            # give it a css tag.
            elif toktype in (None, tokenize.NL, token.NEWLINE,
                             token.ENDMARKER):
                css_class = None

            # Check if the token is a keyword.
            elif toktype == token.NAME and keyword.iskeyword(toktext):
                css_class = self.CSS_CLASSES['KEYWORD']

            elif in_base_list and toktype == token.NAME:
                css_class = self.CSS_CLASSES['BASECLASS']

            elif (in_param_list and toktype == token.NAME and
                  not in_param_default):
                css_class = self.CSS_CLASSES['PARAM']

            # Class/function docstring.
            elif (self.def_name and line[i-1][0] == token.INDENT and
                  self.is_docstring(line, i)):
                css_class = self.CSS_CLASSES['DOCSTRING']

            # Module docstring.
            elif at_module_top and self.is_docstring(line, i):
                css_class = self.CSS_CLASSES['DOCSTRING']

            # check for decorators??
            elif (toktype == token.NAME and
                  ((i>0 and line[i-1][1]=='@') or
                   (i>1 and line[i-1][0]==None and line[i-2][1] == '@'))):
                css_class = self.CSS_CLASSES['DECORATOR']

            # If it's a name, try to link it.
            elif toktype == token.NAME:
                css_class = self.CSS_CLASSES['NAME']
                # If we have a variable named `toktext` in the current
                # context, then link to that.  Note that if we're inside
                # a function, then that function is our context, not
                # the namespace that contains it. [xx] this isn't always
                # the right thing to do.
                if None not in self.context and self.GUESS_LINK_TARGETS:
                    container = DottedName(self.module_name, *self.context)
                    doc = self.docindex.get_vardoc(container+toktext)
                    if doc is not None:
                        url = self.url_func(doc)
                # Otherwise, check the name_to_docs index to see what
                # else this name might refer to.
                if url is None:
                    docs = sorted(self.name_to_docs.get(toktext, []))
                    if docs:
                        tooltip='\n'.join(['%s'%d.canonical_name
                                           for d in docs])
                        if len(docs) == 1 and self.GUESS_LINK_TARGETS:
                            url = self.url_func(docs[0])
                        else:
                            uid, onclick = self.doclink(toktext, docs)

            # For all other tokens, look up the CSS class to use
            # based on the token's type.
            else:
                if toktype == token.OP and toktext in self.CSS_CLASSES:
                    css_class = self.CSS_CLASSES[toktext]
                elif token.tok_name[toktype] in self.CSS_CLASSES:
                    css_class = self.CSS_CLASSES[token.tok_name[toktype]]
                else:
                    css_class = None

            # update our status..
            if toktext == ':':
                in_base_list = False
                in_param_list = False
            if toktext == '=' and in_param_list:
                in_param_default = True
            if in_param_default:
                if toktext in ('(','[','{'): in_param_default += 1
                if toktext in (')',']','}'): in_param_default -= 1
                if toktext == ',' and in_param_default == 1:
                    in_param_default = 0
                
            # Write this token, with appropriate colorization.
            if tooltip and self.ADD_TOOLTIPS:
                tooltip_html = ' title="%s"' % tooltip
            else: tooltip_html = ''
            if css_class: css_class_html = ' class="%s"' % css_class
            else: css_class_html = ''
            if onclick:
                s += ('<span id="%s"%s><a%s%s href="#" onclick="%s">' %
                      (uid, css_class_html, tooltip_html,
                       css_class_html, onclick))
            elif url:
                s += ('<a%s%s href="%s">' %
                      (tooltip_html, css_class_html, url))
            elif css_class_html or tooltip_html:
                s += '<span%s%s>' % (tooltip_html, css_class_html)
            if i == len(line)-1:
                s += ' </span>' # Closes <span class="py-line">
                s += cgi.escape(toktext)
            else:
                s += self.add_line_numbers(cgi.escape(toktext), css_class)

            if onclick: s += "</a></span>"
            if url: s += '</a>'
            elif css_class_html or tooltip_html: s += '</span>'

        if self.ADD_DEF_BLOCKS:
            for i in range(ended_def_blocks):
                self.out(self.END_DEF_BLOCK)

        # Strip any empty <span>s.
        s = re.sub(r'<span class="[\w+]"></span>', '', s)

        # Write the line.
        self.out(s)

        if def_name and None not in self.context:
            self.out('</div>')

        # Add div's if we're starting a def block.
        if (self.ADD_DEF_BLOCKS and def_name and
            (line[-2][1] == ':') and None not in self.context):
            indentation = (''.join(self.indents)+'    ').replace(' ', '+')
            linenum_padding = '+'*self.linenum_size
            name='.'.join(self.context+[def_name])
            self.out(self.START_DEF_BLOCK % (name, linenum_padding,
                                             indentation, name))
            
        self.def_name = def_name

    def doclink(self, name, docs):
        uid = 'link-%s' % self._next_uid
        self._next_uid += 1
        if None not in self.context:
            container = DottedName(self.module_name, *self.context)
        else:
            container = None
        targets = ['%s=%s' % (self.doc_descr(d,container), self.url_func(d))
                   for d in docs]
        onclick = ("doclink('%s', '%s', '%s'); return false;" %
                   (uid, name, ','.join(targets)))
        return uid, onclick

    def doc_descr(self, doc, context):
        name = doc.canonical_name.contextualize(context)
        descr = '%s %s' % (self.doc_kind(doc), name)
        if isinstance(doc, RoutineDoc):
            descr += '()'
        return descr

    # [XX] copied streight from html.py; this should be consolidated,
    # probably into apidoc.
    def doc_kind(self, doc):
        if isinstance(doc, ModuleDoc) and doc.is_package == True:
            return 'Package'
        elif (isinstance(doc, ModuleDoc) and
              doc.canonical_name[0].startswith('script')):
            return 'Script'
        elif isinstance(doc, ModuleDoc):
            return 'Module'
        elif isinstance(doc, ClassDoc):
            return 'Class'
        elif isinstance(doc, ClassMethodDoc):
            return 'Class Method'
        elif isinstance(doc, StaticMethodDoc):
            return 'Static Method'
        elif isinstance(doc, RoutineDoc):
            if isinstance(self.docindex.container(doc), ClassDoc):
                return 'Method'
            else:
                return 'Function'
        else:
            return 'Variable'

    def mark_def(self, s, name):
        replacement = ('<a name="%s"></a><div id="%s-def">\\1'
                       '<a class="pysrc-toggle" href="#" id="%s-toggle" '
                       'onclick="toggle(\'%s\'); return false;">-</a>\\2' %
                       (name, name, name, name))
        return re.sub('(.*) (<span class="py-line">.*)\Z', replacement, s)
                    
    def is_docstring(self, line, i):
        if line[i][0] != token.STRING: return False
        for toktype, toktext in line[i:]:
            if toktype not in (token.NEWLINE, tokenize.COMMENT,
                               tokenize.NL, token.STRING, None):
                return False
        return True
                               
    def add_line_numbers(self, s, css_class):
        result = ''
        start = 0
        end = s.find('\n')+1
        while end:
            result += s[start:end-1]
            if css_class: result += '</span>'
            result += ' </span>' # py-line
            result += '\n'
            if self.ADD_LINE_NUMBERS:
                result += self.lineno_to_html()
            result += '  <span class="py-line">'
            if css_class: result += '<span class="%s">' % css_class
            start = end
            end = s.find('\n', end)+1
            self.lineno += 1
        result += s[start:]
        return result

    def name2url(self, class_name, func_name=None):
        if class_name:
            class_name = '%s.%s' % (self.module_name, class_name)
            if func_name:
                return '%s-class.html#%s' % (class_name, func_name)
            else:
                return '%s-class.html' % class_name
        else:
            return '%s-module.html#%s' % (self.module_name, func_name)

# if __name__=='__main__':
#     s = PythonSourceColorizer('../apidoc.py', 'epydoc.apidoc').colorize()
#     import codecs
#     f = codecs.open('/home/edloper/public_html/color.html', 'w', 'ascii', 'xmlcharrefreplace')
#     f.write(s)
#     f.close()

HDR = '''\
<?xml version="1.0" encoding="ascii"?>
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
                  "DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
        <head>
          <title>$title$</title>
          <link rel="stylesheet" href="epydoc.css" type="text/css" />
          <script type="text/javascript" src="epydoc.js"></script>
        </head>
        
        <body bgcolor="white" text="black" link="blue" vlink="#204080"
              alink="#204080">
'''
FOOT = '</body></html>'
if __name__=='__main__':
    #s = PythonSourceColorizer('../apidoc.py', 'epydoc.apidoc').colorize()
    s = PythonSourceColorizer('/tmp/fo.py', 'epydoc.apidoc').colorize()
    #print s
    import codecs
    f = codecs.open('/home/edloper/public_html/color3.html', 'w', 'ascii', 'xmlcharrefreplace')
    f.write(HDR+'<pre id="py-src-top" class="py-src">'+s+'</pre>'+FOOT)
    f.close()
