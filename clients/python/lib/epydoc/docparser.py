# epydoc -- Source code parsing
#
# Copyright (C) 2005 Edward Loper
# Author: Edward Loper <edloper@loper.org>
# URL: <http://epydoc.sf.net>
#
# $Id: docparser.py 1168 2006-04-05 16:52:56Z edloper $

"""
Extract API documentation about python objects by parsing their source
code.

L{DocParser} is a processing class that reads the Python source code
for one or more modules, and uses it to create L{APIDoc} objects
containing the API documentation for the variables and values defined
in those modules.

C{DocParser} can be subclassed to extend the set of source code
constructions that it supports.
"""
__docformat__ = 'epytext en'

######################################################################
## Imports
######################################################################

# Python source code parsing:
import token, tokenize
# Finding modules:
import imp
# File services:
import os, os.path
# Unicode:
import codecs
# API documentation encoding:
from epydoc.apidoc import *
# For looking up the docs of builtins:
import __builtin__, exceptions
import epydoc.docintrospecter 
# Misc utility functions:
from epydoc.util import *
# Backwards compatibility
from epydoc.compat import *

######################################################################
## Doc Parser
######################################################################

class ParseError(Exception):
    """
    An exception that is used to signify that C{docparser} encountered
    syntactically invalid Python code while processing a Python source
    file.
    """

_moduledoc_cache = {}
"""A cache of C{ModuleDoc}s that we've already created.
C{_moduledoc_cache} is a dictionary mapping from filenames to
C{ValueDoc} objects.
@type: C{dict}"""

# [xx] outdated:
"""    
An API documentation extractor based on source code parsing.
C{DocParser} reads and parses the Python source code for one or
more modules, and uses it to create L{APIDoc} objects containing
the API documentation for the variables and values defined in
those modules.  The main interface method is L{parse()}, which
returns the documentation for an object with a given dotted name,
or a module with a given filename.

Currently, C{DocParser} extracts documentation from the following
source code constructions:

  - module docstring
  - import statements
  - class definition blocks
  - function definition blocks
  - assignment statements
    - simple assignment statements
    - assignment statements with multiple C{'='}s
    - assignment statements with unpacked left-hand sides
    - assignment statements that wrap a function in classmethod
      or staticmethod.
    - assignment to special variables __path__, __all__, and
      __docformat__.
  - delete statements

C{DocParser} does not yet support the following source code
constructions:

  - assignment statements that create properties

By default, C{DocParser} will expore the contents of top-level
C{try} and C{if} blocks.  If desired, C{DocParser} can also
be told to explore the contents of C{while} and C{for} blocks.

Subclassing
===========
C{DocParser} can be subclassed, to extend the set of source code
constructions that it supports.  C{DocParser} can be extended in
several different ways:

  - [XX] fill this in!

"""

#////////////////////////////////////////////////////////////
# Configuration Constants
#////////////////////////////////////////////////////////////

#{ Configuration Constants: Control Flow 
PARSE_TRY_BLOCKS = True
"""Should the contents of C{try} blocks be examined?"""
PARSE_EXCEPT_BLOCKS = True
"""Should the contents of C{except} blocks be examined?"""
PARSE_FINALLY_BLOCKS = True
"""Should the contents of C{finally} blocks be examined?"""
PARSE_IF_BLOCKS = True
"""Should the contents of C{if} blocks be examined?"""
PARSE_ELSE_BLOCKS = True
"""Should the contents of C{else} and C{elif} blocks be examined?"""
PARSE_WHILE_BLOCKS = False
"""Should the contents of C{while} blocks be examined?"""
PARSE_FOR_BLOCKS = False
"""Should the contents of C{for} blocks be examined?"""

#{ Configuration Constants: Imports
IMPORT_HANDLING = 'link'
"""What should C{docparser} do when it encounters an import
statement?
  - C{'link'}: Create variabledoc objects with imported_from pointers
    to the source object.
  - C{'parse'}: Parse the imported file, to find the actual
    documentation for the imported object.  (This will fall back
    to the 'link' behavior if the imported file can't be parsed,
    e.g., if it's a builtin.)
"""

IMPORT_STAR_HANDLING = 'parse'
"""When C{docparser} encounters a C{'from M{m} import *'}
statement, and is unable to parse C{M{m}} (either because
L{IMPORT_HANDLING}=C{'link'}, or because parsing failed), how
should it determine the list of identifiers expored by C{M{m}}?
  - C{'ignore'}: ignore the import statement, and don't create
    any new variables.
  - C{'parse'}: parse it to find a list of the identifiers that it
    exports.  (This will fall back to the 'ignore' behavior if the
    imported file can't be parsed, e.g., if it's a builtin.)
  - C{'introspect'}: import the module and introspect it (using C{dir})
    to find a list of the identifiers that it exports.  (This will
    fall back to the 'ignore' behavior if the imported file can't
    be parsed, e.g., if it's a builtin.)
"""

DEFAULT_DECORATOR_BEHAVIOR = 'opaque'
"""When C{DocParse} encounters an unknown decorator, what should
it do to the documentation of the decorated function?
  - C{'transparent'}: leave the function's documentation as-is.
  - C{'opaque'}: replace the function's documentation with an
    empty C{ValueDoc} object, reflecting the fact that we have no
    knowledge about what value the decorator returns.
"""

BASE_HANDLING = 'link'
"""What should C{docparser} do when it encounters a base class that
was imported from another module?
  - C{'link'}: Create a valuedoc with a C{proxy_for} pointer to the
    base class.
  - C{'parse'}: Parse the file containing the base class, to find
    the actual documentation for it.  (This will fall back to the
    'link' behavior if the imported file can't be parsed, e.g., if
    it's a builtin.)
"""

#{ Configuration Constants: Comment docstrings
COMMENT_DOCSTRING_MARKER = '#: '
"""The prefix used to mark comments that contain attribute
docstrings for variables."""

#{ Configuration Constants: Grouping
START_GROUP_MARKER = '#{'
"""The prefix used to mark a comment that starts a group.  This marker
should be followed (on the same line) by the name of the group.
Following a start-group comment, all variables defined at the same
indentation level will be assigned to this group name, until the
parser reaches the end of the file, a matching end-group comment, or
another start-group comment at the same indentation level.
"""

END_GROUP_MARKER = '#}'
"""The prefix used to mark a comment that ends a group.  See
L{START_GROUP_MARKER}."""

#/////////////////////////////////////////////////////////////////
#{ Module parser
#/////////////////////////////////////////////////////////////////

def parse_docs(filename=None, name=None, context=None, is_script=False):
    """
    Generate the API documentation for a specified object by
    parsing Python source files, and return it as a L{ValueDoc}.
    The object to generate documentation for may be specified
    using the C{filename} parameter I{or} the C{name} parameter.
    (It is an error to specify both a filename and a name; or to
    specify neither a filename nor a name).

    @param filename: The name of the file that contains the python
        source code for a package, module, or script.  If
        C{filename} is specified, then C{parse} will return a
        C{ModuleDoc} describing its contents.
    @param name: The fully-qualified python dotted name of any
        value (including packages, modules, classes, and
        functions).  C{DocParser} will automatically figure out
        which module(s) it needs to parse in order to find the
        documentation for the specified object.
    @param context: The API documentation for the package that
        contains C{filename}.  If no context is given, then
        C{filename} is assumed to contain a top-level module or
        package.  It is an error to specify a C{context} if the
        C{name} argument is used.
    @rtype: L{ValueDoc}
    """
    # Always introspect __builtins__ & exceptions (e.g., in case
    # they're used as base classes.)
    epydoc.docintrospecter.introspect_docs(__builtin__)
    epydoc.docintrospecter.introspect_docs(exceptions)
    
    # If our input is a python object name, then delegate to
    # _find().
    if filename is None and name is not None:
        if context:
            raise ValueError("context should only be specified together "
                             "with filename, not with name.")
        name = DottedName(name)
        val_doc = _find(name)
        if val_doc.canonical_name == UNKNOWN:
            val_doc.canonical_name = name
        return val_doc

    # If our input is a filename, then create a ModuleDoc for it,
    # and use process_file() to populate its attributes.
    elif filename is not None and name is None:
        # Use a python source version, if possible.
        if not is_script:
            try: filename = py_src_filename(filename)
            except ValueError, e: raise ImportError('%s' % e)

        # Check the cache, first.
        if _moduledoc_cache.has_key(filename):
            return _moduledoc_cache[filename]
        
        log.info("Parsing %s" % filename)

        # If the context wasn't provided, then check if the file is in
        # a package directory.  If so, then update basedir & name to
        # contain the topmost package's directory and the fully
        # qualified name for this file.  (This update assume the
        # default value of __path__ for the parent packages; if the
        # parent packages override their __path__s, then this can
        # cause us not to find the value.)
        if context is None and not is_script:
            basedir = os.path.split(filename)[0]
            name = os.path.splitext(os.path.split(filename)[1])[0]
            if name == '__init__':
                basedir, name = os.path.split(basedir)
            context = _parse_package(basedir)

        # Figure out the canonical name of the module we're parsing.
        if not is_script:
            module_name, is_pkg = _get_module_name(filename, context)
        else:
            module_name = DottedName(munge_script_name(filename))
            is_pkg = False

        # Create a new ModuleDoc for the module, & add it to the cache.
        module_doc = ModuleDoc(canonical_name=module_name, variables={},
                               sort_spec=[], imports=[],
                               filename=filename, package=context,
                               is_package=is_pkg, submodules=[],
                               docs_extracted_by='parser')
        module_doc.defining_module = module_doc
        _moduledoc_cache[filename] = module_doc

        # Set the module's __path__ to its default value.
        if is_pkg:
            module_doc.path = [os.path.split(module_doc.filename)[0]]
        
        # Add this module to the parent package's list of submodules.
        if context is not None:
            context.submodules.append(module_doc)

        # Tokenize & process the contents of the module's source file.
        try:
            process_file(module_doc)
        except tokenize.TokenError, e:
            msg, (srow, scol) = e.args
            raise ParseError('Error during parsing: %s '
                             '(%s, line %d, char %d)' %
                             (msg, module_doc.filename, srow, scol))

        # Handle any special variables (__path__, __docformat__, etc.)
        handle_special_module_vars(module_doc)

        # Return the completed ModuleDoc
        return module_doc
    else:
        raise ValueError("Expected exactly one of the following "
                         "arguments: name, filename")

