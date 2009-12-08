# epydoc
#
# Copyright (C) 2005 Edward Loper
# Author: Edward Loper <edloper@loper.org>
# URL: <http://epydoc.sf.net>
#
# $Id: __init__.py 1214 2006-04-11 17:26:56Z edloper $

"""
Automatic Python reference documentation generator.  Epydoc processes
Python modules and docstrings to generate formatted API documentation,
in the form of HTML pages.  Epydoc can be used via a command-line
interface (`epydoc.cli`) and a graphical interface (`epydoc.gui`).
Both interfaces let the user specify a set of modules or other objects
to document, and produce API documentation using the following steps:

1. Extract basic information about the specified objects, and objects
   that are related to them (such as the values defined by a module).
   This can be done via introspection, parsing, or both:

   * *Introspection* imports the objects, and examines them directly
     using Python's introspection mechanisms.
  
   * *Parsing* reads the Python source files that define the objects,
     and extracts information from those files.

2. Combine and process that information.

   * **Merging**: Merge the information obtained from introspection &
     parsing each object into a single structure.
     
   * **Linking**: Replace any \"pointers\" that were created for
     imported variables with the documentation that they point to.
     
   * **Naming**: Assign unique *canonical names* to each of the
     specified objects, and any related objects.
     
   * **Docstrings**: Parse the docstrings of each of the specified
     objects.
     
   * **Inheritance**: Add variables to classes for any values that
     they inherit from their base classes.

3. Generate output.  Output can be generated in a variety of formats:

   * An HTML webpage.
  
   * A LaTeX document (which can be rendered as a PDF file)

   * A plaintext description.

.. digraph:: Overview of epydoc's architecture
   :caption: The boxes represent steps in epydoc's processing chain.
             Arrows are annotated with the data classes used to
             communicate between steps.  The lines along the right
             side mark what portions of the processing chain are
             initiated by build_doc_index() and cli().  Click on
             any item to see its documentation.
             
   /*
                  Python module or value                 *       *
                      /           \                      |       |
                     V             V                     |       |
            introspect_docs()  parse_docs()              |       |
                        \        /                       |       |
                         V      V                        |       |
                        merge_docs()                     |       |
                             |              build_doc_index()  cli()
                             V                           |       |
                       link_imports()                    |       |
                             |                           |       |
                             V                           |       |
                    assign_canonical_names()             |       |
                             |                           |       |
                             V                           |       |
                      parse_docstrings()                 |       |
                             |                           |       |
                             V                           |       |
                       inherit_docs()                    *       |
                      /      |        \                          |
                     V       V         V                         |
                HTMLWriter LaTeXWriter PlaintextWriter           *
   */

   ranksep = 0.1;
   node [shape="box", height="0", width="0"]
   
   { /* Task nodes */
     node [fontcolor=\"#000060\"]
     introspect  [label="Introspect value:\\nintrospect_docs()",
                  href="<docintrospecter.introspect_docs>"]
     parse       [label="Parse source code:\\nparse_docs()",
                  href="<docparser.parse_docs>"]
     merge       [label="Merge introspected & parsed docs:\\nmerge_docs()",
                  href="<docbuilder.merge_docs>", width="2.5"]
     link        [label="Link imports:\\nlink_imports()",
                  href="<docbuilder.link_imports>", width="2.5"]
     name        [label="Assign names:\\nassign_canonical_names()",
                  href="<docbuilder.assign_canonical_names>", width="2.5"]
     docstrings  [label="Parse docstrings:\\nparse_docstring()",
                  href="<docstringparser.parse_docstring>", width="2.5"]
     inheritance [label="Inherit docs from bases:\\ninherit_docs()",
                  href="<docbuilder.inherit_docs>", width="2.5"]
     write_html  [label="Write HTML output:\\nHTMLWriter",
                 href="<docwriter.html>"]
     write_latex  [label="Write LaTeX output:\\nLaTeXWriter",
                 href="<docwriter.latex>"]
     write_text  [label="Write text output:\\nPlaintextWriter",
                 href="<docwriter.plaintext>"]
   }

   { /* Input & Output nodes */
     node [fontcolor=\"#602000\", shape="plaintext"]
     input [label="Python module or value"]
     output [label="DocIndex", href="<apidoc.DocIndex>"]
   }

   { /* Graph edges */
     edge [fontcolor=\"#602000\"]
     input -> introspect
     introspect -> merge [label="APIDoc", href="<apidoc.APIDoc>"]
     input -> parse
     parse -> merge [label="APIDoc", href="<apidoc.APIDoc>"]
     merge -> link [label=" DocIndex", href="<apidoc.DocIndex>"]
     link -> name [label=" DocIndex", href="<apidoc.DocIndex>"]
     name -> docstrings [label=" DocIndex", href="<apidoc.DocIndex>"]
     docstrings -> inheritance [label=" DocIndex", href="<apidoc.DocIndex>"]
     inheritance -> output
     output -> write_html
     output -> write_latex
     output -> write_text
   }

   { /* Task collections */
     node [shape="circle",label="",width=.1,height=.1]
     edge [fontcolor="black", dir="none", fontcolor=\"#000060\"]
     l3 -> l4 [label=" epydoc.\\l docbuilder.\\l build_doc_index()",
               href="<docbuilder.build_doc_index>"]
     l1 -> l2 [label=" epydoc.\\l cli()", href="<cli>"]
   }
   { rank=same; l1 l3 input }
   { rank=same; l2 write_html }
   { rank=same; l4 output }

Package Organization
====================
The epydoc package contains the following subpackages and modules:

.. packagetree::
   :style: UML

The user interfaces are provided by the `gui` and `cli` modules.
The `apidoc` module defines the basic data types used to record
information about Python objects.  The programmatic interface to
epydoc is provided by `docbuilder`.  Docstring markup parsing is
handled by the `markup` package, and output generation is handled by
the `docwriter` package.  See the submodule list for more
information about the submodules and subpackages.

:group User Interface: gui, cli
:group Basic Data Types: apidoc
:group Documentation Generation: docbuilder, docintrospecter, docparser
:group Docstring Processing: docstringparser, markup
:group Output Generation: docwriter
:group Completeness Checking: checker
:group Miscellaneous: log, util, test, compat

:author: `Edward Loper <edloper@gradient.cis.upenn.edu>`__
:requires: Python 2.3+
:version: 3.0 alpha 2
:see: `The epydoc webpage <http://epydoc.sourceforge.net>`__
:see: `The epytext markup language
    manual <http://epydoc.sourceforge.net/epytext.html>`__

:todo: Create a better default top_page than trees.html.
:todo: Fix trees.html to work when documenting non-top-level
       modules/packages
:todo: Implement @include
:todo: Optimize epytext
:todo: More doctests
:todo: When introspecting, limit how much introspection you do (eg,
       don't construct docs for imported modules' vars if it's
       not necessary)

:license: IBM Open Source License
:copyright: |copy| 2006 Edward Loper

:newfield contributor: Contributor, Contributors (Alphabetical Order)
:contributor: `Glyph Lefkowitz  <mailto:glyph@twistedmatrix.com>`__
:contributor: `Edward Loper  <mailto:edloper@gradient.cis.upenn.edu>`__
:contributor: `Bruce Mitchener  <mailto:bruce@cubik.org>`__
:contributor: `Jeff O'Halloran  <mailto:jeff@ohalloran.ca>`__
:contributor: `Simon Pamies  <mailto:spamies@bipbap.de>`__
:contributor: `Christian Reis  <mailto:kiko@async.com.br>`__
:contributor: `Daniele Varrazzo  <mailto:daniele.varrazzo@gmail.com>`__

.. |copy| unicode:: 0xA9 .. copyright sign
"""
__docformat__ = 'restructuredtext en'

__version__ = '3.0alpha2'
"""The version of epydoc"""

__author__ = 'Edward Loper <edloper@gradient.cis.upenn.edu>'
"""The primary author of eypdoc"""

__url__ = 'http://epydoc.sourceforge.net'
"""The URL for epydoc's homepage"""

__license__ = 'IBM Open Source License'
"""The license governing the use and distribution of epydoc"""

# [xx] this should probably be a private variable:
DEBUG = True
"""True if debugging is turned on."""

# Changes needed for docs:
#   - document the method for deciding what's public/private
#   - epytext: fields are defined slightly differently (@group)
#   - new fields
#   - document __extra_epydoc_fields__ and @newfield
#   - Add a faq?
#   - @type a,b,c: ...
#   - new command line option: --command-line-order

