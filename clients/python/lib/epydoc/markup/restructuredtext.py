#
# rst.py: ReStructuredText docstring parsing
# Edward Loper
#
# Created [06/28/03 02:52 AM]
# $Id: restructuredtext.py 1210 2006-04-10 13:25:50Z edloper $
#

"""
Epydoc parser for ReStructuredText strings.  ReStructuredText is the
standard markup language used by the Docutils project.
L{parse_docstring()} provides the primary interface to this module; it
returns a L{ParsedRstDocstring}, which supports all of the methods
defined by L{ParsedDocstring}.

L{ParsedRstDocstring} is basically just a L{ParsedDocstring} wrapper
for the L{docutils.nodes.document} class.

Creating C{ParsedRstDocstring}s
===============================
C{ParsedRstDocstring}s are created by the C{parse_document} function,
using the L{docutils.core.publish_string()} method, with the following
helpers:

  - An L{_EpydocReader} is used to capture all error messages as it
    parses the docstring.
  - A L{_DocumentPseudoWriter} is used to extract the document itself,
    without actually writing any output.  The document is saved for
    further processing.  The settings for the writer are copied from
    L{docutils.writers.html4css1.Writer}, since those settings will
    be used when we actually write the docstring to html.

Using C{ParsedRstDocstring}s
============================

C{ParsedRstDocstring}s support all of the methods defined by
C{ParsedDocstring}; but only the following four methods have
non-default behavior:

  - L{to_html()<ParsedRstDocstring.to_html>} uses an
    L{_EpydocHTMLTranslator} to translate the C{ParsedRstDocstring}'s
    document into an HTML segment.
  - L{split_fields()<ParsedRstDocstring.split_fields>} uses a
    L{_SplitFieldsTranslator} to divide the C{ParsedRstDocstring}'s
    document into its main body and its fields.  Special handling
    is done to account for consolidated fields.
  - L{summary()<ParsedRstDocstring.summary>} uses a
    L{_SummaryExtractor} to extract the first sentence from
    the C{ParsedRstDocstring}'s document.
  - L{to_plaintext()<ParsedRstDocstring.to_plaintext>} uses
    C{document.astext()} to convert the C{ParsedRstDocstring}'s
    document to plaintext.

@todo: Add ParsedRstDocstring.to_latex()
@var CONSOLIDATED_FIELDS: A dictionary encoding the set of
'consolidated fields' that can be used.  Each consolidated field is
marked by a single tag, and contains a single bulleted list, where
each list item starts with an identifier, marked as interpreted text
(C{`...`}).  This module automatically splits these consolidated
fields into individual fields.  The keys of C{CONSOLIDATED_FIELDS} are
the names of possible consolidated fields; and the values are the
names of the field tags that should be used for individual entries in
the list.
"""
__docformat__ = 'epytext en'

# Imports
import re, os, os.path
from xml.dom.minidom import *

from docutils.core import publish_string
from docutils.writers import Writer
from docutils.writers.html4css1 import HTMLTranslator, Writer as HTMLWriter
from docutils.writers.latex2e import LaTeXTranslator, Writer as LaTeXWriter
from docutils.readers.standalone import Reader as StandaloneReader
from docutils.utils import new_document
from docutils.nodes import NodeVisitor, Text, SkipChildren
from docutils.nodes import SkipNode, TreeCopyVisitor
from docutils.frontend import OptionParser
from docutils.parsers.rst import directives
import docutils.nodes

from epydoc.compat import * # Backwards compatibility
from epydoc.markup import *
from epydoc.apidoc import ModuleDoc, ClassDoc
from epydoc.docwriter.dotgraph import *

#: A dictionary whose keys are the "consolidated fields" that are
#: recognized by epydoc; and whose values are the corresponding epydoc
#: field names that should be used for the individual fields.
CONSOLIDATED_FIELDS = {
    'parameters': 'param',
    'arguments': 'arg',
    'exceptions': 'except',
    'variables': 'var',
    'ivariables': 'ivar',
    'cvariables': 'cvar',
    'groups': 'group',
    'types': 'type',
    'keywords': 'keyword',
    }

#: A list of consolidated fields whose bodies may be specified using a
#: definition list, rather than a bulleted list.  For these fields, the
#: 'classifier' for each term in the definition list is translated into
#: a @type field.
CONSOLIDATED_DEFLIST_FIELDS = ['param', 'arg', 'var', 'ivar', 'cvar', 'keyword']

