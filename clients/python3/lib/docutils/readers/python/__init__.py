# Author: David Goodger
# Contact: goodger@users.sourceforge.net
# Revision: $Revision: 3038 $
# Date: $Date: 2005-03-14 17:16:57 +0100 (Mon, 14 Mar 2005) $
# Copyright: This module has been placed in the public domain.

"""
This package contains the Python Source Reader modules.

It requires Python 2.2 or higher (`moduleparser` depends on the
`compiler` and `tokenize` modules).
"""

__docformat__ = 'reStructuredText'


import sys
import docutils.readers
from docutils.readers.python import moduleparser
from docutils import parsers
from docutils import nodes
from docutils.readers.python import pynodes
from docutils import readers

class Reader(docutils.readers.Reader):

    config_section = 'python reader'
    config_section_dependencies = ('readers',)

    default_parser = 'restructuredtext'

    def parse(self):
        """Parse `self.input` into a document tree."""
        self.document = document = self.new_document()
        module_section = moduleparser.parse_module(self.input,
                                                   self.source.source_path)
        module_section.walk(DocformatVisitor(self.document))
        visitor = DocstringFormattingVisitor(
            document=document,
            default_parser=self.default_parser)
        module_section.walk(visitor)
        self.document.append(module_section)


class DocformatVisitor(nodes.SparseNodeVisitor):

    """
    This sets docformat attributes in a module.  Wherever an assignment
    to __docformat__ is found, we look for the enclosing scope -- a class,
    a module, or a function -- and set the docformat attribute there.

    We can't do this during the DocstringFormattingVisitor walking,
    because __docformat__ may appear below a docstring in that format
    (typically below the module docstring).
    """

    def visit_attribute(self, node):
        assert isinstance(node[0], pynodes.object_name)
        name = node[0][0].data
        if name != '__docformat__':
            return
        value = None
        for child in children:
            if isinstance(child, pynodes.expression_value):
                value = child[0].data
                break
        assert value.startswith("'") or value.startswith('"'), "__docformat__ must be assigned a string literal (not %s); line: %s" % (value, node['lineno'])
        name = name[1:-1]
        looking_in = node.parent
        while not isinstance(looking_in, (pynodes.module_section,
                                          pynodes.function_section,
                                          pynodes.class_section)):
            looking_in = looking_in.parent
        looking_in['docformat'] = name


class DocstringFormattingVisitor(nodes.SparseNodeVisitor):

    def __init__(self, document, default_parser):
        self.document = document
        self.default_parser = default_parser
        self.parsers = {}

    def visit_docstring(self, node):
        text = node[0].data
        docformat = self.find_docformat(node)
        del node[0]
        node['docformat'] = docformat
        parser = self.get_parser(docformat)
        parser.parse(text, self.document)
        for child in self.document.children:
            node.append(child)
        self.document.current_source = self.document.current_line = None
        del self.document[:]

    def get_parser(self, parser_name):
        """
        Get a parser based on its name.  We reuse parsers during this
        visitation, so parser instances are cached.
        """
        parser_name = parsers._parser_aliases.get(parser_name, parser_name)
        if not self.parsers.has_key(parser_name):
            cls = parsers.get_parser_class(parser_name)
            self.parsers[parser_name] = cls()
        return self.parsers[parser_name]

    def find_docformat(self, node):
        """
        Find the __docformat__ closest to this node (i.e., look in the
        class or module)
        """
        while node:
            if node.get('docformat'):
                return node['docformat']
            node = node.parent
        return self.default_parser


if __name__ == '__main__':
    try:
        import locale
        locale.setlocale(locale.LC_ALL, '')
    except:
        pass

    from docutils.core import publish_cmdline, default_description

    description = ('Generates pseudo-XML from Python modules '
                   '(for testing purposes).  ' + default_description)

    publish_cmdline(description=description,
                    reader=Reader())
