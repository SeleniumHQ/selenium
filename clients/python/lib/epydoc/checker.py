#
# objdoc: epydoc documentation completeness checker
# Edward Loper
#
# Created [01/30/01 05:18 PM]
# $Id: checker.py 1180 2006-04-07 01:02:08Z edloper $
#

"""
Documentation completeness checker.  This module defines a single
class, C{DocChecker}, which can be used to check the that specified
classes of objects are documented.
"""
__docformat__ = 'epytext en'

##################################################
## Imports
##################################################

import re, sys, os.path, string
from xml.dom.minidom import Text as _Text
from epydoc.apidoc import *

# The following methods may be undocumented:
_NO_DOCS = ['__hash__', '__repr__', '__str__', '__cmp__']

# The following methods never need descriptions, authors, or
# versions:
_NO_BASIC = ['__hash__', '__repr__', '__str__', '__cmp__']

# The following methods never need return value descriptions.
_NO_RETURN = ['__init__', '__hash__', '__repr__', '__str__', '__cmp__']

# The following methods don't need parameters documented:
_NO_PARAM = ['__cmp__']

class DocChecker:
    """
    Documentation completeness checker.  C{DocChecker} can be used to
    check that specified classes of objects are documented.  To check
    the documentation for a group of objects, you should create a
    C{DocChecker} from a L{DocIndex<apidoc.DocIndex>} that documents
    those objects; and then use the L{check} method to run specified
    checks on the objects' documentation.

    What checks are run, and what objects they are run on, are
    specified by the constants defined by C{DocChecker}.  These
    constants are divided into three groups.  

      - Type specifiers indicate what type of objects should be
        checked: L{MODULE}; L{CLASS}; L{FUNC}; L{VAR}; L{IVAR};
        L{CVAR}; L{PARAM}; and L{RETURN}.
      - Public/private specifiers indicate whether public or private
        objects should be checked: L{PRIVATE}.
      - Check specifiers indicate what checks should be run on the
        objects: L{TYPE}; L{DESCR}; L{DESCR_LAZY}; L{AUTHOR};
        and L{VERSION}.

    The L{check} method is used to perform a check on the
    documentation.  Its parameter is formed by or-ing together at
    least one value from each specifier group:

        >>> checker.check(DocChecker.MODULE | DocChecker.DESCR)
        
    To specify multiple values from a single group, simply or their
    values together:
    
        >>> checker.check(DocChecker.MODULE | DocChecker.CLASS |
        ...               DocChecker.FUNC | DocChecker.DESCR_LAZY)

    @group Types: MODULE, CLASS, FUNC, VAR, IVAR, CVAR, PARAM,
        RETURN, ALL_T
    @type MODULE: C{int}
    @cvar MODULE: Type specifier that indicates that the documentation
        of modules should be checked.
    @type CLASS: C{int}
    @cvar CLASS: Type specifier that indicates that the documentation
        of classes should be checked.
    @type FUNC: C{int}
    @cvar FUNC: Type specifier that indicates that the documentation
        of functions should be checked.
    @type VAR: C{int}
    @cvar VAR: Type specifier that indicates that the documentation
        of module variables should be checked.
    @type IVAR: C{int}
    @cvar IVAR: Type specifier that indicates that the documentation
        of instance variables should be checked.
    @type CVAR: C{int}
    @cvar CVAR: Type specifier that indicates that the documentation
        of class variables should be checked.
    @type PARAM: C{int}
    @cvar PARAM: Type specifier that indicates that the documentation
        of function and method parameters should be checked.
    @type RETURN: C{int}
    @cvar RETURN: Type specifier that indicates that the documentation
        of return values should be checked.
    @type ALL_T: C{int}
    @cvar ALL_T: Type specifier that indicates that the documentation
        of all objects should be checked.

    @group Checks: TYPE, AUTHOR, VERSION, DESCR_LAZY, DESCR, ALL_C
    @type TYPE: C{int}
    @cvar TYPE: Check specifier that indicates that every variable and
        parameter should have a C{@type} field.
    @type AUTHOR: C{int}
    @cvar AUTHOR: Check specifier that indicates that every object
        should have an C{author} field.
    @type VERSION: C{int}
    @cvar VERSION: Check specifier that indicates that every object
        should have a C{version} field.
    @type DESCR: C{int}
    @cvar DESCR: Check specifier that indicates that every object
        should have a description.  
    @type ALL_C: C{int}
    @cvar ALL_C: Check specifier that indicates that  all checks
        should be run.

    @group Publicity: PRIVATE
    @type PRIVATE: C{int}
    @cvar PRIVATE: Specifier that indicates that private objects should
        be checked.
    """
    # Types
    MODULE = 1
    CLASS  = 2
    FUNC   = 4
    VAR    = 8
    #IVAR   = 16
    #CVAR   = 32
    PARAM  = 64
    RETURN = 128
    PROPERTY = 256
    ALL_T  = 1+2+4+8+16+32+64+128+256

    # Checks
    TYPE = 256
    AUTHOR = 1024
    VERSION = 2048
    DESCR = 4096
    ALL_C = 256+512+1024+2048+4096

    # Private/public
    PRIVATE = 16384

    ALL = ALL_T + ALL_C + PRIVATE

    def __init__(self, docindex):
        """
        Create a new C{DocChecker} that can be used to run checks on
        the documentation of the objects documented by C{docindex}

        @param docindex: A documentation map containing the
            documentation for the objects to be checked.
        @type docindex: L{Docindex<apidoc.DocIndex>}
        """
        self._docindex = docindex

        # Initialize instance variables
        self._checks = 0
        self._last_warn = None
        self._out = sys.stdout
        self._num_warnings = 0

    def check(self, *check_sets):
        """
        Run the specified checks on the documentation of the objects
        contained by this C{DocChecker}'s C{DocIndex}.  Any errors found
        are printed to standard out.

        @param checks: The checks that should be run on the
            documentation.  This value is constructed by or-ing
            together the specifiers that indicate which objects should
            be checked, and which checks should be run.  See the
            L{module description<checker>} for more information.
            If no checks are specified, then a default set of checks
            will be run.
        @type checks: C{int}
        @return: True if no problems were found.
        @rtype: C{boolean}
        """
        if not check_sets:
            check_sets = (DocChecker.MODULE | DocChecker.CLASS |
                          DocChecker.FUNC | DocChecker.VAR | 
                          DocChecker.DESCR,)
            
        self._warnings = {}
        log.start_progress('Checking docs')
        for j, checks in enumerate(check_sets):
            self._check(checks)
        log.end_progress()

        for (warning, docs) in self._warnings.items():
            docs = sorted(docs)
            docnames = '\n'.join(['  - %s' % self._name(d) for d in docs])
            log.warning('%s:\n%s' % (warning, docnames))

    def _check(self, checks):
        self._checks = checks
        
        # Get the list of objects to check.
        valdocs = sorted(self._docindex.reachable_valdocs(
            imports=False, packages=False, bases=False, submodules=False, 
            subclasses=False, private = (checks & DocChecker.PRIVATE)))
        docs = set()
        for d in valdocs:
            if not isinstance(d, GenericValueDoc): docs.add(d)
        for doc in valdocs:
            if isinstance(doc, NamespaceDoc):
                for d in doc.variables.values():
                    if isinstance(d.value, GenericValueDoc): docs.add(d)

        for i, doc in enumerate(sorted(docs)):
            if isinstance(doc, ModuleDoc):
                self._check_module(doc)
            elif isinstance(doc, ClassDoc):
                self._check_class(doc)
            elif isinstance(doc, RoutineDoc):
                self._check_func(doc)
            elif isinstance(doc, PropertyDoc):
                self._check_property(doc)
            elif isinstance(doc, VariableDoc):
                self._check_var(doc)
            else:
                log.error("Don't know how to check %r" % doc)

    def _name(self, doc):
        name = str(doc.canonical_name)
        if isinstance(doc, RoutineDoc): name += '()'
        return name

    def _check_basic(self, doc):
        """
        Check the description, author, version, and see-also fields of
        C{doc}.  This is used as a helper function by L{_check_module},
        L{_check_class}, and L{_check_func}.

        @param doc: The documentation that should be checked.
        @type doc: L{ObjDoc}
        @rtype: C{None}
        """
        if ((self._checks & DocChecker.DESCR) and
            (doc.descr in (None, UNKNOWN))):
            if doc.docstring in (None, UNKNOWN):
                self.warning('Undocumented', doc)
            else:
                self.warning('No description', doc)
        if self._checks & DocChecker.AUTHOR:
            for tag, arg, descr in doc.metadata:
                if 'author' == tag: break
            else:
                self.warning('No authors', doc)
        if self._checks & DocChecker.VERSION:
            for tag, arg, descr in doc.metadata:
                if 'version' == tag: break
            else:
                self.warning('No version', doc)
            
    def _check_module(self, doc):
        """
        Run checks on the module whose APIDoc is C{doc}.
        
        @param doc: The APIDoc of the module to check.
        @type doc: L{APIDoc}
        @rtype: C{None}
        """
        if self._checks & DocChecker.MODULE:
            self._check_basic(doc)
        
    def _check_class(self, doc):
        """
        Run checks on the class whose APIDoc is C{doc}.
        
        @param doc: The APIDoc of the class to check.
        @type doc: L{APIDoc}
        @rtype: C{None}
        """
        if self._checks & DocChecker.CLASS:
            self._check_basic(doc)

    def _check_property(self, doc):
        if self._checks & DocChecker.PROPERTY:
            self._check_basic(doc)

    def _check_var(self, doc):
        """
        Run checks on the variable whose documentation is C{var} and
        whose name is C{name}.
        
        @param doc: The documentation for the variable to check.
        @type doc: L{Doc}
        @param check_type: Whether or not the variable's type should
            be checked.  This is used to allow varargs and keyword
            parameters to have no type specified.
        @rtype: C{None}
        """
        if self._checks & DocChecker.VAR:
            if (self._checks & (DocChecker.DESCR|DocChecker.TYPE) and
                doc.descr in (None, UNKNOWN) and
                doc.type_descr in (None, UNKNOWN) and
                doc.docstring in (None, UNKNOWN)):
                self.warning('Undocumented', doc)
            else:
                if (self._checks & DocChecker.DESCR and
                    doc.descr in (None, UNKNOWN)):
                    self.warning('No description', doc)
                if (self._checks & DocChecker.TYPE and
                    doc.type_descr in (None, UNKNOWN)):
                    self.warning('No type information', doc)
            
    def _check_func(self, doc):
        """
        Run checks on the function whose APIDoc is C{doc}.
        
        @param doc: The APIDoc of the function to check.
        @type doc: L{APIDoc}
        @rtype: C{None}
        """
        name = doc.canonical_name
        if (self._checks & DocChecker.FUNC and
            doc.docstring in (None, UNKNOWN) and
            doc.canonical_name[-1] not in _NO_DOCS):
            self.warning('Undocumented', doc)
            return
        if (self._checks & DocChecker.FUNC and
            doc.canonical_name[-1] not in _NO_BASIC):
                self._check_basic(doc)
        if (self._checks & DocChecker.RETURN and
            doc.canonical_name[-1] not in _NO_RETURN):
            if (doc.return_type in (None, UNKNOWN) and
                doc.return_descr in (None, UNKNOWN)):
                self.warning('No return descr', doc)
        if (self._checks & DocChecker.PARAM and
            doc.canonical_name[-1] not in _NO_PARAM):
            if doc.arg_descrs in (None, UNKNOWN):
                self.warning('No argument info', doc)
            else:
                args_with_descr = []
                for arg, descr in doc.arg_descrs:
                    if isinstance(arg, basestring):
                        args_with_descr.append(arg)
                    else:
                        args_with_descr += arg
                for posarg in doc.posargs:
                    if (self._checks & DocChecker.DESCR and
                        posarg not in args_with_descr):
                        self.warning('Argument(s) not described', doc)
                    if (self._checks & DocChecker.TYPE and
                        posarg not in doc.arg_types):
                        self.warning('Argument type(s) not described', doc)

    def warning(self, msg, doc):
        self._warnings.setdefault(msg,set()).add(doc)