def parse_docstring(docstring, errors, **options):
    """
    Parse the given docstring, which is formatted using
    ReStructuredText; and return a L{ParsedDocstring} representation
    of its contents.
    @param docstring: The docstring to parse
    @type docstring: C{string}
    @param errors: A list where any errors generated during parsing
        will be stored.
    @type errors: C{list} of L{ParseError}
    @param options: Extra options.  Unknown options are ignored.
        Currently, no extra options are defined.
    @rtype: L{ParsedDocstring}
    """
    writer = _DocumentPseudoWriter()
    reader = _EpydocReader(errors) # Outputs errors to the list.
    publish_string(docstring, writer=writer, reader=reader,
                   settings_overrides={'report_level':10000,
                                       'halt_level':10000,
                                       'warning_stream':None})
    return ParsedRstDocstring(writer.document)

class ParsedRstDocstring(ParsedDocstring):
    """
    An encoded version of a ReStructuredText docstring.  The contents
    of the docstring are encoded in the L{_document} instance
    variable.

    @ivar _document: A ReStructuredText document, encoding the
        docstring.
    @type _document: L{docutils.nodes.document}
    """
    def __init__(self, document):
        """
        @type document: L{docutils.nodes.document}
        """
        self._document = document

    def split_fields(self, errors=None):
        # Inherit docs
        visitor = _SplitFieldsTranslator(self._document, errors)
        self._document.walk(visitor)
        return self, visitor.fields

    def summary(self):
        # Inherit docs
        visitor = _SummaryExtractor(self._document)
        try: self._document.walk(visitor)
        except docutils.nodes.NodeFound: pass
        return visitor.summary

#     def concatenate(self, other):
#         result = self._document.copy()
#         for child in (self._document.get_children() +
#                       other._document.get_children()):
#             visitor = TreeCopyVisitor(self._document)
#             child.walkabout(visitor)
#             result.append(visitor.get_tree_copy())
#         return ParsedRstDocstring(result)
        
    def to_html(self, docstring_linker, directory=None,
                docindex=None, context=None, **options):
        # Inherit docs
        visitor = _EpydocHTMLTranslator(self._document, docstring_linker,
                                        directory, docindex, context)
        self._document.walkabout(visitor)
        return ''.join(visitor.body)

    def to_latex(self, docstring_linker, **options):
        # Inherit docs
        visitor = _EpydocLaTeXTranslator(self._document, docstring_linker)
        self._document.walkabout(visitor)
        return ''.join(visitor.body)

    def to_plaintext(self, docstring_linker, **options):
        # This is should be replaced by something better:
        return self._document.astext() 

    def __repr__(self): return '<ParsedRstDocstring: ...>'

class _EpydocReader(StandaloneReader):
    """
    A reader that captures all errors that are generated by parsing,
    and appends them to a list.
    """
    def __init__(self, errors):
        self._errors = errors
        StandaloneReader.__init__(self)
        
    def new_document(self):
        document = new_document(self.source.source_path, self.settings)
        # Capture all warning messages.
        document.reporter.attach_observer(self.report)
        # These are used so we know how to encode warning messages:
        self._encoding = document.reporter.encoding
        self._error_handler = document.reporter.error_handler
        # Return the new document.
        return document

    def report(self, error):
        try: is_fatal = int(error['level']) > 2
        except: is_fatal = 1
        try: linenum = int(error['line'])
        except: linenum = None

        msg = ''.join([c.astext().encode(self._encoding, self._error_handler)
                       for c in error])

        self._errors.append(ParseError(msg, linenum, is_fatal))
        
class _DocumentPseudoWriter(Writer):
    """
    A pseudo-writer for the docutils framework, that can be used to
    access the document itself.  The output of C{_DocumentPseudoWriter}
    is just an empty string; but after it has been used, the most
    recently processed document is available as the instance variable
    C{document}

    @type document: L{docutils.nodes.document}
    @ivar document: The most recently processed document.
    """
    def __init__(self):
        self.document = None
        Writer.__init__(self)
        
    def translate(self):
        self.output = ''
        
