# epydoc -- API Documentation Classes
#
# Copyright (C) 2005 Edward Loper
# Author: Edward Loper <edloper@loper.org>
# URL: <http://epydoc.sf.net>
#
# $Id: apidoc.py 1203 2006-04-09 21:17:16Z edloper $

"""
Classes for encoding API documentation about Python programs.
These classes are used as a common representation for combining
information derived from introspection and from parsing.

The API documentation for a Python program is encoded using a graph of
L{APIDoc} objects, each of which encodes information about a single
Python variable or value.  C{APIDoc} has two direct subclasses:
L{VariableDoc}, for documenting variables; and L{ValueDoc}, for
documenting values.  The C{ValueDoc} class is subclassed further, to
define the different pieces of information that should be recorded
about each value type:

G{classtree: APIDoc}

The distinction between variables and values is intentionally made
explicit.  This allows us to distinguish information about a variable
itself (such as whether it should be considered 'public' in its
containing namespace) from information about the value it contains
(such as what type the value has).  This distinction is also important
because several variables can contain the same value: each variable
should be described by a separate C{VariableDoc}; but we only need one
C{ValueDoc}, since they share a single value.
"""
__docformat__ = 'epytext en'

######################################################################
## Imports
######################################################################

import types, re, os.path
from epydoc import log
import epydoc
import __builtin__
from epydoc.compat import * # Backwards compatibility
from epydoc.util import decode_with_backslashreplace, py_src_filename

######################################################################
# Dotted Names
######################################################################

class DottedName:
    """
    A sequence of identifiers, separated by periods, used to name a
    Python variable, value, or argument.  The identifiers that make up
    a dotted name can be accessed using the indexing operator:

        >>> name = DottedName('epydoc', 'api_doc', 'DottedName')
        >>> print name
        epydoc.apidoc.DottedName
        >>> name[1]
        'api_doc'
    """
    UNREACHABLE = "??"
    _IDENTIFIER_RE = re.compile("""(?x)
        (%s |             # UNREACHABLE marker, or..
         (script-)?       #   Prefix: script (not a module)
         [a-zA-Z_]\w*     #   Identifier
         '?)              #   Suffix: submodule that is shadowed by a var
        (-\d+)?           # Suffix: unreachable vals with the same name
        $"""
        % re.escape(UNREACHABLE))

    class InvalidDottedName(ValueError):
        """
        An exception raised by the DottedName constructor when one of
        its arguments is not a valid dotted name.
        """
    
    def __init__(self, *pieces):
        """
        Construct a new dotted name from the given sequence of pieces,
        each of which can be either a C{string} or a C{DottedName}.
        Each piece is divided into a sequence of identifiers, and
        these sequences are combined together (in order) to form the
        identifier sequence for the new C{DottedName}.  If a piece
        contains a string, then it is divided into substrings by
        splitting on periods, and each substring is checked to see if
        it is a valid identifier.
        """
        if len(pieces) == 0:
            raise DottedName.InvalidDottedName('Empty DottedName')
        self._identifiers = []
        for piece in pieces:
            if isinstance(piece, DottedName):
                self._identifiers += piece._identifiers
            elif isinstance(piece, basestring):
                for subpiece in piece.split('.'):
                    if not self._IDENTIFIER_RE.match(subpiece):
                        raise DottedName.InvalidDottedName(
                            'Bad identifier %r' % (piece,))
                    self._identifiers.append(subpiece)
            else:
                raise DottedName.InvalidDottedName(
                    'Bad identifier %r' % (piece,))
        self._identifiers = tuple(self._identifiers)

    def __repr__(self):
        idents = [`ident` for ident in self._identifiers]
        return 'DottedName(' + ', '.join(idents) + ')'

    def __str__(self):
        """
        Return the dotted name as a string formed by joining its
        identifiers with periods:

            >>> print DottedName('epydoc', 'api_doc', DottedName')
            epydoc.apidoc.DottedName
        """
        return '.'.join(self._identifiers)

    def __add__(self, other):
        """
        Return a new C{DottedName} whose identifier sequence is formed
        by adding C{other}'s identifier sequence to C{self}'s.
        """
        if isinstance(other, (basestring, DottedName)):
            return DottedName(self, other)
        else:
            return DottedName(self, *other)

    def __radd__(self, other):
        """
        Return a new C{DottedName} whose identifier sequence is formed
        by adding C{self}'s identifier sequence to C{other}'s.
        """
        if isinstance(other, (basestring, DottedName)):
            return DottedName(other, self)
        else:
            return DottedName(*(list(other)+[self]))

    def __getitem__(self, i):
        """
        Return the C{i}th identifier in this C{DottedName}.  If C{i} is
        a non-empty slice, then return a C{DottedName} built from the
        identifiers selected by the slice.  If C{i} is an empty slice,
        return an empty list (since empty C{DottedName}s are not valid).
        """
        if isinstance(i, types.SliceType):
            pieces = self._identifiers[i.start:i.stop]
            if pieces: return DottedName(*pieces)
            else: return []
        else:
            return self._identifiers[i]

    def __hash__(self):
        return hash(self._identifiers)

    def __cmp__(self, other):
        """
        Compare this dotted name to C{other}.  Two dotted names are
        considered equal if their identifier subsequences are equal.
        Ordering between dotted names is lexicographic, in order of
        identifier from left to right.
        """
        if not isinstance(other, DottedName):
            return -1
        return cmp(self._identifiers, other._identifiers)

    def __len__(self):
        """
        Return the number of identifiers in this dotted name.
        """
        return len(self._identifiers)

    def container(self):
        """
        Return the DottedName formed by removing the last identifier
        from this dotted name's identifier sequence.  If this dotted
        name only has one name in its identifier sequence, return
        C{None} instead.
        """
        if len(self._identifiers) == 1:
            return None
        else:
            return DottedName(*self._identifiers[:-1])

    def dominates(self, name, strict=False):
        """
        Return true if this dotted name is equal to a prefix of
        C{name}.  If C{strict} is true, then also require that
        C{self!=name}.

            >>> DottedName('a.b').dominates(DottedName('a.b.c.d'))
            True
        """
        if strict and len(self._identifiers)==len(name._identifiers):
            return False
        return self._identifiers == name._identifiers[:len(self)]

    def contextualize(self, context):
        """
        If C{self} and C{context} share a common ancestor, then return
        a name for C{self}, relative to that ancestor.  If they do not
        share a common ancestor (or if C{context} is C{UNKNOWN}), then
        simply return C{self}.

        This is used to generate shorter versions of dotted names in
        cases where users can infer the intended target from the
        context.
        
        @type context: L{DottedName}
        @rtype: L{DottedName}
        """
        if context is UNKNOWN or not context or len(self) <= 1:
            return self
        if self[0] == context[0]:
            return self[1:].contextualize(context[1:])
        else:
            return self

######################################################################
# UNKNOWN Value
######################################################################

class _Sentinel:
    """
    A unique value that won't compare equal to any other value.  This
    class is used to create L{UNKNOWN}.
    """
    def __init__(self, name):
        self.name = name
    def __repr__(self):
        return '<%s>' % self.name
    def __nonzero__(self):
        raise ValueError('Sentinel value <%s> can not be used as a boolean' %
                         self.name)

UNKNOWN = _Sentinel('UNKNOWN')
"""A special value used to indicate that a given piece of
information about an object is unknown.  This is used as the
default value for all instance variables."""

######################################################################
# API Documentation Objects: Abstract Base Classes
######################################################################