def _parse_package(package_dir):
    """
    If the given directory is a package directory, then parse its
    __init__.py file (and the __init__.py files of all ancestor
    packages); and return its C{ModuleDoc}.
    """
    if not is_package_dir(package_dir):
        return None
    parent_dir = os.path.split(package_dir)[0]
    parent_doc = _parse_package(parent_dir)
    package_file = os.path.join(package_dir, '__init__')
    return parse_docs(filename=package_file, context=parent_doc)
        
# Special vars:
# C{__docformat__}, C{__all__}, and C{__path__}.
def handle_special_module_vars(module_doc):
    # If __docformat__ is defined, parse its value.
    toktree = _module_var_toktree(module_doc, '__docformat__')
    if toktree is not None:
        try: module_doc.docformat = parse_string(toktree)
        except: pass
        del module_doc.variables['__docformat__']
            
    # If __all__ is defined, parse its value.
    toktree = _module_var_toktree(module_doc, '__all__')
    if toktree is not None:
        try:
            public_names = set(parse_string_list(toktree))
            for name, var_doc in module_doc.variables.items():
                if name in public_names:
                    var_doc.is_public = True
                    if not isinstance(var_doc, ModuleDoc):
                        var_doc.is_imported = False
                else:
                    var_doc.is_public = False
        except ParseError:
            # If we couldn't parse the list, give precedence to introspection.
            for name, var_doc in module_doc.variables.items():
                if not isinstance(var_doc, ModuleDoc):
                    var_doc.is_imported = UNKNOWN
        del module_doc.variables['__all__']

    # If __path__ is defined, then extract its value (pkgs only)
    if module_doc.is_package:
        toktree = _module_var_toktree(module_doc, '__path__')
        if toktree is not None:
            try:
                module_doc.path = parse_string_list(toktree)
            except ParseError:
                pass # [xx]
            del module_doc.variables['__path__']

def _module_var_toktree(module_doc, name):
    var_doc = module_doc.variables.get(name)
    if (var_doc is None or var_doc.value in (None, UNKNOWN) or
        var_doc.value.toktree is UNKNOWN):
        return None
    else:
        return var_doc.value.toktree

#////////////////////////////////////////////////////////////
#{ Module Lookup
#////////////////////////////////////////////////////////////

def _find(name, package_doc=None):
    """
    Return the API documentaiton for the object whose name is
    C{name}.  C{package_doc}, if specified, is the API
    documentation for the package containing the named object.
    """
    # If we're inside a package, then find the package's path.
    if package_doc is None:
        path = None
    else:
        try:
            # [XXX]
            path_ast = module_doc.variables['__path__'].value.ast
            path = extract_string_list(path_ast)
        except:
            path = [os.path.split(package_doc.filename)[0]]

    # The leftmost identifier in `name` should be a module or
    # package on the given path; find it and parse it.
    filename = _get_filename(name[0], path)
    module_doc = parse_docs(filename, context=package_doc)

    # If the name just has one identifier, then the module we just
    # parsed is the object we're looking for; return it.
    if len(name) == 1: return module_doc

    # Otherwise, we're looking for something inside the module.
    # First, check to see if it's in a variable (but ignore
    # variables that just contain imported submodules).
    if not _is_submodule_import_var(module_doc, name[1]):
        try: return _find_in_namespace(name[1:], module_doc)
        except ImportError: pass

    # If not, then check to see if it's in a subpackage.
    if module_doc.is_package:
        return _find(name[1:], module_doc)

    # If it's not in a variable or a subpackage, then we can't
    # find it.
    raise ImportError('Could not find value')

def _is_submodule_import_var(module_doc, var_name):
    """
    Return true if C{var_name} is the name of a variable in
    C{module_doc} that just contains an C{imported_from} link to a
    submodule of the same name.  (I.e., is a variable created when
    a package imports one of its own submodules.)
    """
    var_doc = module_doc.variables.get(var_name)
    full_var_name = DottedName(module_doc.canonical_name, var_name)
    return (var_doc is not None and
            var_doc.imported_from == full_var_name)
    
def _find_in_namespace(name, namespace_doc):
    if name[0] not in namespace_doc.variables:
        raise ImportError('Could not find value')
    
    # Look up the variable in the namespace.
    var_doc = namespace_doc.variables[name[0]]
    if var_doc.value is UNKNOWN:
        raise ImportError('Could not find value')
    val_doc = var_doc.value

    # If the variable's value was imported, then follow its
    # alias link.
    if var_doc.imported_from not in (None, UNKNOWN):
        return _find(var_doc.imported_from+name[1:])

    # Otherwise, if the name has one identifier, then this is the
    # value we're looking for; return it.
    elif len(name) == 1:
        return val_doc

    # Otherwise, if this value is a namespace, look inside it.
    elif isinstance(val_doc, NamespaceDoc):
        return _find_in_namespace(name[1:], val_doc)

    # Otherwise, we ran into a dead end.
    else:
        raise ImportError('Could not find value')
    
def _get_filename(identifier, path=None):
    if path == UNKNOWN: path = None
    try:
        fp, filename, (s,m,typ) = imp.find_module(identifier, path)
        if fp is not None: fp.close()
    except ImportError:
        raise ImportError, 'No Python source file found.'

    if typ == imp.PY_SOURCE:
        return filename
    elif typ == imp.PY_COMPILED:
        # See if we can find a corresponding non-compiled version.
        filename = re.sub('.py\w$', '.py', filename)
        if not os.path.exists(filename):
            raise ImportError, 'No Python source file found.'
        return filename
    elif typ == imp.PKG_DIRECTORY:
        filename = os.path.join(filename, '__init__.py')
        if not os.path.exists(filename):
            filename = os.path.join(filename, '__init__.pyw')
            if not os.path.exists(filename):
                raise ImportError, 'No package file found.'
        return filename
    elif typ == imp.C_BUILTIN:
        raise ImportError, 'No Python source file for builtin modules.'
    elif typ == imp.C_EXTENSION:
        raise ImportError, 'No Python source file for c extensions.'
    else:
        raise ImportError, 'No Python source file found.'

#/////////////////////////////////////////////////////////////////
#{ File tokenization loop
#/////////////////////////////////////////////////////////////////

