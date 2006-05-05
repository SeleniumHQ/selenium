# Author: David Goodger
# Contact: goodger@python.org
# Revision: $Revision: 3892 $
# Date: $Date: 2005-09-20 22:04:53 +0200 (Tue, 20 Sep 2005) $
# Copyright: This module has been placed in the public domain.

"""
A do-nothing Writer.
"""

from docutils import writers


class Writer(writers.UnfilteredWriter):

    supported = ('null',)
    """Formats this writer supports."""

    config_section = 'null writer'
    config_section_dependencies = ('writers',)

    def translate(self):
        pass
