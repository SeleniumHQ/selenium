# epydoc -- Graph generation
#
# Copyright (C) 2005 Edward Loper
# Author: Edward Loper <edloper@loper.org>
# URL: <http://epydoc.sf.net>
#
# $Id: dotgraph.py 1210 2006-04-10 13:25:50Z edloper $

"""
Render Graphviz directed graphs as images.  Below are some examples.

.. importgraph::

.. classtree:: epydoc.apidoc.APIDoc

.. packagetree:: epydoc

:see: `The Graphviz Homepage
       <http://www.research.att.com/sw/tools/graphviz/>`__
"""
__docformat__ = 'restructuredtext'

import re
import sys
from epydoc import log
from epydoc.apidoc import *
from epydoc.util import *
from epydoc.compat import * # Backwards compatibility

# colors for graphs of APIDocs
MODULE_BG = '#d8e8ff'
CLASS_BG = '#d8ffe8'
SELECTED_BG = '#ffd0d0'
BASECLASS_BG = '#e0b0a0'
SUBCLASS_BG = '#e0b0a0'
ROUTINE_BG = '#e8d0b0' # maybe?
INH_LINK_COLOR = '#800000'

######################################################################
#{ Dot Graphs
######################################################################

DOT_COMMAND = 'dot'
"""The command that should be used to spawn dot"""

class DotGraph:
    """
    A `dot` directed graph.  The contents of the graph are
    constructed from the following instance variables:

      - `nodes`: A list of `DotGraphNode`\\s, encoding the nodes
        that are present in the graph.  Each node is characterized
        a set of attributes, including an optional label.
      - `edges`: A list of `DotGraphEdge`\\s, encoding the edges
        that are present in the graph.  Each edge is characterized
        by a set of attributes, including an optional label.
      - `node_defaults`: Default attributes for nodes.
      - `edge_defaults`: Default attributes for edges.
      - `body`: A string that is appended as-is in the body of
        the graph.  This can be used to build more complex dot
        graphs.

    The `link()` method can be used to resolve crossreference links
    within the graph.  In particular, if the 'href' attribute of any
    node or edge is assigned a value of the form `<name>`, then it
    will be replaced by the URL of the object with that name.  This
    applies to the `body` as well as the `nodes` and `edges`.

    To render the graph, use the methods `write()` and `render()`.
    Usually, you should call `link()` before you render the graph.
    """
    _uids = set()
    """A set of all uids that that have been generated, used to ensure
    that each new graph has a unique uid."""

    DEFAULT_NODE_DEFAULTS={'fontsize':10, 'fontname': 'helvetica'}
    DEFAULT_EDGE_DEFAULTS={'fontsize':10, 'fontname': 'helvetica'}
    
    def __init__(self, title, body='', node_defaults=None,
                 edge_defaults=None, caption=None):
        """
        Create a new `DotGraph`.
        """
        self.title = title
        """The title of the graph."""

        self.caption = caption
        """A caption for the graph."""
        
        self.nodes = []
        """A list of the nodes that are present in the graph.
        
        :type: `list` of `DotGraphNode`"""
        
        self.edges = []
        """A list of the edges that are present in the graph.
        
        :type: `list` of `DotGraphEdge`"""

        self.body = body
        """A string that should be included as-is in the body of the
        graph.
        
        :type: `str`"""
        
        self.node_defaults = node_defaults or self.DEFAULT_NODE_DEFAULTS
        """Default attribute values for nodes."""
        
        self.edge_defaults = edge_defaults or self.DEFAULT_EDGE_DEFAULTS
        """Default attribute values for edges."""

        self.uid = re.sub(r'\W', '_', title).lower()
        """A unique identifier for this graph.  This can be used as a
        filename when rendering the graph.  No two `DotGraph`\s will
        have the same uid."""

        # Encode the title, if necessary.
        if isinstance(self.title, unicode):
            self.title = self.title.encode('ascii', 'xmlcharrefreplace')

        # Make sure the UID isn't too long.
        self.uid = self.uid[:30]
        
        # Make sure the UID is unique
        if self.uid in self._uids:
            n = 2
            while ('%s_%s' % (self.uid, n)) in self._uids: n += 1
            self.uid = '%s_%s' % (self.uid, n)
        self._uids.add(self.uid)

    def to_html(self, image_file, image_url, center=True):
        """
        Return the HTML code that should be uesd to display this graph
        (including a client-side image map).
        
        :param image_url: The URL of the image file for this graph;
            this should be generated separately with the `write()` method.
        """
        # If dotversion >1.8.10, then we can generate the image and
        # the cmapx with a single call to dot.  Otherwise, we need to
        # run dot twice.
        if get_dot_version() > [1,8,10]:
            cmapx = self._run_dot('-Tgif', '-o%s' % image_file, '-Tcmapx')
            if cmapx is None: return '' # failed to render
        else:
            if not self.write(image_file):
                return '' # failed to render
            cmapx = self.render('cmapx') or ''
            
        title = plaintext_to_html(self.title or '')
        caption = plaintext_to_html(self.caption or '')
        if title or caption:
            css_class = 'graph-with-title'
        else:
            css_class = 'graph-without-title'
        if len(title)+len(caption) > 80:
            title_align = 'left'
            table_width = ' width="600"'
        else:
            title_align = 'center'
            table_width = ''
            
        if center: s = '<center>'
        if title or caption:
            s += ('<p><table border="0" cellpadding="0" cellspacing="0" '
                  'class="graph"%s>\n  <tr><td align="center">\n' %
                  table_width)
        s += ('  %s\n  <img src="%s" alt=%r usemap="#%s" '
              'ismap="ismap" class="%s">\n' %
              (cmapx.strip(), image_url, title, self.uid, css_class))
        if title or caption:
            s += '  </td></tr>\n  <tr><td align=%r>\n' % title_align
            if title:
                s += '<span class="graph-title">%s</span>' % title
            if title and caption:
                s += ' -- '
            if caption:
                s += '<span class="graph-caption">%s</span>' % caption
            s += '\n  </th></tr>\n</table></p>'
        if center: s += '</center>'
        return s

    def link(self, docstring_linker):
        """
        Replace any href attributes whose value is <name> with 
        the url of the object whose name is <name>.
        """
        # Link xrefs in nodes
        self._link_href(self.node_defaults, docstring_linker)
        for node in self.nodes:
            self._link_href(node.attribs, docstring_linker)

        # Link xrefs in edges
        self._link_href(self.edge_defaults, docstring_linker)
        for edge in self.nodes:
            self._link_href(edge.attribs, docstring_linker)

        # Link xrefs in body
        def subfunc(m):
            url = docstring_linker.url_for(m.group(1))
            if url: return 'href="%s"%s' % (url, m.group(2))
            else: return ''
        self.body = re.sub("href\s*=\s*['\"]?<([\w\.]+)>['\"]?\s*(,?)",
                           subfunc, self.body)

    def _link_href(self, attribs, docstring_linker):
        """Helper for `link()`"""
        if 'href' in attribs:
            m = re.match(r'^<([\w\.]+)>$', attribs['href'])
            if m:
                url = docstring_linker.url_for(m.group(1))
                if url: attribs['href'] = url
                else: del attribs['href']
                
    def write(self, filename, language='gif'):
        """
        Render the graph using the output format `language`, and write
        the result to `filename`.
        
        :return: True if rendering was successful.
        """
        result = self._run_dot('-T%s' % language,
                               '-o%s' % filename)
        # Decode into unicode, if necessary.
        if language == 'cmapx' and result is not None:
            result = result.decode('utf-8')
        return (result is not None)

    def render(self, language='gif'):
        """
        Use the ``dot`` command to render this graph, using the output
        format `language`.  Return the result as a string, or `None`
        if the rendering failed.
        """
        return self._run_dot('-T%s' % language)

    def _run_dot(self, *options):
        try:
            result, err = run_subprocess((DOT_COMMAND,)+options,
                                         self.to_dotfile())
            if err: log.warning("Graphviz dot warning(s):\n%s" % err)
        except OSError, e:
            log.warning("Unable to render Graphviz dot graph:\n%s" % e)
            #log.debug(self.to_dotfile())
            return None

        return result

    def to_dotfile(self):
        """
        Return the string contents of the dot file that should be used
        to render this graph.
        """
        lines = ['digraph %s {' % self.uid,
                 'node [%s]' % ','.join(['%s="%s"' % (k,v) for (k,v)
                                         in self.node_defaults.items()]),
                 'edge [%s]' % ','.join(['%s="%s"' % (k,v) for (k,v)
                                         in self.edge_defaults.items()])]
        if self.body:
            lines.append(self.body)
        lines.append('/* Nodes */')
        for node in self.nodes:
            lines.append(node.to_dotfile())
        lines.append('/* Edges */')
        for edge in self.edges:
            lines.append(edge.to_dotfile())
        lines.append('}')

        # Default dot input encoding is UTF-8
        return u'\n'.join(lines).encode('utf-8')