class APIDoc(object):
    """
    API documentation information for a single element of a Python
    program.  C{APIDoc} itself is an abstract base class; subclasses
    are used to specify what information should be recorded about each
    type of program element.  In particular, C{APIDoc} has two direct
    subclasses, C{VariableDoc} for documenting variables and
    C{ValueDoc} for documenting values; and the C{ValueDoc} class is
    subclassed further for different value types.

    Each C{APIDoc} subclass specifies the set of attributes that
    should be used to record information about the corresponding
    program element type.  The default value for each attribute is
    stored in the class; these default values can then be overridden
    with instance variables.  Most attributes use the special value
    L{UNKNOWN} as their default value, to indicate that the correct
    value for that attribute has not yet been determined.  This makes
    it easier to merge two C{APIDoc} objects that are documenting the
    same element (in particular, to merge information about an element
    that was derived from parsing with information that was derived
    from introspection).

    For all attributes with boolean values, use only the constants
    C{True} and C{False} to designate true and false.  In particular,
    do I{not} use other values that evaluate as true or false, such as
    C{2} or C{()}.  This restriction makes it easier to handle
    C{UNKNOWN} values.  For example, to test if a boolean attribute is
    C{True} or C{UNKNOWN}, use 'C{attrib in (True, UNKNOWN)}' or
    'C{attrib is not False}'.

    Two C{APIDoc} objects describing the same object can be X{merged},
    using the method L{merge_and_overwrite(other)}.  After two
    C{APIDoc}s are merged, any changes to one will be reflected in the
    other.  This is accomplished by setting the two C{APIDoc} objects
    to use a shared instance dictionary.  See the documentation for
    L{merge_and_overwrite} for more information, and some important
    caveats about hashing.
    """
    #{ Docstrings
    docstring = UNKNOWN
    """@ivar: The documented item's docstring.
       @type: C{string} or C{None}"""
    
    docstring_lineno = UNKNOWN
    """@ivar: The line number on which the documented item's docstring
       begins.
       @type: C{int}"""
    #} end of "docstrings" group

    #{ Information Extracted from Docstrings
    descr = UNKNOWN
    """@ivar: A description of the documented item, extracted from its
       docstring.
       @type: L{ParsedDocstring<epydoc.markup.ParsedDocstring>}"""
    
    summary = UNKNOWN
    """@ivar: A summary description of the documented item, extracted from
       its docstring.
       @type: L{ParsedDocstring<epydoc.markup.ParsedDocstring>}"""
    
    metadata = UNKNOWN
    """@ivar: Metadata about the documented item, extracted from fields in
       its docstring.  I{Currently} this is encoded as a list of tuples
       C{(field, arg, descr)}.  But that may change.
       @type: C{(str, str, L{ParsedDocstring<markup.ParsedDocstring>})}"""
    
    extra_docstring_fields = UNKNOWN
    """@ivar: A list of new docstring fields tags that are defined by the
       documented item's docstring.  These new field tags can be used by
       this item or by any item it contains.
       @type: L{DocstringField <epydoc.docstringparser.DocstringField>}"""
    #} end of "information extracted from docstrings" group

    #{ Source Information
    docs_extracted_by = UNKNOWN # 'parser' or 'introspecter' or 'both'
    """@ivar: Information about where the information contained by this
       C{APIDoc} came from.  Can be one of C{'parser'},
       C{'introspector'}, or C{'both'}.
       @type: C{str}"""
    #} end of "source information" group

    def __init__(self, **kwargs):
        """
        Construct a new C{APIDoc} object.  Keyword arguments may be
        used to initialize the new C{APIDoc}'s attributes.
        
        @raise TypeError: If a keyword argument is specified that does
            not correspond to a valid attribute for this (sub)class of
            C{APIDoc}.
        """
        if epydoc.DEBUG:
            for key in kwargs:
                if not hasattr(self.__class__, key):
                    raise TypeError('%s got unexpected arg %r' %
                                    (self.__class__.__name__, key))
        self.__dict__.update(kwargs)

    def _debug_setattr(self, attr, val):
        """
        Modify an C{APIDoc}'s attribute.  This is used when
        L{epydoc.DEBUG} is true, to make sure we don't accidentally
        set any inappropriate attributes on C{APIDoc} objects.

        @raise AttributeError: If C{attr} is not a valid attribute for
            this (sub)class of C{APIDoc}.  (C{attr} is considered a
            valid attribute iff C{self.__class__} defines an attribute
            with that name.)
        """
        # Don't intercept special assignments like __class__, or
        # assignments to private variables.
        if attr.startswith('_'):
            return object.__setattr__(self, attr, val)
        if not hasattr(self, attr):
            raise AttributeError('%s does not define attribute %r' %
                            (self.__class__.__name__, attr))
        self.__dict__[attr] = val

    if epydoc.DEBUG:
        __setattr__ = _debug_setattr

    def __repr__(self):
       return '<%s>' % self.__class__.__name__
    
    def pp(self, doublespace=0, depth=5, exclude=(), include=()):
        """
        Return a pretty-printed string representation for the
        information contained in this C{APIDoc}.
        """
        return pp_apidoc(self, doublespace, depth, exclude, include)
    __str__ = pp

    def specialize_to(self, cls):
        """
        Change C{self}'s class to C{cls}.  C{cls} must be a subclass
        of C{self}'s current class.  For example, if a generic
        C{ValueDoc} was created for a value, and it is determined that
        the value is a routine, you can update its class with:
        
            >>> valdoc.specialize_to(RoutineDoc)
        """
        if not issubclass(cls, self.__class__):
            raise ValueError('Can not specialize to %r' % cls)
        # Update the class.
        self.__class__ = cls
        # Update the class of any other apidoc's in the mergeset.
        if self.__mergeset is not None:
            for apidoc in self.__mergeset:
                apidoc.__class__ = cls
        # Re-initialize self, in case the subclass constructor does
        # any special processing on its arguments.
        self.__init__(**self.__dict__)

    __has_been_hashed = False
    """True iff L{self.__hash__()} has ever been called."""
    
    def __hash__(self):
        self.__has_been_hashed = True
        return id(self.__dict__)

    def __cmp__(self, other):
        if not isinstance(other, APIDoc): return -1
        if self.__dict__ is other.__dict__: return 0
        name_cmp = cmp(self.canonical_name, other.canonical_name)
        if name_cmp == 0: return -1
        else: return name_cmp
        
    __mergeset = None
    """The set of all C{APIDoc} objects that have been merged with
    this C{APIDoc} (using L{merge_and_overwrite()}).  Each C{APIDoc}
    in this set shares a common instance dictionary (C{__dict__})."""
    
    def merge_and_overwrite(self, other, ignore_hash_conflict=False):
        """
        Combine C{self} and C{other} into a X{merged object}, such
        that any changes made to one will affect the other.  Any
        attributes that C{other} had before merging will be discarded.
        This is accomplished by copying C{self.__dict__} over
        C{other.__dict__} and C{self.__class__} over C{other.__class__}.

        Care must be taken with this method, since it modifies the
        hash value of C{other}.  To help avoid the problems that this
        can cause, C{merge_and_overwrite} will raise an exception if
        C{other} has ever been hashed, unless C{ignore_hash_conflict}
        is True.  Note that adding C{other} to a dictionary, set, or
        similar data structure will implicitly cause it to be hashed.
        If you do set C{ignore_hash_conflict} to True, then any
        existing data structures that rely on C{other}'s hash staying
        constant may become corrupted.

        @return: C{self}
        @raise ValueError: If C{other} has ever been hashed.
        """
        # If we're already merged, then there's nothing to do.
        if (self.__dict__ is other.__dict__ and
            self.__class__ is other.__class__): return self
            
        if other.__has_been_hashed and not ignore_hash_conflict:
            raise ValueError("%r has already been hashed!  Merging it "
                             "would cause its has value to change." % other)

        # If other was itself already merged with anything,
        # then we need to merge those too.
        a,b = (self.__mergeset, other.__mergeset)
        mergeset = (self.__mergeset or [self]) + (other.__mergeset or [other])
        other.__dict__.clear()
        for apidoc in mergeset:
            #if apidoc is self: pass
            apidoc.__class__ = self.__class__
            apidoc.__dict__ = self.__dict__
        self.__mergeset = mergeset
        # Sanity chacks.
        assert self in mergeset and other in mergeset
        for apidoc in mergeset:
            assert apidoc.__dict__ is self.__dict__
        # Return self.
        return self

    def apidoc_links(self, **filters):
        """
        Return a list of all C{APIDoc}s that are directly linked from
        this C{APIDoc} (i.e., are contained or pointed to by one or
        more of this C{APIDoc}'s attributes.)

        Keyword argument C{filters} can be used to selectively exclude
        certain categories of attribute value.  For example, using
        C{includes=False} will exclude variables that were imported
        from other modules; and C{subclasses=False} will exclude
        subclasses.  The filter categories currently supported by
        epydoc are:
          - C{imports}: Imported variables.
          - C{packages}: Containing packages for modules.
          - C{submodules}: Contained submodules for packages.
          - C{bases}: Bases for classes.
          - C{subclasses}: Subclasses for classes.
          - C{variables}: All variables.
          - C{private}: Private variables.
        """
        return []

