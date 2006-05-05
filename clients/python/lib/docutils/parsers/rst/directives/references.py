# Author: David Goodger, Dmitry Jemerov
# Contact: goodger@users.sourceforge.net
# Revision: $Revision: 4156 $
# Date: $Date: 2005-12-08 05:43:13 +0100 (Thu, 08 Dec 2005) $
# Copyright: This module has been placed in the public domain.

"""
Directives for references and targets.
"""

__docformat__ = 'reStructuredText'

from docutils import nodes
from docutils.transforms import references
from docutils.parsers.rst import directives


def target_notes(name, arguments, options, content, lineno,
                 content_offset, block_text, state, state_machine):
    """Target footnote generation."""
    pending = nodes.pending(references.TargetNotes)
    pending.details.update(options)
    state_machine.document.note_pending(pending)
    nodelist = [pending]
    return nodelist

target_notes.options = {'class': directives.class_option}