class DotGraphNode:
    _next_id = 0
    def __init__(self, label=None, html_label=None, **attribs):
        if label is not None and html_label is not None:
            raise ValueError('Use label or html_label, not both.')
        if label is not None: attribs['label'] = label
        self._html_label = html_label
        self._attribs = attribs
        self.id = self.__class__._next_id
        self.__class__._next_id += 1
        self.port = None

    def __getitem__(self, attr):
        return self._attribs[attr]

    def __setitem__(self, attr, val):
        if attr == 'html_label':
            self._attribs.pop('label')
            self._html_label = val
        else:
            if attr == 'label': self._html_label = None
            self._attribs[attr] = val

    def to_dotfile(self):
        """
        Return the dot commands that should be used to render this node.
        """
        attribs = ['%s="%s"' % (k,v) for (k,v) in self._attribs.items()
                   if v is not None]
        if self._html_label:
            attribs.insert(0, 'label=<%s>' % (self._html_label,))
        if attribs: attribs = ' [%s]' % (','.join(attribs))
        return 'node%d%s' % (self.id, attribs)

class DotGraphEdge:
    def __init__(self, start, end, label=None, **attribs):
        """
        :type start: `DotGraphNode`
        :type end: `DotGraphNode`
        """
        assert isinstance(start, DotGraphNode)
        assert isinstance(end, DotGraphNode)
        if label is not None: attribs['label'] = label
        self.start = start       #: :type: `DotGraphNode`
        self.end = end           #: :type: `DotGraphNode`
        self._attribs = attribs

    def __getitem__(self, attr):
        return self._attribs[attr]

    def __setitem__(self, attr, val):
        self._attribs[attr] = val

    def to_dotfile(self):
        """
        Return the dot commands that should be used to render this edge.
        """
        # Set head & tail ports, if the nodes have preferred ports.
        attribs = self._attribs.copy()
        if (self.start.port is not None and 'headport' not in attribs):
            attribs['headport'] = self.start.port
        if (self.end.port is not None and 'tailport' not in attribs):
            attribs['tailport'] = self.end.port
        # Convert attribs to a string
        attribs = ','.join(['%s="%s"' % (k,v) for (k,v) in attribs.items()
                            if v is not None])
        if attribs: attribs = ' [%s]' % attribs
        # Return the dotfile edge.
        return 'node%d -> node%d%s' % (self.start.id, self.end.id, attribs)

######################################################################
#{ Specialized Nodes for UML Graphs
######################################################################