def reachable_valdocs(root, **filters):
    """
    Return a list of all C{ValueDoc}s that can be reached, directly or
    indirectly from the given root list of C{ValueDoc}s.

    @param filters: A set of filters that can be used to prevent
        C{reachable_valdocs} from following specific link types when
        looking for C{ValueDoc}s that can be reached from the root
        set.  See C{APIDoc.apidoc_links} for a more complete
        description.
    """
    apidoc_queue = list(root)
    val_set = set()
    var_set = set()
    while apidoc_queue:
        api_doc = apidoc_queue.pop()
        if isinstance(api_doc, ValueDoc):
            val_set.add(api_doc)
        else:
            var_set.add(api_doc)
        apidoc_queue.extend([v for v in api_doc.apidoc_links(**filters)
                             if v not in val_set and v not in var_set])
    return val_set

######################################################################
# Variable Documentation Objects
######################################################################

class VariableDoc(APIDoc):
    """
    API documentation information about a single Python variable.

    @note: The only time a C{VariableDoc} will have its own docstring
    is if that variable was created using an assignment statement, and
    that assignment statement had a docstring-comment or was followed
    by a pseudo-docstring.
    """
    #{ Basic Variable Information
    name = UNKNOWN
    """@ivar: The name of this variable in its containing namespace.
       @type: C{str}"""
    
    container = UNKNOWN
    """@ivar: API documentation for the namespace that contains this
       variable.
       @type: L{ValueDoc}"""
    
    value = UNKNOWN
    """@ivar: The API documentation for this variable's value.
       @type: L{ValueDoc}"""
    #}

    #{ Information Extracted from Docstrings
    type_descr = UNKNOWN 
    """@ivar: A description of the variable's expected type, extracted from
       its docstring.
       @type: L{ParsedDocstring<epydoc.markup.ParsedDocstring>}"""
    #} end of "information extracted from docstrings" group
    
    #{ Information about Imported Variables
    imported_from = UNKNOWN
    """@ivar: The fully qualified dotted name of the variable that this
       variable's value was imported from.  This attribute should only
       be defined if C{is_instvar} is true.
       @type: L{DottedName}"""

    is_imported = UNKNOWN
    """@ivar: Was this variable's value imported from another module?
       (Exception: variables that are explicitly included in __all__ have
       C{is_imported} set to C{False}, even if they are in fact
       imported.)
       @type: C{bool}"""
    #} end of "information about imported variables" group

    #{ Information about Variables in Classes
    is_instvar = UNKNOWN
    """@ivar: If true, then this variable is an instance variable; if false,
       then this variable is a class variable.  This attribute should
       only be defined if the containing namespace is a class    
       @type: C{bool}"""
    
    overrides = UNKNOWN # [XXX] rename -- don't use a verb.
    """@ivar: The API documentation for the variable that is overridden by
       this variable.  This attribute should only be defined if the
       containing namespace is a class.
       @type: L{VariableDoc}"""
    #} end of "information about variables in classes" group

    #{ Flags
    is_alias = UNKNOWN
    """@ivar: Is this variable an alias for another variable with the same
       value?  If so, then this variable will be dispreferred when
       assigning canonical names.
       @type: C{bool}"""
    
    is_public = UNKNOWN
    """@ivar: Is this variable part of its container's public API?
       @type: C{bool}"""
    #} end of "flags" group

    def __init__(self, **kwargs):
        APIDoc.__init__(self, **kwargs)
        if self.is_public is UNKNOWN and self.name is not UNKNOWN:
            self.is_public = (not self.name.startswith('_') or
                              self.name.endswith('_'))
        
    def __repr__(self):
        if (self.container is not UNKNOWN and
            self.container.canonical_name is not UNKNOWN):
            return '<%s %s.%s>' % (self.__class__.__name__,
                                   self.container.canonical_name, self.name)
        if self.name is not UNKNOWN:
            return '<%s %s>' % (self.__class__.__name__, self.name)
        else:                     
            return '<%s>' % self.__class__.__name__

    def _get_canonical_name(self):
        if self.container is UNKNOWN:
            raise ValueError, `self`
        if (self.container is UNKNOWN or
            self.container.canonical_name is UNKNOWN):
            return UNKNOWN
        else:
            return self.container.canonical_name + self.name
    canonical_name = property(_get_canonical_name, doc="""
    A read-only property that can be used to get the variable's
    canonical name.  This is formed by taking the varaible's
    container's cannonical name, and adding the variable's name
    to it.""")

    def _get_defining_module(self):
        if self.container is UNKNOWN:
            return UNKNOWN
        return self.container.defining_module
    defining_module = property(_get_defining_module, doc="""
    A read-only property that can be used to get the variable's
    defining module.  This is defined as the defining module
    of the variable's container.""")

    def apidoc_links(self, **filters):
        if self.value in (None, UNKNOWN):
            return []
        else:
            return [self.value]

######################################################################
# Value Documentation Objects
######################################################################

class ValueDoc(APIDoc):
    """
    API documentation information about a single Python value.
    """
    canonical_name = UNKNOWN
    """@ivar: A dotted name that serves as a unique identifier for
       this C{ValueDoc}'s value.  If the value can be reached using a
       single sequence of identifiers (given the appropriate imports),
       then that sequence of identifiers is used as its canonical name.
       If the value can be reached by multiple sequences of identifiers
       (i.e., if it has multiple aliases), then one of those sequences of
       identifiers is used.  If the value cannot be reached by any
       sequence of identifiers (e.g., if it was used as a base class but
       then its variable was deleted), then its canonical name will start
       with C{'??'}.  If necessary, a dash followed by a number will be
       appended to the end of a non-reachable identifier to make its
       canonical name unique.

       When possible, canonical names are chosen when new C{ValueDoc}s
       are created.  However, this is sometimes not possible.  If a
       canonical name can not be chosen when the C{ValueDoc} is created,
       then one will be assigned by L{assign_canonical_names()
       <docbuilder.assign_canonical_names>}.
       
       @type: L{DottedName}"""

    #{ Value Representation
    pyval = UNKNOWN
    """@ivar: A pointer to the actual Python object described by this
       C{ValueDoc}.  This is used to display the value (e.g., when
       describing a variable.)  Use L{pyval_repr()} to generate a
       plaintext string representation of this value.
       @type: Python object"""

    parse_repr = UNKNOWN
    """@ivar: A text representation of this value, extracted from 
       parsing its source code.  This representation may not accurately
       reflect the actual value (e.g., if the value was modified after
       the initial assignment).
       @type: C{unicode}"""
    #} end of "value representation" group

    #{ Context
    defining_module = UNKNOWN
    """@ivar: The documentation for the module that defines this
       value.  This is used, e.g., to lookup the appropriate markup
       language for docstrings.  For a C{ModuleDoc},
       C{defining_module} should be C{self}.
       @type: L{ModuleDoc}"""
    #} end of "context group"

    #{ Information about Imported Variables
    proxy_for = None # [xx] in progress.
    """@ivar: If C{proxy_for} is not None, then this value was
       imported from another file.  C{proxy_for} is the dotted name of
       the variable that this value was imported from.  If that
       variable is documented, then its C{value} may contain more
       complete API documentation about this value.  The C{proxy_for}
       attribute is used by the source code parser to link imported
       values to their source values (in particular, for base
       classes).  When possible, these proxy C{ValueDoc}s are replaced
       by the imported value's C{ValueDoc} by
       L{link_imports()<docbuilder.link_imports>}.
       @type: L{DottedName}"""
    #} end of "information about imported variables" group

    #: @ivar:
    #: This is currently used to extract values from __all__, etc, in
    #: the docparser module; maybe I should specialize
    #: process_assignment and extract it there?  Although, for __all__,
    #: it's not clear where I'd put the value, since I just use it to
    #: set private/public/imported attribs on other vars (that might not
    #: exist yet at the time.)
    toktree = UNKNOWN

    def __repr__(self):
        if self.canonical_name is not UNKNOWN:
            return '<%s %s>' % (self.__class__.__name__, self.canonical_name)
        elif self.pyval_repr() is not UNKNOWN:
            return '<%s %s>' % (self.__class__.__name__, self.pyval_repr())
        elif self.parse_repr is not UNKNOWN:
            return '<%s %s>' % (self.__class__.__name__, self.parse_repr)
        else:                     
            return '<%s>' % self.__class__.__name__

    def pyval_repr(self):
        """
        Return a string representation of this value based on its pyval;
        or UNKNOWN if we don't succeed.  This should probably eventually
        be replaced by more of a safe-repr variant.
        """
        if self.pyval == UNKNOWN:
            return UNKNOWN
        try:
            s = '%r' % self.pyval
            if isinstance(s, str):
                s = decode_with_backslashreplace(s)
            return s
        except KeyboardInterrupt: raise
        except: return UNKNOWN

    def apidoc_links(self, **filters):
        return []

