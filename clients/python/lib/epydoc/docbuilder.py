# epydoc -- Documentation Builder
#
# Copyright (C) 2005 Edward Loper
# Author: Edward Loper <edloper@loper.org>
# URL: <http://epydoc.sf.net>
#
# $Id: docbuilder.py 1208 2006-04-10 13:22:49Z edloper $

"""
Construct data structures that encode the API documentation for Python
objects.  These data structures are created using a series of steps:

  1. B{Building docs}: Extract basic information about the objects,
     and objects that are related to them.  This can be done by
     introspecting the objects' values (with L{epydoc.docintrospecter}; or
     by parsing their source code (with L{epydoc.docparser}.

  2. B{Merging}: Combine the information obtained from introspection &
     parsing each object into a single structure.

  3. B{Linking}: Replace any 'pointers' that were created for imported
     variables by their target (if it's available).
  
  4. B{Naming}: Chose a unique 'canonical name' for each
     object.
  
  5. B{Docstring Parsing}: Parse the docstring of each object, and
     extract any pertinant information.
  
  6. B{Inheritance}: Add information about variables that classes
     inherit from their base classes.

The documentation information for each individual object is
represented using an L{APIDoc}; and the documentation for a collection
of objects is represented using a L{DocIndex}.

The main interface to C{epydoc.docbuilder} consists of two functions:

  - L{build_docs()} -- Builds documentation for a single item, and
    returns it as an L{APIDoc} object.
  - L{build_doc_index()} -- Builds documentation for a collection of
    items, and returns it as a L{DocIndex} object.

The remaining functions are used by these two main functions to
perform individual steps in the creation of the documentation.

@group Documentation Construction: build_doc, build_doc_index,
    _get_docs_from_*, _report_valdoc_progress
@group Merging: *MERGE*, *merge*
@group Linking: link_imports
@group Naming: _name_scores, _unreachable_names, assign_canonical_names,
    _var_shadows_self, _fix_self_shadowing_var, _unreachable_name_for
@group Inheritance: inherit_docs, _inherit_info
"""
__docformat__ = 'epytext en'

######################################################################
## Contents
######################################################################
## 1. build_docs() -- the main interface.
## 2. merge_docs() -- helper, used to merge parse & introspect info
## 3. link_imports() -- helper, used to connect imported vars w/ values
## 4. assign_canonical_names() -- helper, used to set canonical names
## 5. inherit_docs() -- helper, used to inherit docs from base classes

######################################################################
## Imports
######################################################################

import sys, os, os.path, __builtin__, imp
from epydoc.apidoc import *
from epydoc.docintrospecter import introspect_docs
from epydoc.docparser import parse_docs, ParseError
from epydoc.docstringparser import parse_docstring
from epydoc import log
from epydoc.util import *
from epydoc.compat import * # Backwards compatibility

######################################################################
## 1. build_docs()
######################################################################

def build_doc(item, introspect=True, parse=True, add_submodules=True):
    """
    Build API documentation for a given item, and return it as
    an L{APIDoc} object.

    @rtype: L{APIDoc}
    @param item: The item to document, specified using any of the
        following:
          - A string, naming a python package directory
            (e.g., C{'epydoc/markup'})
          - A string, naming a python file
            (e.g., C{'epydoc/docparser.py'})
          - A string, naming a python object
            (e.g., C{'epydoc.docparser.DocParser'})
          - Any (non-string) python object
            (e.g., C{list.append})
    @param introspect: If true, then use introspection to examine the
        specified items.  Otherwise, just use parsing.
    @param parse: If true, then use parsing to examine the specified
        items.  Otherwise, just use introspection.
    """
    docindex = build_doc_index(item, introspect, parse, add_submodules)
    return docindex.root[0]