class DotGraphUmlClassNode(DotGraphNode):
    """
    A specialized dot graph node used to display `ClassDoc`\s using
    UML notation.  The node is rendered as a table with three cells:
    the top cell contains the class name; the middle cell contains a
    list of attributes; and the bottom cell contains a list of
    operations::

         +-------------+
         |  ClassName  |
         +-------------+
         | x: int      |
         |     ...     |
         +-------------+
         | f(self, x)  |
         |     ...     |
         +-------------+

    `DotGraphUmlClassNode`\s may be *collapsed*, in which case they are
    drawn as a simple box containing the class name::
    
         +-------------+
         |  ClassName  |
         +-------------+
         
    Attributes with types corresponding to documented classes can
    optionally be converted into edges, using `link_attributes()`.

    :todo: Add more options?
      - show/hide operation signature
      - show/hide operation signature types
      - show/hide operation signature return type
      - show/hide attribute types
      - use qualifiers
    """

    def __init__(self, class_doc, linker, context, collapsed=False,
                 bgcolor=CLASS_BG, **options):
        """
        Create a new `DotGraphUmlClassNode` based on the class
        `class_doc`.

        :Parameters:
            `linker` : `DocstringLinker<markup.DocstringLinker>`
                Used to look up URLs for classes.
            `context` : `APIDoc`
                The context in which this node will be drawn; dotted
                names will be contextualized to this context.
            `collapsed` : ``bool``
                If true, then display this node as a simple box.
            `bgcolor` : ``str``
                The background color for this node.
            `options` : ``dict``
                A set of options used to control how the node should
                be displayed.

        :Keywords:
          - `show_private_vars`: If false, then private variables
            are filtered out of the attributes & operations lists.
            (Default: *False*)
          - `show_magic_vars`: If false, then magic variables
            (such as ``__init__`` and ``__add__``) are filtered out of
            the attributes & operations lists. (Default: *True*)
          - `show_inherited_vars`: If false, then inherited variables
            are filtered out of the attributes & operations lists.
            (Default: *False*)
          - `max_attributes`: The maximum number of attributes that
            should be listed in the attribute box.  If the class has
            more than this number of attributes, some will be
            ellided.  Ellipsis is marked with ``'...'``.
          - `max_operations`: The maximum number of operations that
            should be listed in the operation box.
          - `add_nodes_for_linked_attributes`: If true, then
            `link_attributes()` will create new a collapsed node for
            the types of a linked attributes if no node yet exists for
            that type.
        """
        self.class_doc = class_doc
        """The class represented by this node."""
        
        self.linker = linker
        """Used to look up URLs for classes."""
        
        self.context = context
        """The context in which the node will be drawn."""
        
        self.bgcolor = bgcolor
        """The background color of the node."""
        
        self.options = options
        """Options used to control how the node is displayed."""

        self.collapsed = collapsed
        """If true, then draw this node as a simple box."""
        
        self.attributes = []
        """The list of VariableDocs for attributes"""
        
        self.operations = []
        """The list of VariableDocs for operations"""
        
        self.qualifiers = []
        """List of (key_label, port) tuples."""

        self.edges = []
        """List of edges used to represent this node's attributes.
        These should not be added to the `DotGraph`; this node will
        generate their dotfile code directly."""

        # Initialize operations & attributes lists.
        show_private = options.get('show_private_vars', False)
        show_magic = options.get('show_magic_vars', True)
        show_inherited = options.get('show_inherited_vars', False)
        for name, var in class_doc.variables.iteritems():
            if ((not show_private and var.is_public == False) or
                (not show_magic and re.match('__\w+__$', name)) or
                (not show_inherited and var.container != class_doc)):
                pass
            elif isinstance(var.value, RoutineDoc):
                self.operations.append(var)
            else:
                self.attributes.append(var)

        # Initialize our dot node settings.
        DotGraphNode.__init__(self, tooltip=class_doc.canonical_name,
                              width=0, height=0, shape='plaintext',
                              href=linker.url_for(class_doc) or NOOP_URL)

    #/////////////////////////////////////////////////////////////////
    #{ Attribute Linking
    #/////////////////////////////////////////////////////////////////
    
    SIMPLE_TYPE_RE = re.compile(
        r'^([\w\.]+)$')
    """A regular expression that matches descriptions of simple types."""
    
    COLLECTION_TYPE_RE = re.compile(
        r'^(list|set|sequence|tuple|collection) of ([\w\.]+)$')
    """A regular expression that matches descriptions of collection types."""

    MAPPING_TYPE_RE = re.compile(
        r'^(dict|dictionary|map|mapping) from ([\w\.]+) to ([\w\.]+)$')
    """A regular expression that matches descriptions of mapping types."""

    MAPPING_TO_COLLECTION_TYPE_RE = re.compile(
        r'^(dict|dictionary|map|mapping) from ([\w\.]+) to '
        r'(list|set|sequence|tuple|collection) of ([\w\.]+)$')
    """A regular expression that matches descriptions of mapping types
    whose value type is a collection."""

    OPTIONAL_TYPE_RE = re.compile(
        r'^(None or|optional) ([\w\.]+)$|^([\w\.]+) or None$')
    """A regular expression that matches descriptions of optional types."""
    
    def link_attributes(self, nodes):
        """
        Convert any attributes with type descriptions corresponding to
        documented classes to edges.  The following type descriptions
        are currently handled:

          - Dotted names: Create an attribute edge to the named type,
            labelled with the variable name.
          - Collections: Create an attribute edge to the named type,
            labelled with the variable name, and marked with '*' at the
            type end of the edge.
          - Mappings: Create an attribute edge to the named type,
            labelled with the variable name, connected to the class by
            a qualifier box that contains the key type description.
          - Optional: Create an attribute edge to the named type,
            labelled with the variable name, and marked with '0..1' at
            the type end of the edge.

        The edges created by `link_attribute()` are handled internally
        by `DotGraphUmlClassNode`; they should *not* be added directly
        to the `DotGraph`.

        :param nodes: A dictionary mapping from `ClassDoc`\s to
            `DotGraphUmlClassNode`\s, used to look up the nodes for
            attribute types.  If the ``add_nodes_for_linked_attributes``
            option is used, then new nodes will be added to this
            dictionary for any types that are not already listed.
            These added nodes must be added to the `DotGraph`.
        """
        # Try to convert each attribute var into a graph edge.  If
        # _link_attribute returns true, then it succeeded, so remove
        # that var from our attribute list; otherwise, leave that var
        # in our attribute list.
        self.attributes = [var for var in self.attributes
                           if not self._link_attribute(var, nodes)]

    def _link_attribute(self, var, nodes):
        """
        Helper for `link_attributes()`: try to convert the attribute
        variable `var` into an edge, and add that edge to
        `self.edges`.  Return ``True`` iff the variable was
        successfully converted to an edge (in which case, it should be
        removed from the attributes list).
        """
        type_descr = self._type_descr(var) or self._type_descr(var.value)
        
        # Simple type.
        m = self.SIMPLE_TYPE_RE.match(type_descr)
        if m and self._add_attribute_edge(var, nodes, m.group(1)):
            return True

        # Collection type.
        m = self.COLLECTION_TYPE_RE.match(type_descr)
        if m and self._add_attribute_edge(var, nodes, m.group(2),
                                          headlabel='*'):
            return True

        # Optional type.
        m = self.OPTIONAL_TYPE_RE.match(type_descr)
        if m and self._add_attribute_edge(var, nodes, m.group(2) or m.group(3),
                                          headlabel='0..1'):
            return True
                
        # Mapping type.
        m = self.MAPPING_TYPE_RE.match(type_descr)
        if m:
            port = 'qualifier_%s' % var.name
            if self._add_attribute_edge(var, nodes, m.group(3),
                                        tailport='%s:e' % port):
                self.qualifiers.append( (m.group(2), port) )
                return True

        # Mapping to collection type.
        m = self.MAPPING_TO_COLLECTION_TYPE_RE.match(type_descr)
        if m:
            port = 'qualifier_%s' % var.name
            if self._add_attribute_edge(var, nodes, m.group(4), headlabel='*', 
                                        tailport='%s:e' % port):
                self.qualifiers.append( (m.group(2), port) )
                return True

        # We were unable to link this attribute.
        return False

    def _add_attribute_edge(self, var, nodes, type_str, **attribs):
        """
        Helper for `link_attribute()`: try to add an edge for the
        given attribute variable `var`.  Return ``True`` if
        successful.
        """
        # Use the type string to look up a corresponding ValueDoc.
        type_doc = self.linker.docindex.find(type_str, var)
        if not type_doc: return False

        # Get the type ValueDoc's node.  If it doesn't have one (and
        # add_nodes_for_linked_attributes=True), then create it.
        type_node = nodes.get(type_doc)
        if not type_node:
            if self.options.get('add_nodes_for_linked_attributes', True):
                type_node = DotGraphUmlClassNode(type_doc, self.linker,
                                                 self.context, collapsed=True)
                nodes[type_doc] = type_node
            else:
                return False

        # Add an edge from self to the target type node.
        # [xx] should I set constraint=false here?
        attribs.setdefault('headport', 'body')
        attribs.setdefault('tailport', 'body')
        url = self.linker.url_for(var) or NOOP_URL
        self.edges.append(DotGraphEdge(self, type_node, label=var.name,
                        arrowhead='open', href=url,
                        tooltip=var.canonical_name, labeldistance=1.5,
                        **attribs))
        return True
                           
    #/////////////////////////////////////////////////////////////////
    #{ Helper Methods
    #/////////////////////////////////////////////////////////////////
    def _summary(self, api_doc):
        """Return a plaintext summary for `api_doc`"""
        if not isinstance(api_doc, APIDoc): return ''
        if api_doc.summary in (None, UNKNOWN): return ''
        summary = api_doc.summary.to_plaintext(self.linker).strip()
        return plaintext_to_html(summary)

    def _type_descr(self, api_doc):
        """Return a plaintext type description for `api_doc`"""
        if not hasattr(api_doc, 'type_descr'): return ''
        if api_doc.type_descr in (None, UNKNOWN): return ''
        type_descr = api_doc.type_descr.to_plaintext(self.linker).strip()
        return plaintext_to_html(type_descr)

    def _tooltip(self, var_doc):
        """Return a tooltip for `var_doc`."""
        return (self._summary(var_doc) or
                self._summary(var_doc.value) or
                var_doc.canonical_name)
    
    #/////////////////////////////////////////////////////////////////
    #{ Rendering
    #/////////////////////////////////////////////////////////////////
    
    def _attribute_cell(self, var_doc):
        # Construct the label
        label = var_doc.name
        type_descr = (self._type_descr(var_doc) or
                      self._type_descr(var_doc.value))
        if type_descr: label += ': %s' % type_descr
        # Get the URL
        url = self.linker.url_for(var_doc) or NOOP_URL
        # Construct & return the pseudo-html code
        return self._ATTRIBUTE_CELL % (url, self._tooltip(var_doc), label)

    def _operation_cell(self, var_doc):
        """
        :todo: do 'word wrapping' on the signature, by starting a new
               row in the table, if necessary.  How to indent the new
               line?  Maybe use align=right?  I don't think dot has a
               &nbsp;.
        :todo: Optionally add return type info?
        """
        # Construct the label (aka function signature)
        func_doc = var_doc.value
        args = [self._operation_arg(n, d, func_doc) for (n, d)
                in zip(func_doc.posargs, func_doc.posarg_defaults)]
        args = [plaintext_to_html(arg) for arg in args]
        if func_doc.vararg: args.append('*'+func_doc.vararg)
        if func_doc.kwarg: args.append('**'+func_doc.kwarg)
        label = '%s(%s)' % (var_doc.name, ', '.join(args))
        # Get the URL
        url = self.linker.url_for(var_doc) or NOOP_URL
        # Construct & return the pseudo-html code
        return self._OPERATION_CELL % (url, self._tooltip(var_doc), label)

    def _operation_arg(self, name, default, func_doc):
        """
        :todo: Handle tuple args better
        :todo: Optionally add type info?
        """
        if default is None:
            return '%s' % name
        elif default.parse_repr is not UNKNOWN:
            return '%s=%s' % (name, default.parse_repr)
        else:
            pyval_repr = default.pyval_repr()
            if pyval_repr is not UNKNOWN:
                return '%s=%s' % (name, pyval_repr)
            else:
                return '%s=??' % name

    def _qualifier_cell(self, key_label, port):
        return self._QUALIFIER_CELL  % (port, self.bgcolor, key_label)

    #: args: (url, tooltip, label)
    _ATTRIBUTE_CELL = '''
    <TR><TD ALIGN="LEFT" HREF="%s" TOOLTIP="%s">%s</TD></TR>
    '''

    #: args: (url, tooltip, label)
    _OPERATION_CELL = '''
    <TR><TD ALIGN="LEFT" HREF="%s" TOOLTIP="%s">%s</TD></TR>
    '''

    #: args: (port, bgcolor, label)
    _QUALIFIER_CELL = '''
    <TR><TD VALIGN="BOTTOM" PORT="%s" BGCOLOR="%s" BORDER="1">%s</TD></TR>
    '''

    _QUALIFIER_DIV = '''
    <TR><TD VALIGN="BOTTOM" HEIGHT="10" WIDTH="10" FIXEDSIZE="TRUE"></TD></TR>
    '''
    
    #: Args: (rowspan, bgcolor, classname, attributes, operations, qualifiers)
    _LABEL = '''
    <TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0" CELLPADDING="0">
      <TR><TD ROWSPAN="%s">
        <TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0"
               CELLPADDING="0" PORT="body" BGCOLOR="%s">
          <TR><TD>%s</TD></TR>
          <TR><TD><TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0">
            %s</TABLE></TD></TR>
          <TR><TD><TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0">
            %s</TABLE></TD></TR>
        </TABLE>
      </TD></TR>
      %s
    </TABLE>'''

    _COLLAPSED_LABEL = '''
    <TABLE CELLBORDER="0" BGCOLOR="%s" PORT="body">
      <TR><TD>%s</TD></TR>
    </TABLE>'''

    def _get_html_label(self):
        # Get the class name & contextualize it.
        classname = self.class_doc.canonical_name
        classname = classname.contextualize(self.context.canonical_name)
        
        # If we're collapsed, display the node as a single box.
        if self.collapsed:
            return self._COLLAPSED_LABEL % (self.bgcolor, classname)
        
        # Construct the attribute list.  (If it's too long, truncate)
        attrib_cells = [self._attribute_cell(a) for a in self.attributes]
        max_attributes = self.options.get('max_attributes', 15)
        if len(attrib_cells) == 0:
            attrib_cells = ['<TR><TD></TD></TR>']
        elif len(attrib_cells) > max_attributes:
            attrib_cells[max_attributes-2:-1] = ['<TR><TD>...</TD></TR>']
        attributes = ''.join(attrib_cells)
                      
        # Construct the operation list.  (If it's too long, truncate)
        oper_cells = [self._operation_cell(a) for a in self.operations]
        max_operations = self.options.get('max_operations', 15)
        if len(oper_cells) == 0:
            oper_cells = ['<TR><TD></TD></TR>']
        elif len(oper_cells) > max_operations:
            oper_cells[max_operations-2:-1] = ['<TR><TD>...</TD></TR>']
        operations = ''.join(oper_cells)

        # Construct the qualifier list & determine the rowspan.
        if self.qualifiers:
            rowspan = len(self.qualifiers)*2+2
            div = self._QUALIFIER_DIV
            qualifiers = div+div.join([self._qualifier_cell(l,p) for
                                     (l,p) in self.qualifiers])+div
        else:
            rowspan = 1
            qualifiers = ''

        # Put it all together.
        return self._LABEL % (rowspan, self.bgcolor, classname,
                              attributes, operations, qualifiers)

    def to_dotfile(self):
        attribs = ['%s="%s"' % (k,v) for (k,v) in self._attribs.items()]
        attribs.append('label=<%s>' % self._get_html_label())
        s = 'node%d%s' % (self.id, ' [%s]' % (','.join(attribs)))
        if not self.collapsed:
            for edge in self.edges:
                s += '\n' + edge.to_dotfile()
        return s