class GenericValueDoc(ValueDoc):
    """
    API documentation about a 'generic' value, i.e., one that does not
    have its own docstring or any information other than its value and
    parse representation.  C{GenericValueDoc}s do not get assigned
    cannonical names.
    """
    canonical_name = None
    
class NamespaceDoc(ValueDoc):
    """
    API documentation information about a singe Python namespace
    value.  (I.e., a module or a class).
    """
    #{ Information about Variables
    variables = UNKNOWN
    """@ivar: The contents of the namespace, encoded as a
        dictionary mapping from identifiers to C{VariableDoc}s.  This
        dictionary contains all names defined by the namespace,
        including imported variables, aliased variables, and variables
        inherited from base classes (once L{DocInheriter
        <epydoc.docinheriter.DocInheriter>} has added them).
       @type: C{dict} from C{string} to L{VariableDoc}"""
    sorted_variables = UNKNOWN
    """@ivar: A list of all variables defined by this
       namespace, in sorted order.  The elements of this list should
       exactly match the values of L{variables}.  The sort order for
       this list is defined as follows:
          - Any variables listed in a C{@sort} docstring field are
            listed in the order given by that field.
          - These are followed by any variables that were found while
            parsing the source code, in the order in which they were
            defined in the source file.
          - Finally, any remaining variables are listed in
            alphabetical order.
       @type: C{list} of L{VariableDoc}"""
    sort_spec = UNKNOWN
    """@ivar: The order in which variables should be listed,
       encoded as a list of names.  Any variables whose names are not
       included in this list should be listed alphabetically,
       following the variables that are included.
       @type: C{list} of C{str}"""
    group_specs = UNKNOWN
    """@ivar: The groups that are defined by this namespace's
       docstrings.  C{group_specs} is encoded as an ordered list of
       tuples C{(group_name, elt_names)}, where C{group_name} is the
        
       name of a group and C{elt_names} is a list of element names in
       that group.  (An element can be a variable or a submodule.)  A
       '*' in an element name will match any string of characters.
       @type: C{list} of C{(str,list)}"""
    variable_groups = UNKNOWN
    """@ivar: A dictionary specifying what group each
       variable belongs to.  The keys of the dictionary are group
       names, and the values are lists of C{VariableDoc}s.  The order
       that groups should be listed in should be taken from
       L{group_specs}.
       @type: C{dict} from C{str} to C{list} of L{APIDoc}"""
    #} end of group "information about variables"

    def __init__(self, **kwargs):
        kwargs.setdefault('variables', {})
        APIDoc.__init__(self, **kwargs)
        assert self.variables != UNKNOWN

    def apidoc_links(self, **filters):
        variables = filters.get('variables', True)
        imports = filters.get('imports', True)
        private = filters.get('private', True)
        if variables and imports and private:
            return self.variables.values() # list the common case first.
        elif not variables:
            return []
        elif not imports and not private:
            return [v for v in self.variables.values() if
                    v.is_imported != True and v.is_public != False]
        elif not private:
            return [v for v in self.variables.values() if
                    v.is_public != False]
        elif not imports:
            return [v for v in self.variables.values() if
                    v.is_imported != True]
        assert 0, 'this line should be unreachable'

    def init_sorted_variables(self):
        """
        Initialize the L{sorted_variables} attribute, based on the
        L{variables} and L{sort_spec} attributes.  This should usually
        be called after all variables have been added to C{variables}
        (including any inherited variables for classes).  
        """
        unsorted = self.variables.copy()
        self.sorted_variables = []
    
        # Add any variables that are listed in sort_spec
        if self.sort_spec is not UNKNOWN:
            for ident in self.sort_spec:
                if ident in unsorted:
                    self.sorted_variables.append(unsorted[ident])
                    del unsorted[ident]
                elif '*' in ident:
                    regexp = re.compile('^%s$' % ident.replace('*', '(.*)'))
                    # sort within matching group?
                    for name, var_doc in unsorted.items():
                        if regexp.match(name):
                            self.sorted_variables.append(var_doc)
                            unsorted.remove(var_doc)
    
        # Add any remaining variables in alphabetical order.
        var_docs = unsorted.items()
        var_docs.sort()
        for name, var_doc in var_docs:
            self.sorted_variables.append(var_doc)

    def init_variable_groups(self):
        """
        Initialize the L{variable_groups} attribute, based on the
        L{sorted_variables} and L{group_specs} attributes.
        """
        if self.sorted_variables == UNKNOWN:
            self.init_sorted_variables
        assert len(self.sorted_variables) == len(self.variables)

        elts = [(v.name, v) for v in self.sorted_variables]
        self.variable_groups = self._init_grouping(elts)

    def group_names(self):
        """
        Return a list of the group names defined by this namespace, in
        the order in which they should be listed, with no duplicates.
        """
        name_list = ['']
        name_set = set()
        for name, spec in self.group_specs:
            if name not in name_set:
                name_set.add(name)
                name_list.append(name)
        return name_list

    def _init_grouping(self, elts):
        """
        Divide a given a list of APIDoc objects into groups, as
        specified by L{self.group_specs}.

        @param elts: A list of tuples C{(name, apidoc)}.
        
        @return: A list of tuples C{(groupname, elts)}, where
        C{groupname} is the name of a group and C{elts} is a list of
        C{APIDoc}s in that group.  The first tuple has name C{''}, and
        is used for ungrouped elements.  The remaining tuples are
        listed in the order that they appear in C{self.group_specs}.
        Within each tuple, the elements are listed in the order that
        they appear in C{api_docs}.
        """
        # Make the common case fast.
        if len(self.group_specs) == 0:
            return {'': [elt[1] for elt in elts]}

        ungrouped = set([elt_doc for (elt_name, elt_doc) in elts])
        groups = {}
        for (group_name, elt_names) in self.group_specs:
            group_re = re.compile('|'.join([n.replace('*','.*')+'$'
                                            for n in elt_names]))
            group = groups.get(group_name, [])
            for elt_name, elt_doc in list(elts):
                if group_re.match(elt_name):
                    group.append(elt_doc)
                    if elt_doc in ungrouped:
                        ungrouped.remove(elt_doc)
                    else:
                        # [xx] might just be listed in the same group twice!
                        log.warning("%s.%s is in multiple groups" %
                                    (self.canonical_name, elt_name))
            groups[group_name] = group

        # Convert ungrouped from an unordered set to an ordered list.
        groups[''] = [elt_doc for (elt_name, elt_doc) in elts
                      if elt_doc in ungrouped]
        return groups
    
