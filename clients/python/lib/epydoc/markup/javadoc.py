#
# javadoc.py: javadoc docstring parsing
# Edward Loper
#
# Created [07/03/03 12:37 PM]
# $Id: javadoc.py 946 2006-03-10 00:40:50Z edloper $
#

"""
Epydoc parser for U{Javadoc<http://java.sun.com/j2se/javadoc/>}
docstrings.  Javadoc is an HTML-based markup language that was
developed for documenting Java APIs with inline comments.  It consists
of raw HTML, augmented by Javadoc tags.  There are two types of
Javadoc tag:

  - X{Javadoc block tags} correspond to Epydoc fields.  They are
    marked by starting a line with a string of the form \"C{@M{tag}
    [M{arg}]}\", where C{M{tag}} indicates the type of block, and
    C{M{arg}} is an optional argument.  (For fields that take
    arguments, Javadoc assumes that the single word immediately
    following the tag is an argument; multi-word arguments cannot be
    used with javadoc.)  
  
  - X{inline Javadoc tags} are used for inline markup.  In particular,
    epydoc uses them for crossreference links between documentation.
    Inline tags may appear anywhere in the text, and have the form
    \"C{{@M{tag} M{[args...]}}}\", where C{M{tag}} indicates the
    type of inline markup, and C{M{args}} are optional arguments.

Epydoc supports all Javadoc tags, I{except}:
  - C{{@docRoot}}, which gives the (relative) URL of the generated
    documentation's root.
  - C{{@inheritDoc}}, which copies the documentation of the nearest
    overridden object.  This can be used to combine the documentation
    of the overridden object with the documentation of the
    overridding object.
  - C{@serial}, C{@serialField}, and C{@serialData} which describe the
    serialization (pickling) of an object.
  - C{{@value}}, which copies the value of a constant.

@warning: Epydoc only supports HTML output for Javadoc docstrings.
"""
__docformat__ = 'epytext en'

# Imports
import re
from xml.dom.minidom import *
from epydoc.markup import *

def parse_docstring(docstring, errors, **options):
    """
    Parse the given docstring, which is formatted using Javadoc; and
    return a C{ParsedDocstring} representation of its contents.
    @param docstring: The docstring to parse
    @type docstring: C{string}
    @param errors: A list where any errors generated during parsing
        will be stored.
    @type errors: C{list} of L{ParseError}
    @param options: Extra options.  Unknown options are ignored.
        Currently, no extra options are defined.
    @rtype: L{ParsedDocstring}
    """
    return ParsedJavadocDocstring(docstring, errors)

