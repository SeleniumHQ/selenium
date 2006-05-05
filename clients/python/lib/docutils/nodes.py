# Author: David Goodger
# Contact: goodger@users.sourceforge.net
# Revision: $Revision: 4487 $
# Date: $Date: 2006-04-02 08:27:33 +0200 (Sun, 02 Apr 2006) $
# Copyright: This module has been placed in the public domain.

"""
Docutils document tree element class library.

Classes in CamelCase are abstract base classes or auxiliary classes. The one
exception is `Text`, for a text (PCDATA) node; uppercase is used to
differentiate from element classes.  Classes in lower_case_with_underscores
are element classes, matching the XML element generic identifiers in the DTD_.

The position of each node (the level at which it can occur) is significant and
is represented by abstract base classes (`Root`, `Structural`, `Body`,
`Inline`, etc.).  Certain transformations will be easier because we can use
``isinstance(node, base_class)`` to determine the position of the node in the
hierarchy.

.. _DTD: http://docutils.sourceforge.net/docs/ref/docutils.dtd
"""

__docformat__ = 'reStructuredText'

import sys
import os
import re
import warnings
from types import IntType, SliceType, StringType, UnicodeType, \
     TupleType, ListType, ClassType
from UserString import UserString


# ==============================
#  Functional Node Base Classes
# ==============================

class Node:

    """Abstract base class of nodes in a document tree."""

    parent = None
    """Back-reference to the Node immediately containing this Node."""

    document = None
    """The `document` node at the root of the tree containing this Node."""

    source = None
    """Path or description of the input source which generated this Node."""

    line = None
    """The line number (1-based) of the beginning of this Node in `source`."""

    def __nonzero__(self):
        """
        Node instances are always true, even if they're empty.  A node is more
        than a simple container.  Its boolean "truth" does not depend on
        having one or more subnodes in the doctree.

        Use `len()` to check node length.  Use `None` to represent a boolean
        false value.
        """
        return 1

    def asdom(self, dom=None):
        """Return a DOM **fragment** representation of this Node."""
        if dom is None:
            import xml.dom.minidom as dom
        domroot = dom.Document()
        return self._dom_node(domroot)

    def pformat(self, indent='    ', level=0):
        """
        Return an indented pseudo-XML representation, for test purposes.

        Override in subclasses.
        """
        raise NotImplementedError

    def copy(self):
        """Return a copy of self."""
        raise NotImplementedError

    def deepcopy(self):
        """Return a deep copy of self (also copying children)."""
        raise NotImplementedError

    def setup_child(self, child):
        child.parent = self
        if self.document:
            child.document = self.document
            if child.source is None:
                child.source = self.document.current_source
            if child.line is None:
                child.line = self.document.current_line

    def walk(self, visitor):
        """
        Traverse a tree of `Node` objects, calling the
        `dispatch_visit()` method of `visitor` when entering each
        node.  (The `walkabout()` method is similar, except it also
        calls the `dispatch_departure()` method before exiting each
        node.)

        This tree traversal supports limited in-place tree
        modifications.  Replacing one node with one or more nodes is
        OK, as is removing an element.  However, if the node removed
        or replaced occurs after the current node, the old node will
        still be traversed, and any new nodes will not.

        Within ``visit`` methods (and ``depart`` methods for
        `walkabout()`), `TreePruningException` subclasses may be raised
        (`SkipChildren`, `SkipSiblings`, `SkipNode`, `SkipDeparture`).

        Parameter `visitor`: A `NodeVisitor` object, containing a
        ``visit`` implementation for each `Node` subclass encountered.
        """
        visitor.document.reporter.debug(
            'docutils.nodes.Node.walk calling dispatch_visit for %s'
            % self.__class__.__name__)
        try:
            visitor.dispatch_visit(self)
        except (SkipChildren, SkipNode):
            return
        except SkipDeparture:           # not applicable; ignore
            pass
        children = self.children
        try:
            for child in children[:]:
                child.walk(visitor)
        except SkipSiblings:
            pass

    def walkabout(self, visitor):
        """
        Perform a tree traversal similarly to `Node.walk()` (which
        see), except also call the `dispatch_departure()` method
        before exiting each node.

        Parameter `visitor`: A `NodeVisitor` object, containing a
        ``visit`` and ``depart`` implementation for each `Node`
        subclass encountered.
        """
        call_depart = 1
        visitor.document.reporter.debug(
            'docutils.nodes.Node.walkabout calling dispatch_visit for %s'
            % self.__class__.__name__)
        try:
            try:
                visitor.dispatch_visit(self)
            except SkipNode:
                return
            except SkipDeparture:
                call_depart = 0
            children = self.children
            try:
                for child in children[:]:
                    child.walkabout(visitor)
            except SkipSiblings:
                pass
        except SkipChildren:
            pass
        if call_depart:
            visitor.document.reporter.debug(
                'docutils.nodes.Node.walkabout calling dispatch_departure '
                'for %s' % self.__class__.__name__)
            visitor.dispatch_departure(self)

    def traverse(self, condition=None,
                 include_self=1, descend=1, siblings=0, ascend=0):
        """
        Return an iterable containing

        * self (if include_self is true)
        * all descendants in tree traversal order (if descend is true)
        * all siblings (if siblings is true) and their descendants (if
          also descend is true)
        * the siblings of the parent (if ascend is true) and their
          descendants (if also descend is true), and so on

        If `condition` is not None, the iterable contains only nodes
        for which ``condition(node)`` is true.  If `condition` is a
        node class ``cls``, it is equivalent to a function consisting
        of ``return isinstance(node, cls)``.

        If ascend is true, assume siblings to be true as well.

        For example, given the following tree::

            <paragraph>
                <emphasis>      <--- emphasis.traverse() and
                    <strong>    <--- strong.traverse() are called.
                        Foo
                    Bar
                <reference name="Baz" refid="baz">
                    Baz

        Then list(emphasis.traverse()) equals ::

            [<emphasis>, <strong>, <#text: Foo>, <#text: Bar>]

        and list(strong.traverse(ascend=1)) equals ::

            [<strong>, <#text: Foo>, <#text: Bar>, <reference>, <#text: Baz>]
        """
        r = []
        if ascend:
            siblings=1
        if isinstance(condition, ClassType):
            node_class = condition
            def condition(node, node_class=node_class):
                return isinstance(node, node_class)
        if include_self and (condition is None or condition(self)):
            r.append(self)
        if descend and len(self.children):
            for child in self:
                r.extend(child.traverse(
                    include_self=1, descend=1, siblings=0, ascend=0,
                    condition=condition))
        if siblings or ascend:
            node = self
            while node.parent:
                index = node.parent.index(node)
                for sibling in node.parent[index+1:]:
                    r.extend(sibling.traverse(include_self=1, descend=descend,
                                              siblings=0, ascend=0,
                                              condition=condition))
                if not ascend:
                    break
                else:
                    node = node.parent
        return r

    def next_node(self, condition=None,
                  include_self=0, descend=1, siblings=0, ascend=0):
        """
        Return the first node in the iterable returned by traverse(),
        or None if the iterable is empty.

        Parameter list is the same as of traverse.  Note that
        include_self defaults to 0, though.
        """
        iterable = self.traverse(condition=condition,
                                 include_self=include_self, descend=descend,
                                 siblings=siblings, ascend=ascend)
        try:
            return iterable[0]
        except IndexError:
            return None

