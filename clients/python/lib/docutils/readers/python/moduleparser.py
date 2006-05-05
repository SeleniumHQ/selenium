# Author: David Goodger
# Contact: goodger@users.sourceforge.net
# Revision: $Revision: 4242 $
# Date: $Date: 2006-01-06 00:28:53 +0100 (Fri, 06 Jan 2006) $
# Copyright: This module has been placed in the public domain.

"""
Parser for Python modules.  Requires Python 2.2 or higher.

The `parse_module()` function takes a module's text and file name,
runs it through the module parser (using compiler.py and tokenize.py)
and produces a parse tree of the source code, using the nodes as found
in pynodes.py.  For example, given this module (x.py)::

    # comment

    '''Docstring'''

    '''Additional docstring'''

    __docformat__ = 'reStructuredText'

    a = 1
    '''Attribute docstring'''

    class C(Super):

        '''C's docstring'''

        class_attribute = 1
        '''class_attribute's docstring'''

        def __init__(self, text=None):
            '''__init__'s docstring'''

            self.instance_attribute = (text * 7
                                       + ' whaddyaknow')
            '''instance_attribute's docstring'''


    def f(x,                            # parameter x
          y=a*5,                        # parameter y
          *args):                       # parameter args
        '''f's docstring'''
        return [x + item for item in args]

    f.function_attribute = 1
    '''f.function_attribute's docstring'''

The module parser will produce this module documentation tree::

    <module_section filename="test data">
        <docstring>
            Docstring
        <docstring lineno="5">
            Additional docstring
        <attribute lineno="7">
	    <object_name>
	        __docformat__
            <expression_value lineno="7">
                'reStructuredText'
        <attribute lineno="9">
	    <object_name>
	        a
            <expression_value lineno="9">
                1
            <docstring lineno="10">
                Attribute docstring
        <class_section lineno="12">
	    <object_name>
	        C
            <class_base>
	        Super
            <docstring lineno="12">
                C's docstring
            <attribute lineno="16">
	        <object_name>
		    class_attribute
                <expression_value lineno="16">
                    1
                <docstring lineno="17">
                    class_attribute's docstring
            <method_section lineno="19">
	        <object_name>
		    __init__
                <docstring lineno="19">
                    __init__'s docstring
                <parameter_list lineno="19">
                    <parameter lineno="19">
		        <object_name>
			    self
                    <parameter lineno="19">
		        <object_name>
			    text
                        <parameter_default lineno="19">
                            None
                <attribute lineno="22">
		    <object_name>
		        self.instance_attribute
                    <expression_value lineno="22">
                        (text * 7 + ' whaddyaknow')
                    <docstring lineno="24">
                        instance_attribute's docstring
        <function_section lineno="27">
	    <object_name>
	        f
            <docstring lineno="27">
                f's docstring
            <parameter_list lineno="27">
                <parameter lineno="27">
		    <object_name>
		        x
                    <comment>
                        # parameter x
                <parameter lineno="27">
		    <object_name>
		        y
                    <parameter_default lineno="27">
                        a * 5
                    <comment>
                        # parameter y
                <parameter excess_positional="1" lineno="27">
		    <object_name>
		        args
                    <comment>
                        # parameter args
        <attribute lineno="33">
	    <object_name>
	        f.function_attribute
            <expression_value lineno="33">
                1
            <docstring lineno="34">
                f.function_attribute's docstring

(Comments are not implemented yet.)

compiler.parse() provides most of what's needed for this doctree, and
"tokenize" can be used to get the rest.  We can determine the line
number from the compiler.parse() AST, and the TokenParser.rhs(lineno)
method provides the rest.

The Docutils Python reader component will transform this module doctree into a
Python-specific Docutils doctree, and then a "stylist transform" will
further transform it into a generic doctree.  Namespaces will have to be
compiled for each of the scopes, but I'm not certain at what stage of
processing.

It's very important to keep all docstring processing out of this, so that it's
a completely generic and not tool-specific.

::

> Why perform all of those transformations?  Why not go from the AST to a
> generic doctree?  Or, even from the AST to the final output?

I want the docutils.readers.python.moduleparser.parse_module() function to
produce a standard documentation-oriented tree that can be used by any tool.
We can develop it together without having to compromise on the rest of our
design (i.e., HappyDoc doesn't have to be made to work like Docutils, and
vice-versa).  It would be a higher-level version of what compiler.py provides.

The Python reader component transforms this generic AST into a Python-specific
doctree (it knows about modules, classes, functions, etc.), but this is
specific to Docutils and cannot be used by HappyDoc or others.  The stylist
transform does the final layout, converting Python-specific structures
("class" sections, etc.) into a generic doctree using primitives (tables,
sections, lists, etc.).  This generic doctree does *not* know about Python
structures any more.  The advantage is that this doctree can be handed off to
any of the output writers to create any output format we like.

The latter two transforms are separate because I want to be able to have
multiple independent layout styles (multiple runtime-selectable "stylist
transforms").  Each of the existing tools (HappyDoc, pydoc, epydoc, Crystal,
etc.) has its own fixed format.  I personally don't like the tables-based
format produced by these tools, and I'd like to be able to customize the
format easily.  That's the goal of stylist transforms, which are independent
from the Reader component itself.  One stylist transform could produce
HappyDoc-like output, another could produce output similar to module docs in
the Python library reference manual, and so on.

It's for exactly this reason::

>> It's very important to keep all docstring processing out of this, so that
>> it's a completely generic and not tool-specific.

... but it goes past docstring processing.  It's also important to keep style
decisions and tool-specific data transforms out of this module parser.


Issues
======

* At what point should namespaces be computed?  Should they be part of the
  basic AST produced by the ASTVisitor walk, or generated by another tree
  traversal?

* At what point should a distinction be made between local variables &
  instance attributes in __init__ methods?

* Docstrings are getting their lineno from their parents.  Should the
  TokenParser find the real line no's?

* Comments: include them?  How and when?  Only full-line comments, or
  parameter comments too?  (See function "f" above for an example.)

* Module could use more docstrings & refactoring in places.

"""

