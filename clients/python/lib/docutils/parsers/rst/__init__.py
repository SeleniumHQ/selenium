# Author: David Goodger
# Contact: goodger@users.sourceforge.net
# Revision: $Revision: 4445 $
# Date: $Date: 2006-03-23 15:28:36 +0100 (Thu, 23 Mar 2006) $
# Copyright: This module has been placed in the public domain.

"""
This is ``docutils.parsers.rst`` package. It exports a single class, `Parser`,
the reStructuredText parser.


Usage
=====

1. Create a parser::

       parser = docutils.parsers.rst.Parser()

   Several optional arguments may be passed to modify the parser's behavior.
   Please see `Customizing the Parser`_ below for details.

2. Gather input (a multi-line string), by reading a file or the standard
   input::

       input = sys.stdin.read()

3. Create a new empty `docutils.nodes.document` tree::

       document = docutils.utils.new_document(source, settings)

   See `docutils.utils.new_document()` for parameter details.

4. Run the parser, populating the document tree::

       parser.parse(input, document)


Parser Overview
===============

The reStructuredText parser is implemented as a state machine, examining its
input one line at a time. To understand how the parser works, please first
become familiar with the `docutils.statemachine` module, then see the
`states` module.


Customizing the Parser
----------------------

Anything that isn't already customizable is that way simply because that type
of customizability hasn't been implemented yet.  Patches welcome!

When instantiating an object of the `Parser` class, two parameters may be
passed: ``rfc2822`` and ``inliner``.  Pass ``rfc2822=1`` to enable an initial
RFC-2822 style header block, parsed as a "field_list" element (with "class"
attribute set to "rfc2822").  Currently this is the only body-level element
which is customizable without subclassing.  (Tip: subclass `Parser` and change
its "state_classes" and "initial_state" attributes to refer to new classes.
Contact the author if you need more details.)

The ``inliner`` parameter takes an instance of `states.Inliner` or a subclass.
It handles inline markup recognition.  A common extension is the addition of
further implicit hyperlinks, like "RFC 2822".  This can be done by subclassing
`states.Inliner`, adding a new method for the implicit markup, and adding a
``(pattern, method)`` pair to the "implicit_dispatch" attribute of the
subclass.  See `states.Inliner.implicit_inline()` for details.  Explicit
inline markup can be customized in a `states.Inliner` subclass via the
``patterns.initial`` and ``dispatch`` attributes (and new methods as
appropriate).
"""

__docformat__ = 'reStructuredText'


import docutils.parsers
import docutils.statemachine
from docutils.parsers.rst import states
from docutils import frontend


class Parser(docutils.parsers.Parser):

    """The reStructuredText parser."""

    supported = ('restructuredtext', 'rst', 'rest', 'restx', 'rtxt', 'rstx')
    """Aliases this parser supports."""

    settings_spec = (
        'reStructuredText Parser Options',
        None,
        (('Recognize and link to standalone PEP references (like "PEP 258").',
          ['--pep-references'],
          {'action': 'store_true', 'validator': frontend.validate_boolean}),
         ('Base URL for PEP references '
          '(default "http://www.python.org/dev/peps/").',
          ['--pep-base-url'],
          {'metavar': '<URL>', 'default': 'http://www.python.org/dev/peps/',
           'validator': frontend.validate_url_trailing_slash}),
         ('Template for PEP file part of URL. (default "pep-%04d")',
          ['--pep-file-url-template'],
          {'metavar': '<URL>', 'default': 'pep-%04d'}),
         ('Recognize and link to standalone RFC references (like "RFC 822").',
          ['--rfc-references'],
          {'action': 'store_true', 'validator': frontend.validate_boolean}),
         ('Base URL for RFC references (default "http://www.faqs.org/rfcs/").',
          ['--rfc-base-url'],
          {'metavar': '<URL>', 'default': 'http://www.faqs.org/rfcs/',
           'validator': frontend.validate_url_trailing_slash}),
         ('Set number of spaces for tab expansion (default 8).',
          ['--tab-width'],
          {'metavar': '<width>', 'type': 'int', 'default': 8,
           'validator': frontend.validate_nonnegative_int}),
         ('Remove spaces before footnote references.',
          ['--trim-footnote-reference-space'],
          {'action': 'store_true', 'validator': frontend.validate_boolean}),
         ('Leave spaces before footnote references.',
          ['--leave-footnote-reference-space'],
          {'action': 'store_false', 'dest': 'trim_footnote_reference_space',
           'validator': frontend.validate_boolean}),
         ('Disable directives that insert the contents of external file '
          '("include" & "raw"); replaced with a "warning" system message.',
          ['--no-file-insertion'],
          {'action': 'store_false', 'default': 1,
           'dest': 'file_insertion_enabled'}),
         ('Enable directives that insert the contents of external file '
          '("include" & "raw").  Enabled by default.',
          ['--file-insertion-enabled'],
          {'action': 'store_true', 'dest': 'file_insertion_enabled'}),
         ('Disable the "raw" directives; replaced with a "warning" '
          'system message.',
          ['--no-raw'],
          {'action': 'store_false', 'default': 1, 'dest': 'raw_enabled'}),
         ('Enable the "raw" directive.  Enabled by default.',
          ['--raw-enabled'],
          {'action': 'store_true', 'dest': 'raw_enabled'}),))

    config_section = 'restructuredtext parser'
    config_section_dependencies = ('parsers',)

    def __init__(self, rfc2822=None, inliner=None):
        if rfc2822:
            self.initial_state = 'RFC2822Body'
        else:
            self.initial_state = 'Body'
        self.state_classes = states.state_classes
        self.inliner = inliner

    def parse(self, inputstring, document):
        """Parse `inputstring` and populate `document`, a document tree."""
        self.setup_parse(inputstring, document)
        self.statemachine = states.RSTStateMachine(
              state_classes=self.state_classes,
              initial_state=self.initial_state,
              debug=document.reporter.debug_flag)
        inputlines = docutils.statemachine.string2lines(
              inputstring, tab_width=document.settings.tab_width,
              convert_whitespace=1)
        self.statemachine.run(inputlines, document, inliner=self.inliner)
        self.finish_parse()