class Text(Node, UserString):

    """
    Instances are terminal nodes (leaves) containing text only; no child
    nodes or attributes.  Initialize by passing a string to the constructor.
    Access the text itself with the `astext` method.
    """

    tagname = '#text'

    children = ()
    """Text nodes have no children, and cannot have children."""

    def __init__(self, data, rawsource=''):
        UserString.__init__(self, data)

        self.rawsource = rawsource
        """The raw text from which this element was constructed."""

    def __repr__(self):
        data = repr(self.data)
        if len(data) > 70:
            data = repr(self.data[:64] + ' ...')
        return '<%s: %s>' % (self.tagname, data)

    def __len__(self):
        return len(self.data)

    def shortrepr(self):
        data = repr(self.data)
        if len(data) > 20:
            data = repr(self.data[:16] + ' ...')
        return '<%s: %s>' % (self.tagname, data)

    def _dom_node(self, domroot):
        return domroot.createTextNode(self.data)

    def astext(self):
        return self.data

    def copy(self):
        return self.__class__(self.data)

    def deepcopy(self):
        return self.copy()

    def pformat(self, indent='    ', level=0):
        result = []
        indent = indent * level
        for line in self.data.splitlines():
            result.append(indent + line + '\n')
        return ''.join(result)


class Element(Node):

    """
    `Element` is the superclass to all specific elements.

    Elements contain attributes and child nodes.  Elements emulate
    dictionaries for attributes, indexing by attribute name (a string).  To
    set the attribute 'att' to 'value', do::

        element['att'] = 'value'

    There are two special attributes: 'ids' and 'names'.  Both are
    lists of unique identifiers, and names serve as human interfaces
    to IDs.  Names are case- and whitespace-normalized (see the
    fully_normalize_name() function), and IDs conform to the regular
    expression ``[a-z](-?[a-z0-9]+)*`` (see the make_id() function).

    Elements also emulate lists for child nodes (element nodes and/or text
    nodes), indexing by integer.  To get the first child node, use::

        element[0]

    Elements may be constructed using the ``+=`` operator.  To add one new
    child node to element, do::

        element += node

    This is equivalent to ``element.append(node)``.

    To add a list of multiple child nodes at once, use the same ``+=``
    operator::

        element += [node1, node2]

    This is equivalent to ``element.extend([node1, node2])``.
    """

    list_attributes = ('ids', 'classes', 'names', 'dupnames', 'backrefs')
    """List attributes, automatically initialized to empty lists for
    all nodes."""

    tagname = None
    """The element generic identifier. If None, it is set as an instance
    attribute to the name of the class."""

    child_text_separator = '\n\n'
    """Separator for child nodes, used by `astext()` method."""

    def __init__(self, rawsource='', *children, **attributes):
        self.rawsource = rawsource
        """The raw text from which this element was constructed."""

        self.children = []
        """List of child nodes (elements and/or `Text`)."""

        self.extend(children)           # maintain parent info

        self.attributes = {}
        """Dictionary of attribute {name: value}."""

        # Initialize list attributes.
        for att in self.list_attributes:
            self.attributes[att] = []

        for att, value in attributes.items():
            att = att.lower()
            if att in self.list_attributes:
                # mutable list; make a copy for this node
                self.attributes[att] = value[:]
            else:
                self.attributes[att] = value

        if self.tagname is None:
            self.tagname = self.__class__.__name__

    def _dom_node(self, domroot):
        element = domroot.createElement(self.tagname)
        for attribute, value in self.attlist():
            if isinstance(value, ListType):
                value = ' '.join([serial_escape('%s' % v) for v in value])
            element.setAttribute(attribute, '%s' % value)
        for child in self.children:
            element.appendChild(child._dom_node(domroot))
        return element

    def __repr__(self):
        data = ''
        for c in self.children:
            data += c.shortrepr()
            if len(data) > 60:
                data = data[:56] + ' ...'
                break
        if self['names']:
            return '<%s "%s": %s>' % (self.__class__.__name__,
                                      '; '.join(self['names']), data)
        else:
            return '<%s: %s>' % (self.__class__.__name__, data)

    def shortrepr(self):
        if self['names']:
            return '<%s "%s"...>' % (self.__class__.__name__,
                                     '; '.join(self['names']))
        else:
            return '<%s...>' % self.tagname

    def __str__(self):
        return self.__unicode__().encode('raw_unicode_escape')

    def __unicode__(self):
        if self.children:
            return u'%s%s%s' % (self.starttag(),
                                 ''.join([str(c) for c in self.children]),
                                 self.endtag())
        else:
            return self.emptytag()

    def starttag(self):
        parts = [self.tagname]
        for name, value in self.attlist():
            if value is None:           # boolean attribute
                parts.append(name)
            elif isinstance(value, ListType):
                values = [serial_escape('%s' % v) for v in value]
                parts.append('%s="%s"' % (name, ' '.join(values)))
            else:
                parts.append('%s="%s"' % (name, value))
        return '<%s>' % ' '.join(parts)

    def endtag(self):
        return '</%s>' % self.tagname

    def emptytag(self):
        return u'<%s/>' % ' '.join([self.tagname] +
                                    ['%s="%s"' % (n, v)
                                     for n, v in self.attlist()])

    def __len__(self):
        return len(self.children)

    def __getitem__(self, key):
        if isinstance(key, UnicodeType) or isinstance(key, StringType):
            return self.attributes[key]
        elif isinstance(key, IntType):
            return self.children[key]
        elif isinstance(key, SliceType):
            assert key.step in (None, 1), 'cannot handle slice with stride'
            return self.children[key.start:key.stop]
        else:
            raise TypeError, ('element index must be an integer, a slice, or '
                              'an attribute name string')

    def __setitem__(self, key, item):
        if isinstance(key, UnicodeType) or isinstance(key, StringType):
            self.attributes[str(key)] = item
        elif isinstance(key, IntType):
            self.setup_child(item)
            self.children[key] = item
        elif isinstance(key, SliceType):
            assert key.step in (None, 1), 'cannot handle slice with stride'
            for node in item:
                self.setup_child(node)
            self.children[key.start:key.stop] = item
        else:
            raise TypeError, ('element index must be an integer, a slice, or '
                              'an attribute name string')

    def __delitem__(self, key):
        if isinstance(key, UnicodeType) or isinstance(key, StringType):
            del self.attributes[key]
        elif isinstance(key, IntType):
            del self.children[key]
        elif isinstance(key, SliceType):
            assert key.step in (None, 1), 'cannot handle slice with stride'
            del self.children[key.start:key.stop]
        else:
            raise TypeError, ('element index must be an integer, a simple '
                              'slice, or an attribute name string')

    def __add__(self, other):
        return self.children + other

    def __radd__(self, other):
        return other + self.children

    def __iadd__(self, other):
        """Append a node or a list of nodes to `self.children`."""
        if isinstance(other, Node):
            self.append(other)
        elif other is not None:
            self.extend(other)
        return self

    def astext(self):
        return self.child_text_separator.join(
              [child.astext() for child in self.children])

    def non_default_attributes(self):
        atts = {}
        for key, value in self.attributes.items():
            if self.is_not_default(key):
                atts[key] = value
        return atts

    def attlist(self):
        attlist = self.non_default_attributes().items()
        attlist.sort()
        return attlist

    def get(self, key, failobj=None):
        return self.attributes.get(key, failobj)

    def hasattr(self, attr):
        return self.attributes.has_key(attr)

    def delattr(self, attr):
        if self.attributes.has_key(attr):
            del self.attributes[attr]

    def setdefault(self, key, failobj=None):
        return self.attributes.setdefault(key, failobj)

    has_key = hasattr

    def append(self, item):
        self.setup_child(item)
        self.children.append(item)

    def extend(self, item):
        for node in item:
            self.append(node)

    def insert(self, index, item):
        if isinstance(item, Node):
            self.setup_child(item)
            self.children.insert(index, item)
        elif item is not None:
            self[index:index] = item

    def pop(self, i=-1):
        return self.children.pop(i)

    def remove(self, item):
        self.children.remove(item)

    def index(self, item):
        return self.children.index(item)

    def is_not_default(self, key):
        if self[key] == [] and key in self.list_attributes:
            return 0
        else:
            return 1

    def update_basic_atts(self, dict):
        """
        Update basic attributes ('ids', 'names', 'classes',
        'dupnames', but not 'source') from node or dictionary `dict`.
        """
        if isinstance(dict, Node):
            dict = dict.attributes
        for att in ('ids', 'classes', 'names', 'dupnames'):
            for value in dict.get(att, []):
                if not value in self[att]:
                    self[att].append(value)

    def clear(self):
        self.children = []

    def replace(self, old, new):
        """Replace one child `Node` with another child or children."""
        index = self.index(old)
        if isinstance(new, Node):
            self.setup_child(new)
            self[index] = new
        elif new is not None:
            self[index:index+1] = new

    def replace_self(self, new):
        """
        Replace `self` node with `new`, where `new` is a node or a
        list of nodes.
        """
        update = new
        if not isinstance(new, Node):
            # `new` is a list; update first child.
            try:
                update = new[0]
            except IndexError:
                update = None
        if isinstance(update, Element):
            update.update_basic_atts(self)
        else:
            # `update` is a Text node or `new` is an empty list.
            # Assert that we aren't losing any attributes.
            for att in ('ids', 'names', 'classes', 'dupnames'):
                assert not self[att], \
                       'Losing "%s" attribute: %s' % (att, self[att])
        self.parent.replace(self, new)

    def first_child_matching_class(self, childclass, start=0, end=sys.maxint):
        """
        Return the index of the first child whose class exactly matches.

        Parameters:

        - `childclass`: A `Node` subclass to search for, or a tuple of `Node`
          classes. If a tuple, any of the classes may match.
        - `start`: Initial index to check.
        - `end`: Initial index to *not* check.
        """
        if not isinstance(childclass, TupleType):
            childclass = (childclass,)
        for index in range(start, min(len(self), end)):
            for c in childclass:
                if isinstance(self[index], c):
                    return index
        return None

    def first_child_not_matching_class(self, childclass, start=0,
                                       end=sys.maxint):
        """
        Return the index of the first child whose class does *not* match.

        Parameters:

        - `childclass`: A `Node` subclass to skip, or a tuple of `Node`
          classes. If a tuple, none of the classes may match.
        - `start`: Initial index to check.
        - `end`: Initial index to *not* check.
        """
        if not isinstance(childclass, TupleType):
            childclass = (childclass,)
        for index in range(start, min(len(self), end)):
            for c in childclass:
                if isinstance(self.children[index], c):
                    break
            else:
                return index
        return None

    def pformat(self, indent='    ', level=0):
        return ''.join(['%s%s\n' % (indent * level, self.starttag())] +
                       [child.pformat(indent, level+1)
                        for child in self.children])

    def copy(self):
        return self.__class__(**self.attributes)

    def deepcopy(self):
        copy = self.copy()
        copy.extend([child.deepcopy() for child in self.children])
        return copy

    def set_class(self, name):
        """Add a new class to the "classes" attribute."""
        warnings.warn('docutils.nodes.Element.set_class deprecated; '
                      "append to Element['classes'] list attribute directly",
                      DeprecationWarning, stacklevel=2)
        assert ' ' not in name
        self['classes'].append(name.lower())

    def note_referenced_by(self, name=None, id=None):
        """Note that this Element has been referenced by its name
        `name` or id `id`."""
        self.referenced = 1
        # Element.expect_referenced_by_* dictionaries map names or ids
        # to nodes whose ``referenced`` attribute is set to true as
        # soon as this node is referenced by the given name or id.
        # Needed for target propagation.
        by_name = getattr(self, 'expect_referenced_by_name', {}).get(name)
        by_id = getattr(self, 'expect_referenced_by_id', {}).get(id)
        if by_name:
            assert name is not None
            by_name.referenced = 1
        if by_id:
            assert id is not None
            by_id.referenced = 1