def build_doc_index(items, introspect=True, parse=True,
                    add_submodules=True):
    """
    Build API documentation for the given list of items, and
    return it in the form of a L{DocIndex}.

    @rtype: L{DocIndex}
    @param items: The items to document, specified using any of the
        following:
          - A string, naming a python package directory
            (e.g., C{'epydoc/markup'})
          - A string, naming a python file
            (e.g., C{'epydoc/docparser.py'})
          - A string, naming a python object
            (e.g., C{'epydoc.docparser.DocParser'})
          - Any (non-string) python object
            (e.g., C{list.append})
    @param introspect: If true, then use introspection to examine the
        specified items.  Otherwise, just use parsing.
    @param parse: If true, then use parsing to examine the specified
        items.  Otherwise, just use introspection.
    """
    # Get the basic docs for each item.
    doc_pairs = _get_docs_from_items(items, introspect, parse, add_submodules)

    # Merge the introspection & parse docs.
    if parse and introspect:
        log.start_progress('Merging parsed & introspected information')
        docs = []
        for i, (introspect_doc, parse_doc) in enumerate(doc_pairs):
            if introspect_doc is not None and parse_doc is not None:
                if introspect_doc.canonical_name not in (None, UNKNOWN):
                    name = introspect_doc.canonical_name
                else:
                    name = parse_doc.canonical_name
                log.progress(float(i)/len(doc_pairs), name)
                docs.append(merge_docs(introspect_doc, parse_doc))
            elif introspect_doc is not None:
                docs.append(introspect_doc)
            elif parse_doc is not None:
                docs.append(parse_doc)
        log.end_progress()
    elif introspect:
        docs = [doc_pair[0] for doc_pair in doc_pairs if doc_pair[0]]
    else:
        docs = [doc_pair[1] for doc_pair in doc_pairs if doc_pair[1]]

    if len(docs) == 0:
        log.error('Nothing left to document!')
        return None

    # Collect the docs into a single index.
    docindex = DocIndex(docs)

    # Replace any proxy valuedocs that we got from importing with
    # their targets.
    if parse:
        log.start_progress('Linking imported variables')
        valdocs = docindex.reachable_valdocs(sort_by_name=True, imports=False,
                                             submodules=False, packages=False,
                                             subclasses=False)
        for i, val_doc in enumerate(valdocs):
            _report_valdoc_progress(i, val_doc, valdocs)
            link_imports(val_doc, docindex)
        log.end_progress()

    # Assign canonical names.
    log.start_progress('Indexing documentation')
    for i, val_doc in enumerate(docindex.root):
        log.progress(float(i)/len(docindex.root), val_doc.canonical_name)
        assign_canonical_names(val_doc, val_doc.canonical_name, docindex)
    log.end_progress()

    # Parse the docstrings for each object.
    log.start_progress('Parsing docstrings')
    valdocs = docindex.reachable_valdocs(sort_by_name=True, imports=False,
                                         submodules=False, packages=False,
                                         subclasses=False)
    for i, val_doc in enumerate(valdocs):
        _report_valdoc_progress(i, val_doc, valdocs)
        # the value's docstring
        parse_docstring(val_doc, docindex)
        # the value's variables' docstrings
        if (isinstance(val_doc, NamespaceDoc) and
            val_doc.variables not in (None, UNKNOWN)):
            for var_doc in val_doc.variables.values():
                parse_docstring(var_doc, docindex)
    log.end_progress()

    # Take care of inheritance.
    log.start_progress('Inheriting documentation')
    for i, val_doc in enumerate(valdocs):
        if isinstance(val_doc, ClassDoc):
            percent = float(i)/len(valdocs)
            log.progress(percent, val_doc.canonical_name)
            inherit_docs(val_doc)
    log.end_progress()

    # Initialize the groups & sortedvars attributes.
    log.start_progress('Sorting & Grouping')
    for i, val_doc in enumerate(valdocs):
        if isinstance(val_doc, NamespaceDoc):
            percent = float(i)/len(valdocs)
            log.progress(percent, val_doc.canonical_name)
            val_doc.init_sorted_variables()
            val_doc.init_variable_groups()
            if isinstance(val_doc, ModuleDoc):
                val_doc.init_submodule_groups()
    log.end_progress()

    return docindex

def _report_valdoc_progress(i, val_doc, val_docs):
    if (isinstance(val_doc, (ModuleDoc, ClassDoc)) and
        val_doc.canonical_name != UNKNOWN and
        not val_doc.canonical_name[0].startswith('??')):
        log.progress(float(i)/len(val_docs), val_doc.canonical_name)

#/////////////////////////////////////////////////////////////////
# Documentation Generation
#/////////////////////////////////////////////////////////////////

def _get_docs_from_items(items, introspect, parse, add_submodules):
    # Start the progress bar.
    log.start_progress('Building documentation')
    progress_estimator = _ProgressEstimator(items)

    # Collect (introspectdoc, parsedoc) pairs for each item.
    doc_pairs = []
    for item in items:
        if isinstance(item, basestring):
            if is_module_file(item):
                doc_pairs.append(_get_docs_from_module_file(
                    item, introspect, parse, progress_estimator))
            elif is_package_dir(item):
                pkgfile = os.path.join(item, '__init__')
                doc_pairs.append(_get_docs_from_module_file(
                    pkgfile, introspect, parse, progress_estimator))
            elif os.path.isfile(item):
                doc_pairs.append(_get_docs_from_pyscript(
                    item, introspect, parse, progress_estimator))
            elif hasattr(__builtin__, item):
                val = getattr(__builtin__, item)
                doc_pairs.append(_get_docs_from_pyobject(
                    val, introspect, parse, progress_estimator))
            elif is_pyname(item):
                doc_pairs.append(_get_docs_from_pyname(
                    item, introspect, parse, progress_estimator))
            elif os.path.isdir(item):
                log.error("Directory %r is not a package" % item)
            elif os.path.isfile(item):
                log.error("File %s is not a Python module" % item)
            else:
                log.error("Could not find a file or object named %s" %
                          item)
        else:
            doc_pairs.append(_get_docs_from_pyobject(
                item, introspect, parse, progress_estimator))

        # This will only have an effect if doc_pairs[-1] contains a
        # package's docs.  The 'not is_module_file(item)' prevents
        # us from adding subdirectories if they explicitly specify
        # a package's __init__.py file.
        if add_submodules and not is_module_file(item):
            doc_pairs += _get_docs_from_submodules(
                item, doc_pairs[-1], introspect, parse, progress_estimator)

    log.end_progress()
    return doc_pairs

def _get_docs_from_pyobject(obj, introspect, parse, progress_estimator):
    progress_estimator.complete += 1
    log.progress(progress_estimator.progress(), `obj`)
    
    if not introspect:
        log.error("Cannot get docs for Python objects without "
                  "introspecting them.")
            
    introspect_doc = parse_doc = None
    introspect_error = parse_error = None
    try:
        introspect_doc = introspect_docs(value=obj)
    except ImportError, e:
        log.error(e)
        return (None, None)
    if parse:
        if introspect_doc.canonical_name is not None:
            _, parse_docs = _get_docs_from_pyname(
                str(introspect_doc.canonical_name), False, True,
                progress_estimator, supress_warnings=True)
    return (introspect_doc, parse_doc)

