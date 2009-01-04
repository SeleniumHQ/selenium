# Author: David Goodger
# Contact: goodger@users.sourceforge.net
# Revision: $Revision: 3892 $
# Date: $Date: 2005-09-20 22:04:53 +0200 (Tue, 20 Sep 2005) $
# Copyright: This module has been placed in the public domain.

"""
Python Enhancement Proposal (PEP) Reader.
"""

__docformat__ = 'reStructuredText'


from docutils.readers import standalone
from docutils.transforms import peps, references, misc, frontmatter
from docutils.parsers import rst


class Reader(standalone.Reader):

    supported = ('pep',)
    """Contexts this reader supports."""

    settings_spec = (
        'PEP Reader Option Defaults',
        'The --pep-references and --rfc-references options (for the '
        'reStructuredText parser) are on by default.',
        ())

    config_section = 'pep reader'
    config_section_dependencies = ('readers', 'standalone reader')

    def get_transforms(self):
        transforms = standalone.Reader.get_transforms(self)
        # We have PEP-specific frontmatter handling.
        transforms.remove(frontmatter.DocTitle)
        transforms.remove(frontmatter.SectionSubTitle)
        transforms.remove(frontmatter.DocInfo)
        transforms.extend([peps.Headers, peps.Contents, peps.TargetNotes])
        return transforms

    settings_default_overrides = {'pep_references': 1, 'rfc_references': 1}

    inliner_class = rst.states.Inliner

    def __init__(self, parser=None, parser_name=None):
        """`parser` should be ``None``."""
        if parser is None:
            parser = rst.Parser(rfc2822=1, inliner=self.inliner_class())
        standalone.Reader.__init__(self, parser, '')