class TextElement(Element):

    """
    An element which directly contains text.

    Its children are all `Text` or `Inline` subclass nodes.  You can
    check whether an element's context is inline simply by checking whether
    its immediate parent is a `TextElement` instance (including subclasses).
    This is handy for nodes like `image` that can appear both inline and as
    standalone body elements.

    If passing children to `__init__()`, make sure to set `text` to
    ``''`` or some other suitable value.
    """

    child_text_separator = ''
    """Separator for child nodes, used by `astext()` method."""

    def __init__(self, rawsource='', text='', *children, **attributes):
        if text != '':
            textnode = Text(text)
            Element.__init__(self, rawsource, textnode, *children,
                              **attributes)
        else:
            Element.__init__(self, rawsource, *children, **attributes)


class FixedTextElement(TextElement):

    """An element which directly contains preformatted text."""

    def __init__(self, rawsource='', text='', *children, **attributes):
        TextElement.__init__(self, rawsource, text, *children, **attributes)
        self.attributes['xml:space'] = 'preserve'


# ========
#  Mixins
# ========

class Resolvable:

    resolved = 0


class BackLinkable:

    def add_backref(self, refid):
        self['backrefs'].append(refid)


# ====================
#  Element Categories
# ====================

class Root: pass

class Titular: pass