def _get_docs_from_pyname(name, introspect, parse, progress_estimator,
                          supress_warnings=False):
    progress_estimator.complete += 1
    log.progress(progress_estimator.progress(), name)
    
    introspect_doc = parse_doc = None
    introspect_error = parse_error = None
    if introspect:
        try:
            introspect_doc = introspect_docs(name=name)
        except ImportError, e:
            introspect_error = str(e)
    if parse:
        try:
            parse_doc = parse_docs(name=name)
        except ParseError, e:
            parse_error = str(e)
        except ImportError, e:
            # If we get here, then there' probably no python source
            # available; don't bother to generate a warnining.
            pass
        
    # Report any errors we encountered.
    if not supress_warnings:
        _report_errors(name, introspect_doc, parse_doc,
                       introspect_error, parse_error)

    # Return the docs we found.
    return (introspect_doc, parse_doc)

def _get_docs_from_pyscript(filename, introspect, parse, progress_estimator):
    # [xx] I should be careful about what names I allow as filenames,
    # and maybe do some munging to prevent problems.

    introspect_doc = parse_doc = None
    introspect_error = parse_error = None
    if introspect:
        try:
            introspect_doc = introspect_docs(filename=filename, is_script=True)
        except ImportError, e:
            introspect_error = str(e)
    if parse:
        try:
            parse_doc = parse_docs(filename=filename, is_script=True)
        except ParseError, e:
            parse_error = str(e)
        except ImportError, e:
            parse_error = str(e)
                
    # Report any errors we encountered.
    _report_errors(filename, introspect_doc, parse_doc,
                   introspect_error, parse_error)

    # Return the docs we found.
    return (introspect_doc, parse_doc)
    
def _get_docs_from_module_file(filename, introspect, parse, progress_estimator,
                               parent_docs=(None,None)):
    """
    Construct and return the API documentation for the python
    module with the given filename.

    @param parent_doc: The C{ModuleDoc} of the containing package.
        If C{parent_doc} is not provided, then this method will
        check if the given filename is contained in a package; and
        if so, it will construct a stub C{ModuleDoc} for the
        containing package(s).
    """
    # Record our progress.
    modulename = os.path.splitext(os.path.split(filename)[1])[0]
    if modulename == '__init__':
        modulename = os.path.split(os.path.split(filename)[0])[1]
    if parent_docs[0]:
        modulename = DottedName(parent_docs[0].canonical_name, modulename)
    elif parent_docs[1]:
        modulename = DottedName(parent_docs[1].canonical_name, modulename)
    log.progress(progress_estimator.progress(),
                 '%s (%s)' % (modulename, filename))
    progress_estimator.complete += 1
    
    # Normalize the filename.
    filename = os.path.normpath(os.path.abspath(filename))

    # When possible, use the source version of the file.
    try:
        filename = py_src_filename(filename)
        src_file_available = True
    except ValueError:
        src_file_available = False

    # Get the introspected & parsed docs (as appropriate)
    introspect_doc = parse_doc = None
    introspect_error = parse_error = None
    if introspect:
        try:
            introspect_doc = introspect_docs(
                filename=filename, context=parent_docs[0])
        except ImportError, e:
            introspect_error = str(e)
    if parse and src_file_available:
        try:
            parse_doc = parse_docs(
                filename=filename, context=parent_docs[1])
        except ParseError, e:
            parse_error = str(e)
        except ImportError, e:
            parse_error = str(e)

    # Report any errors we encountered.
    _report_errors(filename, introspect_doc, parse_doc,
                   introspect_error, parse_error)

    # Return the docs we found.
    return (introspect_doc, parse_doc)

def _get_docs_from_submodules(item, pkg_docs, introspect, parse,
                              progress_estimator):
    # Extract the package's __path__.
    if isinstance(pkg_docs[0], ModuleDoc) and pkg_docs[0].is_package:
        pkg_path = pkg_docs[0].path
        package_dir = os.path.split(pkg_docs[0].filename)[0]
    elif isinstance(pkg_docs[1], ModuleDoc) and pkg_docs[1].is_package:
        pkg_path = pkg_docs[1].path
        package_dir = os.path.split(pkg_docs[1].filename)[0]
    else:
        return []

    module_filenames = {}
    subpackage_dirs = set()
    for subdir in pkg_path:
        if os.path.isdir(subdir):
            for name in os.listdir(subdir):
                filename = os.path.join(subdir, name)
                # Is it a valid module filename?
                if is_module_file(filename):
                    basename = os.path.splitext(filename)[0]
                    if os.path.split(basename)[1] != '__init__':
                        module_filenames[basename] = filename
                # Is it a valid package filename?
                if is_package_dir(filename):
                    subpackage_dirs.add(filename)

    # Update our estimate of the number of modules in this package.
    progress_estimator.revise_estimate(item, module_filenames.items(),
                                       subpackage_dirs)

    docs = [pkg_docs]
    for module_filename in module_filenames.values():
        d = _get_docs_from_module_file(
            module_filename, introspect, parse, progress_estimator, pkg_docs)
        docs.append(d)
    for subpackage_dir in subpackage_dirs:
        subpackage_file = os.path.join(subpackage_dir, '__init__')
        docs.append(_get_docs_from_module_file(
            subpackage_file, introspect, parse, progress_estimator, pkg_docs))
        docs += _get_docs_from_submodules(
            subpackage_dir, docs[-1], introspect, parse, progress_estimator)
    return docs

def _report_errors(name, introspect_doc, parse_doc,
                   introspect_error, parse_error):
    hdr = 'In %s:\n' % name
    if introspect_doc == parse_doc == None:
        log.start_block('%sNo documentation available!' % hdr)
        if introspect_error:
            log.error('Import failed:\n%s' % introspect_error)
        if parse_error:
            log.error('Source code parsing failed:\n%s' % parse_error)
        log.end_block()
    elif introspect_error:
        log.start_block('%sImport failed (but source code parsing '
                        'was successful).' % hdr)
        log.error(introspect_error)
        log.end_block()
    elif parse_error:
        log.start_block('%sSource code parsing failed (but '
                        'introspection was successful).' % hdr)
        log.error(parse_error)
        log.end_block()