class ModuleDoc(NamespaceDoc):
    """
    API documentation information about a single module.
    """
    #{ Information about the Module
    filename = UNKNOWN
    """@ivar: The name of the file that defines the module.
       @type: C{string}"""
    docformat = UNKNOWN
    """@ivar: The markup language used by docstrings in this module.
       @type: C{string}"""
    #{ Information about Submodules
    submodules = UNKNOWN
    """@ivar: Modules contained by this module (if this module
       is a package).  (Note: on rare occasions, a module may have a
       submodule that is shadowed by a variable with the same name.)
       @type: C{list} of L{ModuleDoc}"""
    submodule_groups = UNKNOWN
    """@ivar: A dictionary specifying what group each
       submodule belongs to.  The keys of the dictionary are group
       names, and the values are lists of C{ModuleDoc}s.  The order
       that groups should be listed in should be taken from
       L{group_specs}.
       @type: C{dict} from C{str} to C{list} of L{APIDoc}"""
    #{ Information about Packages
    package = UNKNOWN
    """@ivar: API documentation for the module's containing package.
       @type: L{ModuleDoc}"""
    is_package = UNKNOWN
    """@ivar: True if this C{ModuleDoc} describes a package.
       @type: C{bool}"""
    path = UNKNOWN
    """@ivar: If this C{ModuleDoc} describes a package, then C{path}
       contains a list of directories that constitute its path (i.e.,
       the value of its C{__path__} variable).
       @type: C{list} of C{str}"""
    #{ Information about Imported Variables
    imports = UNKNOWN
    """@ivar: A list of the source names of variables imported into
       this module.  This is used to construct import graphs.
       @type: C{list} of L{DottedName}"""
    #}

    def apidoc_links(self, **filters):
        val_docs = NamespaceDoc.apidoc_links(self, **filters)
        if (filters.get('packages', True) and
            self.package not in (None, UNKNOWN)):
            val_docs.append(self.package)
        if (filters.get('submodules', True) and
            self.submodules not in (None, UNKNOWN)):
            val_docs += self.submodules
        return val_docs

    def init_submodule_groups(self):
        """
        Initialize the L{submodule_groups} attribute, based on the
        L{submodules} and L{group_specs} attributes.
        """
        if self.submodules in (None, UNKNOWN):
            return
        self.submodules = sorted(self.submodules,
                                 key=lambda m:m.canonical_name)
        elts = [(m.canonical_name[-1], m) for m in self.submodules]
        self.submodule_groups = self._init_grouping(elts)

    def select_variables(self, group=None, value_type=None, public=None,
                         imported=None):
        """
        Return a specified subset of this module's L{sorted_variables}
        list.  If C{value_type} is given, then only return variables
        whose values have the specified type.  If C{group} is given,
        then only return variables that belong to the specified group.

        @require: The L{sorted_variables} and L{groups} attributes
            must be initialized before this method can be used.  See
            L{init_sorted_variables()} and L{init_groups()}.

        @param value_type: A string specifying the value type for
            which variables should be returned.  Valid values are:
              - 'class' - variables whose values are classes or types.
              - 'function' - variables whose values are functions.
              - 'other' - variables whose values are not classes,
                 exceptions, types, or functions.
        @type value_type: C{string}
        
        @param group: The name of the group for which variables should
            be returned.  A complete list of the groups defined by
            this C{ModuleDoc} is available in the L{group_names}
            instance variable.  The first element of this list is
            always the special group name C{''}, which is used for
            variables that do not belong to any group.
        @type group: C{string}
        """
        if (self.sorted_variables == UNKNOWN or 
            self.variable_groups == UNKNOWN):
            raise ValueError('sorted_variables and variable_groups '
                             'must be initialized first.')
        
        if group is None: var_list = self.sorted_variables
        else:
            var_list = self.variable_groups[group]

        # Public/private filter (Count UNKNOWN as public)
        if public is True:
            var_list = [v for v in var_list if v.is_public is not False]
        elif public is False:
            var_list = [v for v in var_list if v.is_public is False]

        # Imported filter (Count UNKNOWN as non-imported)
        if imported is True:
            var_list = [v for v in var_list if v.is_imported is True]
        elif imported is False:
            var_list = [v for v in var_list if v.is_imported is not True]

        # [xx] Modules are not currently included in any of these
        # value types.
        if value_type is None:
            return var_list
        elif value_type == 'class':
            return [var_doc for var_doc in var_list
                    if (isinstance(var_doc.value, ClassDoc))]
        elif value_type == 'function':
            return [var_doc for var_doc in var_list
                    if isinstance(var_doc.value, RoutineDoc)]
        elif value_type == 'other':
            return [var_doc for var_doc in var_list
                    if not isinstance(var_doc.value,
                                      (ClassDoc, RoutineDoc, ModuleDoc))]
        else:
            raise ValueError('Bad value type %r' % value_type)

class ClassDoc(NamespaceDoc):
    """
    API documentation information about a single class.
    """
    #{ Information about Base Classes
    bases = UNKNOWN
    """@ivar: API documentation for the class's base classes.
    @type: C{list} of L{ClassDoc}"""
    #{ Information about Subclasses
    subclasses = UNKNOWN
    """@ivar: API documentation for the class's known subclasses.
    @type: C{list} of L{ClassDoc}"""
    #}

    def apidoc_links(self, **filters):
        val_docs = NamespaceDoc.apidoc_links(self, **filters)
        if (filters.get('bases', True) and 
            self.bases not in (None, UNKNOWN)):
            val_docs += self.bases
        if (filters.get('subclasses', True) and
            self.subclasses not in (None, UNKNOWN)):
            val_docs += self.subclasses
        return val_docs
    
    def is_type(self):
        if self.canonical_name == DottedName('type'): return True
        if self.bases is UNKNOWN: return False
        for base in self.bases:
            if isinstance(base, ClassDoc) and base.is_type():
                return True
        return False
    
    def is_exception(self):
        if self.canonical_name == DottedName('Exception'): return True
        if self.bases is UNKNOWN: return False
        for base in self.bases:
            if isinstance(base, ClassDoc) and base.is_exception():
                return True
        return False
    
    def is_newstyle_class(self):
        if self.canonical_name == DottedName('object'): return True
        if self.bases is UNKNOWN: return False
        for base in self.bases:
            if isinstance(base, ClassDoc) and base.is_newstyle_class():
                return True
        return False

    def mro(self, warn_about_bad_bases=False):
        if self.is_newstyle_class():
            return self._c3_mro(warn_about_bad_bases)
        else:
            return self._dfs_bases([], set(), warn_about_bad_bases)
                
    def _dfs_bases(self, mro, seen, warn_about_bad_bases):
        if self in seen: return mro
        mro.append(self)
        seen.add(self)
        if self.bases is not UNKNOWN:
            for base in self.bases:
                if isinstance(base, ClassDoc) and base.proxy_for is None:
                    base._dfs_bases(mro, seen, warn_about_bad_bases)
                elif warn_about_bad_bases:
                    self._report_bad_base(base)
        return mro

    def _c3_mro(self, warn_about_bad_bases):
        """
        Compute the class precedence list (mro) according to C3.
        @seealso: U{http://www.python.org/2.3/mro.html}
        """
        bases = [base for base in self.bases if isinstance(base, ClassDoc)]
        if len(bases) != len(self.bases) and warn_about_bad_bases:
            for base in self.bases:
                if (not isinstance(base, ClassDoc) or
                    base.proxy_for is not None):
                    self._report_bad_base(base)
        w = [warn_about_bad_bases]*len(bases)
        return self._c3_merge([[self]] + map(ClassDoc._c3_mro, bases, w) +
                              [list(bases)])

    def _report_bad_base(self, base):
        if not isinstance(base, ClassDoc):
            log.warning("%s's base %s is not a class" %
                        (self.canonical_name, base.canonical_name))
        elif base.proxy_for is not None:
            log.warning("No information available for %s's base %s" %
                        (self.canonical_name, base.proxy_for))

    def _c3_merge(self, seqs):
        """
        Helper function for L{_c3_mro}.
        """
        res = []
        while 1:
          nonemptyseqs=[seq for seq in seqs if seq]
          if not nonemptyseqs: return res
          for seq in nonemptyseqs: # find merge candidates among seq heads
              cand = seq[0]
              nothead=[s for s in nonemptyseqs if cand in s[1:]]
              if nothead: cand=None #reject candidate
              else: break
          if not cand: raise "Inconsistent hierarchy"
          res.append(cand)
          for seq in nonemptyseqs: # remove cand
              if seq[0] == cand: del seq[0]
    
    def select_variables(self, group=None, value_type=None,
                         inherited=None, public=None, imported=None):
        """
        Return a specified subset of this class's L{sorted_variables}
        list.  If C{value_type} is given, then only return variables
        whose values have the specified type.  If C{group} is given,
        then only return variables that belong to the specified group.
        If C{inherited} is True, then only return inherited variables;
        if C{inherited} is False, then only return local variables.

        @require: The L{sorted_variables} and L{groups} attributes
            must be initialized before this method can be used.  See
            L{init_sorted_variables()} and L{init_groups()}.

        @param value_type: A string specifying the value type for
            which variables should be returned.  Valid values are:
              - 'instancemethod' - variables whose values are
                instance methods.
              - 'classmethod' - variables whose values are class
                methods.
              - 'staticmethod' - variables whose values are static
                methods.
              - 'properties' - variables whose values are properties.
              - 'class' - variables whose values are nested classes
                (including exceptions and types).
              - 'instancevariable' - instance variables.  This includes
                any variables that are explicitly marked as instance
                variables with docstring fields; and variables with
                docstrings that are initialized in the constructor.
              - 'classvariable' - class variables.  This includes any
                variables that are not included in any of the above
                categories.
        @type value_type: C{string}
        
        @param group: The name of the group for which variables should
            be returned.  A complete list of the groups defined by
            this C{ClassDoc} is available in the L{group_names}
            instance variable.  The first element of this list is
            always the special group name C{''}, which is used for
            variables that do not belong to any group.
        @type group: C{string}

        @param inherited: If C{None}, then return both inherited and
            local variables; if C{True}, then return only inherited
            variables; if C{False}, then return only local variables.
        """
        if (self.sorted_variables == UNKNOWN or 
            self.variable_groups == UNKNOWN):
            raise ValueError('sorted_variables and variable_groups '
                             'must be initialized first.')
        
        if group is None: var_list = self.sorted_variables
        else: var_list = self.variable_groups[group]

        # Public/private filter (Count UNKNOWN as public)
        if public is True:
            var_list = [v for v in var_list if v.is_public is not False]
        elif public is False:
            var_list = [v for v in var_list if v.is_public is False]

        # Inherited filter (Count UNKNOWN as non-inherited)
        if inherited is None: pass
        elif inherited:
            var_list = [v for v in var_list if v.container != self]
        else:
            var_list = [v for v in var_list if v.container == self ]

        # Imported filter (Count UNKNOWN as non-imported)
        if imported is True:
            var_list = [v for v in var_list if v.is_imported is True]
        elif imported is False:
            var_list = [v for v in var_list if v.is_imported is not True]
        
        if value_type is None:
            return var_list
        elif value_type == 'method':
            return [var_doc for var_doc in var_list
                    if (isinstance(var_doc.value, RoutineDoc) and
                        var_doc.is_instvar in (False, UNKNOWN))]
        elif value_type == 'instancemethod':
            return [var_doc for var_doc in var_list
                    if (isinstance(var_doc.value, RoutineDoc) and
                        not isinstance(var_doc.value, ClassMethodDoc) and
                        not isinstance(var_doc.value, StaticMethodDoc) and
                        var_doc.is_instvar in (False, UNKNOWN))]
        elif value_type == 'classmethod':
            return [var_doc for var_doc in var_list
                    if (isinstance(var_doc.value, ClassMethodDoc) and
                        var_doc.is_instvar in (False, UNKNOWN))]
        elif value_type == 'staticmethod':
            return [var_doc for var_doc in var_list
                    if (isinstance(var_doc.value, StaticMethodDoc) and
                        var_doc.is_instvar in (False, UNKNOWN))]
        elif value_type == 'property':
            return [var_doc for var_doc in var_list
                    if (isinstance(var_doc.value, PropertyDoc) and
                        var_doc.is_instvar in (False, UNKNOWN))]
        elif value_type == 'class':
            return [var_doc for var_doc in var_list
                    if (isinstance(var_doc.value, ClassDoc) and
                        var_doc.is_instvar in (False, UNKNOWN))]
        elif value_type == 'instancevariable':
            return [var_doc for var_doc in var_list
                    if var_doc.is_instvar is True]
        elif value_type == 'classvariable':
            return [var_doc for var_doc in var_list
                    if (var_doc.is_instvar in (False, UNKNOWN) and
                        not isinstance(var_doc.value,
                                       (RoutineDoc, ClassDoc, PropertyDoc)))]
        else:
            raise ValueError('Bad value type %r' % value_type)