class PreBibliographic:
    """Category of Node which may occur before Bibliographic Nodes."""

class Bibliographic: pass

class Decorative(PreBibliographic): pass

class Structural: pass

class Body: pass

class General(Body): pass

class Sequential(Body):
    """List-like elements."""

class Admonition(Body): pass

class Special(Body):
    """Special internal body elements."""

class Invisible(PreBibliographic):
    """Internal elements that don't appear in output."""

class Part: pass

class Inline: pass

class Referential(Resolvable): pass


class Targetable(Resolvable):

    referenced = 0

    indirect_reference_name = None
    """Holds the whitespace_normalized_name (contains mixed case) of a target.
    Required for MoinMoin/reST compatibility."""


class Labeled:
    """Contains a `label` as its first element."""


# ==============
#  Root Element
# ==============

class document(Root, Structural, Element):

    """
    The document root element.

    Do not instantiate this class directly; use
    `docutils.utils.new_document()` instead.
    """

    def __init__(self, settings, reporter, *args, **kwargs):
        Element.__init__(self, *args, **kwargs)

        self.current_source = None
        """Path to or description of the input source being processed."""

        self.current_line = None
        """Line number (1-based) of `current_source`."""

        self.settings = settings
        """Runtime settings data record."""

        self.reporter = reporter
        """System message generator."""

        self.indirect_targets = []
        """List of indirect target nodes."""

        self.substitution_defs = {}
        """Mapping of substitution names to substitution_definition nodes."""

        self.substitution_names = {}
        """Mapping of case-normalized substitution names to case-sensitive
        names."""

        self.refnames = {}
        """Mapping of names to lists of referencing nodes."""

        self.refids = {}
        """Mapping of ids to lists of referencing nodes."""

        self.nameids = {}
        """Mapping of names to unique id's."""

        self.nametypes = {}
        """Mapping of names to hyperlink type (boolean: True => explicit,
        False => implicit."""

        self.ids = {}
        """Mapping of ids to nodes."""

        self.footnote_refs = {}
        """Mapping of footnote labels to lists of footnote_reference nodes."""

        self.citation_refs = {}
        """Mapping of citation labels to lists of citation_reference nodes."""

        self.autofootnotes = []
        """List of auto-numbered footnote nodes."""

        self.autofootnote_refs = []
        """List of auto-numbered footnote_reference nodes."""

        self.symbol_footnotes = []
        """List of symbol footnote nodes."""

        self.symbol_footnote_refs = []
        """List of symbol footnote_reference nodes."""

        self.footnotes = []
        """List of manually-numbered footnote nodes."""

        self.citations = []
        """List of citation nodes."""

        self.autofootnote_start = 1
        """Initial auto-numbered footnote number."""

        self.symbol_footnote_start = 0
        """Initial symbol footnote symbol index."""

        self.id_start = 1
        """Initial ID number."""

        self.parse_messages = []
        """System messages generated while parsing."""

        self.transform_messages = []
        """System messages generated while applying transforms."""

        import docutils.transforms
        self.transformer = docutils.transforms.Transformer(self)
        """Storage for transforms to be applied to this document."""

        self.decoration = None
        """Document's `decoration` node."""

        self.document = self

    def __getstate__(self):
        """
        Return dict with unpicklable references removed.
        """
        state = self.__dict__.copy()
        state['reporter'] = None
        state['transformer'] = None
        return state

    def asdom(self, dom=None):
        """Return a DOM representation of this document."""
        if dom is None:
            import xml.dom.minidom as dom
        domroot = dom.Document()
        domroot.appendChild(self._dom_node(domroot))
        return domroot

    def set_id(self, node, msgnode=None):
        for id in node['ids']:
            if self.ids.has_key(id) and self.ids[id] is not node:
                msg = self.reporter.severe('Duplicate ID: "%s".' % id)
                if msgnode != None:
                    msgnode += msg
        if not node['ids']:
            for name in node['names']:
                id = self.settings.id_prefix + make_id(name)
                if id and not self.ids.has_key(id):
                    break
            else:
                id = ''
                while not id or self.ids.has_key(id):
                    id = (self.settings.id_prefix +
                          self.settings.auto_id_prefix + str(self.id_start))
                    self.id_start += 1
            node['ids'].append(id)
        self.ids[id] = node
        return id

    def set_name_id_map(self, node, id, msgnode=None, explicit=None):
        """
        `self.nameids` maps names to IDs, while `self.nametypes` maps names to
        booleans representing hyperlink type (True==explicit,
        False==implicit).  This method updates the mappings.

        The following state transition table shows how `self.nameids` ("ids")
        and `self.nametypes` ("types") change with new input (a call to this
        method), and what actions are performed ("implicit"-type system
        messages are INFO/1, and "explicit"-type system messages are ERROR/3):

        ====  =====  ========  ========  =======  ====  =====  =====
         Old State    Input          Action        New State   Notes
        -----------  --------  -----------------  -----------  -----
        ids   types  new type  sys.msg.  dupname  ids   types
        ====  =====  ========  ========  =======  ====  =====  =====
        -     -      explicit  -         -        new   True
        -     -      implicit  -         -        new   False
        None  False  explicit  -         -        new   True
        old   False  explicit  implicit  old      new   True
        None  True   explicit  explicit  new      None  True
        old   True   explicit  explicit  new,old  None  True   [#]_
        None  False  implicit  implicit  new      None  False
        old   False  implicit  implicit  new,old  None  False
        None  True   implicit  implicit  new      None  True
        old   True   implicit  implicit  new      old   True
        ====  =====  ========  ========  =======  ====  =====  =====

        .. [#] Do not clear the name-to-id map or invalidate the old target if
           both old and new targets are external and refer to identical URIs.
           The new target is invalidated regardless.
        """
        for name in node['names']:
            if self.nameids.has_key(name):
                self.set_duplicate_name_id(node, id, name, msgnode, explicit)
            else:
                self.nameids[name] = id
                self.nametypes[name] = explicit

    def set_duplicate_name_id(self, node, id, name, msgnode, explicit):
        old_id = self.nameids[name]
        old_explicit = self.nametypes[name]
        self.nametypes[name] = old_explicit or explicit
        if explicit:
            if old_explicit:
                level = 2
                if old_id is not None:
                    old_node = self.ids[old_id]
                    if node.has_key('refuri'):
                        refuri = node['refuri']
                        if old_node['names'] \
                               and old_node.has_key('refuri') \
                               and old_node['refuri'] == refuri:
                            level = 1   # just inform if refuri's identical
                    if level > 1:
                        dupname(old_node, name)
                        self.nameids[name] = None
                msg = self.reporter.system_message(
                    level, 'Duplicate explicit target name: "%s".' % name,
                    backrefs=[id], base_node=node)
                if msgnode != None:
                    msgnode += msg
                dupname(node, name)
            else:
                self.nameids[name] = id
                if old_id is not None:
                    old_node = self.ids[old_id]
                    dupname(old_node, name)
        else:
            if old_id is not None and not old_explicit:
                self.nameids[name] = None
                old_node = self.ids[old_id]
                dupname(old_node, name)
            dupname(node, name)
        if not explicit or (not old_explicit and old_id is not None):
            msg = self.reporter.info(
                'Duplicate implicit target name: "%s".' % name,
                backrefs=[id], base_node=node)
            if msgnode != None:
                msgnode += msg

    def has_name(self, name):
        return self.nameids.has_key(name)

    # "note" here is an imperative verb: "take note of".
    def note_implicit_target(self, target, msgnode=None):
        id = self.set_id(target, msgnode)
        self.set_name_id_map(target, id, msgnode, explicit=None)

    def note_explicit_target(self, target, msgnode=None):
        id = self.set_id(target, msgnode)
        self.set_name_id_map(target, id, msgnode, explicit=1)

    def note_refname(self, node):
        self.refnames.setdefault(node['refname'], []).append(node)

    def note_refid(self, node):
        self.refids.setdefault(node['refid'], []).append(node)

    def note_indirect_target(self, target):
        self.indirect_targets.append(target)
        if target['names']:
            self.note_refname(target)

    def note_anonymous_target(self, target):
        self.set_id(target)

    def note_autofootnote(self, footnote):
        self.set_id(footnote)
        self.autofootnotes.append(footnote)

    def note_autofootnote_ref(self, ref):
        self.set_id(ref)
        self.autofootnote_refs.append(ref)

    def note_symbol_footnote(self, footnote):
        self.set_id(footnote)
        self.symbol_footnotes.append(footnote)

    def note_symbol_footnote_ref(self, ref):
        self.set_id(ref)
        self.symbol_footnote_refs.append(ref)

    def note_footnote(self, footnote):
        self.set_id(footnote)
        self.footnotes.append(footnote)

    def note_footnote_ref(self, ref):
        self.set_id(ref)
        self.footnote_refs.setdefault(ref['refname'], []).append(ref)
        self.note_refname(ref)

    def note_citation(self, citation):
        self.citations.append(citation)

    def note_citation_ref(self, ref):
        self.set_id(ref)
        self.citation_refs.setdefault(ref['refname'], []).append(ref)
        self.note_refname(ref)

    def note_substitution_def(self, subdef, def_name, msgnode=None):
        name = whitespace_normalize_name(def_name)
        if self.substitution_defs.has_key(name):
            msg = self.reporter.error(
                  'Duplicate substitution definition name: "%s".' % name,
                  base_node=subdef)
            if msgnode != None:
                msgnode += msg
            oldnode = self.substitution_defs[name]
            dupname(oldnode, name)
        # keep only the last definition:
        self.substitution_defs[name] = subdef
        # case-insensitive mapping:
        self.substitution_names[fully_normalize_name(name)] = name

    def note_substitution_ref(self, subref, refname):
        subref['refname'] = whitespace_normalize_name(refname)

    def note_pending(self, pending, priority=None):
        self.transformer.add_pending(pending, priority)

    def note_parse_message(self, message):
        self.parse_messages.append(message)

    def note_transform_message(self, message):
        self.transform_messages.append(message)

    def note_source(self, source, offset):
        self.current_source = source
        if offset is None:
            self.current_line = offset
        else:
            self.current_line = offset + 1

    def copy(self):
        return self.__class__(self.settings, self.reporter,
                              **self.attributes)

    def get_decoration(self):
        if not self.decoration:
            self.decoration = decoration()
            index = self.first_child_not_matching_class(Titular)
            if index is None:
                self.append(self.decoration)
            else:
                self.insert(index, self.decoration)
        return self.decoration