class _SummaryExtractor(NodeVisitor):
    """
    A docutils node visitor that extracts the first sentence from
    the first paragraph in a document.
    """
    def __init__(self, document):
        NodeVisitor.__init__(self, document)
        self.summary = None
        
    def visit_document(self, node):
        self.summary = None
        
    def visit_paragraph(self, node):
        if self.summary is not None: return

        summary_pieces = []

        # Extract the first sentence.
        for child in node:
            if isinstance(child, docutils.nodes.Text):
                m = re.match(r'(\s*[\w\W]*?\.)(\s|$)', child.data)
                if m:
                    summary_pieces.append(docutils.nodes.Text(m.group(1)))
                    break
            summary_pieces.append(child)

        summary_doc = self.document.copy() # shallow copy
        summary_para = node.copy() # shallow copy
        summary_doc[:] = [summary_para]
        summary_para[:] = summary_pieces
        self.summary = ParsedRstDocstring(summary_doc)
        raise docutils.nodes.NodeFound('Found summary')

    def unknown_visit(self, node):
        'Ignore all unknown nodes'

class _SplitFieldsTranslator(NodeVisitor):
    """
    A docutils translator that removes all fields from a document, and
    collects them into the instance variable C{fields}

    @ivar fields: The fields of the most recently walked document.
    @type fields: C{list} of L{Field<markup.Field>}
    """
    def __init__(self, document, errors):
        NodeVisitor.__init__(self, document)
        self._errors = errors
        self.fields = []
        self._newfields = {}

    def visit_document(self, node):
        self.fields = []

    def visit_field(self, node):
        # Remove the field from the tree.
        node.parent.remove(node)

        # Extract the field name & optional argument
        tag = node[0].astext().split(None, 1)
        tagname = tag[0]
        if len(tag)>1: arg = tag[1]
        else: arg = None

        # Handle special fields:
        fbody = node[1]
        if arg is None:
            for (list_tag, entry_tag) in CONSOLIDATED_FIELDS.items():
                if tagname.lower() == list_tag:
                    try:
                        self.handle_consolidated_field(fbody, entry_tag)
                        return
                    except ValueError, e:
                        estr = 'Unable to split consolidated field '
                        estr += '"%s" - %s' % (tagname, e)
                        self._errors.append(ParseError(estr, node.line,
                                                       is_fatal=0))
                        
                        # Use a @newfield to let it be displayed as-is.
                        if not self._newfields.has_key(tagname.lower()):
                            newfield = Field('newfield', tagname.lower(),
                                             parse(tagname, 'plaintext'))
                            self.fields.append(newfield)
                            self._newfields[tagname.lower()] = 1
                        
        self._add_field(tagname, arg, fbody)

    def _add_field(self, tagname, arg, fbody):
        field_doc = self.document.copy()
        for child in fbody: field_doc.append(child)
        field_pdoc = ParsedRstDocstring(field_doc)
        self.fields.append(Field(tagname, arg, field_pdoc))
            
    def visit_field_list(self, node):
        # Remove the field list from the tree.  The visitor will still walk
        # over the node's children.
        node.parent.remove(node)

    def handle_consolidated_field(self, body, tagname):
        """
        Attempt to handle a consolidated section.
        """
        if len(body) != 1:
            raise ValueError('does not contain a single list.')
        elif body[0].tagname == 'bullet_list':
            self.handle_consolidated_bullet_list(body[0], tagname)
        elif (body[0].tagname == 'definition_list' and
              tagname in CONSOLIDATED_DEFLIST_FIELDS):
            self.handle_consolidated_definition_list(body[0], tagname)
        elif tagname in CONSOLIDATED_DEFLIST_FIELDS:
            raise ValueError('does not contain a bulleted list or '
                             'definition list.')
        else:
            raise ValueError('does not contain a bulleted list.')

    def handle_consolidated_bullet_list(self, items, tagname):
        # Check the contents of the list.  In particular, each list
        # item should have the form:
        #   - `arg`: description...
        n = 0
        _BAD_ITEM = ("list item %d is not well formed.  Each item must "
                     "consist of a single marked identifier (e.g., `x`), "
                     "optionally followed by a colon or dash and a "
                     "description.")
        for item in items:
            n += 1
            if item.tagname != 'list_item' or len(item) == 0: 
                raise ValueError('bad bulleted list (bad child %d).' % n)
            if item[0].tagname != 'paragraph':
                if item[0].tagname == 'definition_list':
                    raise ValueError(('list item %d contains a definition '+
                                      'list (it\'s probably indented '+
                                      'wrong).') % n)
                else:
                    raise ValueError(_BAD_ITEM % n)
            if len(item[0]) == 0: 
                raise ValueError(_BAD_ITEM % n)
            if item[0][0].tagname != 'title_reference':
                raise ValueError(_BAD_ITEM % n)

        # Everything looks good; convert to multiple fields.
        for item in items:
            # Extract the arg
            arg = item[0][0].astext()

            # Extract the field body, and remove the arg
            fbody = item[:]
            fbody[0] = fbody[0].copy()
            fbody[0][:] = item[0][1:]

            # Remove the separating ":", if present
            if (len(fbody[0]) > 0 and
                isinstance(fbody[0][0], docutils.nodes.Text)):
                child = fbody[0][0]
                if child.data[:1] in ':-':
                    child.data = child.data[1:].lstrip()
                elif child.data[:2] == ' -':
                    child.data = child.data[2:].lstrip()

            # Wrap the field body, and add a new field
            self._add_field(tagname, arg, fbody)
        
    def handle_consolidated_definition_list(self, items, tagname):
        # Check the list contents.
        n = 0
        _BAD_ITEM = ("item %d is not well formed.  Each item's term must "
                     "consist of a single marked identifier (e.g., `x`), "
                     "optionally followed by a space, colon, space, and "
                     "a type description.")
        for item in items:
            n += 1
            if (item.tagname != 'definition_list_item' or len(item) < 2 or
                item[0].tagname != 'term' or
                item[-1].tagname != 'definition'):
                raise ValueError('bad definition list (bad child %d).' % n)
            if len(item) > 3:
                raise ValueError(_BAD_ITEM % n)
            if item[0][0].tagname != 'title_reference':
                raise ValueError(_BAD_ITEM % n)
            for child in item[0][1:]:
                if child.astext() != '':
                    raise ValueError(_BAD_ITEM % n)

        # Extract it.
        for item in items:
            # The basic field.
            arg = item[0][0].astext()
            fbody = item[-1]
            self._add_field(tagname, arg, fbody)
            # If there's a classifier, treat it as a type.
            if len(item) == 3:
                type_descr = item[1]
                self._add_field('type', arg, type_descr)

    def unknown_visit(self, node):
        'Ignore all unknown nodes'