class RoutineDoc(ValueDoc):
    """
    API documentation information about a single routine.
    """
    #{ Signature
    posargs = UNKNOWN
    """@ivar: The names of the routine's positional arguments.
       If an argument list contains \"unpacking\" arguments, then
       their names will be specified using nested lists.  E.g., if
       a function's argument list is C{((x1,y1), (x2,y2))}, then
       posargs will be C{[['x1','y1'], ['x2','y2']]}.
       @type: C{list}"""
    posarg_defaults = UNKNOWN
    """@ivar: API documentation for the positional arguments'
       default values.  This list has the same length as C{posargs}, and
       each element of C{posarg_defaults} describes the corresponding
       argument in C{posargs}.  For positional arguments with no default,
       C{posargs_defaults} will contain None.
       @type: C{list} of C{ValueDoc} or C{None}"""
    vararg = UNKNOWN
    """@ivar: The name of the routine's vararg argument, or C{None} if
       it has no vararg argument.
       @type: C{string} or C{None}"""
    kwarg = UNKNOWN
    """@ivar: The name of the routine's keyword argument, or C{None} if
       it has no keyword argument.
       @type: C{string} or C{None}"""
    lineno = UNKNOWN # used to look up profiling info from pstats.
    """@ivar: The line number of the first line of the function's
       signature.  For Python functions, this is equal to
       C{func.func_code.co_firstlineno}.  The first line of a file
       is considered line 1.
       @type: C{int}"""
    #} end of "signature" group

    #{ Information Extracted from Docstrings
    arg_descrs = UNKNOWN
    """@ivar: A list of descriptions of the routine's
       arguments.  Each element of this list is a tuple C{(arg,
       descr)}, where C{arg} is an argument name (or a tuple of 
       of argument names); and C{descr} is a L{ParsedDocstring
       <epydoc.markup.ParsedDocstring>} describing the argument(s)
       specified by C{arg}.
       @type: C{list}"""
    arg_types = UNKNOWN
    """@ivar: Descriptions of the expected types for the
       routine's arguments, encoded as a dictionary mapping from
       argument names to type descriptions.
       @type: C{dict} from C{string} to L{ParsedDocstring
       <epydoc.markup.ParsedDocstring>}"""
    return_descr = UNKNOWN
    """@ivar: A description of the value returned by this routine.
       @type: L{ParsedDocstring<epydoc.markup.ParsedDocstring>}"""
    return_type = UNKNOWN
    """@ivar: A description of expected type for the value
       returned by this routine.
       @type: L{ParsedDocstring<epydoc.markup.ParsedDocstring>}"""
    exception_descrs = UNKNOWN
    """@ivar: A list of descriptions of exceptions
       that the routine might raise.  Each element of this list is a
       tuple C{(exc, descr)}, where C{exc} is a string contianing the
       exception name; and C{descr} is a L{ParsedDocstring
       <epydoc.markup.ParsedDocstring>} describing the circumstances
       under which the exception specified by C{exc} is raised.
       @type: C{list}"""
    #} end of "information extracted from docstrings" group

    def all_args(self):
        """
        @return: A list of the names of all arguments (positional,
        vararg, and keyword), in order.  If a positional argument
        consists of a tuple of names, then that tuple will be
        flattened.
        """
        all_args = _flatten(self.posargs)
        if self.vararg not in (None, UNKNOWN):
            all_args.append(self.vararg)
        if self.kwarg not in (None, UNKNOWN):
            all_args.append(self.kwarg)
        return all_args

def _flatten(lst, out=None):
    """
    Return a flattened version of C{lst}.
    """
    if out is None: out = []
    for elt in lst:
        if isinstance(elt, (list,tuple)):
            _flatten(elt, out)
        else:
            out.append(elt)
    return out

class ClassMethodDoc(RoutineDoc): pass
class StaticMethodDoc(RoutineDoc): pass