# ================
#  Title Elements
# ================

class title(Titular, PreBibliographic, TextElement): pass
class subtitle(Titular, PreBibliographic, TextElement): pass
class rubric(Titular, TextElement): pass


# ========================
#  Bibliographic Elements
# ========================

class docinfo(Bibliographic, Element): pass
class author(Bibliographic, TextElement): pass
class authors(Bibliographic, Element): pass
class organization(Bibliographic, TextElement): pass
class address(Bibliographic, FixedTextElement): pass
class contact(Bibliographic, TextElement): pass
class version(Bibliographic, TextElement): pass
class revision(Bibliographic, TextElement): pass
class status(Bibliographic, TextElement): pass
class date(Bibliographic, TextElement): pass
class copyright(Bibliographic, TextElement): pass


# =====================
#  Decorative Elements
# =====================

class decoration(Decorative, Element):

    def get_header(self):
        if not len(self.children) or not isinstance(self.children[0], header):
            self.insert(0, header())
        return self.children[0]

    def get_footer(self):
        if not len(self.children) or not isinstance(self.children[-1], footer):
            self.append(footer())
        return self.children[-1]


class header(Decorative, Element): pass
class footer(Decorative, Element): pass


# =====================
#  Structural Elements
# =====================

class section(Structural, Element): pass