def process_file(module_doc):
    """
    Read the given C{ModuleDoc}'s file, and add variables
    corresponding to any objects defined in that file.  In
    particular, read and tokenize C{module_doc.filename}, and
    process each logical line using L{process_line()}.
    """
    # Keep track of the current line number:
    lineno = None
    
    # Use this list to collect the tokens on a single logical line:
    line_toks = []
    
    # This list contains one APIDoc for each indentation level.
    # The first element is the APIDoc for the module, and each
    # subsequent element is the APIDoc for the object at that
    # indentation level.  The final element of the list is the
    # C{APIDoc} for the entity that we're currently processing.
    parent_docs = [module_doc]

    # The APIDoc for the object that was defined by the previous
    # line, if any; or None otherwise.  This is used to update
    # parent_docs when we encounter an indent; and to decide what
    # object (if any) is described by a docstring.
    prev_line_doc = module_doc

    # A list of comments that occur before or on the current
    # logical line, used to build the comment docstring.  Each
    # element is a tuple (comment_text, comment_lineno).
    comments = []

    # A list of decorator lines that occur before the current
    # logical line.  This is used so we can process a function
    # declaration line and its decorators all at once.
    decorators = []

    # A list of group names, one for each indentation level.  This is
    # used to keep track groups that are defined by comment markers
    # START_GROUP_MARKER and END_GROUP_MARKER.
    groups = [None]

    # When we encounter a comment start group marker, set this to the
    # name of the group; but wait until we're ready to process the
    # next line before we actually set groups[-1] to this value.  This
    # is necessary because at the top of a block, the tokenizer gives
    # us comments before the INDENT token; but if we encounter a group
    # start marker at the top of a block, then we want it to apply
    # inside that block, not outside it.
    start_group = None

    # Check if the source file declares an encoding.
    encoding = get_module_encoding(module_doc.filename)

    # The token-eating loop:
    try:
        module_file = codecs.open(module_doc.filename, 'rU', encoding)
    except LookupError:
        log.warning("Unknown encoding %r for %s; using the default"
                    "encoding instead (iso-8859-1)" %
                    (encoding, module_doc.filename))
        encoding = 'iso-8859-1'
        module_file = codecs.open(module_doc.filename, 'rU', encoding)
    tok_iter = tokenize.generate_tokens(module_file.readline)
    for toktype, toktext, (srow,scol), (erow,ecol), line_str in tok_iter:
        # BOM encoding marker: ignore.
        if toktype == token.ERRORTOKEN:
            log.debug(type(toktext), `toktext`)
        if (toktype == token.ERRORTOKEN and
            (toktext == u'\ufeff' or
             toktext.encode(encoding) == '\xef\xbb\xbf')):
            pass
            
        # Error token: abort
        elif toktype == token.ERRORTOKEN:
            raise ParseError('Error during parsing: invalid syntax '
                             '(%s, line %d, char %d: %r)' %
                             (module_doc.filename, srow, scol, toktext))
        
        # Indent token: update the parent_doc stack.
        elif toktype == token.INDENT:
            if prev_line_doc is None:
                parent_docs.append(parent_docs[-1])
            else:
                parent_docs.append(prev_line_doc)
            groups.append(None)
                
        # Dedent token: update the parent_doc stack.
        elif toktype == token.DEDENT:
            if line_toks == []:
                parent_docs.pop()
                groups.pop()
            else:
                # This *should* only happen if the file ends on an
                # indented line, with no final newline.
                # (otherwise, this is the wrong thing to do.)
                pass
            
        # Line-internal newline token: if we're still at the start of
        # the logical line, and we've seen one or more comment lines,
        # then discard them: blank lines are not allowed between a
        # comment block and the thing it describes.
        elif toktype == tokenize.NL:
            if comments and not line_toks:
                log.warning('Ignoring docstring comment block followed by '
                            'a blank line in %r on line %r' %
                            (module_doc.filename, srow-1))
                comments = []
                
        # Comment token: add to comments if appropriate.
        elif toktype == tokenize.COMMENT:
            if toktext.startswith(COMMENT_DOCSTRING_MARKER):
                comment_line = toktext[len(COMMENT_DOCSTRING_MARKER):].rstrip()
                comments.append( [comment_line, srow])
            elif toktext.startswith(START_GROUP_MARKER):
                start_group = toktext[len(START_GROUP_MARKER):].strip()
            elif toktext.startswith(END_GROUP_MARKER):
                for i in range(len(groups)-1, -1, -1):
                    if groups[i]:
                        groups[i] = None
                        break
                else:
                    log.warning("Got group end marker without a corresponding "
                                "start marker in %r on line %r" % 
                                (module_doc.filename, srow))
            
        # Normal token: Add it to line_toks.  (If it's a non-unicode
        # string literal, then we need to re-encode using the file's
        # encoding, to get back to the original 8-bit data; and then
        # convert that string with 8-bit data to a 7-bit ascii
        # representation.)
        elif toktype != token.NEWLINE and toktype != token.ENDMARKER:
            if lineno is None: lineno = srow
            if toktype == token.STRING:
                str_prefixes = re.match('[^\'"]*', toktext).group()
                if 'u' not in str_prefixes:
                    s = toktext.encode(encoding)
                    toktext = decode_with_backslashreplace(s)
            line_toks.append( (toktype, toktext) )
            
        # Decorator line: add it to the decorators list.
        elif line_toks and line_toks[0] == (token.OP, '@'):
            decorators.append(shallow_parse(line_toks))
            line_toks = []

        # End of line token, but nothing to do.
        elif line_toks == []:
            pass
            
        # End of line token: parse the logical line & process it.
        else:
            if start_group:
                groups[-1] = start_group
                start_group = None

            if parent_docs[-1] != 'skip_block':
                try:
                    prev_line_doc = process_line(
                        shallow_parse(line_toks), parent_docs, prev_line_doc, 
                        lineno, comments, decorators, encoding)
                except ParseError, e:
                    raise ParseError('Error during parsing: invalid '
                                     'syntax (%s, line %d) -- %s' %
                                     (module_doc.filename, lineno, e))

                # grouping...
                if groups[-1] and prev_line_doc not in (None, 'skip_block'):
                    if isinstance(prev_line_doc, VariableDoc):
                        # This special case is needed for inst vars, where
                        # parent_docs[-1] is the __init__ function, not the
                        # containing class:
                        add_to_group(prev_line_doc.container,
                                     prev_line_doc, groups[-1])
                    elif isinstance(parent_docs[-1], NamespaceDoc):
                        add_to_group(parent_docs[-1], prev_line_doc,
                                     groups[-1])
            else:
                prev_line_doc = None

            # Reset line contents.
            line_toks = []
            lineno = None
            comments = []
            
def add_to_group(container, api_doc, group_name):
    if container.group_specs == UNKNOWN:
        container.group_specs = []

    if isinstance(api_doc, VariableDoc):
        var_name = api_doc.name
    else:
        var_name = api_doc.canonical_name[-1]

    for (name, group_vars) in container.group_specs:
        if name == group_name:
            group_vars.append(var_name)
            return
    else:
        container.group_specs.append( (group_name, [var_name]) )

#/////////////////////////////////////////////////////////////////
#{ Shallow parser
#/////////////////////////////////////////////////////////////////

def shallow_parse(line_toks):
    """
    Given a flat list of tokens, return a nested tree structure
    (called a X{token tree}), whose leaves are identical to the
    original list, but whose structure reflects the structure
    implied by the grouping tokens (i.e., parenthases, braces, and
    brackets).  If the parenthases, braces, and brackets do not
    match, or are not balanced, then raise a ParseError.
    
    Assign some structure to a sequence of structure (group parens).
    """
    stack = [[]]
    parens = []
    for tok in line_toks:
        toktype, toktext = tok
        if toktext in ('(','[','{'):
            parens.append(tok)
            stack.append([tok])
        elif toktext in ('}',']',')'):
            if not parens:
                raise ParseError('Unbalanced parens')
            left_paren = parens.pop()[1]
            if left_paren+toktext not in ('()', '[]', '{}'):
                raise ParseError('Mismatched parens')
            lst = stack.pop()
            lst.append(tok)
            stack[-1].append(lst)
        else:
            stack[-1].append(tok)
    if len(stack) != 1 or len(parens) != 0:
        raise ParseError('Unbalanced parens')
    return stack[0]

#/////////////////////////////////////////////////////////////////
#{ Line processing
#/////////////////////////////////////////////////////////////////
# The methods process_*() are used to handle lines.

def process_line(line, parent_docs, prev_line_doc, lineno,
                 comments, decorators, encoding):
    """
    @return: C{new-doc}, C{decorator}..?
    """
    args = (line, parent_docs, prev_line_doc, lineno,
            comments, decorators, encoding)

    if not line: # blank line.
        return None
    elif (token.OP, ':') in line[:-1]:
        return process_one_line_block(*args)
    elif (token.OP, ';') in line:
        return process_multi_stmt(*args)
    elif line[0] == (token.NAME, 'def'):
        return process_funcdef(*args)
    elif line[0] == (token.OP, '@'):
        return process_funcdef(*args)
    elif line[0] == (token.NAME, 'class'):
        return process_classdef(*args)
    elif line[0] == (token.NAME, 'import'):
        return process_import(*args)
    elif line[0] == (token.NAME, 'from'):
        return process_from_import(*args)
    elif line[0] == (token.NAME, 'del'):
        return process_del(*args)
    elif len(line)==1 and line[0][0] == token.STRING:
        return process_docstring(*args)
    elif (token.OP, '=') in line:
        return process_assignment(*args)
    elif (line[0][0] == token.NAME and
          line[0][1] in CONTROL_FLOW_KEYWORDS):
        return process_control_flow_line(*args)
    else:
        return None
        # [xx] do something with control structures like for/if?