class PropertyDoc(ValueDoc):
    """
    API documentation information about a single property.
    """
    #{ Property Access Functions
    fget = UNKNOWN
    """@ivar: API documentation for the property's get function.
       @type: L{RoutineDoc}"""
    fset = UNKNOWN
    """@ivar: API documentation for the property's set function.
       @type: L{RoutineDoc}"""
    fdel = UNKNOWN
    """@ivar: API documentation for the property's delete function.
       @type: L{RoutineDoc}"""
    #}
    #{ Information Extracted from Docstrings
    type_descr = UNKNOWN
    """@ivar: A description of the property's expected type, extracted
       from its docstring.
       @type: L{ParsedDocstring<epydoc.markup.ParsedDocstring>}"""
    #} end of "information extracted from docstrings" group

    def apidoc_links(self, **filters):
        val_docs = []
        if self.fget not in (None, UNKNOWN): val_docs.append(self.fget)
        if self.fset not in (None, UNKNOWN): val_docs.append(self.fset)
        if self.fdel not in (None, UNKNOWN): val_docs.append(self.fdel)
        return val_docs

######################################################################
## Index
######################################################################

class DocIndex:
    """
    [xx] out of date.
    
    An index that .. hmm...  it *can't* be used to access some things,
    cuz they're not at the root level.  Do I want to add them or what?
    And if so, then I have a sort of a new top level.  hmm..  so
    basically the question is what to do with a name that's not in the
    root var's name space.  2 types:
      - entirely outside (eg os.path)
      - inside but not known (eg a submodule that we didn't look at?)
      - container of current thing not examined?
    
    An index of all the C{APIDoc} objects that can be reached from a
    root set of C{ValueDoc}s.  
    
    The members of this index can be accessed by dotted name.  In
    particular, C{DocIndex} defines two mappings, accessed via the
    L{get_vardoc()} and L{get_valdoc()} methods, which can be used to
    access C{VariableDoc}s or C{ValueDoc}s respectively by name.  (Two
    separate mappings are necessary because a single name can be used
    to refer to both a variable and to the value contained by that
    variable.)

    Additionally, the index defines two sets of C{ValueDoc}s:
    \"reachable C{ValueDoc}s\" and \"contained C{ValueDoc}s\".  The
    X{reachable C{ValueDoc}s} are defined as the set of all
    C{ValueDoc}s that can be reached from the root set by following
    I{any} sequence of pointers to C{ValueDoc}s or C{VariableDoc}s.
    The X{contained C{ValueDoc}s} are defined as the set of all
    C{ValueDoc}s that can be reached from the root set by following
    only the C{ValueDoc} pointers defined by non-imported
    C{VariableDoc}s.  For example, if the root set contains a module
    C{m}, then the contained C{ValueDoc}s includes the C{ValueDoc}s
    for any functions, variables, or classes defined in that module,
    as well as methods and variables defined in classes defined in the
    module.  The reachable C{ValueDoc}s includes all of those
    C{ValueDoc}s, as well as C{ValueDoc}s for any values imported into
    the module, and base classes for classes defined in the module.
    """

    def __init__(self, root):
        """
        Create a new documentation index, based on the given root set
        of C{ValueDoc}s.  If any C{APIDoc}s reachable from the root
        set does not have a canonical name, then it will be assigned
        one.  etc.
        
        @param root: A list of C{ValueDoc}s.
        """
        for apidoc in root:
            if apidoc.canonical_name in (None, UNKNOWN):
                raise ValueError("All APIdocs passed to DocIndexer "
                                 "must already have canonical names.")
        
        # Initialize the root items list.  We sort them by length in
        # ascending order.  (This ensures that variables will shadow
        # submodules when appropriate.)
        self.root = sorted(root, key=lambda d:len(d.canonical_name))

        self.callers = None
        """A dictionary mapping from C{RoutineDoc}s in this index
           to lists of C{RoutineDoc}s for the routine's callers.
           This dictionary is initialized by calling
           L{read_profiling_info()}.
           @type: C{list} of L{RoutineDoc}"""
        
        self.callees = None
        """A dictionary mapping from C{RoutineDoc}s in this index
           to lists of C{RoutineDoc}s for the routine's callees.
           This dictionary is initialized by calling
           L{read_profiling_info()}.
           @type: C{list} of L{RoutineDoc}"""

        self._funcid_to_doc = {}

    #////////////////////////////////////////////////////////////
    # Lookup methods
    #////////////////////////////////////////////////////////////
    # [xx]
    # Currently these only work for things reachable from the
    # root... :-/  I might want to change this so that imported
    # values can be accessed even if they're not contained.  
    # Also, I might want canonical names to not start with ??
    # if the thing is a top-level imported module..?

    def get_vardoc(self, name):
        """
        Return the C{VariableDoc} with the given name, or C{None} if this
        index does not contain a C{VariableDoc} with the given name.
        """
        var, val = self._get(name)
        return var

    def get_valdoc(self, name):
        """
        Return the C{ValueDoc} with the given name, or C{None} if this
        index does not contain a C{ValueDoc} with the given name.
        """
        var, val = self._get(name)
        return val

    def _get(self, name):
        """
        A helper function that's used to implement L{get_vardoc()}
        and L{get_valdoc()}.
        """
        # Convert name to a DottedName, if necessary.
        name = DottedName(name)

        # Look for an element in the root set whose name is a prefix
        # of `name`.  If we can't find one, then return None.
        for root_valdoc in self.root:
            if root_valdoc.canonical_name.dominates(name):
                # Starting at the root valdoc, walk down the variable/
                # submodule chain until we find the requested item.
                var_doc = None
                val_doc = root_valdoc
                for identifier in name[len(root_valdoc.canonical_name):]:
                    if val_doc is None: break
                    var_doc, val_doc = self._get_from(val_doc, identifier)
                else:
                    # If we found it, then return.
                    if var_doc is not None or val_doc is not None:
                        return var_doc, val_doc

        # We didn't find it.
        return None, None

    def _get_from(self, val_doc, identifier):
        if isinstance(val_doc, NamespaceDoc):
            child_var = val_doc.variables.get(identifier)
            if child_var is not None:
                child_val = child_var.value
                if child_val == UNKNOWN: child_val = None
                return child_var, child_val

        # If that fails, then see if it's a submodule.
        if (isinstance(val_doc, ModuleDoc) and
            val_doc.submodules is not UNKNOWN):
            for submodule in val_doc.submodules:
                if (submodule.canonical_name ==
                    DottedName(val_doc.canonical_name, identifier)):
                    var_doc = None
                    val_doc = submodule
                    if val_doc is UNKNOWN: val_doc = None
                    return var_doc, val_doc

        return None, None

    def find(self, name, context):
        """
        Look for a C{ValueDoc} named C{name}, relative to C{context}.
        Return the C{ValueDoc} if one is found; otherwise, return
        C{None}.  C{find} looks in the following places, in order:
          - Function parameters (if one matches, return C{None})
          - All enclosing namespaces, from closest to furthest.
          - If C{name} starts with C{'self'}, then strip it off and
            look for the remaining part of the name using C{find}
          - Builtins
          - Parameter attributes
        
        @type name: C{str} or L{DottedName}
        @type context: L{ValueDoc}
        """
        if isinstance(name, basestring):
            name = re.sub(r'\(.*\)$', '', name.strip())
            if re.match('^([a-zA-Z_]\w*)(\.[a-zA-Z_]\w*)*$', name):
                name = DottedName(name)
            else:
                return None
        elif not isinstance(name, DottedName):
            raise TypeError("'name' should be a string or DottedName")
        
        if context is None or context.canonical_name is None:
            container_name = []
        else:
            container_name = context.canonical_name

        # Check for the name in all containing namespaces, starting
        # with the closest one.
        for i in range(len(container_name), -1, -1):
            relative_name = container_name[:i]+name
            # Is `name` the absolute name of a documented value?
            val_doc = self.get_valdoc(relative_name)
            if val_doc is not None: return val_doc
            # Is `name` the absolute name of a documented variable?
            var_doc = self.get_vardoc(relative_name)
            if var_doc is not None: return var_doc

        # If the name begins with 'self', then try stripping that off
        # and see if we can find the variable.
        if name[0] == 'self':
            doc = self.find('.'.join(name[1:]), context)
            if doc is not None: return doc

        # Is it the name of a builtin?
        if len(name)==1 and hasattr(__builtin__, name[0]):
            return None
        
        # Is it a parameter's name or an attribute of a parameter?
        if (isinstance(context, RoutineDoc) and
            name[0] in context.all_args()):
            return None

    #////////////////////////////////////////////////////////////
    # etc
    #////////////////////////////////////////////////////////////

    def reachable_valdocs(self, **filters):
        """
        Return a list of all C{ValueDoc}s that can be reached,
        directly or indirectly from this C{DocIndex}'s root set.
        
        @param filters: A set of filters that can be used to prevent
            C{reachable_valdocs} from following specific link types
            when looking for C{ValueDoc}s that can be reached from the
            root set.  See C{APIDoc.apidoc_links} for a more complete
            description.
        """
        return reachable_valdocs(self.root, **filters)

    def container(self, api_doc):
        """
        Return the C{ValueDoc} that contains the given C{APIDoc}, or
        C{None} if its container is not in the index.
        """
        if isinstance(api_doc, GenericValueDoc):
            return None # [xx] unknown.
        if isinstance(api_doc, VariableDoc):
            return api_doc.container
        if len(api_doc.canonical_name) == 1:
            return None
        elif isinstance(api_doc, ModuleDoc) and api_doc.package != UNKNOWN:
            return api_doc.package
        else:
            parent = api_doc.canonical_name.container()
            return self.get_valdoc(parent)

    #////////////////////////////////////////////////////////////
    # Profiling information
    #////////////////////////////////////////////////////////////

    def read_profiling_info(self, profile_stats):
        """
        Initialize the L{callers} and L{callees} variables, given a
        C{Stat} object from the C{pstats} module.
        
        @warning: This method uses undocumented data structures inside
            of C{profile_stats}.
        """
        if self.callers is None: self.callers = {}
        if self.callees is None: self.callees = {}
        
        # The Stat object encodes functions using `funcid`s, or
        # tuples of (filename, lineno, funcname).  Create a mapping
        # from these `funcid`s to `RoutineDoc`s.
        self._update_funcid_to_doc(profile_stats)
        
        for callee, (cc, nc, tt, ct, callers) in profile_stats.stats.items():
            callee = self._funcid_to_doc.get(callee)
            if callee is None: continue
            for caller in callers:
                caller = self._funcid_to_doc.get(caller)
                if caller is None: continue
                self.callers.setdefault(callee, []).append(caller)
                self.callees.setdefault(caller, []).append(callee)

    def _update_funcid_to_doc(self, profile_stats):
        """
        Update the dictionary mapping from C{pstat.Stat} funciton ids to
        C{RoutineDoc}s.  C{pstat.Stat} function ids are tuples of
        C{(filename, lineno, funcname)}.
        """
        # Maps (filename, lineno, funcname) -> RoutineDoc
        for val_doc in self.reachable_valdocs():
            # We only care about routines.
            if not isinstance(val_doc, RoutineDoc): continue
            # Get the filename from the defining module.
            module = val_doc.defining_module
            if module is UNKNOWN or module.filename is UNKNOWN: continue
            # Normalize the filename.
            filename = os.path.abspath(module.filename)
            try: filename = py_src_filename(filename)
            except: pass
            # Look up the stat_func_id
            funcid = (filename, val_doc.lineno, val_doc.canonical_name[-1])
            if funcid in profile_stats.stats:
                self._funcid_to_doc[funcid] = val_doc