class topic(Structural, Element):

    """
    Topics are terminal, "leaf" mini-sections, like block quotes with titles,
    or textual figures.  A topic is just like a section, except that it has no
    subsections, and it doesn't have to conform to section placement rules.

    Topics are allowed wherever body elements (list, table, etc.) are allowed,
    but only at the top level of a section or document.  Topics cannot nest
    inside topics, sidebars, or body elements; you can't have a topic inside a
    table, list, block quote, etc.
    """


class sidebar(Structural, Element):

    """
    Sidebars are like miniature, parallel documents that occur inside other
    documents, providing related or reference material.  A sidebar is
    typically offset by a border and "floats" to the side of the page; the
    document's main text may flow around it.  Sidebars can also be likened to
    super-footnotes; their content is outside of the flow of the document's
    main text.

    Sidebars are allowed wherever body elements (list, table, etc.) are
    allowed, but only at the top level of a section or document.  Sidebars
    cannot nest inside sidebars, topics, or body elements; you can't have a
    sidebar inside a table, list, block quote, etc.
    """


class transition(Structural, Element): pass


# ===============
#  Body Elements
# ===============

class paragraph(General, TextElement): pass
class compound(General, Element): pass
class container(General, Element): pass
class bullet_list(Sequential, Element): pass
class enumerated_list(Sequential, Element): pass
class list_item(Part, Element): pass
class definition_list(Sequential, Element): pass
class definition_list_item(Part, Element): pass
class term(Part, TextElement): pass
class classifier(Part, TextElement): pass
class definition(Part, Element): pass
class field_list(Sequential, Element): pass
class field(Part, Element): pass
class field_name(Part, TextElement): pass
class field_body(Part, Element): pass


class option(Part, Element):

    child_text_separator = ''


class option_argument(Part, TextElement):

    def astext(self):
        return self.get('delimiter', ' ') + TextElement.astext(self)


class option_group(Part, Element):

    child_text_separator = ', '


class option_list(Sequential, Element): pass


class option_list_item(Part, Element):

    child_text_separator = '  '


class option_string(Part, TextElement): pass
class description(Part, Element): pass
class literal_block(General, FixedTextElement): pass
class doctest_block(General, FixedTextElement): pass
class line_block(General, Element): pass


class line(Part, TextElement):

    indent = None


class block_quote(General, Element): pass
class attribution(Part, TextElement): pass
class attention(Admonition, Element): pass
class caution(Admonition, Element): pass
class danger(Admonition, Element): pass
class error(Admonition, Element): pass
class important(Admonition, Element): pass
class note(Admonition, Element): pass
class tip(Admonition, Element): pass
class hint(Admonition, Element): pass
class warning(Admonition, Element): pass
class admonition(Admonition, Element): pass
class comment(Special, Invisible, FixedTextElement): pass
class substitution_definition(Special, Invisible, TextElement): pass
class target(Special, Invisible, Inline, TextElement, Targetable): pass
class footnote(General, BackLinkable, Element, Labeled, Targetable): pass
class citation(General, BackLinkable, Element, Labeled, Targetable): pass
class label(Part, TextElement): pass
class figure(General, Element): pass
class caption(Part, TextElement): pass
class legend(Part, Element): pass
class table(General, Element): pass
class tgroup(Part, Element): pass
class colspec(Part, Element): pass
class thead(Part, Element): pass
class tbody(Part, Element): pass
class row(Part, Element): pass
class entry(Part, Element): pass


class system_message(Special, BackLinkable, PreBibliographic, Element):

    """
    System message element.

    Do not instantiate this class directly; use
    ``document.reporter.info/warning/error/severe()`` instead.
    """

    def __init__(self, message=None, *children, **attributes):
        if message:
            p = paragraph('', message)
            children = (p,) + children
        try:
            Element.__init__(self, '', *children, **attributes)
        except:
            print 'system_message: children=%r' % (children,)
            raise

    def astext(self):
        line = self.get('line', '')
        return u'%s:%s: (%s/%s) %s' % (self['source'], line, self['type'],
                                       self['level'], Element.astext(self))