#/////////////////////////////////////////////////////////////////
# Progress Estimation (for Documentation Generation)
#/////////////////////////////////////////////////////////////////

class _ProgressEstimator:
    """
    Used to keep track of progress when generating the initial docs
    for the given items.  (It is not known in advance how many items a
    package directory will contain, since it might depend on those
    packages' __path__ values.)
    """
    def __init__(self, items):
        self.est_totals = {}
        self.complete = 0
        
        for item in items:
            if is_package_dir(item):
                self.est_totals[item] = self._est_pkg_modules(item)
            else:
                self.est_totals[item] = 1

    def progress(self):
        total = sum(self.est_totals.values())
        return float(self.complete) / total

    def revise_estimate(self, pkg_item, modules, subpackages):
        del self.est_totals[pkg_item]
        for item in modules:
            self.est_totals[item] = 1
        for item in subpackages:
            self.est_totals[item] = self._est_pkg_modules(item)

    def _est_pkg_modules(self, package_dir):
        num_items = 0
        
        if is_package_dir(package_dir):
            for name in os.listdir(package_dir):
                filename = os.path.join(package_dir, name)
                if is_module_file(filename):
                    num_items += 1
                elif is_package_dir(filename):
                    num_items += self._est_pkg_modules(filename)
                    
        return num_items
        
######################################################################
## Doc Merger
######################################################################

MERGE_PRECEDENCE = {
    'repr': 'parse',

    # Why?
    'canonical_name': 'introspect',

    # The parser can tell if a variable is imported or not; the
    # introspector must guess.
    'is_imported': 'parse',

    # The parser can tell if an assignment creates an alias or not.
    'is_alias': 'parse',

    # Why?
    'docformat': 'parse',

    # The parse should be able to tell definitively whether a module
    # is a package or not.
    'is_package': 'parse',

    # Extract the sort spec from the order in which values are defined
    # in the source file.
    'sort_spec': 'parse',
    
    'submodules': 'introspect',

    # The filename used by 'parse' is the source file.
    'filename': 'parse',

    # 'parse' is more likely to get the encoding right, but
    # 'introspect' will handle programatically generated docstrings.
    # Which is better?
    'docstring': 'introspect',
    }
"""Indicates whether information from introspection or parsing should be
given precedence, for specific attributes.  This dictionary maps from
attribute names to either C{'introspect'} or C{'parse'}."""

DEFAULT_MERGE_PRECEDENCE = 'introspect'
"""Indicates whether information from introspection or parsing should be
given precedence.  Should be either C{'introspect'} or C{'parse'}"""

_attribute_mergefunc_registry = {}
def register_attribute_mergefunc(attrib, mergefunc):
    """
    Register an attribute merge function.  This function will be
    called by L{merge_docs()} when it needs to merge the attribute
    values of two C{APIDoc}s.

    @param attrib: The name of the attribute whose values are merged
    by C{mergefunc}.

    @param mergefun: The merge function, whose sinature is:

    >>> def mergefunc(introspect_val, parse_val, precedence, cyclecheck, path):
    ...     return calculate_merged_value(introspect_val, parse_val)

    Where C{introspect_val} and C{parse_val} are the two values to
    combine; C{precedence} is a string indicating which value takes
    precedence for this attribute (C{'introspect'} or C{'parse'});
    C{cyclecheck} is a value used by C{merge_docs()} to make sure that
    it only visits each pair of docs once; and C{path} is a string
    describing the path that was taken from the root to this
    attribute (used to generate log messages).

    If the merge function needs to call C{merge_docs}, then it should
    pass C{cyclecheck} and C{path} back in.  (When appropriate, a
    suffix should be added to C{path} to describe the path taken to
    the merged values.)
    """
    _attribute_mergefunc_registry[attrib] = mergefunc