class DotGraphUmlModuleNode(DotGraphNode):
    """
    A specialized dot grah node used to display `ModuleDoc`\s using
    UML notation.  Simple module nodes look like::

        .----.
        +------------+
        | modulename |
        +------------+

    Packages nodes are drawn with their modules & subpackages nested
    inside::
        
        .----.
        +----------------------------------------+
        | packagename                            |
        |                                        |
        |  .----.       .----.       .----.      |
        |  +---------+  +---------+  +---------+ |
        |  | module1 |  | module2 |  | module3 | |
        |  +---------+  +---------+  +---------+ |
        |                                        |
        +----------------------------------------+

    """
    def __init__(self, module_doc, linker, context, collapsed=False,
                 excluded_submodules=(), **options):
        self.module_doc = module_doc
        self.linker = linker
        self.context = context
        self.collapsed = collapsed
        self.options = options
        self.excluded_submodules = excluded_submodules
        DotGraphNode.__init__(self, shape='plaintext',
                              href=linker.url_for(module_doc) or NOOP_URL,
                              tooltip=module_doc.canonical_name)

    #: Expects: (color, color, url, tooltip, body)
    _MODULE_LABEL = ''' 
    <TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0" ALIGN="LEFT">
    <TR><TD ALIGN="LEFT" VALIGN="BOTTOM" HEIGHT="8" WIDTH="16"
            FIXEDSIZE="true" BGCOLOR="%s" BORDER="1" PORT="tab"></TD></TR>
    <TR><TD ALIGN="LEFT" VALIGN="TOP" BGCOLOR="%s" BORDER="1" WIDTH="20"
            PORT="body" HREF="%s" TOOLTIP="%s">%s</TD></TR>
    </TABLE>'''

    #: Expects: (name, body_rows)
    _NESTED_BODY = '''
    <TABLE BORDER="0" CELLBORDER="0" CELLPADDING="0" CELLSPACING="0">
    <TR><TD ALIGN="LEFT">%s</TD></TR>
    %s
    </TABLE>'''

    #: Expects: (cells,)
    _NESTED_BODY_ROW = '''
    <TR><TD>
      <TABLE BORDER="0" CELLBORDER="0"><TR>%s</TR></TABLE>
    </TD></TR>'''
    
    def _get_html_label(self, package):
        """
        :Return: (label, depth, width) where:
        
          - `label` is the HTML label
          - `depth` is the depth of the package tree (for coloring)
          - `width` is the max width of the HTML label, roughly in
             units of characters.
        """
        MAX_ROW_WIDTH = 80 # unit is roughly characters.
        pkg_name = package.canonical_name
        pkg_url = self.linker.url_for(package) or NOOP_URL
        
        if (not package.is_package or len(package.submodules) == 0 or
            self.collapsed):
            pkg_color = self._color(package, 1)
            label = self._MODULE_LABEL % (pkg_color, pkg_color,
                                          pkg_url, pkg_name, pkg_name[-1])
            return (label, 1, len(pkg_name[-1])+3)
                
        # Get the label for each submodule, and divide them into rows.
        row_list = ['']
        row_width = 0
        max_depth = 0
        max_row_width = len(pkg_name[-1])+3
        for submodule in package.submodules:
            if submodule in self.excluded_submodules: continue
            # Get the submodule's label.
            label, depth, width = self._get_html_label(submodule)
            # Check if we should start a new row.
            if row_width > 0 and width+row_width > MAX_ROW_WIDTH:
                row_list.append('')
                row_width = 0
            # Add the submodule's label to the row.
            row_width += width
            row_list[-1] += '<TD ALIGN="LEFT">%s</TD>' % label
            # Update our max's.
            max_depth = max(depth, max_depth)
            max_row_width = max(row_width, max_row_width)

        # Figure out which color to use.
        pkg_color = self._color(package, depth+1)
        
        # Assemble & return the label.
        rows = ''.join([self._NESTED_BODY_ROW % r for r in row_list])
        body = self._NESTED_BODY % (pkg_name, rows)
        label = self._MODULE_LABEL % (pkg_color, pkg_color,
                                      pkg_url, pkg_name, body)
        return label, max_depth+1, max_row_width

    _COLOR_DIFF = 24
    def _color(self, package, depth):
        if package == self.context: return SELECTED_BG
        else: 
            # Parse the base color.
            if re.match(MODULE_BG, 'r#[0-9a-fA-F]{6}$'):
                base = int(MODULE_BG[1:], 16)
            else:
                base = int('d8e8ff', 16)
            red = (base & 0xff0000) >> 16
            green = (base & 0x00ff00) >> 8
            blue = (base & 0x0000ff)
            # Make it darker with each level of depth. (but not *too*
            # dark -- package name needs to be readable)
            red = max(64, red-(depth-1)*self._COLOR_DIFF)
            green = max(64, green-(depth-1)*self._COLOR_DIFF)
            blue = max(64, blue-(depth-1)*self._COLOR_DIFF)
            # Convert it back to a color string
            return '#%06x' % ((red<<16)+(green<<8)+blue)
        
    def to_dotfile(self):
        attribs = ['%s="%s"' % (k,v) for (k,v) in self._attribs.items()]
        label, depth, width = self._get_html_label(self.module_doc)
        attribs.append('label=<%s>' % label)
        return 'node%d%s' % (self.id, ' [%s]' % (','.join(attribs)))


    