#/////////////////////////////////////////////////////////////////
# Line handler: control flow
#/////////////////////////////////////////////////////////////////

CONTROL_FLOW_KEYWORDS = [
    #: A list of the control flow keywords.  If a line begins with
    #: one of these keywords, then it should be handled by
    #: C{process_control_flow_line}.
    'if', 'elif', 'else', 'while', 'for', 'try', 'except', 'finally']

def process_control_flow_line(line, parent_docs, prev_line_doc,
                              lineno, comments, decorators, encoding):
    keyword = line[0][1]

    # If it's a 'for' block: create the loop variable.
    if keyword == 'for' and PARSE_FOR_BLOCKS:
        loopvar_name = parse_dotted_name(
            split_on(line[1:], (token.NAME, 'in'))[0])
        parent = get_lhs_parent(loopvar_name, parent_docs)
        if parent is not None:
            var_doc = VariableDoc(name=loopvar_name[-1], is_alias=False, 
                                  is_imported=False, is_instvar=False,
                                  docs_extracted_by='parser')
            set_variable(parent, var_doc)
    
    if ((keyword == 'if' and PARSE_IF_BLOCKS) or
        (keyword == 'elif' and PARSE_ELSE_BLOCKS) or
        (keyword == 'else' and PARSE_ELSE_BLOCKS) or
        (keyword == 'while' and PARSE_WHILE_BLOCKS) or
        (keyword == 'for' and PARSE_FOR_BLOCKS) or
        (keyword == 'try' and PARSE_TRY_BLOCKS) or
        (keyword == 'except' and PARSE_EXCEPT_BLOCKS) or
        (keyword == 'finally' and PARSE_FINALLY_BLOCKS)):
        # Return "None" to indicate that we should process the
        # block using the same context that we were already in.
        return None
    else:
        # Return 'skip_block' to indicate that we should ignore
        # the contents of this block.
        return 'skip_block'

#/////////////////////////////////////////////////////////////////
# Line handler: imports
#/////////////////////////////////////////////////////////////////
# [xx] I could optionally add ValueDoc's for the imported
# variables with proxy_for set to the imported source; but
# I don't think I gain much of anything by doing so.

def process_import(line, parent_docs, prev_line_doc, lineno,
                   comments, decorators, encoding):
    if not isinstance(parent_docs[-1], NamespaceDoc): return
    
    names = split_on(line[1:], (token.OP, ','))
    
    for name in names:
        name_pieces = split_on(name, (token.NAME, 'as'))
        if len(name_pieces) == 1:
            src_name = parse_dotted_name(name_pieces[0])
            _import_var(src_name, parent_docs)
        elif len(name_pieces) == 2:
            if len(name_pieces[1]) != 1:
                raise ParseError('Expected identifier after "as"')
            src_name = parse_dotted_name(name_pieces[0])
            var_name = parse_name(name_pieces[1][0])
            _import_var_as(src_name, var_name, parent_docs)
        else:
            raise ParseError('Multiple "as" tokens in import')

def process_from_import(line, parent_docs, prev_line_doc, lineno,
                        comments, decorators, encoding):
    if not isinstance(parent_docs[-1], NamespaceDoc): return
    
    pieces = split_on(line[1:], (token.NAME, 'import'))
    if len(pieces) != 2 or not pieces[0] or not pieces[1]:
        raise ParseError("Bad from-import")
    lhs, rhs = pieces

    # The RHS might be parenthasized, as specified by PEP 328:
    # http://www.python.org/peps/pep-0328.html
    if (len(rhs) == 1 and isinstance(rhs[0], list) and
        rhs[0][0] == (token.OP, '(') and rhs[0][-1] == (token.OP, ')')):
        rhs = rhs[0][1:-1]

    # >>> from __future__ import nested_scopes
    if lhs == [(token.NAME, '__future__')]:
        return

    # >>> from sys import *
    elif rhs == [(token.OP, '*')]:
        src_name = parse_dotted_name(lhs)
        _process_fromstar_import(src_name, parent_docs)

    # >>> from os.path import join, split
    else:
        src_name = parse_dotted_name(lhs)
        for elt in rhs:
            if elt != (token.OP, ','):
                var_name = parse_name(elt)
                _import_var_as(DottedName(src_name, var_name),
                                    var_name, parent_docs)
    
def _process_fromstar_import(src, parent_docs):
    """
    Handle a statement of the form:
        >>> from <src> import *

    If L{IMPORT_HANDLING} is C{'parse'}, then first try to parse
    the module C{M{<src>}}, and copy all of its exported variables
    to C{parent_docs[-1]}.

    Otherwise, try to determine the names of the variables exported by
    C{M{<src>}}, and create a new variable for each export.  If
    L{IMPORT_STAR_HANDLING} is C{'parse'}, then the list of exports if
    found by parsing C{M{<src>}}; if it is C{'introspect'}, then the
    list of exports is found by importing and introspecting
    C{M{<src>}}.
    """
    # Record the import
    parent_docs[0].imports.append(src) # mark that it's .*??
    
    if not isinstance(parent_docs[-1], NamespaceDoc): return
    
    # If src is package-local, then convert it to a global name.
    src = _global_name(src, parent_docs)

    # [xx] add check for if we already have the source docs in our
    # cache??

    if (IMPORT_HANDLING == 'parse' or
        IMPORT_STAR_HANDLING == 'parse'): # [xx] is this ok?
        try: module_doc = _find(src)
        except ImportError: module_doc = None
        if isinstance(module_doc, ModuleDoc):
            for name, imp_var in module_doc.variables.items():
                # [xx] this is not exactly correct, but close.  It
                # does the wrong thing if a __var__ is explicitly
                # listed in __all__.
                if (imp_var.is_public and
                    not (name.startswith('__') and name.endswith('__'))):
                    var_doc = _add_import_var(DottedName(src, name), name,
                                              parent_docs[-1])
                    if IMPORT_HANDLING == 'parse':
                        var_doc.value = imp_var.value

    # If we got here, then either IMPORT_HANDLING='link' or we
    # failed to parse the `src` module.
    if IMPORT_STAR_HANDLING == 'introspect':
        try: module = __import__(str(src), {}, {}, [0])
        except: return # We couldn't import it.
        if module is None: return # We couldn't import it.
        if hasattr(module, '__all__'):
            names = list(module.__all__)
        else:
            names = [n for n in dir(module) if not n.startswith('_')]
        for name in names:
            _add_import_var(DottedName(src, name), name, parent_docs[-1])

def _import_var(name, parent_docs):
    """
    Handle a statement of the form:
        >>> import <name>

    If L{IMPORT_HANDLING} is C{'parse'}, then first try to find
    the value by parsing; and create an appropriate variable in
    parentdoc.

    Otherwise, add a variable for the imported variable.  (More than
    one variable may be created for cases like C{'import a.b'}, where
    we need to create a variable C{'a'} in parentdoc containing a
    proxy module; and a variable C{'b'} in the proxy module.
    """
    # Record the import
    parent_docs[0].imports.append(name)
    
    if not isinstance(parent_docs[-1], NamespaceDoc): return
    
    # If name is package-local, then convert it to a global name.
    src = _global_name(name, parent_docs)
    src_prefix = src[:len(src)-len(name)]

    # [xx] add check for if we already have the source docs in our
    # cache??

    if IMPORT_HANDLING == 'parse':
        # Check to make sure that we can actually find the value.
        try: val_doc = _find(src)
        except ImportError: val_doc = None
        if val_doc is not None:
            # We found it; but it's not the value itself we want to
            # import, but the module containing it; so import that
            # module (=top_mod) and create a variable for it.
            top_mod = src_prefix+name[0]
            var_doc = _add_import_var(top_mod, name[0], parent_docs[-1])
            var_doc.value = _find(DottedName(name[0]))
            return

    # If we got here, then either IMPORT_HANDLING='link', or we
    # did not successfully find the value's docs by parsing; use
    # a variable with an UNKNOWN value.
    
    # Create any necessary intermediate proxy module values.
    container = parent_docs[-1]
    for i, identifier in enumerate(name[:-1]):
        if (identifier not in container.variables or
            not isinstance(container.variables[identifier], ModuleDoc)):
            var_doc = _add_import_var(name[:i+1], identifier, container)
            var_doc.value = ModuleDoc(variables={}, sort_spec=[],
                                      proxy_for=src_prefix+name[:i+1],
                                      submodules={}, 
                                      docs_extracted_by='parser')
        container = container.variables[identifier].value

    # Add the variable to the container.
    _add_import_var(src, name[-1], container)