######################################################################
## Pretty Printing
######################################################################

def pp_apidoc(api_doc, doublespace=0, depth=5, exclude=(), include=(),
              backpointers=None):
    """
    @return: A multiline pretty-printed string representation for the
        given C{APIDoc}.
    @param doublespace: If true, then extra lines will be
        inserted to make the output more readable.
    @param depth: The maximum depth that pp_apidoc will descend
        into descendent VarDocs.  To put no limit on
        depth, use C{depth=-1}.
    @param exclude: A list of names of attributes whose values should
        not be shown.
    @param backpointers: For internal use.
    """
    pyid = id(api_doc.__dict__)
    if backpointers is None: backpointers = {}
    if (hasattr(api_doc, 'canonical_name') and
        api_doc.canonical_name not in (None, UNKNOWN)):
        name = '%s for %s' % (api_doc.__class__.__name__,
                              api_doc.canonical_name)
    elif hasattr(api_doc, 'name') and api_doc.name not in (UNKNOWN, None):
        name = '%s for %s' % (api_doc.__class__.__name__, api_doc.name)
    else:
        name = api_doc.__class__.__name__
        
    if pyid in backpointers:
        return '%s [%s] (defined above)' % (name, backpointers[pyid])
    
    if depth == 0:
        if hasattr(api_doc, 'name') and api_doc.name is not None:
            return '%s...' % api_doc.name
        else:
            return '...'

    backpointers[pyid] = len(backpointers)
    s = '%s [%s]' % (name, backpointers[pyid])

    # Only print non-empty fields:
    fields = [field for field in api_doc.__dict__.keys()
              if (field in include or
                  (getattr(api_doc, field) is not UNKNOWN
                   and field not in exclude))]
    if include:
        fields = [field for field in dir(api_doc)
                  if field in include]
    else:
        fields = [field for field in api_doc.__dict__.keys()
                  if (getattr(api_doc, field) is not UNKNOWN
                      and field not in exclude)]
    fields.sort()
    
    for field in fields:
        fieldval = getattr(api_doc, field)
        if doublespace: s += '\n |'
        s += '\n +- %s' % field

        if (isinstance(fieldval, types.ListType) and
            len(fieldval)>0 and
            isinstance(fieldval[0], APIDoc)):
            s += _pp_list(api_doc, fieldval, doublespace, depth,
                          exclude, include, backpointers,
                          (field is fields[-1]))
        elif (isinstance(fieldval, types.DictType) and
              len(fieldval)>0 and 
              isinstance(fieldval.values()[0], APIDoc)):
            s += _pp_dict(api_doc, fieldval, doublespace, 
                          depth, exclude, include, backpointers,
                          (field is fields[-1]))
        elif isinstance(fieldval, APIDoc):
            s += _pp_apidoc(api_doc, fieldval, doublespace, depth,
                            exclude, include, backpointers,
                            (field is fields[-1]))
        else:
            s += ' = ' + _pp_val(api_doc, fieldval, doublespace,
                                 depth, exclude, include, backpointers)
                
    return s

def _pp_list(api_doc, items, doublespace, depth, exclude, include,
              backpointers, is_last):
    line1 = (is_last and ' ') or '|'
    s = ''
    for item in items:
        line2 = ((item is items[-1]) and ' ') or '|'
        joiner = '\n %s  %s ' % (line1, line2)
        if doublespace: s += '\n %s  |' % line1
        s += '\n %s  +- ' % line1
        valstr = _pp_val(api_doc, item, doublespace, depth, exclude, include,
                         backpointers)
        s += joiner.join(valstr.split('\n'))
    return s

def _pp_dict(api_doc, dict, doublespace, depth, exclude, include,
              backpointers, is_last):
    items = dict.items()
    items.sort()
    line1 = (is_last and ' ') or '|'
    s = ''
    for item in items:
        line2 = ((item is items[-1]) and ' ') or '|'
        joiner = '\n %s  %s ' % (line1, line2)
        if doublespace: s += '\n %s  |' % line1
        s += '\n %s  +- ' % line1
        valstr = _pp_val(api_doc, item[1], doublespace, depth, exclude,
                         include, backpointers)
        s += joiner.join(('%s => %s' % (item[0], valstr)).split('\n'))
    return s

def _pp_apidoc(api_doc, val, doublespace, depth, exclude, include,
                backpointers, is_last):
    line1 = (is_last and ' ') or '|'
    s = ''
    if doublespace: s += '\n %s  |  ' % line1
    s += '\n %s  +- ' % line1
    joiner = '\n %s    ' % line1
    childstr = pp_apidoc(val, doublespace, depth-1, exclude,
                         include, backpointers)
    return s + joiner.join(childstr.split('\n'))
    
def _pp_val(api_doc, val, doublespace, depth, exclude, include, backpointers):
    from epydoc import markup
    if isinstance(val, APIDoc):
        return pp_apidoc(val, doublespace, depth-1, exclude,
                         include, backpointers)
    elif isinstance(val, markup.ParsedDocstring):
        valrepr = `val.to_plaintext(None)`
        if len(valrepr) < 40: return valrepr
        else: return valrepr[:37]+'...'
    else:
        valrepr = repr(val)
        if len(valrepr) < 40: return valrepr
        else: return valrepr[:37]+'...'