__docformat__ = 'reStructuredText'

import sys
import compiler
import compiler.ast
import tokenize
import token
from compiler.consts import OP_ASSIGN
from compiler.visitor import ASTVisitor
from types import StringType, UnicodeType, TupleType
from docutils.readers.python import pynodes
from docutils.nodes import Text


def parse_module(module_text, filename):
    """Return a module documentation tree from `module_text`."""
    ast = compiler.parse(module_text)
    token_parser = TokenParser(module_text)
    visitor = ModuleVisitor(filename, token_parser)
    compiler.walk(ast, visitor, walker=visitor)
    return visitor.module

class BaseVisitor(ASTVisitor):

    def __init__(self, token_parser):
        ASTVisitor.__init__(self)
        self.token_parser = token_parser
        self.context = []
        self.documentable = None

    def default(self, node, *args):
        self.documentable = None
        #print 'in default (%s)' % node.__class__.__name__
        #ASTVisitor.default(self, node, *args)

    def default_visit(self, node, *args):
        #print 'in default_visit (%s)' % node.__class__.__name__
        ASTVisitor.default(self, node, *args)


class DocstringVisitor(BaseVisitor):

    def visitDiscard(self, node):
        if self.documentable:
            self.visit(node.expr)

    def visitConst(self, node):
        if self.documentable:
            if type(node.value) in (StringType, UnicodeType):
                self.documentable.append(make_docstring(node.value, node.lineno))
            else:
                self.documentable = None

    def visitStmt(self, node):
        self.default_visit(node)


class AssignmentVisitor(DocstringVisitor):

    def visitAssign(self, node):
        visitor = AttributeVisitor(self.token_parser)
        compiler.walk(node, visitor, walker=visitor)
        if visitor.attributes:
            self.context[-1].extend(visitor.attributes)
        if len(visitor.attributes) == 1:
            self.documentable = visitor.attributes[0]
        else:
            self.documentable = None


class ModuleVisitor(AssignmentVisitor):

    def __init__(self, filename, token_parser):
        AssignmentVisitor.__init__(self, token_parser)
        self.filename = filename
        self.module = None

    def visitModule(self, node):
        self.module = module = pynodes.module_section()
        module['filename'] = self.filename
        append_docstring(module, node.doc, node.lineno)
        self.context.append(module)
        self.documentable = module
        self.visit(node.node)
        self.context.pop()

    def visitImport(self, node):
        self.context[-1] += make_import_group(names=node.names,
                                              lineno=node.lineno)
        self.documentable = None

    def visitFrom(self, node):
        self.context[-1].append(
            make_import_group(names=node.names, from_name=node.modname,
                              lineno=node.lineno))
        self.documentable = None

    def visitFunction(self, node):
        visitor = FunctionVisitor(self.token_parser,
                                  function_class=pynodes.function_section)
        compiler.walk(node, visitor, walker=visitor)
        self.context[-1].append(visitor.function)

    def visitClass(self, node):
        visitor = ClassVisitor(self.token_parser)
        compiler.walk(node, visitor, walker=visitor)
        self.context[-1].append(visitor.klass)