######################################################################
#{ Graph Generation Functions
######################################################################

def package_tree_graph(packages, linker, context=None, **options):
    """
    Return a `DotGraph` that graphically displays the package
    hierarchies for the given packages.
    """
    if options.get('style', 'uml') == 'uml': # default to uml style?
        if get_dot_version() >= [2]:
            return uml_package_tree_graph(packages, linker, context,
                                             **options)
        elif 'style' in options:
            log.warning('UML style package trees require dot version 2.0+')

    graph = DotGraph('Package Tree for %s' % name_list(packages, context),
                     body='ranksep=.3\n;nodesep=.1\n',
                     edge_defaults={'dir':'none'})
    
    # Options
    if options.get('dir', 'TB') != 'TB': # default: top-to-bottom
        graph.body += 'rankdir=%s\n' % options.get('dir', 'TB')

    # Get a list of all modules in the package.
    queue = list(packages)
    modules = set(packages)
    for module in queue:
        queue.extend(module.submodules)
        modules.update(module.submodules)

    # Add a node for each module.
    nodes = add_valdoc_nodes(graph, modules, linker, context)

    # Add an edge for each package/submodule relationship.
    for module in modules:
        for submodule in module.submodules:
            graph.edges.append(DotGraphEdge(nodes[module], nodes[submodule],
                                            headport='tab'))

    return graph