def merge_docs(introspect_doc, parse_doc, cyclecheck=None, path=None):
    """
    Merge the API documentation information that was obtained from
    introspection with information that was obtained from parsing.
    C{introspect_doc} and C{parse_doc} should be two C{APIDoc} instances
    that describe the same object.  C{merge_docs} combines the
    information from these two instances, and returns the merged
    C{APIDoc}.

    If C{introspect_doc} and C{parse_doc} are compatible, then they will
    be I{merged} -- i.e., they will be coerced to a common class, and
    their state will be stored in a shared dictionary.  Once they have
    been merged, any change made to the attributes of one will affect
    the other.  The value for the each of the merged C{APIDoc}'s
    attributes is formed by combining the values of the source
    C{APIDoc}s' attributes, as follows:

      - If either of the source attributes' value is C{UNKNOWN}, then
        use the other source attribute's value.
      - Otherwise, if an attribute merge function has been registered
        for the attribute, then use that function to calculate the
        merged value from the two source attribute values.
      - Otherwise, if L{MERGE_PRECEDENCE} is defined for the
        attribute, then use the attribute value from the source that
        it indicates.
      - Otherwise, use the attribute value from the source indicated
        by L{DEFAULT_MERGE_PRECEDENCE}.

    If C{introspect_doc} and C{parse_doc} are I{not} compatible (e.g., if
    their values have incompatible types), then C{merge_docs()} will
    simply return either C{introspect_doc} or C{parse_doc}, depending on
    the value of L{DEFAULT_MERGE_PRECEDENCE}.  The two input
    C{APIDoc}s will not be merged or modified in any way.

    @param cyclecheck, path: These arguments should only be provided
        when C{merge_docs()} is called by an attribute merge
        function.  See L{register_attribute_mergefunc()} for more
        details.
    """
    assert isinstance(introspect_doc, APIDoc)
    assert isinstance(parse_doc, APIDoc)

    if cyclecheck is None:
        cyclecheck = set()
        if introspect_doc.canonical_name not in (None, UNKNOWN):
            path = '%s' % introspect_doc.canonical_name
        elif parse_doc.canonical_name not in (None, UNKNOWN):
            path = '%s' % parse_doc.canonical_name
        else:
            path = '??'

    # If we've already examined this pair, then there's nothing
    # more to do.  The reason that we check id's here is that we
    # want to avoid hashing the APIDoc objects for now, so we can
    # use APIDoc.merge_and_overwrite() later.
    if (id(introspect_doc), id(parse_doc)) in cyclecheck:
        return introspect_doc
    cyclecheck.add( (id(introspect_doc), id(parse_doc)) )

    # If these two are already merged, then we're done.  (Two
    # APIDoc's compare equal iff they are identical or have been
    # merged.)
    if introspect_doc == parse_doc:
        return introspect_doc

    # If both values are GenericValueDoc, then we don't want to merge
    # them.  E.g., we don't want to merge 2+2 with 4.  So just copy
    # the inspect_doc's pyval to the parse_doc, and return the parse_doc.
    if type(introspect_doc) == type(parse_doc) == GenericValueDoc:
        parse_doc.pyval = introspect_doc.pyval
        parse_doc.docs_extracted_by = 'both'
        return parse_doc

    # Perform several sanity checks here -- if we accidentally
    # merge values that shouldn't get merged, then bad things can
    # happen.
    mismatch = None
    if (introspect_doc.__class__ != parse_doc.__class__ and
        not (issubclass(introspect_doc.__class__, parse_doc.__class__) or
             issubclass(parse_doc.__class__, introspect_doc.__class__))):
        mismatch = ("value types don't match -- i=%r, p=%r." %
                    (introspect_doc.__class__, parse_doc.__class__))
    if (isinstance(introspect_doc, ValueDoc) and
        isinstance(parse_doc, ValueDoc)):
        if (introspect_doc.pyval is not UNKNOWN and
            parse_doc.pyval is not UNKNOWN and
            introspect_doc.pyval is not parse_doc.pyval):
            mismatch = "values don't match."
        elif (introspect_doc.canonical_name not in (None, UNKNOWN) and
            parse_doc.canonical_name not in (None, UNKNOWN) and
            introspect_doc.canonical_name != parse_doc.canonical_name):
            mismatch = "canonical names don't match."
    if mismatch is not None:
        log.info("Not merging the parsed & introspected values of %s, "
                 "since their %s" % (path, mismatch))
        if DEFAULT_MERGE_PRECEDENCE == 'introspect':
            return introspect_doc
        else:
            return parse_doc

    # If one apidoc's class is a superclass of the other's, then
    # specialize it to the more specific class.
    if introspect_doc.__class__ is not parse_doc.__class__:
        if issubclass(introspect_doc.__class__, parse_doc.__class__):
            parse_doc.specialize_to(introspect_doc.__class__)
        if issubclass(parse_doc.__class__, introspect_doc.__class__):
            introspect_doc.specialize_to(parse_doc.__class__)
    assert introspect_doc.__class__ is parse_doc.__class__

    # The posargs and defaults are tied together -- if we merge
    # the posargs one way, then we need to merge the defaults the
    # same way.  So check them first.  (This is a minor hack)
    if (isinstance(introspect_doc, RoutineDoc) and
        isinstance(parse_doc, RoutineDoc)):
        _merge_posargs_and_defaults(introspect_doc, parse_doc, path)
    
    # Merge the two api_doc's attributes.
    for attrib in set(introspect_doc.__dict__.keys() +
                      parse_doc.__dict__.keys()):
        # Be sure not to merge any private attributes (especially
        # __mergeset or __has_been_hashed!)
        if attrib.startswith('_'): continue
        merge_attribute(attrib, introspect_doc, parse_doc,
                             cyclecheck, path)

    # Set the dictionaries to be shared.
    return introspect_doc.merge_and_overwrite(parse_doc)

def _merge_posargs_and_defaults(introspect_doc, parse_doc, path):
    # If either is unknown, then let merge_attrib handle it.
    if introspect_doc.posargs == UNKNOWN or parse_doc.posargs == UNKNOWN:
        return 
        
    # If the introspected doc just has '...', then trust the parsed doc.
    if introspect_doc.posargs == ['...'] and parse_doc.posargs != ['...']:
        introspect_doc.posargs = parse_doc.posargs
        introspect_doc.posarg_defaults = parse_doc.posarg_defaults

    # If they are incompatible, then check the precedence.
    elif introspect_doc.posargs != parse_doc.posargs:
        log.info("Not merging the parsed & introspected arg "
                 "lists for %s, since they don't match (%s vs %s)"
                  % (path, introspect_doc.posargs, parse_doc.posargs))
        if (MERGE_PRECEDENCE.get('posargs', DEFAULT_MERGE_PRECEDENCE) ==
            'introspect'):
            parse_doc.posargs = introspect_doc.posargs
            parse_doc.posarg_defaults = introspect_doc.posarg_defaults
        else:
            introspect_doc.posargs = parse_doc.posargs
            introspect_doc.posarg_defaults = parse_doc.posarg_defaults