class AttributeVisitor(BaseVisitor):

    def __init__(self, token_parser):
        BaseVisitor.__init__(self, token_parser)
        self.attributes = pynodes.class_attribute_section()

    def visitAssign(self, node):
        # Don't visit the expression itself, just the attribute nodes:
        for child in node.nodes:
            self.dispatch(child)
        expression_text = self.token_parser.rhs(node.lineno)
        expression = pynodes.expression_value()
        expression.append(Text(expression_text))
        for attribute in self.attributes:
            attribute.append(expression)

    def visitAssName(self, node):
        self.attributes.append(make_attribute(node.name,
                                              lineno=node.lineno))

    def visitAssTuple(self, node):
        attributes = self.attributes
        self.attributes = []
        self.default_visit(node)
        n = pynodes.attribute_tuple()
        n.extend(self.attributes)
        n['lineno'] = self.attributes[0]['lineno']
        attributes.append(n)
        self.attributes = attributes
        #self.attributes.append(att_tuple)

    def visitAssAttr(self, node):
        self.default_visit(node, node.attrname)

    def visitGetattr(self, node, suffix):
        self.default_visit(node, node.attrname + '.' + suffix)

    def visitName(self, node, suffix):
        self.attributes.append(make_attribute(node.name + '.' + suffix,
                                              lineno=node.lineno))


class FunctionVisitor(DocstringVisitor):

    in_function = 0

    def __init__(self, token_parser, function_class):
        DocstringVisitor.__init__(self, token_parser)
        self.function_class = function_class

    def visitFunction(self, node):
        if self.in_function:
            self.documentable = None
            # Don't bother with nested function definitions.
            return
        self.in_function = 1
        self.function = function = make_function_like_section(
            name=node.name,
            lineno=node.lineno,
            doc=node.doc,
            function_class=self.function_class)
        self.context.append(function)
        self.documentable = function
        self.parse_parameter_list(node)
        self.visit(node.code)
        self.context.pop()

    def parse_parameter_list(self, node):
        parameters = []
        special = []
        argnames = list(node.argnames)
        if node.kwargs:
            special.append(make_parameter(argnames[-1], excess_keyword=1))
            argnames.pop()
        if node.varargs:
            special.append(make_parameter(argnames[-1],
                                          excess_positional=1))
            argnames.pop()
        defaults = list(node.defaults)
        defaults = [None] * (len(argnames) - len(defaults)) + defaults
        function_parameters = self.token_parser.function_parameters(
            node.lineno)
        #print >>sys.stderr, function_parameters
        for argname, default in zip(argnames, defaults):
            if type(argname) is TupleType:
                parameter = pynodes.parameter_tuple()
                for tuplearg in argname:
                    parameter.append(make_parameter(tuplearg))
                argname = normalize_parameter_name(argname)
            else:
                parameter = make_parameter(argname)
            if default:
                n_default = pynodes.parameter_default()
                n_default.append(Text(function_parameters[argname]))
                parameter.append(n_default)
            parameters.append(parameter)
        if parameters or special:
            special.reverse()
            parameters.extend(special)
            parameter_list = pynodes.parameter_list()
            parameter_list.extend(parameters)
            self.function.append(parameter_list)


class ClassVisitor(AssignmentVisitor):

    in_class = 0

    def __init__(self, token_parser):
        AssignmentVisitor.__init__(self, token_parser)
        self.bases = []

    def visitClass(self, node):
        if self.in_class:
            self.documentable = None
            # Don't bother with nested class definitions.
            return
        self.in_class = 1
        #import mypdb as pdb
        #pdb.set_trace()
        for base in node.bases:
            self.visit(base)
        self.klass = klass = make_class_section(node.name, self.bases,
                                                doc=node.doc,
                                                lineno=node.lineno)
        self.context.append(klass)
        self.documentable = klass
        self.visit(node.code)
        self.context.pop()

    def visitGetattr(self, node, suffix=None):
        if suffix:
            name = node.attrname + '.' + suffix
        else:
            name = node.attrname
        self.default_visit(node, name)

    def visitName(self, node, suffix=None):
        if suffix:
            name = node.name + '.' + suffix
        else:
            name = node.name
        self.bases.append(name)

    def visitFunction(self, node):
        if node.name == '__init__':
            visitor = InitMethodVisitor(self.token_parser,
                                        function_class=pynodes.method_section)
            compiler.walk(node, visitor, walker=visitor)
        else:
            visitor = FunctionVisitor(self.token_parser,
                                      function_class=pynodes.method_section)
            compiler.walk(node, visitor, walker=visitor)
        self.context[-1].append(visitor.function)


