# Author: Martin Blais
# Contact: blais@furius.ca
# Revision: $Revision: 3629 $
# Date: $Date: 2005-06-29 21:45:35 +0200 (Wed, 29 Jun 2005) $
# Copyright: This module has been placed in the public domain.

"""A do-nothing parser."""

from docutils import parsers


class Parser(parsers.Parser):

    """A do-nothing parser."""

    supported = ('null',)

    config_section = 'null parser'
    config_section_dependencies = ('parsers',)

    def parse(self, inputstring, document):
        pass