def merge_attribute(attrib, introspect_doc, parse_doc, cyclecheck, path):
    precedence = MERGE_PRECEDENCE.get(attrib, DEFAULT_MERGE_PRECEDENCE)
    if precedence not in ('parse', 'introspect'):
        raise ValueError('Bad precedence value %r' % precedence)
    
    if (getattr(introspect_doc, attrib) is UNKNOWN and
        getattr(parse_doc, attrib) is not UNKNOWN):
        setattr(introspect_doc, attrib, getattr(parse_doc, attrib))
    elif (getattr(introspect_doc, attrib) is not UNKNOWN and
          getattr(parse_doc, attrib) is UNKNOWN):
        setattr(parse_doc, attrib, getattr(introspect_doc, attrib))
    elif (getattr(introspect_doc, attrib) is UNKNOWN and
          getattr(parse_doc, attrib) is UNKNOWN):
        pass
    else:
        # Both APIDoc objects have values; we need to merge them.
        introspect_val = getattr(introspect_doc, attrib)
        parse_val = getattr(parse_doc, attrib)
        if attrib in _attribute_mergefunc_registry:
            handler = _attribute_mergefunc_registry[attrib]
            merged_val = handler(introspect_val, parse_val, precedence,
                                 cyclecheck, path)
        elif precedence == 'introspect':
            merged_val = introspect_val
        elif precedence == 'parse':
            merged_val = parse_val

        setattr(introspect_doc, attrib, merged_val)
        setattr(parse_doc, attrib, merged_val)

def merge_variables(varlist1, varlist2, precedence, cyclecheck, path):
    # Merge all variables that are in both sets.
    for varname, var1 in varlist1.items():
        var2 = varlist2.get(varname)
        if var2 is not None:
            var = merge_docs(var1, var2, cyclecheck, path+'.'+varname)
            varlist1[varname] = var
            varlist2[varname] = var

    # Copy any variables that are not in varlist1 over.
    for varname, var in varlist2.items():
        varlist1.setdefault(varname, var)

    return varlist1

def merge_value(value1, value2, precedence, cyclecheck, path):
    assert value1 is not None and value2 is not None
    return merge_docs(value1, value2, cyclecheck, path)

# [xx] are these really necessary or useful??
def merge_package(v1, v2, precedence, cyclecheck, path):
    if v1 is None or v2 is None:
        if precedence == 'introspect': return v1
        else: return v2
    return merge_value(v1, v2, precedence, cyclecheck, path+'.<package>')
def merge_container(v1, v2, precedence, cyclecheck, path):
    if v1 is None or v2 is None:
        if precedence == 'introspect': return v1
        else: return v2
    return merge_value(v1, v2, precedence, cyclecheck, path+'.<container>')
def merge_overrides(v1, v2, precedence, cyclecheck, path):
    return merge_value(v1, v2, precedence, cyclecheck, path+'.<overrides>')
def merge_fget(v1, v2, precedence, cyclecheck, path):
    return merge_value(v1, v2, precedence, cyclecheck, path+'.fget')
def merge_fset(v1, v2, precedence, cyclecheck, path):
    return merge_value(v1, v2, precedence, cyclecheck, path+'.fset')
def merge_fdel(v1, v2, precedence, cyclecheck, path):
    return merge_value(v1, v2, precedence, cyclecheck, path+'.fdel')

def merge_proxy_for(v1, v2, precedence, cyclecheck, path):
    # Anything we got from introspection shouldn't have a proxy_for
    # attribute -- it should be the actual object's documentation.
    return v1

def merge_bases(baselist1, baselist2, precedence, cyclecheck, path):
    # Be careful here -- if we get it wrong, then we could end up
    # merging two unrelated classes, which could lead to bad
    # things (e.g., a class that's its own subclass).  So only
    # merge two bases if we're quite sure they're the same class.
    # (In particular, if they have the same canonical name.)

    # If the lengths don't match up, then give up.  This is most
    # often caused by __metaclass__.
    if len(baselist1) != len(baselist2):
        log.info("Not merging the introspected & parsed base lists "
                 "for %s, since their lengths don't match (%s vs %s)" %
                 (path, len(baselist1), len(baselist2)))
        if precedence == 'introspect': return baselist1
        else: return baselist2

    # If any names disagree, then give up.
    for base1, base2 in zip(baselist1, baselist2):
        if ((base1.canonical_name not in (None, UNKNOWN) and
             base2.canonical_name not in (None, UNKNOWN)) and
            base1.canonical_name != base2.canonical_name):
            log.info("Not merging the parsed & introspected base "
                     "lists for %s, since the bases' names don't match "
                     "(%s vs %s)" % (path, base1.canonical_name,
                                     base2.canonical_name))
            if precedence == 'introspect': return baselist1
            else: return baselist2

    for i, (base1, base2) in enumerate(zip(baselist1, baselist2)):
        base = merge_docs(base1, base2, cyclecheck,
                           '%s.__bases__[%d]' % (path, i))
        baselist1[i] = baselist2[i] = base

    return baselist1

def merge_posarg_defaults(defaults1, defaults2, precedence, cyclecheck, path):
    if len(defaults1) != len(defaults2):
        if precedence == 'introspect': return defaults1
        else: return defaults2
    defaults = []
    for i, (d1, d2) in enumerate(zip(defaults1, defaults2)):
        if d1 is not None and d2 is not None:
            d_path = '%s.<default-arg-val>[%d]' % (path, i)
            defaults.append(merge_docs(d1, d2, cyclecheck, d_path))
        elif precedence == 'introspect':
            defaults.append(d1)
        else:
            defaults.append(d2)
    return defaults