def _import_var_as(src, name, parent_docs):
    """
    Handle a statement of the form:
        >>> import src as name
        
    If L{IMPORT_HANDLING} is C{'parse'}, then first try to find
    the value by parsing; and create an appropriate variable in
    parentdoc.

    Otherwise, create a variables with its C{imported_from} attribute
    pointing to the imported object.
    """
    # Record the import
    parent_docs[0].imports.append(src)
    
    if not isinstance(parent_docs[-1], NamespaceDoc): return
    
    # If src is package-local, then convert it to a global name.
    src = _global_name(src, parent_docs)
    
    if IMPORT_HANDLING == 'parse':
        # Parse the value and create a variable for it.
        try: val_doc = _find(src)
        except ImportError: val_doc = None
        if val_doc is not None:
            var_doc = VariableDoc(name=name, value=val_doc,
                                  is_imported=True, is_alias=False,
                                  imported_from=src,
                                  docs_extracted_by='parser')
            set_variable(parent_docs[-1], var_doc)
            return

    # If we got here, then either IMPORT_HANDLING='link', or we
    # did not successfully find the value's docs by parsing; use a
    # variable with a proxy value.
    _add_import_var(src, name, parent_docs[-1])

def _add_import_var(src, name, container):
    """
    Add a new imported variable named C{name} to C{container}, with
    C{imported_from=src}.
    """
    var_doc = VariableDoc(name=name, is_imported=True, is_alias=False,
                          imported_from=src, docs_extracted_by='parser')
    set_variable(container, var_doc)
    return var_doc

def _global_name(name, parent_docs):
    """
    If the given name is package-local (relative to the current
    context, as determined by C{parent_docs}), then convert it
    to a global name.
    """
    # Get the containing package from parent_docs.
    if parent_docs[0].is_package:
        package = parent_docs[0]
    else:
        package = parent_docs[0].package

    # Check each package (from closest to furthest) to see if it
    # contains a module named name[0]; if so, then treat `name` as
    # relative to that package.
    while package not in (None, UNKNOWN):
        try:
            fp = imp.find_module(name[0], package.path)[0]
            if fp is not None: fp.close()
        except ImportError:
            # No submodule found here; try the next package up.
            package = package.package
            continue
        # A submodule was found; return its name.
        return package.canonical_name + name

    # We didn't find any package containing `name`; so just return
    # `name` as-is.
    return name

#/////////////////////////////////////////////////////////////////
# Line handler: assignment
#/////////////////////////////////////////////////////////////////

def process_assignment(line, parent_docs, prev_line_doc, lineno,
                       comments, decorators, encoding):
    # Divide the assignment statement into its pieces.
    pieces = split_on(line, (token.OP, '='))

    lhs_pieces = pieces[:-1]
    rhs = pieces[-1]

    # Decide whether the variable is an instance variable or not.
    # If it's an instance var, then discard the value.
    is_instvar = lhs_is_instvar(lhs_pieces, parent_docs)
    
    # if it's not an instance var, and we're not in a namespace,
    # then it's just a local var -- so ignore it.
    if not (is_instvar or isinstance(parent_docs[-1], NamespaceDoc)):
        return None
    
    # Evaluate the right hand side.
    if not is_instvar:
        rhs_val, is_alias = rhs_to_valuedoc(rhs, parent_docs)
    else:
        rhs_val, is_alias = UNKNOWN, False

    # Assign the right hand side value to each left hand side.
    # (Do the rightmost assignment first)
    lhs_pieces.reverse()
    for lhs in lhs_pieces:
        # Try treating the LHS as a simple dotted name.
        try: lhs_name = parse_dotted_name(lhs)
        except: lhs_name = None
        if lhs_name is not None:
            lhs_parent = get_lhs_parent(lhs_name, parent_docs)
            if lhs_parent is None: continue
            # Create the VariableDoc.
            var_doc = VariableDoc(name=lhs_name[-1], value=rhs_val,
                                  is_imported=False, is_alias=is_alias,
                                  is_instvar=is_instvar,
                                  docs_extracted_by='parser')
            # Extract a docstring from the comments, when present,
            # but only if there's a single LHS.
            if len(lhs_pieces) == 1:
                add_docstring_from_comments(var_doc, comments)

            # Assign the variable to the containing namespace,
            # *unless* the variable is an instance variable
            # without a comment docstring.  In that case, we'll
            # only want to add it if we later discover that it's
            # followed by a variable docstring.  If it is, then
            # process_docstring will take care of adding it to the
            # containing clas.  (This is a little hackish, but
            # unfortunately is necessary because we won't know if
            # this assignment line is followed by a docstring
            # until later.)
            if (not is_instvar) or comments:
                set_variable(lhs_parent, var_doc, True)

            # If it's the only var, then return the VarDoc for use
            # as the new `prev_line_doc`.
            if (len(lhs_pieces) == 1 and
                (len(lhs_name) == 1 or is_instvar)):
                return var_doc

        # Otherwise, the LHS must be a complex expression; use
        # dotted_names_in() to decide what variables it contains,
        # and create VariableDoc's for all of them (with UNKNOWN
        # value).
        else:
            for lhs_name in dotted_names_in(lhs_pieces):
                lhs_parent = get_lhs_parent(lhs_name, parent_docs)
                if lhs_parent is None: continue
                var_doc = VariableDoc(name=lhs_name[-1],
                                      is_imported=False,
                                      is_alias=is_alias,
                                      is_instvar=is_instvar,
                                      docs_extracted_by='parser')
                set_variable(lhs_parent, var_doc, True)

        # If we have multiple left-hand-sides, then all but the
        # rightmost one are considered aliases.
        is_alias = True
        

def lhs_is_instvar(lhs_pieces, parent_docs):
    if not isinstance(parent_docs[-1], RoutineDoc):
        return False
    # make sure that lhs_pieces is <self>.<name>, where <self> is
    # the name of the first arg to the containing routinedoc, and
    # <name> is a simple name.
    posargs = parent_docs[-1].posargs
    if not (len(lhs_pieces)==1 and len(posargs) > 0 and 
            len(lhs_pieces[0]) == 3 and
            lhs_pieces[0][0] == (token.NAME, posargs[0]) and
            lhs_pieces[0][1] == (token.OP, '.') and
            lhs_pieces[0][2][0] == token.NAME):
        return False
    # Make sure we're in an instance method, and not a
    # module-level function.
    for i in range(len(parent_docs)-1, -1, -1):
        if isinstance(parent_docs[i], ClassDoc):
            return True
        elif parent_docs[i] != parent_docs[-1]:
            return False
    return False
        
def rhs_to_valuedoc(rhs, parent_docs):
    # Dotted variable:
    try:
        rhs_name = parse_dotted_name(rhs)
        rhs_val = lookup_value(rhs_name, parent_docs)
        if rhs_val is not None:
            return rhs_val, True
    except ParseError:
        pass

    # Decorators:
    if (len(rhs)==2 and rhs[0][0] == token.NAME and
        isinstance(rhs[1], list)):
        arg_val, _ = rhs_to_valuedoc(rhs[1][1:-1], parent_docs)
        if isinstance(arg_val, RoutineDoc):
            doc = apply_decorator(DottedName(rhs[0][1]), arg_val)
            doc.canonical_name = UNKNOWN
            doc.parse_repr = pp_toktree(rhs)
            return doc, False

    # Nothing else to do: make a val with the source as its repr.
    return GenericValueDoc(parse_repr=pp_toktree(rhs), toktree=rhs,
                           defining_module=parent_docs[0],
                           docs_extracted_by='parser'), False

def get_lhs_parent(lhs_name, parent_docs):
    assert isinstance(lhs_name, DottedName)

    # For instance vars inside an __init__ method:
    if isinstance(parent_docs[-1], RoutineDoc):
        for i in range(len(parent_docs)-1, -1, -1):
            if isinstance(parent_docs[i], ClassDoc):
                return parent_docs[i]
        else:
            raise ValueError("%r is not a namespace or method" %
                             parent_docs[-1])

    # For local variables:
    if len(lhs_name) == 1:
        return parent_docs[-1]

    # For non-local variables:
    return lookup_value(lhs_name.container(), parent_docs)

#/////////////////////////////////////////////////////////////////
# Line handler: single-line blocks
#/////////////////////////////////////////////////////////////////

def process_one_line_block(line, parent_docs, prev_line_doc, lineno,
                           comments, decorators, encoding):
    """
    The line handler for single-line blocks, such as:

        >>> def f(x): return x*2

    This handler calls L{process_line} twice: once for the tokens
    up to and including the colon, and once for the remaining
    tokens.  The comment docstring is applied to the first line
    only.
    @return: C{None}
    """
    i = line.index((token.OP, ':'))
    doc1 = process_line(line[:i+1], parent_docs, prev_line_doc,
                             lineno, comments, decorators, encoding)
    doc2 = process_line(line[i+1:], parent_docs+[doc1],
                             doc1, lineno, None, [], encoding)
    return doc1