def uml_package_tree_graph(packages, linker, context=None, **options):
    """
    Return a `DotGraph` that graphically displays the package
    hierarchies for the given packages as a nested set of UML
    symbols.
    """
    graph = DotGraph('Package Tree for %s' % name_list(packages, context))
    # Remove any packages whose containers are also in the list.
    root_packages = []
    for package1 in packages:
        for package2 in packages:
            if (package1 is not package2 and
                package2.canonical_name.dominates(package1.canonical_name)):
                break
        else:
            root_packages.append(package1)
    # If the context is a variable, then get its value.
    if isinstance(context, VariableDoc) and context.value is not UNKNOWN:
        context = context.value
    # Return a graph with one node for each root package.
    for package in root_packages:
        graph.nodes.append(DotGraphUmlModuleNode(package, linker, context))
    return graph

######################################################################
def class_tree_graph(bases, linker, context=None, **options):
    """
    Return a `DotGraph` that graphically displays the package
    hierarchies for the given packages.
    """
    graph = DotGraph('Class Hierarchy for %s' % name_list(bases, context),
                     body='ranksep=0.3\n',
                     edge_defaults={'sametail':True, 'dir':'none'})

    # Options
    if options.get('dir', 'TB') != 'TB': # default: top-down
        graph.body += 'rankdir=%s\n' % options.get('dir', 'TB')

    # Find all superclasses & subclasses of the given classes.
    classes = set(bases)
    queue = list(bases)
    for cls in queue:
        if cls.subclasses not in (None, UNKNOWN):
            queue.extend(cls.subclasses)
            classes.update(cls.subclasses)
    queue = list(bases)
    for cls in queue:
        if cls.bases not in (None, UNKNOWN):
            queue.extend(cls.bases)
            classes.update(cls.bases)

    # Add a node for each cls.
    classes = [d for d in classes if isinstance(d, ClassDoc)
               if d.pyval is not object]
    nodes = add_valdoc_nodes(graph, classes, linker, context)

    # Add an edge for each package/subclass relationship.
    edges = set()
    for cls in classes:
        for subcls in cls.subclasses:
            if cls in nodes and subcls in nodes:
                edges.add((nodes[cls], nodes[subcls]))
    graph.edges = [DotGraphEdge(src,dst) for (src,dst) in edges]

    return graph