def merge_docstring(docstring1, docstring2, precedence, cyclecheck, path):
    if docstring1 in (None, UNKNOWN) or precedence=='parse':
        return docstring2
    else:
        return docstring1

def merge_docs_extracted_by(v1, v2, precedence, cyclecheck, path):
    return 'both'

register_attribute_mergefunc('variables', merge_variables)
register_attribute_mergefunc('value', merge_value)
# [xx] are these useful/necessary?
#register_attribute_mergefunc('package', merge_package)
#register_attribute_mergefunc('container', merge_container)
register_attribute_mergefunc('overrides', merge_overrides)
register_attribute_mergefunc('fget', merge_fget)
register_attribute_mergefunc('fset', merge_fset)
register_attribute_mergefunc('fdel', merge_fdel)
register_attribute_mergefunc('proxy_for', merge_proxy_for)
register_attribute_mergefunc('bases', merge_bases)
register_attribute_mergefunc('posarg_defaults', merge_posarg_defaults)
register_attribute_mergefunc('docstring', merge_docstring)
register_attribute_mergefunc('docs_extracted_by', merge_docs_extracted_by)

######################################################################
## Import Linking
######################################################################

def link_imports(val_doc, docindex):
    # Check if the ValueDoc has an unresolved proxy_for link.
    # If so, then resolve it.
    while val_doc.proxy_for not in (UNKNOWN, None):
        # Find the valuedoc that the proxy_for name points to.
        src_doc = docindex.get_valdoc(val_doc.proxy_for)

        # If we don't have any valuedoc at that address, then
        # set that address as its canonical name.
        # [XXX] Do I really want to do this?
        if src_doc is None:
            val_doc.canonical_name = val_doc.proxy_for
            return

        # If we *do* have something at that address, then
        # merge the proxy `val_doc` with it.
        elif src_doc != val_doc:
            # Copy any subclass information from val_doc->src_doc.
            if (isinstance(val_doc, ClassDoc) and
                isinstance(src_doc, ClassDoc)):
                for subclass in val_doc.subclasses:
                    if subclass not in src_doc.subclasses:
                        src_doc.subclasses.append(subclass)
            # Then overwrite val_doc with the contents of src_doc.
            src_doc.merge_and_overwrite(val_doc, ignore_hash_conflict=True)

        # If the proxy_for link points back at src_doc
        # itself, then we most likely have a variable that's
        # shadowing a submodule that it should be equal to.
        # So just get rid of the variable.
        elif src_doc == val_doc:
            parent_name = val_doc.proxy_for[:-1]
            var_name = val_doc.proxy_for[-1]
            parent = docindex.get_valdoc(parent_name)
            if parent is not None and var_name in parent.variables:
                del parent.variables[var_name]
            src_doc.proxy_for = None

######################################################################
## Canonical Name Assignment
######################################################################

_name_scores = {}
"""A dictionary mapping from each C{ValueDoc} to the score that has
been assigned to its current cannonical name.  If
L{assign_canonical_names()} finds a canonical name with a better
score, then it will replace the old name."""

_unreachable_names = set(DottedName(DottedName.UNREACHABLE))
"""The set of names that have been used for unreachable objects.  This
is used to ensure there are no duplicate cannonical names assigned."""

def assign_canonical_names(val_doc, name, docindex, score=0):
    """
    Assign a canonical name to C{val_doc} (if it doesn't have one
    already), and (recursively) to each variable in C{val_doc}.
    In particular, C{val_doc} will be assigned the canonical name
    C{name} iff either:
      - C{val_doc}'s canonical name is C{UNKNOWN}; or
      - C{val_doc}'s current canonical name was assigned by this
        method; but the score of the new name (C{score}) is higher
        than the score of the current name (C{score_dict[val_doc]}).
        
    Note that canonical names will even be assigned to values
    like integers and C{None}; but these should be harmless.
    """
    # If we've already visited this node, and our new score
    # doesn't beat our old score, then there's nothing more to do.
    # Note that since score increases strictly monotonically, this
    # also prevents us from going in cycles.
    if val_doc in _name_scores and score <= _name_scores[val_doc]:
        return

    # Update val_doc's canonical name, if appropriate.
    if (val_doc not in _name_scores and
        val_doc.canonical_name is not UNKNOWN):
        # If this is the fist time we've seen val_doc, and it
        # already has a name, then don't change that name.
        _name_scores[val_doc] = sys.maxint
        name = val_doc.canonical_name
        score = 0
    else:
        # Otherwise, update the name iff the new score is better
        # than the old one.
        if (val_doc not in _name_scores or
            score > _name_scores[val_doc]):
            val_doc.canonical_name = name
            _name_scores[val_doc] = score

    # Recurse to any contained values.
    if isinstance(val_doc, NamespaceDoc):
        for var_doc in val_doc.variables.values():
            if var_doc.value is UNKNOWN: continue
            varname = DottedName(name, var_doc.name)
    
            # This check is for cases like curses.wrapper, where an
            # imported variable shadows its value's "real" location.
            if _var_shadows_self(var_doc, varname):
                _fix_self_shadowing_var(var_doc, varname, docindex)
    
            # Find the score for this new name.            
            vardoc_score = score-1
            if var_doc.is_imported is UNKNOWN: vardoc_score -= 10
            elif var_doc.is_imported: vardoc_score -= 100
            if var_doc.is_alias is UNKNOWN: vardoc_score -= 10
            elif var_doc.is_alias: vardoc_score -= 1000
            
            assign_canonical_names(var_doc.value, varname,
                                   docindex, vardoc_score)

    # Recurse to any directly reachable values.
    for val_doc_2 in val_doc.apidoc_links(variables=False):
        val_name, val_score = _unreachable_name_for(val_doc_2, docindex)
        assign_canonical_names(val_doc_2, val_name, docindex, val_score)