class ParsedJavadocDocstring(ParsedDocstring):
    """
    An encoded version of a Javadoc docstring.  Since Javadoc is a
    fairly simple markup language, we don't do any processing in
    advance; instead, we wait to split fields or resolve
    crossreference links until we need to.

    @group Field Splitting: split_fields, _ARG_FIELDS, _FIELD_RE
    @cvar _ARG_FIELDS: A list of the fields that take arguments.
        Since Javadoc doesn't mark arguments in any special way, we
        must consult this list to decide whether the first word of a
        field is an argument or not.
    @cvar _FIELD_RE: A regular expression used to search for Javadoc
        block tags.

    @group HTML Output: to_html, _LINK_SPLIT_RE, _LINK_RE
    @cvar _LINK_SPLIT_RE: A regular expression used to search for
        Javadoc inline tags.
    @cvar _LINK_RE: A regular expression used to process Javadoc
        inline tags.
    """
    def __init__(self, docstring, errors=None):
        """
        Create a new C{ParsedJavadocDocstring}.
        
        @param docstring: The docstring that should be used to
            construct this C{ParsedJavadocDocstring}.
        @type docstring: C{string}
        @param errors: A list where any errors generated during
            parsing will be stored.  If no list is given, then
            all errors are ignored.
        @type errors: C{list} of L{ParseError}
        """
        self._docstring = docstring
        if errors is None: errors = []
        self._check_links(errors)

    #////////////////////////////////////////////////////////////
    # Field Splitting
    #////////////////////////////////////////////////////////////

    _ARG_FIELDS = ('group variable var type cvariable cvar ivariable '+
                   'ivar param '+
                   'parameter arg argument raise raises exception '+
                   'except deffield newfield keyword kwarg kwparam').split()
    _FIELD_RE = re.compile(r'(^\s*\@\w+[\s$])', re.MULTILINE)
    
    # Inherit docs from ParsedDocstring.
    def split_fields(self, errors=None):

        # Split the docstring into an alternating list of field tags
        # and text (odd pieces are field tags).
        pieces = self._FIELD_RE.split(self._docstring)

        # The first piece is the description.
        descr = ParsedJavadocDocstring(pieces[0])

        # The remaining pieces are the block fields (alternating tags
        # and bodies; odd pieces are tags).
        fields = []
        for i in range(1, len(pieces)):
            if i%2 == 1:
                # Get the field tag.
                tag = pieces[i].strip()[1:]
            else:
                # Get the field argument (if appropriate).
                if tag in self._ARG_FIELDS:
                    (arg, body) = pieces[i].strip().split(None, 1)
                else:
                    (arg, body) = (None, pieces[i])

                # Special processing for @see fields, since Epydoc
                # allows unrestricted text in them, but Javadoc just
                # uses them for xref links:
                if tag == 'see' and body:
                    if body[0] in '"\'':
                        if body[-1] == body[0]: body = body[1:-1]
                    elif body[0] == '<': pass
                    else: body = '{@link %s}' % body

                # Construct the field.
                parsed_body = ParsedJavadocDocstring(body)
                fields.append(Field(tag, arg, parsed_body))

        return (descr, fields)

    #////////////////////////////////////////////////////////////
    # HTML Output.
    #////////////////////////////////////////////////////////////

    _LINK_SPLIT_RE = re.compile(r'({@link(?:plain)?\s[^}]+})')
    _LINK_RE = re.compile(r'{@link(?:plain)?\s+' + r'([\w#.]+)' +
                          r'(?:\([^\)]*\))?' + r'(\s+.*)?' + r'}')

    # Inherit docs from ParsedDocstring.
    def to_html(self, docstring_linker, **options):
        # Split the docstring into an alternating list of HTML and
        # links (odd pieces are links).
        pieces = self._LINK_SPLIT_RE.split(self._docstring)

        # This function is used to translate {@link ...}s to HTML.
        translate_xref = docstring_linker.translate_identifier_xref
        
        # Build up the HTML string from the pieces.  For HTML pieces
        # (even), just add it to html.  For link pieces (odd), use
        # docstring_linker to translate the crossreference link to
        # HTML for us.
        html = ''
        for i in range(len(pieces)):
            if i%2 == 0:
                html += pieces[i]
            else:
                # Decompose the link into pieces.
                m = self._LINK_RE.match(pieces[i])
                if m is None: continue # Error flagged by _check_links
                (target, name) = m.groups()

                # Normalize the target name.
                if target[0] == '#': target = target[1:]
                target = target.replace('#', '.')
                target = re.sub(r'\(.*\)', '', target)

                # Provide a name, if it wasn't specified.
                if name is None: name = target
                else: name = name.strip()

                # Use docstring_linker to convert the name to html.
                html += translate_xref(target, name)
        return html

    def _check_links(self, errors):
        """
        Make sure that all @{link}s are valid.  We need a separate
        method for ths because we want to do this at parse time, not
        html output time.  Any errors found are appended to C{errors}.
        """
        pieces = self._LINK_SPLIT_RE.split(self._docstring)
        linenum = 0
        for i in range(len(pieces)):
            if i%2 == 1 and not self._LINK_RE.match(pieces[i]):
                estr = 'Bad link %r' % pieces[i]
                errors.append(ParseError(estr, linenum, is_fatal=0))
            linenum += pieces[i].count('\n')

    #////////////////////////////////////////////////////////////
    # Plaintext Output.
    #////////////////////////////////////////////////////////////

    # Inherit docs from ParsedDocstring.  Since we don't define
    # to_latex, this is used when generating latex output.
    def to_plaintext(self, docstring_linker, **options):
        return self._docstring

    # Jeff's hack to get summary working
    def summary(self):
        m = re.match(r'(\s*[\w\W]*?\.)(\s|$)', self._docstring)
        if m:
            return ParsedJavadocDocstring(m.group(1))
        else:
            summary = self._docstring.split('\n', 1)[0]+'...'
            return ParsedJavadocDocstring(summary)
        
#     def concatenate(self, other):
#         if not isinstance(other, ParsedJavadocDocstring):
#             raise ValueError, 'Could not concatenate docstrings'
#         return ParsedJavadocDocstring(self._docstring+other._docstring)