######################################################################
def uml_class_tree_graph(class_doc, linker, context=None, **options):
    """
    Return a `DotGraph` that graphically displays the class hierarchy
    for the given class, using UML notation.  Options:
    
      - max_attributes
      - max_operations
      - show_private_vars
      - show_magic_vars
      - link_attributes
    """
    nodes = {} # ClassDoc -> DotGraphUmlClassNode

    # Create nodes for class_doc and all its bases.
    for cls in class_doc.mro():
        if cls.pyval is object: continue # don't include `object`.
        if cls == class_doc: color = SELECTED_BG
        else: color = BASECLASS_BG
        nodes[cls] = DotGraphUmlClassNode(cls, linker, context,
                                          show_inherited_vars=False,
                                          collapsed=False, bgcolor=color)

    # Create nodes for all class_doc's subclasses.
    queue = [class_doc]
    for cls in queue:
        if cls.subclasses not in (None, UNKNOWN):
            queue.extend(cls.subclasses)
            for cls in cls.subclasses:
                if cls not in nodes:
                    nodes[cls] = DotGraphUmlClassNode(cls, linker, context,
                                                      collapsed=True,
                                                      bgcolor=SUBCLASS_BG)
                    
    # Only show variables in the class where they're defined for
    # *class_doc*.
    mro = class_doc.mro()
    for name, var in class_doc.variables.items():
        i = mro.index(var.container)
        for base in mro[i+1:]:
            if base.pyval is object: continue # don't include `object`.
            overridden_var = base.variables.get(name)
            if overridden_var and overridden_var.container == base:
                try:
                    if isinstance(overridden_var.value, RoutineDoc):
                        nodes[base].operations.remove(overridden_var)
                    else:
                        nodes[base].attributes.remove(overridden_var)
                except ValueError:
                    pass # var is filtered (eg private or magic)

    # Keep track of which nodes are part of the inheritance graph
    # (since link_attributes might add new nodes)
    inheritance_nodes = set(nodes.values())
        
    # Turn attributes into links.
    if options.get('link_attributes', True):
        for node in nodes.values():
            node.link_attributes(nodes)
            # Make sure that none of the new attribute edges break the
            # rank ordering assigned by inheritance.
            for edge in node.edges:
                if edge.end in inheritance_nodes:
                    edge['constraint'] = 'False'
                
    # Construct the graph.
    graph = DotGraph('UML class diagram for %s' % class_doc,
                     body='ranksep=.2\n;nodesep=.3\n')
    graph.nodes = nodes.values()
    
    # Add inheritance edges.
    for node in inheritance_nodes:
        for base in node.class_doc.bases:
            if base in nodes:
                graph.edges.append(DotGraphEdge(nodes[base], node,
                              dir='back', arrowtail='empty',
                              headport='body', tailport='body',
                              color=INH_LINK_COLOR, weight=100,
                              style='bold'))

    # And we're done!
    return graph

######################################################################
def import_graph(modules, docindex, linker, context=None, **options):
    graph = DotGraph('Import Graph', body='ranksep=.3\n;nodesep=.3\n')

    # Options
    if options.get('dir', 'RL') != 'TB': # default: right-to-left.
        graph.body += 'rankdir=%s\n' % options.get('dir', 'RL')

    # Add a node for each module.
    nodes = add_valdoc_nodes(graph, modules, linker, context)

    # Edges.
    edges = set()
    for dst in modules:
        if dst.imports in (None, UNKNOWN): continue
        for var_name in dst.imports:
            for i in range(len(var_name), 0, -1):
                val_doc = docindex.get_valdoc(var_name[:i])
                if isinstance(val_doc, ModuleDoc):
                    if val_doc in nodes and dst in nodes:
                        edges.add((nodes[val_doc], nodes[dst]))
                    break
    graph.edges = [DotGraphEdge(src,dst) for (src,dst) in edges]

    return graph