class InitMethodVisitor(FunctionVisitor, AssignmentVisitor): pass


class TokenParser:

    def __init__(self, text):
        self.text = text + '\n\n'
        self.lines = self.text.splitlines(1)
        self.generator = tokenize.generate_tokens(iter(self.lines).next)
        self.next()

    def __iter__(self):
        return self

    def next(self):
        self.token = self.generator.next()
        self.type, self.string, self.start, self.end, self.line = self.token
        return self.token

    def goto_line(self, lineno):
        while self.start[0] < lineno:
            self.next()
        return token

    def rhs(self, lineno):
        """
        Return a whitespace-normalized expression string from the right-hand
        side of an assignment at line `lineno`.
        """
        self.goto_line(lineno)
        while self.string != '=':
            self.next()
        self.stack = None
        while self.type != token.NEWLINE and self.string != ';':
            if self.string == '=' and not self.stack:
                self.tokens = []
                self.stack = []
                self._type = None
                self._string = None
                self._backquote = 0
            else:
                self.note_token()
            self.next()
        self.next()
        text = ''.join(self.tokens)
        return text.strip()

    closers = {')': '(', ']': '[', '}': '{'}
    openers = {'(': 1, '[': 1, '{': 1}
    del_ws_prefix = {'.': 1, '=': 1, ')': 1, ']': 1, '}': 1, ':': 1, ',': 1}
    no_ws_suffix = {'.': 1, '=': 1, '(': 1, '[': 1, '{': 1}

    def note_token(self):
        if self.type == tokenize.NL:
            return
        del_ws = self.del_ws_prefix.has_key(self.string)
        append_ws = not self.no_ws_suffix.has_key(self.string)
        if self.openers.has_key(self.string):
            self.stack.append(self.string)
            if (self._type == token.NAME
                or self.closers.has_key(self._string)):
                del_ws = 1
        elif self.closers.has_key(self.string):
            assert self.stack[-1] == self.closers[self.string]
            self.stack.pop()
        elif self.string == '`':
            if self._backquote:
                del_ws = 1
                assert self.stack[-1] == '`'
                self.stack.pop()
            else:
                append_ws = 0
                self.stack.append('`')
            self._backquote = not self._backquote
        if del_ws and self.tokens and self.tokens[-1] == ' ':
            del self.tokens[-1]
        self.tokens.append(self.string)
        self._type = self.type
        self._string = self.string
        if append_ws:
            self.tokens.append(' ')

    def function_parameters(self, lineno):
        """
        Return a dictionary mapping parameters to defaults
        (whitespace-normalized strings).
        """
        self.goto_line(lineno)
        while self.string != 'def':
            self.next()
        while self.string != '(':
            self.next()
        name = None
        default = None
        parameter_tuple = None
        self.tokens = []
        parameters = {}
        self.stack = [self.string]
        self.next()
        while 1:
            if len(self.stack) == 1:
                if parameter_tuple:
                    # Just encountered ")".
                    #print >>sys.stderr, 'parameter_tuple: %r' % self.tokens
                    name = ''.join(self.tokens).strip()
                    self.tokens = []
                    parameter_tuple = None
                if self.string in (')', ','):
                    if name:
                        if self.tokens:
                            default_text = ''.join(self.tokens).strip()
                        else:
                            default_text = None
                        parameters[name] = default_text
                        self.tokens = []
                        name = None
                        default = None
                    if self.string == ')':
                        break
                elif self.type == token.NAME:
                    if name and default:
                        self.note_token()
                    else:
                        assert name is None, (
                            'token=%r name=%r parameters=%r stack=%r'
                            % (self.token, name, parameters, self.stack))
                        name = self.string
                        #print >>sys.stderr, 'name=%r' % name
                elif self.string == '=':
                    assert name is not None, 'token=%r' % (self.token,)
                    assert default is None, 'token=%r' % (self.token,)
                    assert self.tokens == [], 'token=%r' % (self.token,)
                    default = 1
                    self._type = None
                    self._string = None
                    self._backquote = 0
                elif name:
                    self.note_token()
                elif self.string == '(':
                    parameter_tuple = 1
                    self._type = None
                    self._string = None
                    self._backquote = 0
                    self.note_token()
                else:                   # ignore these tokens:
                    assert (self.string in ('*', '**', '\n') 
                            or self.type == tokenize.COMMENT), (
                        'token=%r' % (self.token,))
            else:
                self.note_token()
            self.next()
        return parameters