def latex_head_prefix():
    document = new_document('<fake>')
    translator = _EpydocLaTeXTranslator(document, None)
    return translator.head_prefix
    
class _EpydocLaTeXTranslator(LaTeXTranslator):
    def __init__(self, document, docstring_linker):
        # Set the document's settings.
        settings = OptionParser([LaTeXWriter()]).get_default_values()
        document.settings = settings

        LaTeXTranslator.__init__(self, document)
        self._linker = docstring_linker

        # Start at section level 3.  (Unfortunately, we now have to
        # set a private variable to make this work; perhaps the standard
        # latex translator should grow an official way to spell this?)
        self.section_level = 3
        self._section_number = [0]*self.section_level

    # Handle interpreted text (crossreferences)
    def visit_title_reference(self, node):
        target = self.encode(node.astext())
        xref = self._linker.translate_identifier_xref(target, target)
        self.body.append(xref)
        raise SkipNode

    def visit_document(self, node): pass
    def depart_document(self, node): pass

    # For now, just ignore dotgraphs. [XXX]
    def visit_dotgraph(self, node): pass
    def depart_dotgraph(self, node): pass
    
class _EpydocHTMLTranslator(HTMLTranslator):
    def __init__(self, document, docstring_linker, directory,
                 docindex, context):
        self._linker = docstring_linker
        self._directory = directory
        self._docindex = docindex
        self._context = context
        
        # Set the document's settings.
        settings = OptionParser([HTMLWriter()]).get_default_values()
        document.settings = settings

        # Call the parent constructor.
        HTMLTranslator.__init__(self, document)

    # Handle interpreted text (crossreferences)
    def visit_title_reference(self, node):
        target = self.encode(node.astext())
        xref = self._linker.translate_identifier_xref(target, target)
        self.body.append(xref)
        raise SkipNode

    def should_be_compact_paragraph(self, node):
        if self.document.children == [node]:
            return True
        else:
            return HTMLTranslator.should_be_compact_paragraph(self, node)

    def visit_document(self, node): pass
    def depart_document(self, node): pass
        
    def starttag(self, node, tagname, suffix='\n', **attributes):
        """
        This modified version of starttag makes a few changes to HTML
        tags, to prevent them from conflicting with epydoc.  In particular:
          - existing class attributes are prefixed with C{'rst-'}
          - existing names are prefixed with C{'rst-'}
          - hrefs starting with C{'#'} are prefixed with C{'rst-'}
          - hrefs not starting with C{'#'} are given target='_top'
          - all headings (C{<hM{n}>}) are given the css class C{'heading'}
        """
        # Prefix all CSS classes with "rst-"
        if attributes.has_key('class'):
            attributes['class'] = 'rst-%s' % attributes['class']

        # Prefix all names with "rst-", to avoid conflicts
        if attributes.has_key('id'):
            attributes['id'] = 'rst-%s' % attributes['id']
        if attributes.has_key('name'):
            attributes['name'] = 'rst-%s' % attributes['name']
        if attributes.has_key('href'):
            if attributes['href'][:1]=='#':
                attributes['href'] = '#rst-%s' % attributes['href'][1:]
            else:
                attributes['target'] = '_top'

        # For headings, use class="heading"
        if re.match(r'^h\d+$', tagname):
            attributes['class'] = 'heading'
        
        return HTMLTranslator.starttag(self, node, tagname, suffix,
                                       **attributes)

    def visit_dotgraph(self, node):
        if self._directory is None: return # [xx] warning?
        
        # Generate the graph.
        graph = node.graph(self._docindex, self._context, self._linker)
        if graph is None: return
        
        # Write the graph.
        image_url = '%s.gif' % graph.uid
        image_file = os.path.join(self._directory, image_url)
        self.body.append(graph.to_html(image_file, image_url))

    def depart_dotgraph(self, node):
        pass # Nothing to do.