######################################################################
def call_graph(api_docs, docindex, linker, context=None, **options):
    """
    :param options:
        - `dir`: rankdir for the graph.  (default=LR)
        - `add_callers`: also include callers for any of the
          routines in `api_docs`.  (default=False)
        - `add_callees`: also include callees for any of the
          routines in `api_docs`.  (default=False)
    :todo: Add an `exclude` option?
    """
    if docindex.callers is None:
        log.warning("No profiling information for call graph!")
        return DotGraph('Call Graph') # return None instead?

    if isinstance(context, VariableDoc):
        context = context.value

    # Get the set of requested functions.
    functions = []
    for api_doc in api_docs:
        # If it's a variable, get its value.
        if isinstance(api_doc, VariableDoc):
            api_doc = api_doc.value
        # Add the value to the functions list.
        if isinstance(api_doc, RoutineDoc):
            functions.append(api_doc)
        elif isinstance(api_doc, NamespaceDoc):
            for vardoc in api_doc.variables.values():
                if isinstance(vardoc.value, RoutineDoc):
                    functions.append(vardoc.value)

    # Filter out functions with no callers/callees?
    # [xx] this isnt' quite right, esp if add_callers or add_callees
    # options are fales.
    functions = [f for f in functions if
                 (f in docindex.callers) or (f in docindex.callees)]
        
    # Add any callers/callees of the selected functions
    func_set = set(functions)
    if options.get('add_callers', False) or options.get('add_callees', False):
        for func_doc in functions:
            if options.get('add_callers', False):
                func_set.update(docindex.callers.get(func_doc, ()))
            if options.get('add_callees', False):
                func_set.update(docindex.callees.get(func_doc, ()))

    graph = DotGraph('Call Graph for %s' % name_list(api_docs, context),
                     node_defaults={'shape':'box', 'width': 0, 'height': 0})
    
    # Options
    if options.get('dir', 'LR') != 'TB': # default: left-to-right
        graph.body += 'rankdir=%s\n' % options.get('dir', 'LR')

    nodes = add_valdoc_nodes(graph, func_set, linker, context)
    
    # Find the edges.
    edges = set()
    for func_doc in functions:
        for caller in docindex.callers.get(func_doc, ()):
            if caller in nodes:
                edges.add( (nodes[caller], nodes[func_doc]) )
        for callee in docindex.callees.get(func_doc, ()):
            if callee in nodes:
                edges.add( (nodes[func_doc], nodes[callee]) )
    graph.edges = [DotGraphEdge(src,dst) for (src,dst) in edges]
    
    return graph

######################################################################
#{ Dot Version
######################################################################

_dot_version = None
_DOT_VERSION_RE = re.compile(r'dot version ([\d\.]+)')
def get_dot_version():
    global _dot_version
    if _dot_version is None:
        try:
            out, err = run_subprocess([DOT_COMMAND, '-V'])
            version_info = err or out
            m = _DOT_VERSION_RE.match(version_info)
            if m:
                _dot_version = [int(x) for x in m.group(1).split('.')]
            else:
                _dot_version = (0,)
        except RunSubprocessError, e:
            _dot_version = (0,)
        log.info('Detected dot version %s' % _dot_version)
    return _dot_version

######################################################################
#{ Helper Functions
######################################################################

def add_valdoc_nodes(graph, val_docs, linker, context):
    """
    @todo: Use different node styles for different subclasses of APIDoc
    """
    nodes = {}
    val_docs = sorted(val_docs, key=lambda d:d.canonical_name)
    for i, val_doc in enumerate(val_docs):
        label = val_doc.canonical_name.contextualize(context.canonical_name)
        node = nodes[val_doc] = DotGraphNode(label)
        graph.nodes.append(node)
        specialize_valdoc_node(node, val_doc, context, linker.url_for(val_doc))
    return nodes

NOOP_URL = 'javascript: void(0);'
MODULE_NODE_HTML = '''
  <TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0"
         CELLPADDING="0" PORT="table" ALIGN="LEFT">
  <TR><TD ALIGN="LEFT" VALIGN="BOTTOM" HEIGHT="8" WIDTH="16" FIXEDSIZE="true"
          BGCOLOR="%s" BORDER="1" PORT="tab"></TD></TR>
  <TR><TD ALIGN="LEFT" VALIGN="TOP" BGCOLOR="%s" BORDER="1"
          PORT="body" HREF="%s" TOOLTIP="%s">%s</TD></TR>
  </TABLE>'''.strip()

def specialize_valdoc_node(node, val_doc, context, url):
    """
    Update the style attributes of `node` to reflext its type
    and context.
    """
    # We can only use html-style nodes if dot_version>2.
    dot_version = get_dot_version()
    
    # If val_doc or context is a variable, get its value.
    if isinstance(val_doc, VariableDoc) and val_doc.value is not UNKNOWN:
        val_doc = val_doc.value
    if isinstance(context, VariableDoc) and context.value is not UNKNOWN:
        context = context.value

    # Set the URL.  (Do this even if it points to the page we're
    # currently on; otherwise, the tooltip is ignored.)
    node['href'] = url or NOOP_URL

    if isinstance(val_doc, ModuleDoc) and dot_version >= [2]:
        node['shape'] = 'plaintext'
        if val_doc == context: color = SELECTED_BG
        else: color = MODULE_BG
        node['tooltip'] = node['label']
        node['html_label'] = MODULE_NODE_HTML % (color, color, url,
                                                 val_doc.canonical_name,
                                                 node['label'])
        node['width'] = node['height'] = 0
        node.port = 'body'

    elif isinstance(val_doc, RoutineDoc):
        node['shape'] = 'box'
        node['style'] = 'rounded'
        node['width'] = 0
        node['height'] = 0
        node['label'] = '%s()' % node['label']
        node['tooltip'] = node['label']
        if val_doc == context:
            node['fillcolor'] = SELECTED_BG
            node['style'] = 'filled,rounded,bold'
            
    else:
        node['shape'] = 'box' 
        node['width'] = 0
        node['height'] = 0
        node['tooltip'] = node['label']
        if val_doc == context:
            node['fillcolor'] = SELECTED_BG
            node['style'] = 'filled,bold'

def name_list(api_docs, context=None):
    if context is not None:
        context = context.canonical_name
    names = [str(d.canonical_name.contextualize(context)) for d in api_docs]
    if len(names) == 0: return ''
    if len(names) == 1: return '%s' % names[0]
    elif len(names) == 2: return '%s and %s' % (names[0], names[1])
    else:
        return '%s, and %s' % (', '.join(names[:-1]), names[-1])