def make_docstring(doc, lineno):
    n = pynodes.docstring()
    if lineno:
        # Really, only module docstrings don't have a line
        # (@@: but maybe they should)
        n['lineno'] = lineno
    n.append(Text(doc))
    return n

def append_docstring(node, doc, lineno):
    if doc:
        node.append(make_docstring(doc, lineno))

def make_class_section(name, bases, lineno, doc):
    n = pynodes.class_section()
    n['lineno'] = lineno
    n.append(make_object_name(name))
    for base in bases:
        b = pynodes.class_base()
        b.append(make_object_name(base))
        n.append(b)
    append_docstring(n, doc, lineno)
    return n

def make_object_name(name):
    n = pynodes.object_name()
    n.append(Text(name))
    return n

def make_function_like_section(name, lineno, doc, function_class):
    n = function_class()
    n['lineno'] = lineno
    n.append(make_object_name(name))
    append_docstring(n, doc, lineno)
    return n

def make_import_group(names, lineno, from_name=None):
    n = pynodes.import_group()
    n['lineno'] = lineno
    if from_name:
        n_from = pynodes.import_from()
        n_from.append(Text(from_name))
        n.append(n_from)
    for name, alias in names:
        n_name = pynodes.import_name()
        n_name.append(Text(name))
        if alias:
            n_alias = pynodes.import_alias()
            n_alias.append(Text(alias))
            n_name.append(n_alias)
        n.append(n_name)
    return n

def make_class_attribute(name, lineno):
    n = pynodes.class_attribute()
    n['lineno'] = lineno
    n.append(Text(name))
    return n

def make_attribute(name, lineno):
    n = pynodes.attribute()
    n['lineno'] = lineno
    n.append(make_object_name(name))
    return n

def make_parameter(name, excess_keyword=0, excess_positional=0):
    """
    excess_keyword and excess_positional must be either 1 or 0, and
    not both of them can be 1.
    """
    n = pynodes.parameter()
    n.append(make_object_name(name))
    assert not excess_keyword or not excess_positional
    if excess_keyword:
        n['excess_keyword'] = 1
    if excess_positional:
        n['excess_positional'] = 1
    return n

def trim_docstring(text):
    """
    Trim indentation and blank lines from docstring text & return it.

    See PEP 257.
    """
    if not text:
        return text
    # Convert tabs to spaces (following the normal Python rules)
    # and split into a list of lines:
    lines = text.expandtabs().splitlines()
    # Determine minimum indentation (first line doesn't count):
    indent = sys.maxint
    for line in lines[1:]:
        stripped = line.lstrip()
        if stripped:
            indent = min(indent, len(line) - len(stripped))
    # Remove indentation (first line is special):
    trimmed = [lines[0].strip()]
    if indent < sys.maxint:
        for line in lines[1:]:
            trimmed.append(line[indent:].rstrip())
    # Strip off trailing and leading blank lines:
    while trimmed and not trimmed[-1]:
        trimmed.pop()
    while trimmed and not trimmed[0]:
        trimmed.pop(0)
    # Return a single string:
    return '\n'.join(trimmed)

def normalize_parameter_name(name):
    """
    Converts a tuple like ``('a', ('b', 'c'), 'd')`` into ``'(a, (b, c), d)'``
    """
    if type(name) is TupleType:
        return '(%s)' % ', '.join([normalize_parameter_name(n) for n in name])
    else:
        return name

if __name__ == '__main__':
    import sys
    args = sys.argv[1:]
    if args[0] == '-v':
        filename = args[1]
        module_text = open(filename).read()
        ast = compiler.parse(module_text)
        visitor = compiler.visitor.ExampleASTVisitor()
        compiler.walk(ast, visitor, walker=visitor, verbose=1)
    else:
        filename = args[0]
        content = open(filename).read()
        print parse_module(content, filename).pformat()