######################################################################
#{ Graph Generation Directives
######################################################################
# See http://docutils.sourceforge.net/docs/howto/rst-directives.html

class dotgraph(docutils.nodes.image):
    """
    A custom docutils node that should be rendered using Graphviz dot.
    This node does not directly store the graph; instead, it stores a
    pointer to a function that can be used to generate the graph.
    This allows the graph to be built based on information that might
    not be available yet at parse time.  This graph generation
    function has the following signature:

        >>> def generate_graph(docindex, context, linker, *args):
        ...     'generates and returns a new DotGraph'

    Where C{docindex} is a docindex containing the documentation that
    epydoc has built; C{context} is the C{APIDoc} whose docstring
    contains this dotgraph node; C{linker} is a L{DocstringLinker}
    that can be used to resolve crossreferences; and C{args} is any
    extra arguments that are passed to the C{dotgraph} constructor.
    """
    def __init__(self, generate_graph_func, *generate_graph_args):
        docutils.nodes.image.__init__(self)
        self.graph_func = generate_graph_func
        self.args = generate_graph_args
    def graph(self, docindex, context, linker):
        return self.graph_func(docindex, context, linker, *self.args)

def _dir_option(argument):
    """A directive option spec for the orientation of a graph."""
    argument = argument.lower().strip()
    if argument == 'right': return 'LR'
    if argument == 'left': return 'RL'
    if argument == 'down': return 'TB'
    if argument == 'up': return 'BT'
    raise ValueError('%r unknown; choose from left, right, up, down' %
                     argument)
 
def digraph_directive(name, arguments, options, content, lineno,
                      content_offset, block_text, state, state_machine):
    """
    A custom restructuredtext directive which can be used to display
    Graphviz dot graphs.  This directive takes a single argument,
    which is used as the graph's name.  The contents of the directive
    are used as the body of the graph.  Any href attributes whose
    value has the form <name> will be replaced by the URL of the object
    with that name.  Here's a simple example::

     .. digraph:: example_digraph
       a -> b -> c
       c -> a [dir=\"none\"]
    """
    if arguments: title = arguments[0]
    else: title = ''
    return dotgraph(_construct_digraph, title, options.get('caption'),
                    '\n'.join(content))
digraph_directive.arguments = (0, 1, True)
digraph_directive.options = {'caption': directives.unchanged}
digraph_directive.content = True
directives.register_directive('digraph', digraph_directive)

def _construct_digraph(docindex, context, linker, title, caption,
                       body):
    """Graph generator for L{digraph_directive}"""
    graph = DotGraph(title, body, caption=caption)
    graph.link(linker)
    return graph