#/////////////////////////////////////////////////////////////////
# Line handler: semicolon-separated statements
#/////////////////////////////////////////////////////////////////

def process_multi_stmt(line, parent_docs, prev_line_doc, lineno,
                       comments, decorators, encoding):
    """
    The line handler for semicolon-separated statements, such as:

        >>> x=1; y=2; z=3

    This handler calls L{process_line} once for each statement.
    The comment docstring is not passed on to any of the
    sub-statements.
    @return: C{None}
    """
    for statement in split_on(line, (token.OP, ';')):
        if not statement: continue
        doc = process_line(statement, parent_docs, prev_line_doc, 
                           lineno, None, decorators, encoding)
        prev_line_doc = doc
        decorators = []
    return None

#/////////////////////////////////////////////////////////////////
# Line handler: delete statements
#/////////////////////////////////////////////////////////////////

def process_del(line, parent_docs, prev_line_doc, lineno,
                comments, decorators, encoding):
    """
    The line handler for delete statements, such as:

        >>> del x, y.z

    This handler calls L{del_variable} for each dotted variable in
    the variable list.  The variable list may be nested.  Complex
    expressions in the variable list (such as C{x[3]}) are ignored.
    @return: C{None}
    """
    # If we're not in a namespace, then ignore it.
    parent_doc = parent_docs[-1]
    if not isinstance(parent_doc, NamespaceDoc): return

    var_list = split_on(line[1:], (token.OP, ','))
    for var_name in dotted_names_in(var_list):
        del_variable(parent_docs[-1], var_name)

    return None

#/////////////////////////////////////////////////////////////////
# Line handler: docstrings
#/////////////////////////////////////////////////////////////////

def process_docstring(line, parent_docs, prev_line_doc, lineno,
                      comments, decorators, encoding):
    """
    The line handler for bare string literals.  If
    C{prev_line_doc} is not C{None}, then the string literal is
    added to that C{APIDoc} as a docstring.  If it already has a
    docstring (from comment docstrings), then the new docstring
    will be appended to the old one.
    """
    if prev_line_doc is None: return
    docstring = parse_string(line)

    # If the docstring is a str, then convert it to unicode.
    # According to a strict reading of PEP 263, this might not be the
    # right thing to do; but it will almost always be what the
    # module's author intended.
    if isinstance(docstring, str):
        docstring = docstring.decode(encoding)

    # If the modified APIDoc is an instance variable, and it has
    # not yet been added to its class's C{variables} list,
    # then add it now.  This is done here, rather than in the
    # process_assignment() call that created the variable, because
    # we only want to add instance variables if they have an
    # associated docstring.  (For more info, see the comment above
    # the set_variable() call in process_assignment().)
    if (isinstance(prev_line_doc, VariableDoc) and
        prev_line_doc.is_instvar and
        prev_line_doc.docstring in (None, UNKNOWN)):
        for i in range(len(parent_docs)-1, -1, -1):
            if isinstance(parent_docs[i], ClassDoc):
                set_variable(parent_docs[i], prev_line_doc, True)
                break

    if prev_line_doc.docstring not in (None, UNKNOWN):
        log.warning("%s has both a comment-docstring and a normal "
                    "(string) docstring; ignoring the comment-"
                    "docstring." % prev_line_doc.canonical_name)
        
    prev_line_doc.docstring = docstring
    prev_line_doc.docstring_lineno = lineno

    
#/////////////////////////////////////////////////////////////////
# Line handler: function declarations
#/////////////////////////////////////////////////////////////////

def process_funcdef(line, parent_docs, prev_line_doc, lineno,
                    comments, decorators, encoding):
    """
    The line handler for function declaration lines, such as:

        >>> def f(a, b=22, (c,d)):

    This handler creates and initializes a new C{VariableDoc}
    containing a C{RoutineDoc}, adds the C{VariableDoc} to the
    containing namespace, and returns the C{RoutineDoc}.
    """
    # Check syntax.
    if len(line) != 4 or line[3] != (token.OP, ':'):
        raise ParseError("Bad function definition line")
    
    # If we're not in a namespace, then ignore it.
    parent_doc = parent_docs[-1]
    if not isinstance(parent_doc, NamespaceDoc): return

    # Get the function's name
    func_name = parse_name(line[1])
    canonical_name = DottedName(parent_doc.canonical_name, func_name)

    # Create the function's RoutineDoc.
    func_doc = RoutineDoc(canonical_name=canonical_name,
                          defining_module=parent_docs[0],
                          lineno=lineno, docs_extracted_by='parser')

    # Process the signature.
    init_arglist(func_doc, line[2])

    # If the preceeding comment includes a docstring, then add it.
    add_docstring_from_comments(func_doc, comments)
    
    # Apply any decorators.
    decorators.reverse()
    for decorator in decorators:
        try:
            deco_name = parse_dotted_name(decorator[1:])
        except ParseError:
            deco_name = None
        if func_doc.canonical_name is not UNKNOWN:
            deco_repr = '%s(%s)' % (pp_toktree(decorator[1:]),
                                    func_doc.canonical_name)
        elif func_doc.parse_repr not in (None, UNKNOWN):
            # [xx] this case should be improved.. when will func_doc
            # have a known parse_repr??
            deco_repr = '%s(%s)' % (pp_toktree(decorator[1:]),
                                    func_doc.parse_repr)
        else:
            deco_repr = UNKNOWN
        func_doc = apply_decorator(deco_name, func_doc)
        func_doc.canonical_name = UNKNOWN
        func_doc.parse_repr = deco_repr

    # Add a variable to the containing namespace.
    var_doc = VariableDoc(name=func_name, value=func_doc,
                          is_imported=False, is_alias=False,
                          docs_extracted_by='parser')
    set_variable(parent_doc, var_doc)
    
    # Return the new ValueDoc.
    return func_doc

def apply_decorator(decorator_name, func_doc):
    # [xx] what if func_doc is not a RoutineDoc?
    if decorator_name == DottedName('staticmethod'):
        return StaticMethodDoc(**func_doc.__dict__)
    elif decorator_name == DottedName('classmethod'):
        return ClassMethodDoc(**func_doc.__dict__)
    elif DEFAULT_DECORATOR_BEHAVIOR == 'transparent':
        return func_doc.__class__(**func_doc.__dict__) # make a copy.
    elif DEFAULT_DECORATOR_BEHAVIOR == 'opaque':
        return GenericValueDoc(docs_extracted_by='parser')
    else:
        raise ValueError, 'Bad value for DEFAULT_DECORATOR_BEHAVIOR'

def init_arglist(func_doc, arglist):
    if not isinstance(arglist, list) or arglist[0] != (token.OP, '('):
        raise ParseError("Bad argument list")

    # Initialize to defaults.
    func_doc.posargs = []
    func_doc.posarg_defaults = []
    func_doc.vararg = None
    func_doc.kwarg = None

    # Divide the arglist into individual args.
    args = split_on(arglist[1:-1], (token.OP, ','))

    # Keyword argument.
    if args and args[-1][0] == (token.OP, '**'):
        if len(args[-1]) != 2 or args[-1][1][0] != token.NAME:
            raise ParseError("Expected name after ** in argument list")
        func_doc.kwarg = args[-1][1][1]
        args.pop()

    # Vararg argument.
    if args and args[-1][0] == (token.OP, '*'):
        if len(args[-1]) != 2 or args[-1][1][0] != token.NAME:
            raise ParseError("Expected name after * in argument list")
        func_doc.vararg = args[-1][1][1]
        args.pop()

    # Positional arguments.
    for arg in args:
        func_doc.posargs.append(parse_funcdef_arg(arg[0]))
        if len(arg) == 1:
            func_doc.posarg_defaults.append(None)
        elif arg[1] != (token.OP, '=') or len(arg) == 2:
            raise ParseError("Bad argument list")
        else:
            default_val = GenericValueDoc(parse_repr=pp_toktree(arg[2:]),
                                          docs_extracted_by='parser')
            func_doc.posarg_defaults.append(default_val)

#/////////////////////////////////////////////////////////////////
# Line handler: class declarations
#/////////////////////////////////////////////////////////////////