def _var_shadows_self(var_doc, varname):
    return (var_doc.value not in (None, UNKNOWN) and
            var_doc.value.canonical_name not in (None, UNKNOWN) and
            var_doc.value.canonical_name != varname and
            varname.dominates(var_doc.value.canonical_name))

def _fix_self_shadowing_var(var_doc, varname, docindex):
    # If possible, find another name for the shadowed value.
    cname = var_doc.value.canonical_name
    for i in range(1, len(cname)-1):
        new_name = cname[:i] + (cname[i]+"'") + cname[i+1:]
        val_doc = docindex.get_valdoc(new_name)
        if val_doc is not None:
            log.warning("%s shadows its own value -- using %s instead" %
                     (varname, new_name))
            var_doc.value = val_doc
            return

    # If we couldn't find the actual value, then at least
    # invalidate the canonical name.
    log.warning('%s shadows itself' % varname)
    del var_doc.value.canonical_name

def _unreachable_name_for(val_doc, docindex):
    assert isinstance(val_doc, ValueDoc)
    
    # [xx] (when) does this help?
    if (isinstance(val_doc, ModuleDoc) and
        len(val_doc.canonical_name)==1 and val_doc.package is None):
        for root_val in docindex.root:
            if root_val.canonical_name == val_doc.canonical_name:
                if root_val != val_doc: 
                    log.error("Name conflict: %r vs %r" %
                              (val_doc, root_val))
                break
        else:
            return val_doc.canonical_name, -1000

    # Assign it an 'unreachable' name:
    if (val_doc.pyval is not UNKNOWN and
          hasattr(val_doc.pyval, '__name__')):
        try:
            name = DottedName(DottedName.UNREACHABLE,
                              val_doc.pyval.__name__)
        except DottedName.InvalidDottedName:
            name = DottedName(DottedName.UNREACHABLE)
    else:
        name = DottedName(DottedName.UNREACHABLE)

    # Uniquify the name.
    if name in _unreachable_names:
        n = 2
        while DottedName('%s-%s' % (name,n)) in _unreachable_names:
            n += 1
        name = DottedName('%s-%s' % (name,n))
    _unreachable_names.add(name)
    
    return name, -10000

######################################################################
## Documentation Inheritance
######################################################################

def inherit_docs(class_doc):
    for base_class in list(class_doc.mro(warn_about_bad_bases=True)):
        if base_class == class_doc: continue

        # Inherit any groups.  Place them *after* this class's groups,
        # so that any groups that are important to this class come
        # first.
        if base_class.group_specs not in (None, UNKNOWN):
            class_doc.group_specs += [gs for gs in base_class.group_specs
                                      if gs not in class_doc.group_specs]

        # Inherit any variables.
        if base_class.variables is UNKNOWN: continue
        for name, var_doc in base_class.variables.items():
            # If it's a __private variable, then don't inherit it.
            if name.startswith('__') and not name.endswith('__'):
                continue
            
            # Inhetit only from the defining class. Or else, in case of
            # multiple inheritance, we may import from a grand-ancestor
            # variables overridden by a class that follows in mro.
            if base_class != var_doc.container:
                continue
            
            # If class_doc doesn't have a variable with this name,
            # then inherit it.
            if name not in class_doc.variables:
                class_doc.variables[name] = var_doc

            # Otherwise, class_doc already contains a variable
            # that shadows var_doc.  But if class_doc's var is
            # local, then record the fact that it overrides
            # var_doc.
            elif (class_doc.variables[name].container==class_doc and
                  class_doc.variables[name].overrides==UNKNOWN):
                class_doc.variables[name].overrides = var_doc
                _inherit_info(class_doc.variables[name])

_INHERITED_ATTRIBS = [
    'descr', 'summary', 'metadata', 'extra_docstring_fields',
    'type_descr', 'arg_descrs', 'arg_types', 'return_descr',
    'return_type', 'exception_descrs']

def _inherit_info(var_doc):
    """
    Copy any relevant documentation information from the variable that
    C{var_doc} overrides into C{var_doc} itself.
    """
    # If the new variable has a docstring, then don't inherit
    # anything, even if the docstring is blank.
    if var_doc.docstring not in (None, UNKNOWN):
        return
    
    src_var = var_doc.overrides
    src_val = var_doc.overrides.value
    val_doc = var_doc.value

    # [xx] Do I want a check like this:?
#     # If it's a method and the signature doesn't match well enough,
#     # then give up.
#     if (isinstance(src_val, RoutineDoc) and
#         isinstance(val_doc, RoutineDoc)):
#         if (src_val.posargs != val_doc.posargs[:len(src_val.posargs)] or
#             src_val.vararg != None and src_val.vararg != val_doc.vararg):
#             log.docstring_warning(
#                 "The signature of %s does not match the signature of the "
#                 "method it overrides (%s); not inheriting documentation." %
#                 (var_doc.canonical_name, src_var.canonical_name))
#             return

    # Inherit attributes!
    for attrib in _INHERITED_ATTRIBS:
        if (hasattr(var_doc, attrib) and hasattr(src_var, attrib) and
            getattr(src_var, attrib) not in (None, UNKNOWN)):
            setattr(var_doc, attrib, getattr(src_var, attrib))
        elif (src_val is not None and
              hasattr(val_doc, attrib) and hasattr(src_val, attrib) and
              getattr(src_val, attrib) not in (None, UNKNOWN) and
              getattr(val_doc, attrib) in (None, UNKNOWN)):
            setattr(val_doc, attrib, getattr(src_val, attrib))