def classtree_directive(name, arguments, options, content, lineno,
                        content_offset, block_text, state, state_machine):
    """
    A custom restructuredtext directive which can be used to
    graphically display a class hierarchy.  If one or more arguments
    are given, then those classes and all their descendants will be
    displayed.  If no arguments are given, and the directive is in a
    class's docstring, then that class and all its descendants will be
    displayed.  It is an error to use this directive with no arguments
    in a non-class docstring.

    Options:
      - C{:dir:} -- Specifies the orientation of the graph.  One of
        C{down}, C{right} (default), C{left}, C{up}.
    """
    return dotgraph(_construct_classtree, arguments, options)
classtree_directive.arguments = (0, 1, True)
classtree_directive.options = {'dir': _dir_option}
classtree_directive.content = False
directives.register_directive('classtree', classtree_directive)

def _construct_classtree(docindex, context, linker, arguments, options):
    """Graph generator for L{classtree_directive}"""
    if len(arguments) == 1:
        bases = [docindex.find(name, context) for name in
                 arguments[0].replace(',',' ').split()]
        bases = [d for d in bases if isinstance(d, ClassDoc)]
    elif isinstance(context, ClassDoc):
        bases = [context]
    else:
        log.warning("Could not construct class tree: you must "
                    "specify one or more base classes.")
        return None
        
    return class_tree_graph(bases, linker, context, **options)

def packagetree_directive(name, arguments, options, content, lineno,
                        content_offset, block_text, state, state_machine):
    """
    A custom restructuredtext directive which can be used to
    graphically display a package hierarchy.  If one or more arguments
    are given, then those packages and all their submodules will be
    displayed.  If no arguments are given, and the directive is in a
    package's docstring, then that package and all its submodules will
    be displayed.  It is an error to use this directive with no
    arguments in a non-package docstring.

    Options:
      - C{:dir:} -- Specifies the orientation of the graph.  One of
        C{down}, C{right} (default), C{left}, C{up}.
    """
    return dotgraph(_construct_packagetree, arguments, options)
packagetree_directive.arguments = (0, 1, True)
packagetree_directive.options = {
  'dir': _dir_option,
  'style': lambda a:directives.choice(a.lower(), ('uml', 'tree'))}
packagetree_directive.content = False
directives.register_directive('packagetree', packagetree_directive)

def _construct_packagetree(docindex, context, linker, arguments, options):
    """Graph generator for L{packagetree_directive}"""
    if len(arguments) == 1:
        packages = [docindex.find(name, context) for name in
                    arguments[0].replace(',',' ').split()]
        packages = [d for d in packages if isinstance(d, ModuleDoc)]
    elif isinstance(context, ModuleDoc):
        packages = [context]
    else:
        log.warning("Could not construct package tree: you must "
                    "specify one or more root packages.")
        return None

    return package_tree_graph(packages, linker, context, **options)

def importgraph_directive(name, arguments, options, content, lineno,
                        content_offset, block_text, state, state_machine):
    return dotgraph(_construct_importgraph, arguments, options)
importgraph_directive.arguments = None
importgraph_directive.options = {'dir': _dir_option}
importgraph_directive.content = False
directives.register_directive('importgraph', importgraph_directive)

def _construct_importgraph(docindex, context, linker, arguments, options):
    """Graph generator for L{importgraph_directive}"""
    modules = [d for d in docindex.root if isinstance(d, ModuleDoc)]
    return import_graph(modules, docindex, linker, context, **options)

def callgraph_directive(name, arguments, options, content, lineno,
                        content_offset, block_text, state, state_machine):
    return dotgraph(_construct_callgraph, arguments, options)
callgraph_directive.arguments = (0, 1, True)
callgraph_directive.options = {'dir': _dir_option,
                                 'add_callers': directives.flag,
                                 'add_callees': directives.flag}
callgraph_directive.content = False
directives.register_directive('callgraph', callgraph_directive)

def _construct_callgraph(docindex, context, linker, arguments, options):
    """Graph generator for L{callgraph_directive}"""
    if len(arguments) == 1:
        docs = [docindex.find(name, context) for name in
                 arguments[0].replace(',',' ').split()]
        docs = [doc for doc in docs if doc is not None]
    else:
        docs = [context]
    return call_graph(docs, docindex, linker, context, **options)
  