def process_classdef(line, parent_docs, prev_line_doc, lineno,
                     comments, decorators, encoding):
    """
    The line handler for class declaration lines, such as:
    
        >>> class Foo(Bar, Baz):

    This handler creates and initializes a new C{VariableDoc}
    containing a C{ClassDoc}, adds the C{VariableDoc} to the
    containing namespace, and returns the C{ClassDoc}.
    """
    # Check syntax
    if len(line)<3 or len(line)>4 or line[-1] != (token.OP, ':'):
        raise ParseError("Bad class definition line")

    # If we're not in a namespace, then ignore it.
    parent_doc = parent_docs[-1]
    if not isinstance(parent_doc, NamespaceDoc): return

    # Get the class's name
    class_name = parse_name(line[1])
    canonical_name = DottedName(parent_doc.canonical_name, class_name)

    # Create the class's ClassDoc & VariableDoc.
    class_doc = ClassDoc(variables={}, sort_spec=[],
                         bases=[], subclasses=[],
                         canonical_name=canonical_name,
                         defining_module=parent_docs[0],
                         docs_extracted_by='parser')
    var_doc = VariableDoc(name=class_name, value=class_doc,
                          is_imported=False, is_alias=False,
                          docs_extracted_by='parser')

    # Add the bases.
    if len(line) == 4:
        if (not isinstance(line[2], list) or
            line[2][0] != (token.OP, '(')):
            raise ParseError("Expected base list")
        try:
            for base_name in parse_classdef_bases(line[2]):
                class_doc.bases.append(find_base(base_name, parent_docs))
        except ParseError, e:
            log.warning("Unable to extract the base list for %s: %s" %
                        (canonical_name, e))
            class_doc.bases = UNKNOWN
    else:
        class_doc.bases = []

    # Register ourselves as a subclass to our bases.
    if class_doc.bases is not UNKNOWN:
        for basedoc in class_doc.bases:
            if isinstance(basedoc, ClassDoc):
                basedoc.subclasses.append(class_doc)
    
    # If the preceeding comment includes a docstring, then add it.
    add_docstring_from_comments(class_doc, comments)
    
    # Add the VariableDoc to our container.
    set_variable(parent_doc, var_doc)

    return class_doc

def find_base(name, parent_docs):
    assert isinstance(name, DottedName)

    # Find the variable containing the base.
    base_var = lookup_variable(name, parent_docs)
    if base_var is None:
        # If it looks like it's in an external module, then try
        # "importing" it.
        if (lookup_name(name[0], parent_docs).imported_from not in
            (None, UNKNOWN)):
            _import_var(name, parent_docs)
            base_var = lookup_variable(name, parent_docs)
        # If we still don't have a var containing the base, give up.
        if base_var is None:
            raise ParseError("Could not find %s" % name)

    # If the variable has a value, return that value.
    if base_var.value != UNKNOWN:
        return base_var.value

    # Otherwise, if BASE_HANDLING is 'parse', try parsing the docs for
    # the base class; if that fails, or if BASE_HANDLING is 'link',
    # just make a proxy object.
    if base_var.imported_from not in (None, UNKNOWN):
        if BASE_HANDLING == 'parse':
            try:
                return parse_docs(name=base_var.imported_from)
            except ParseError:
                pass
        # Either BASE_HANDLING='link' or parsing the base class failed;
        # return a proxy value for the base class.
        return ClassDoc(variables={}, sort_spec=[], bases=[],
                        subclasses=[], proxy_for=base_var.imported_from,
                        docs_extracted_by='parser')
    else:
        raise ParseError() # no value available for var.
                    
                    
    

#/////////////////////////////////////////////////////////////////
#{ Parsing
#/////////////////////////////////////////////////////////////////

def dotted_names_in(elt_list):
    """
    Return a list of all simple dotted names in the given
    expression.
    """
    names = []
    while elt_list:
        elt = elt_list.pop()
        if len(elt) == 1 and isinstance(elt[0], list):
            # Nested list: process the contents
            elt_list.extend(split_on(elt[0][1:-1], (token.OP, ',')))
        else:
            try:
                names.append(parse_dotted_name(elt))
            except ParseError:
                pass # complex expression -- ignore
    return names

def parse_name(elt, strip_parens=False):
    """
    If the given token tree element is a name token, then return
    that name as a string.  Otherwise, raise ParseError.
    @param strip_parens: If true, then if elt is a single name
        enclosed in parenthases, then return that name.
    """
    if strip_parens and isinstance(elt, list):
        while (isinstance(elt, list) and len(elt) == 3 and
               elt[0] == (token.OP, '(') and
               elt[-1] == (token.OP, ')')):
            elt = elt[1]
    if isinstance(elt, list) or elt[0] != token.NAME:
        raise ParseError("Bad name")
    return elt[1]

def parse_dotted_name(elt_list, strip_parens=True):
    """
    @bug: does not handle 'x.(y).z'
    """
    if len(elt_list) == 0: raise ParseError("Bad dotted name")
    
    # Handle ((x.y).z).  (If the contents of the parens include
    # anything other than dotted names, such as (x,y), then we'll
    # catch it below and raise a ParseError.
    while (isinstance(elt_list[0], list) and
           len(elt_list[0]) >= 3 and
           elt_list[0][0] == (token.OP, '(') and
           elt_list[0][-1] == (token.OP, ')')):
        elt_list[:1] = elt_list[0][1:-1]

    if len(elt_list) % 2 != 1: raise ParseError("Bad dotted name")
    name = DottedName(parse_name(elt_list[0], True))
    for i in range(2, len(elt_list), 2):
        dot, identifier = elt_list[i-1], elt_list[i]
        if  dot != (token.OP, '.'):
            raise ParseError("Bad dotted name")
        name = DottedName(name, parse_name(identifier, True))
    return name
        
def split_on(elt_list, split_tok):
    # [xx] add code to guarantee each elt is non-empty.
    result = [[]]
    for elt in elt_list:
        if elt == split_tok:
            if result[-1] == []: raise ParseError("Empty element from split")
            result.append([])
        else:
            result[-1].append(elt)
    if result[-1] == []: result.pop()
    return result

def parse_funcdef_arg(elt):
    """
    If the given tree token element contains a valid function
    definition argument (i.e., an identifier token or nested list
    of identifiers), then return a corresponding string identifier
    or nested list of string identifiers.  Otherwise, raise a
    ParseError.
    """
    if isinstance(elt, list):
        if elt[0] == (token.OP, '('):
            if len(elt) == 3:
                return parse_funcdef_arg(elt[1])
            else:
                return [parse_funcdef_arg(e)
                        for e in elt[1:-1]
                        if e != (token.OP, ',')]
        else:
            raise ParseError("Bad argument -- expected name or tuple")
    elif elt[0] == token.NAME:
        return elt[1]
    else:
        raise ParseError("Bad argument -- expected name or tuple")
    
def parse_classdef_bases(elt):
    """
    If the given tree token element contains a valid base list
    (that contains only dotted names), then return a corresponding
    list of L{DottedName}s.  Otherwise, raise a ParseError.
    
    @bug: Does not handle either of::
        - class A( (base.in.parens) ): pass
        - class B( (lambda:calculated.base)() ): pass
    """
    if (not isinstance(elt, list) or
        elt[0] != (token.OP, '(')):
        raise ParseError("Bad base list")

    return [parse_dotted_name(n)
            for n in split_on(elt[1:-1], (token.OP, ','))]

# Used by: base list; 'del'; ...
def parse_dotted_name_list(elt_list):
    """
    If the given list of tree token elements contains a
    comma-separated list of dotted names, then return a
    corresponding list of L{DottedName} objects.  Otherwise, raise
    ParseError.
    """
    names = []
    
    state = 0
    for elt in elt_list:
        # State 0 -- Expecting a name, or end of arglist
        if state == 0:
            # Make sure it's a name
            if isinstance(elt, tuple) and elt[0] == token.NAME:
                names.append(DottedName(elt[1]))
                state = 1
            else:
                raise ParseError("Expected a name")
        # State 1 -- Expecting comma, period, or end of arglist
        elif state == 1:
            if elt == (token.OP, '.'):
                state = 2
            elif elt == (token.OP, ','):
                state = 0
            else:
                raise ParseError("Expected '.' or ',' or end of list")
        # State 2 -- Continuation of dotted name.
        elif state == 2:
            if isinstance(elt, tuple) and elt[0] == token.NAME:
                names[-1] = DottedName(names[-1], elt[1])
                state = 1
            else:
                raise ParseError("Expected a name")
    if state == 2:
        raise ParseError("Expected a name")
    return names

def parse_string(elt_list):
    if len(elt_list) == 1 and elt_list[0][0] == token.STRING:
        # [xx] use something safer here?  But it needs to deal with
        # any string type (eg r"foo\bar" etc).
        return eval(elt_list[0][1])
    else:
        raise ParseError("Expected a string")

# ['1', 'b', 'c']
def parse_string_list(elt_list):
    if (len(elt_list) == 1 and isinstance(elt_list, list) and
        elt_list[0][0][1] in ('(', '[')):
        elt_list = elt_list[0][1:-1]

    string_list = []
    for string_elt in split_on(elt_list, (token.OP, ',')):
        string_list.append(parse_string(string_elt))

    return string_list

