# Authors: Felix Wiemann
# Contact: Felix_Wiemann@ososo.de
# Revision: $Revision: 3909 $
# Date: $Date: 2005-09-26 20:17:31 +0200 (Mon, 26 Sep 2005) $
# Copyright: This module has been placed in the public domain.

"""
Auxiliary transforms mainly to be used by Writer components.

This module is called "writer_aux" because otherwise there would be
conflicting imports like this one::

    from docutils import writers
    from docutils.transforms import writers
"""

__docformat__ = 'reStructuredText'

from docutils import nodes, utils
from docutils.transforms import Transform


class Compound(Transform):

    """
    Flatten all compound paragraphs.  For example, transform ::

        <compound>
            <paragraph>
            <literal_block>
            <paragraph>

    into ::

        <paragraph>
        <literal_block classes="continued">
        <paragraph classes="continued">
    """

    default_priority = 810

    def apply(self):
        for compound in self.document.traverse(nodes.compound):
            first_child = 1
            for child in compound:
                if first_child:
                    if not isinstance(child, nodes.Invisible):
                        first_child = 0
                else:
                    child['classes'].append('continued')
            # Substitute children for compound.
            compound.replace_self(compound[:])