class pending(Special, Invisible, Element):

    """
    The "pending" element is used to encapsulate a pending operation: the
    operation (transform), the point at which to apply it, and any data it
    requires.  Only the pending operation's location within the document is
    stored in the public document tree (by the "pending" object itself); the
    operation and its data are stored in the "pending" object's internal
    instance attributes.

    For example, say you want a table of contents in your reStructuredText
    document.  The easiest way to specify where to put it is from within the
    document, with a directive::

        .. contents::

    But the "contents" directive can't do its work until the entire document
    has been parsed and possibly transformed to some extent.  So the directive
    code leaves a placeholder behind that will trigger the second phase of its
    processing, something like this::

        <pending ...public attributes...> + internal attributes

    Use `document.note_pending()` so that the
    `docutils.transforms.Transformer` stage of processing can run all pending
    transforms.
    """

    def __init__(self, transform, details=None,
                 rawsource='', *children, **attributes):
        Element.__init__(self, rawsource, *children, **attributes)

        self.transform = transform
        """The `docutils.transforms.Transform` class implementing the pending
        operation."""

        self.details = details or {}
        """Detail data (dictionary) required by the pending operation."""

    def pformat(self, indent='    ', level=0):
        internals = [
              '.. internal attributes:',
              '     .transform: %s.%s' % (self.transform.__module__,
                                          self.transform.__name__),
              '     .details:']
        details = self.details.items()
        details.sort()
        for key, value in details:
            if isinstance(value, Node):
                internals.append('%7s%s:' % ('', key))
                internals.extend(['%9s%s' % ('', line)
                                  for line in value.pformat().splitlines()])
            elif value and isinstance(value, ListType) \
                  and isinstance(value[0], Node):
                internals.append('%7s%s:' % ('', key))
                for v in value:
                    internals.extend(['%9s%s' % ('', line)
                                      for line in v.pformat().splitlines()])
            else:
                internals.append('%7s%s: %r' % ('', key, value))
        return (Element.pformat(self, indent, level)
                + ''.join([('    %s%s\n' % (indent * level, line))
                           for line in internals]))

    def copy(self):
        return self.__class__(self.transform, self.details, self.rawsource,
                              **self.attributes)


class raw(Special, Inline, PreBibliographic, FixedTextElement):

    """
    Raw data that is to be passed untouched to the Writer.
    """

    pass


# =================
#  Inline Elements
# =================

class emphasis(Inline, TextElement): pass
class strong(Inline, TextElement): pass
class literal(Inline, TextElement): pass
class reference(General, Inline, Referential, TextElement): pass
class footnote_reference(Inline, Referential, TextElement): pass
class citation_reference(Inline, Referential, TextElement): pass
class substitution_reference(Inline, TextElement): pass
class title_reference(Inline, TextElement): pass
class abbreviation(Inline, TextElement): pass
class acronym(Inline, TextElement): pass
class superscript(Inline, TextElement): pass
class subscript(Inline, TextElement): pass


class image(General, Inline, Element):

    def astext(self):
        return self.get('alt', '')


class inline(Inline, TextElement): pass
class problematic(Inline, TextElement): pass
class generated(Inline, TextElement): pass


# ========================================
#  Auxiliary Classes, Functions, and Data
# ========================================

node_class_names = """
    Text
    abbreviation acronym address admonition attention attribution author
        authors
    block_quote bullet_list
    caption caution citation citation_reference classifier colspec comment
        compound contact container copyright
    danger date decoration definition definition_list definition_list_item
        description docinfo doctest_block document
    emphasis entry enumerated_list error
    field field_body field_list field_name figure footer
        footnote footnote_reference
    generated
    header hint
    image important inline
    label legend line line_block list_item literal literal_block
    note
    option option_argument option_group option_list option_list_item
        option_string organization
    paragraph pending problematic
    raw reference revision row rubric
    section sidebar status strong subscript substitution_definition
        substitution_reference subtitle superscript system_message
    table target tbody term tgroup thead tip title title_reference topic
        transition
    version
    warning""".split()
"""A list of names of all concrete Node subclasses."""


class NodeVisitor:

    """
    "Visitor" pattern [GoF95]_ abstract superclass implementation for
    document tree traversals.

    Each node class has corresponding methods, doing nothing by
    default; override individual methods for specific and useful
    behaviour.  The `dispatch_visit()` method is called by
    `Node.walk()` upon entering a node.  `Node.walkabout()` also calls
    the `dispatch_departure()` method before exiting a node.

    The dispatch methods call "``visit_`` + node class name" or
    "``depart_`` + node class name", resp.

    This is a base class for visitors whose ``visit_...`` & ``depart_...``
    methods should be implemented for *all* node types encountered (such as
    for `docutils.writers.Writer` subclasses).  Unimplemented methods will
    raise exceptions.

    For sparse traversals, where only certain node types are of interest,
    subclass `SparseNodeVisitor` instead.  When (mostly or entirely) uniform
    processing is desired, subclass `GenericNodeVisitor`.

    .. [GoF95] Gamma, Helm, Johnson, Vlissides. *Design Patterns: Elements of
       Reusable Object-Oriented Software*. Addison-Wesley, Reading, MA, USA,
       1995.
    """

    optional = ()
    """
    Tuple containing node class names (as strings).

    No exception will be raised if writers do not implement visit
    or departure functions for these node classes.

    Used to ensure transitional compatibility with existing 3rd-party writers.
    """

    def __init__(self, document):
        self.document = document

    def dispatch_visit(self, node):
        """
        Call self."``visit_`` + node class name" with `node` as
        parameter.  If the ``visit_...`` method does not exist, call
        self.unknown_visit.
        """
        node_name = node.__class__.__name__
        method = getattr(self, 'visit_' + node_name, self.unknown_visit)
        self.document.reporter.debug(
            'docutils.nodes.NodeVisitor.dispatch_visit calling %s for %s'
            % (method.__name__, node_name))
        return method(node)

    def dispatch_departure(self, node):
        """
        Call self."``depart_`` + node class name" with `node` as
        parameter.  If the ``depart_...`` method does not exist, call
        self.unknown_departure.
        """
        node_name = node.__class__.__name__
        method = getattr(self, 'depart_' + node_name, self.unknown_departure)
        self.document.reporter.debug(
            'docutils.nodes.NodeVisitor.dispatch_departure calling %s for %s'
            % (method.__name__, node_name))
        return method(node)

    def unknown_visit(self, node):
        """
        Called when entering unknown `Node` types.

        Raise an exception unless overridden.
        """
        if  (node.document.settings.strict_visitor
             or node.__class__.__name__ not in self.optional):
            raise NotImplementedError(
                '%s visiting unknown node type: %s'
                % (self.__class__, node.__class__.__name__))

    def unknown_departure(self, node):
        """
        Called before exiting unknown `Node` types.

        Raise exception unless overridden.
        """
        if  (node.document.settings.strict_visitor
             or node.__class__.__name__ not in self.optional):
            raise NotImplementedError(
                '%s departing unknown node type: %s'
                % (self.__class__, node.__class__.__name__))