#/////////////////////////////////////////////////////////////////
#{ Variable Manipulation
#/////////////////////////////////////////////////////////////////

def set_variable(namespace, var_doc, preserve_docstring=False):
    """
    Add var_doc to namespace.  If namespace already contains a
    variable with the same name, then discard the old variable.  If
    C{preserve_docstring} is true, then keep the old variable's
    docstring when overwriting a variable.
    """
    # Choose which dictionary we'll be storing the variable in.
    if not isinstance(namespace, NamespaceDoc):
        return
    # If we already have a variable with this name, then remove the
    # old VariableDoc from the sort_spec list; and if we gave its
    # value a canonical name, then delete it.
    if var_doc.name in namespace.variables:
        namespace.sort_spec.remove(var_doc.name)
        old_var_doc = namespace.variables[var_doc.name]
        if (old_var_doc.is_alias == False and
            old_var_doc.value != UNKNOWN):
            old_var_doc.value.canonical_name = UNKNOWN
        if (preserve_docstring and var_doc.docstring in (None, UNKNOWN) and
            old_var_doc.docstring not in (None, UNKNOWN)):
            var_doc.docstring = old_var_doc.docstring
            var_doc.docstring_lineno = old_var_doc.docstring_lineno
    # Add the variable to the namespace.
    namespace.variables[var_doc.name] = var_doc
    namespace.sort_spec.append(var_doc.name)
    assert var_doc.container is UNKNOWN
    var_doc.container = namespace

def del_variable(namespace, name):
    if not isinstance(namespace, NamespaceDoc):
        return

    if name[0] in namespace.variables:
        if len(name) == 1:
            var_doc = namespace.variables[name[0]]
            namespace.sort_spec.remove(name[0])
            del namespace.variables[name[0]]
            if not var_doc.is_alias and var_doc.value is not UNKNOWN:
                var_doc.value.canonical_name = UNKNOWN
        else:
            del_variable(namespace.variables[name[0]].value, name[1:])
            
#/////////////////////////////////////////////////////////////////
#{ Name Lookup
#/////////////////////////////////////////////////////////////////

def lookup_name(identifier, parent_docs):
    """
    Find and return the documentation for the variable named by
    the given identifier.
    
    @rtype: L{VariableDoc} or C{None}
    """
    # We need to check 3 namespaces: locals, globals, and builtins.
    # Note that this is true even if we're in a version of python with
    # nested scopes, because nested scope lookup does not apply to
    # nested class definitions, and we're not worried about variables
    # in nested functions.
    if not isinstance(identifier, basestring):
        raise TypeError('identifier must be a string')

    # Locals
    if isinstance(parent_docs[-1], NamespaceDoc):
        if parent_docs[-1].variables.has_key(identifier):
            return parent_docs[-1].variables[identifier]

    # Globals (aka the containing module)
    if isinstance(parent_docs[0], NamespaceDoc):
        if parent_docs[0].variables.has_key(identifier):
            return parent_docs[0].variables[identifier]

    # Builtins
    builtins = epydoc.docintrospecter.introspect_docs(__builtin__)
    if isinstance(builtins, NamespaceDoc):
        if builtins.variables.has_key(identifier):
            return builtins.variables[identifier]

    # We didn't find it; return None.
    return None

def lookup_variable(dotted_name, parent_docs):
    assert isinstance(dotted_name, DottedName)
    # If it's a simple identifier, use lookup_name.
    if len(dotted_name) == 1:
        return lookup_name(dotted_name[0], parent_docs)

    # If it's a dotted name with multiple pieces, look up the
    # namespace containing the var (=parent) first; and then
    # look for the var in that namespace.
    else:
        parent = lookup_value(dotted_name[:-1], parent_docs)
        if (isinstance(parent, NamespaceDoc) and
            dotted_name[-1] in parent.variables):
            return parent.variables[dotted_name[-1]]
        else:
            return None # var not found.

def lookup_value(dotted_name, parent_docs):
    """
    Find and return the documentation for the value contained in
    the variable with the given name in the current namespace.
    """
    assert isinstance(dotted_name, DottedName)
    var_doc = lookup_name(dotted_name[0], parent_docs)

    for i in range(1, len(dotted_name)):
        if var_doc is None: return None

        if isinstance(var_doc.value, NamespaceDoc):
            var_dict = var_doc.value.variables
        elif (var_doc.value == UNKNOWN and
            var_doc.imported_from not in (None, UNKNOWN)):
            src_name = var_doc.imported_from + dotted_name[i:]
            # [xx] do I want to create a proxy here??
            return GenericValueDoc(proxy_for=src_name,
                                   parse_repr=str(dotted_name),
                                   docs_extracted_by='parser')
        else:
            return None

        var_doc = var_dict.get(dotted_name[i])

    if var_doc is None: return None
    return var_doc.value

#/////////////////////////////////////////////////////////////////
#{ Docstring Comments
#/////////////////////////////////////////////////////////////////

def add_docstring_from_comments(api_doc, comments):
    if api_doc is None or not comments: return
    api_doc.docstring = '\n'.join([line for (line, lineno) in comments])
    api_doc.docstring_lineno = comments[0][1]

#/////////////////////////////////////////////////////////////////
#{ Tree tokens
#/////////////////////////////////////////////////////////////////

def pp_toktree(elts, spacing='normal', indent=0):
    s = u''
    for elt in elts:
        # Put a blank line before class & def statements.
        if elt == (token.NAME, 'class') or elt == (token.NAME, 'def'):
            s += '\n%s' % ('    '*indent)

        if isinstance(elt, tuple):
            if elt[0] == token.NEWLINE:
                s += '    '+elt[1]
                s += '\n%s' % ('    '*indent)
            elif elt[0] == token.INDENT:
                s += '    '
                indent += 1
            elif elt[0] == token.DEDENT:
                assert s[-4:] == '    '
                s = s[:-4]
                indent -= 1
            elif elt[0] == tokenize.COMMENT:
                s += elt[1].rstrip() + '\n' + '    '*indent
            else:
                s += elt[1]
        else:
            elt_s = pp_toktree(elt, spacing, indent)
            # Join them.  s = left side; elt_s = right side.
            if (elt_s=='' or s=='' or
                s in ('-','`') or elt_s in ('}',']',')','`',':') or
                elt_s[0] in ('.',',') or s[-1] in ('(','[','{','.','\n',' ') or
                (elt_s[0] == '(' and s[-1] not in (',','='))):
                s = '%s%s' % (s, elt_s)
            elif (spacing=='tight' and
                  s[-1] in '+-*/=,' or elt_s[0] in '+-*/=,'):
                s = '%s%s' % (s, elt_s)
            else:
                s = '%s %s' % (s, elt_s)
    return s
        
#/////////////////////////////////////////////////////////////////
#{ Helper Functions
#/////////////////////////////////////////////////////////////////

def get_module_encoding(filename):
    """
    @see: U{PEP 263<http://www.python.org/peps/pep-0263.html>}
    """
    module_file = open(filename, 'rU')
    try:
        lines = [module_file.readline() for i in range(2)]
        if lines[0].startswith('\xef\xbb\xbf'):
            return 'utf-8'
        else:
            for line in lines:
                m = re.search("coding[:=]\s*([-\w.]+)", line)
                if m: return m.group(1)
                
        # Fall back on Python's default encoding.
        return 'iso-8859-1' # aka 'latin-1'
    finally:
        module_file.close()
        
def _get_module_name(filename, package_doc):
    """
    Return (dotted_name, is_package)
    """
    name = re.sub(r'.py\w?$', '', os.path.split(filename)[1])
    if name == '__init__':
        is_package = True
        name = os.path.split(os.path.split(filename)[0])[1]
    else:
        is_package = False

    # [XX] if the module contains a script, then `name` may not
    # necessarily be a valid identifier -- which will cause
    # DottedName to raise an exception.  Is that what I want?
    if package_doc is None:
        dotted_name = DottedName(name)
    else:
        dotted_name = DottedName(package_doc.canonical_name, name)

    # Check if the module looks like it's shadowed by a variable.
    # If so, then add a "'" to the end of its canonical name, to
    # distinguish it from the variable.
    if package_doc is not None and name in package_doc.variables:
        valdoc = package_doc.variables[name].value
        if (valdoc not in (None, UNKNOWN) and
            valdoc.imported_from != dotted_name):
            log.warning("Module %s might be shadowed by a variable with "
                        "the same name." % dotted_name)
            dotted_name = DottedName(str(dotted_name)+"'")

    return dotted_name, is_package

def flatten(lst, out=None):
    """
    @return: a flat list containing the leaves of the given nested
        list.
    @param lst: The nested list that should be flattened.
    """
    if out is None: out = []
    for elt in lst:
        if isinstance(elt, (list, tuple)):
            flatten(elt, out)
        else:
            out.append(elt)
    return out