class SparseNodeVisitor(NodeVisitor):

    """
    Base class for sparse traversals, where only certain node types are of
    interest.  When ``visit_...`` & ``depart_...`` methods should be
    implemented for *all* node types (such as for `docutils.writers.Writer`
    subclasses), subclass `NodeVisitor` instead.
    """


class GenericNodeVisitor(NodeVisitor):

    """
    Generic "Visitor" abstract superclass, for simple traversals.

    Unless overridden, each ``visit_...`` method calls `default_visit()`, and
    each ``depart_...`` method (when using `Node.walkabout()`) calls
    `default_departure()`. `default_visit()` (and `default_departure()`) must
    be overridden in subclasses.

    Define fully generic visitors by overriding `default_visit()` (and
    `default_departure()`) only. Define semi-generic visitors by overriding
    individual ``visit_...()`` (and ``depart_...()``) methods also.

    `NodeVisitor.unknown_visit()` (`NodeVisitor.unknown_departure()`) should
    be overridden for default behavior.
    """

    def default_visit(self, node):
        """Override for generic, uniform traversals."""
        raise NotImplementedError

    def default_departure(self, node):
        """Override for generic, uniform traversals."""
        raise NotImplementedError

def _call_default_visit(self, node):
    self.default_visit(node)

def _call_default_departure(self, node):
    self.default_departure(node)

def _nop(self, node):
    pass

def _add_node_class_names(names):
    """Save typing with dynamic assignments:"""
    for _name in names:
        setattr(GenericNodeVisitor, "visit_" + _name, _call_default_visit)
        setattr(GenericNodeVisitor, "depart_" + _name, _call_default_departure)
        setattr(SparseNodeVisitor, 'visit_' + _name, _nop)
        setattr(SparseNodeVisitor, 'depart_' + _name, _nop)

_add_node_class_names(node_class_names)


class TreeCopyVisitor(GenericNodeVisitor):

    """
    Make a complete copy of a tree or branch, including element attributes.
    """

    def __init__(self, document):
        GenericNodeVisitor.__init__(self, document)
        self.parent_stack = []
        self.parent = []

    def get_tree_copy(self):
        return self.parent[0]

    def default_visit(self, node):
        """Copy the current node, and make it the new acting parent."""
        newnode = node.copy()
        self.parent.append(newnode)
        self.parent_stack.append(self.parent)
        self.parent = newnode

    def default_departure(self, node):
        """Restore the previous acting parent."""
        self.parent = self.parent_stack.pop()


class TreePruningException(Exception):

    """
    Base class for `NodeVisitor`-related tree pruning exceptions.

    Raise subclasses from within ``visit_...`` or ``depart_...`` methods
    called from `Node.walk()` and `Node.walkabout()` tree traversals to prune
    the tree traversed.
    """

    pass


class SkipChildren(TreePruningException):

    """
    Do not visit any children of the current node.  The current node's
    siblings and ``depart_...`` method are not affected.
    """

    pass


class SkipSiblings(TreePruningException):

    """
    Do not visit any more siblings (to the right) of the current node.  The
    current node's children and its ``depart_...`` method are not affected.
    """

    pass


class SkipNode(TreePruningException):

    """
    Do not visit the current node's children, and do not call the current
    node's ``depart_...`` method.
    """

    pass


class SkipDeparture(TreePruningException):

    """
    Do not call the current node's ``depart_...`` method.  The current node's
    children and siblings are not affected.
    """

    pass


class NodeFound(TreePruningException):

    """
    Raise to indicate that the target of a search has been found.  This
    exception must be caught by the client; it is not caught by the traversal
    code.
    """

    pass


def make_id(string):
    """
    Convert `string` into an identifier and return it.

    Docutils identifiers will conform to the regular expression
    ``[a-z](-?[a-z0-9]+)*``.  For CSS compatibility, identifiers (the "class"
    and "id" attributes) should have no underscores, colons, or periods.
    Hyphens may be used.

    - The `HTML 4.01 spec`_ defines identifiers based on SGML tokens:

          ID and NAME tokens must begin with a letter ([A-Za-z]) and may be
          followed by any number of letters, digits ([0-9]), hyphens ("-"),
          underscores ("_"), colons (":"), and periods (".").

    - However the `CSS1 spec`_ defines identifiers based on the "name" token,
      a tighter interpretation ("flex" tokenizer notation; "latin1" and
      "escape" 8-bit characters have been replaced with entities)::

          unicode     \\[0-9a-f]{1,4}
          latin1      [&iexcl;-&yuml;]
          escape      {unicode}|\\[ -~&iexcl;-&yuml;]
          nmchar      [-a-z0-9]|{latin1}|{escape}
          name        {nmchar}+

    The CSS1 "nmchar" rule does not include underscores ("_"), colons (":"),
    or periods ("."), therefore "class" and "id" attributes should not contain
    these characters. They should be replaced with hyphens ("-"). Combined
    with HTML's requirements (the first character must be a letter; no
    "unicode", "latin1", or "escape" characters), this results in the
    ``[a-z](-?[a-z0-9]+)*`` pattern.

    .. _HTML 4.01 spec: http://www.w3.org/TR/html401
    .. _CSS1 spec: http://www.w3.org/TR/REC-CSS1
    """
    id = _non_id_chars.sub('-', ' '.join(string.lower().split()))
    id = _non_id_at_ends.sub('', id)
    return str(id)

_non_id_chars = re.compile('[^a-z0-9]+')
_non_id_at_ends = re.compile('^[-0-9]+|-+$')

def dupname(node, name):
    node['dupnames'].append(name)
    node['names'].remove(name)
    # Assume that this method is referenced, even though it isn't; we
    # don't want to throw unnecessary system_messages.
    node.referenced = 1

def fully_normalize_name(name):
    """Return a case- and whitespace-normalized name."""
    return ' '.join(name.lower().split())

def whitespace_normalize_name(name):
    """Return a whitespace-normalized name."""
    return ' '.join(name.split())

def serial_escape(value):
    """Escape string values that are elements of a list, for serialization."""
    return value.replace('\\', r'\\').replace(' ', r'\ ')

# 
#
# Local Variables:
# indent-tabs-mode: nil
# sentence-end-double-space: t
# fill-column: 78
# End:
