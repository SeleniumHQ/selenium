# Author: Engelbert Gruber
# Contact: grubert@users.sourceforge.net
# Revision: $Revision: 4515 $
# Date: $Date: 2006-04-24 11:15:38 +0200 (Mon, 24 Apr 2006) $
# Copyright: This module has been placed in the public domain.

"""
LaTeX2e document tree Writer.
"""

__docformat__ = 'reStructuredText'

# code contributions from several people included, thanks to all.
# some named: David Abrahams, Julien Letessier, Lele Gaifax, and others.
#
# convention deactivate code by two # e.g. ##.

import sys
import time
import re
import string
from types import ListType
from docutils import frontend, nodes, languages, writers, utils


class Writer(writers.Writer):

    supported = ('latex','latex2e')
    """Formats this writer supports."""

    settings_spec = (
        'LaTeX-Specific Options',
        'The LaTeX "--output-encoding" default is "latin-1:strict".',
        (('Specify documentclass.  Default is "article".',
          ['--documentclass'],
          {'default': 'article', }),
         ('Specify document options.  Multiple options can be given, '
          'separated by commas.  Default is "10pt,a4paper".',
          ['--documentoptions'],
          {'default': '10pt,a4paper', }),
         ('Use LaTeX footnotes. LaTeX supports only numbered footnotes (does it?). '
          'Default: no, uses figures.',
          ['--use-latex-footnotes'],
          {'default': 0, 'action': 'store_true',
           'validator': frontend.validate_boolean}),
         ('Format for footnote references: one of "superscript" or '
          '"brackets".  Default is "superscript".',
          ['--footnote-references'],
          {'choices': ['superscript', 'brackets'], 'default': 'superscript',
           'metavar': '<format>',
           'overrides': 'trim_footnote_reference_space'}),
         ('Use LaTeX citations. '
          'Default: no, uses figures which might get mixed with images.',
          ['--use-latex-citations'],
          {'default': 0, 'action': 'store_true',
           'validator': frontend.validate_boolean}),
         ('Format for block quote attributions: one of "dash" (em-dash '
          'prefix), "parentheses"/"parens", or "none".  Default is "dash".',
          ['--attribution'],
          {'choices': ['dash', 'parentheses', 'parens', 'none'],
           'default': 'dash', 'metavar': '<format>'}),
         ('Specify a stylesheet file. The file will be "input" by latex in '
          'the document header.  Default is no stylesheet ("").  '
          'Overrides --stylesheet-path.',
          ['--stylesheet'],
          {'default': '', 'metavar': '<file>',
           'overrides': 'stylesheet_path'}),
         ('Specify a stylesheet file, relative to the current working '
          'directory.  Overrides --stylesheet.',
          ['--stylesheet-path'],
          {'metavar': '<file>', 'overrides': 'stylesheet'}),
         ('Table of contents by docutils (default) or latex. Latex (writer) '
          'supports only one ToC per document, but docutils does not write '
          'pagenumbers.',
          ['--use-latex-toc'],
          {'default': 0, 'action': 'store_true',
           'validator': frontend.validate_boolean}),
         ('Let LaTeX print author and date, do not show it in docutils '
          'document info.',
          ['--use-latex-docinfo'],
          {'default': 0, 'action': 'store_true',
           'validator': frontend.validate_boolean}),
         ('Color of any hyperlinks embedded in text '
          '(default: "blue", "0" to disable).',
          ['--hyperlink-color'], {'default': 'blue'}),
         ('Enable compound enumerators for nested enumerated lists '
          '(e.g. "1.2.a.ii").  Default: disabled.',
          ['--compound-enumerators'],
          {'default': None, 'action': 'store_true',
           'validator': frontend.validate_boolean}),
         ('Disable compound enumerators for nested enumerated lists.  This is '
          'the default.',
          ['--no-compound-enumerators'],
          {'action': 'store_false', 'dest': 'compound_enumerators'}),
         ('Enable section ("." subsection ...) prefixes for compound '
          'enumerators.  This has no effect without --compound-enumerators.  '
          'Default: disabled.',
          ['--section-prefix-for-enumerators'],
          {'default': None, 'action': 'store_true',
           'validator': frontend.validate_boolean}),
         ('Disable section prefixes for compound enumerators.  '
          'This is the default.',
          ['--no-section-prefix-for-enumerators'],
          {'action': 'store_false', 'dest': 'section_prefix_for_enumerators'}),
         ('Set the separator between section number and enumerator '
          'for compound enumerated lists.  Default is "-".',
          ['--section-enumerator-separator'],
          {'default': '-', 'metavar': '<char>'}),
         ('When possibile, use verbatim for literal-blocks. '
          'Default is to always use the mbox environment.',
          ['--use-verbatim-when-possible'],
          {'default': 0, 'action': 'store_true',
           'validator': frontend.validate_boolean}),
         ('Table style. "standard" with horizontal and vertical lines, '
          '"booktabs" (LaTeX booktabs style) only horizontal lines '
          'above and below the table and below the header or "nolines".  '
          'Default: "standard"',
          ['--table-style'],
          {'choices': ['standard', 'booktabs','nolines'], 'default': 'standard',
           'metavar': '<format>'}),
         ('LaTeX graphicx package option. '
          'Possible values are "dvips", "pdftex". "auto" includes LaTeX code '
          'to use "pdftex" if processing with pdf(la)tex and dvips otherwise. '
          'Default is no option.',
          ['--graphicx-option'],
          {'default': ''}),
         ('LaTeX font encoding. '
          'Possible values are "T1", "OT1", "" or some other fontenc option. '
          'The font encoding influences available symbols, e.g. "<<" as one '
          'character. Default is "" which leads to package "ae" (a T1 '
          'emulation using CM fonts).',
          ['--font-encoding'],
          {'default': ''}),
          ),)

    settings_defaults = {'output_encoding': 'latin-1'}

    relative_path_settings = ('stylesheet_path',)

    config_section = 'latex2e writer'
    config_section_dependencies = ('writers',)

    output = None
    """Final translated form of `document`."""

    def __init__(self):
        writers.Writer.__init__(self)
        self.translator_class = LaTeXTranslator

    def translate(self):
        visitor = self.translator_class(self.document)
        self.document.walkabout(visitor)
        self.output = visitor.astext()
        self.head_prefix = visitor.head_prefix
        self.head = visitor.head
        self.body_prefix = visitor.body_prefix
        self.body = visitor.body
        self.body_suffix = visitor.body_suffix

"""
Notes on LaTeX
--------------

* latex does not support multiple tocs in one document.
  (might be no limitation except for docutils documentation)

* width

  * linewidth - width of a line in the local environment
  * textwidth - the width of text on the page

  Maybe always use linewidth ?

  *Bug* inside a minipage a (e.g. Sidebar) the linewidth is
        not changed, needs fix in docutils so that tables
        are not too wide.

        So we add locallinewidth set it initially and
        on entering sidebar and reset on exit.
"""

class Babel:
    """Language specifics for LaTeX."""
    # country code by a.schlock.
    # partly manually converted from iso and babel stuff, dialects and some
    _ISO639_TO_BABEL = {
        'no': 'norsk',     #XXX added by hand ( forget about nynorsk?)
        'gd': 'scottish',  #XXX added by hand
        'hu': 'magyar',    #XXX added by hand
        'pt': 'portuguese',#XXX added by hand
        'sl': 'slovenian',
        'af': 'afrikaans',
        'bg': 'bulgarian',
        'br': 'breton',
        'ca': 'catalan',
        'cs': 'czech',
        'cy': 'welsh',
        'da': 'danish',
        'fr': 'french',
        # french, francais, canadien, acadian
        'de': 'ngerman',  #XXX rather than german
        # ngerman, naustrian, german, germanb, austrian
        'el': 'greek',
        'en': 'english',
        # english, USenglish, american, UKenglish, british, canadian
        'eo': 'esperanto',
        'es': 'spanish',
        'et': 'estonian',
        'eu': 'basque',
        'fi': 'finnish',
        'ga': 'irish',
        'gl': 'galician',
        'he': 'hebrew',
        'hr': 'croatian',
        'hu': 'hungarian',
        'is': 'icelandic',
        'it': 'italian',
        'la': 'latin',
        'nl': 'dutch',
        'pl': 'polish',
        'pt': 'portuguese',
        'ro': 'romanian',
        'ru': 'russian',
        'sk': 'slovak',
        'sr': 'serbian',
        'sv': 'swedish',
        'tr': 'turkish',
        'uk': 'ukrainian'
    }

    def __init__(self,lang):
        self.language = lang
        # pdflatex does not produce double quotes for ngerman in tt.
        self.double_quote_replacment = None
        if re.search('^de',self.language):
            #self.quotes = ("\"`", "\"'")
            self.quotes = ('{\\glqq}', '{\\grqq}')
            self.double_quote_replacment = "{\\dq}"
        else:
            self.quotes = ("``", "''")
        self.quote_index = 0

    def next_quote(self):
        q = self.quotes[self.quote_index]
        self.quote_index = (self.quote_index+1)%2
        return q

    def quote_quotes(self,text):
        t = None
        for part in text.split('"'):
            if t == None:
                t = part
            else:
                t += self.next_quote() + part
        return t

    def double_quotes_in_tt (self,text):
        if not self.double_quote_replacment:
            return text
        return text.replace('"', self.double_quote_replacment)

    def get_language(self):
        if self._ISO639_TO_BABEL.has_key(self.language):
            return self._ISO639_TO_BABEL[self.language]
        else:
            # support dialects.
            l = self.language.split("_")[0]
            if self._ISO639_TO_BABEL.has_key(l):
                return self._ISO639_TO_BABEL[l]
        return None


latex_headings = {
        'optionlist_environment' : [
              '\\newcommand{\\optionlistlabel}[1]{\\bf #1 \\hfill}\n'
              '\\newenvironment{optionlist}[1]\n'
              '{\\begin{list}{}\n'
              '  {\\setlength{\\labelwidth}{#1}\n'
              '   \\setlength{\\rightmargin}{1cm}\n'
              '   \\setlength{\\leftmargin}{\\rightmargin}\n'
              '   \\addtolength{\\leftmargin}{\\labelwidth}\n'
              '   \\addtolength{\\leftmargin}{\\labelsep}\n'
              '   \\renewcommand{\\makelabel}{\\optionlistlabel}}\n'
              '}{\\end{list}}\n',
              ],
        'lineblock_environment' : [
            '\\newlength{\\lineblockindentation}\n'
            '\\setlength{\\lineblockindentation}{2.5em}\n'
            '\\newenvironment{lineblock}[1]\n'
            '{\\begin{list}{}\n'
            '  {\\setlength{\\partopsep}{\\parskip}\n'
            '   \\addtolength{\\partopsep}{\\baselineskip}\n'
            '   \\topsep0pt\\itemsep0.15\\baselineskip\\parsep0pt\n'
            '   \\leftmargin#1}\n'
            ' \\raggedright}\n'
            '{\\end{list}}\n'
            ],
        'footnote_floats' : [
            '% begin: floats for footnotes tweaking.\n',
            '\\setlength{\\floatsep}{0.5em}\n',
            '\\setlength{\\textfloatsep}{\\fill}\n',
            '\\addtolength{\\textfloatsep}{3em}\n',
            '\\renewcommand{\\textfraction}{0.5}\n',
            '\\renewcommand{\\topfraction}{0.5}\n',
            '\\renewcommand{\\bottomfraction}{0.5}\n',
            '\\setcounter{totalnumber}{50}\n',
            '\\setcounter{topnumber}{50}\n',
            '\\setcounter{bottomnumber}{50}\n',
            '% end floats for footnotes\n',
            ],
        'some_commands' : [
            '% some commands, that could be overwritten in the style file.\n'
            '\\newcommand{\\rubric}[1]'
            '{\\subsection*{~\\hfill {\\it #1} \\hfill ~}}\n'
            '\\newcommand{\\titlereference}[1]{\\textsl{#1}}\n'
            '% end of "some commands"\n',
            ]
        }

class DocumentClass:
    """Details of a LaTeX document class."""

    # BUG: LaTeX has no deeper sections (actually paragrah is no
    # section either).
    # BUG: No support for unknown document classes.  Make 'article'
    # default?
    _class_sections = {
        'book': ( 'chapter', 'section', 'subsection', 'subsubsection' ),
        'scrbook': ( 'chapter', 'section', 'subsection', 'subsubsection' ),
        'report': ( 'chapter', 'section', 'subsection', 'subsubsection' ),
        'scrreprt': ( 'chapter', 'section', 'subsection', 'subsubsection' ),
        'article': ( 'section', 'subsection', 'subsubsection' ),
        'scrartcl': ( 'section', 'subsection', 'subsubsection' ),
        }
    _deepest_section = 'subsubsection'

    def __init__(self, document_class):
        self.document_class = document_class

    def section(self, level):
        """ Return the section name at the given level for the specific
            document class.

            Level is 1,2,3..., as level 0 is the title."""

        sections = self._class_sections[self.document_class]
        if level <= len(sections):
            return sections[level-1]
        else:
            return self._deepest_section

class Table:
    """ Manage a table while traversing.
        Maybe change to a mixin defining the visit/departs, but then
        class Table internal variables are in the Translator.
    """
    def __init__(self,latex_type,table_style):
        self._latex_type = latex_type
        self._table_style = table_style
        self._open = 0
        # miscellaneous attributes
        self._attrs = {}
        self._col_width = []
        self._rowspan = []

    def open(self):
        self._open = 1
        self._col_specs = []
        self.caption = None
        self._attrs = {}
        self._in_head = 0 # maybe context with search
    def close(self):
        self._open = 0
        self._col_specs = None
        self.caption = None
        self._attrs = {}
    def is_open(self):
        return self._open
    def used_packages(self):
        if self._table_style == 'booktabs':
            return '\\usepackage{booktabs}\n'
        return ''
    def get_latex_type(self):
        return self._latex_type

    def set(self,attr,value):
        self._attrs[attr] = value
    def get(self,attr):
        if self._attrs.has_key(attr):
            return self._attrs[attr]
        return None
    def get_vertical_bar(self):
        if self._table_style == 'standard':
            return '|'
        return ''
    # horizontal lines are drawn below a row, because we.
    def get_opening(self):
        return '\\begin{%s}[c]' % self._latex_type
    def get_closing(self):
        line = ""
        if self._table_style == 'booktabs':
            line = '\\bottomrule\n'
        elif self._table_style == 'standard':
            lines = '\\hline\n'
        return '%s\\end{%s}' % (line,self._latex_type)

    def visit_colspec(self,node):
        self._col_specs.append(node)

    def get_colspecs(self):
        """
        Return column specification for longtable.

        Assumes reST line length being 80 characters.
        Table width is hairy.

        === ===
        ABC DEF
        === ===

        usually gets to narrow, therefore we add 1 (fiddlefactor).
        """
        width = 80

        total_width = 0.0
        # first see if we get too wide.
        for node in self._col_specs:
            colwidth = float(node['colwidth']+1) / width
            total_width += colwidth
        self._col_width = []
        self._rowspan = []
        # donot make it full linewidth
        factor = 0.93
        if total_width > 1.0:
            factor /= total_width
        bar = self.get_vertical_bar()
        latex_table_spec = ""
        for node in self._col_specs:
            colwidth = factor * float(node['colwidth']+1) / width
            self._col_width.append(colwidth+0.005)
            self._rowspan.append(0)
            latex_table_spec += "%sp{%.2f\\locallinewidth}" % (bar,colwidth+0.005)
        return latex_table_spec+bar

    def get_column_width(self):
        """ return columnwidth for current cell (not multicell)
        """
        return "%.2f\\locallinewidth" % self._col_width[self._cell_in_row-1]

    def visit_thead(self):
        self._in_thead = 1
        if self._table_style == 'standard':
            return ['\\hline\n']
        elif self._table_style == 'booktabs':
            return ['\\toprule\n']
        return []
    def depart_thead(self):
        a = []
        #if self._table_style == 'standard':
        #    a.append('\\hline\n')
        if self._table_style == 'booktabs':
            a.append('\\midrule\n')
        a.append('\\endhead\n')
        # for longtable one could add firsthead, foot and lastfoot
        self._in_thead = 0
        return a
    def visit_row(self):
        self._cell_in_row = 0
    def depart_row(self):
        res = [' \\\\\n']
        self._cell_in_row = None  # remove cell counter
        for i in range(len(self._rowspan)):
            if (self._rowspan[i]>0):
                self._rowspan[i] -= 1

        if self._table_style == 'standard':
            rowspans = []
            for i in range(len(self._rowspan)):
                if (self._rowspan[i]<=0):
                    rowspans.append(i+1)
            if len(rowspans)==len(self._rowspan):
                res.append('\\hline\n')
            else:
                cline = ''
                rowspans.reverse()
                # TODO merge clines
                while 1:
                    try:
                        c_start = rowspans.pop()
                    except:
                        break
                    cline += '\\cline{%d-%d}\n' % (c_start,c_start)
                res.append(cline)
        return res

    def set_rowspan(self,cell,value):
        try:
            self._rowspan[cell] = value
        except:
            pass
    def get_rowspan(self,cell):
        try:
            return self._rowspan[cell]
        except:
            return 0
    def get_entry_number(self):
        return self._cell_in_row
    def visit_entry(self):
        self._cell_in_row += 1


class LaTeXTranslator(nodes.NodeVisitor):

    # When options are given to the documentclass, latex will pass them
    # to other packages, as done with babel.
    # Dummy settings might be taken from document settings

    latex_head = '\\documentclass[%s]{%s}\n'
    encoding = '\\usepackage[%s]{inputenc}\n'
    linking = '\\usepackage[colorlinks=%s,linkcolor=%s,urlcolor=%s]{hyperref}\n'
    stylesheet = '\\input{%s}\n'
    # add a generated on day , machine by user using docutils version.
    generator = '%% generator Docutils: http://docutils.sourceforge.net/\n'

    # use latex tableofcontents or let docutils do it.
    use_latex_toc = 0

    # TODO: use mixins for different implementations.
    # list environment for option-list. else tabularx
    use_optionlist_for_option_list = 1
    # list environment for docinfo. else tabularx
    use_optionlist_for_docinfo = 0 # NOT YET IN USE

    # Use compound enumerations (1.A.1.)
    compound_enumerators = 0

    # If using compound enumerations, include section information.
    section_prefix_for_enumerators = 0

    # This is the character that separates the section ("." subsection ...)
    # prefix from the regular list enumerator.
    section_enumerator_separator = '-'

    # default link color
    hyperlink_color = "blue"

    def __init__(self, document):
        nodes.NodeVisitor.__init__(self, document)
        self.settings = settings = document.settings
        self.latex_encoding = self.to_latex_encoding(settings.output_encoding)
        self.use_latex_toc = settings.use_latex_toc
        self.use_latex_docinfo = settings.use_latex_docinfo
        self.use_latex_footnotes = settings.use_latex_footnotes
        self._use_latex_citations = settings.use_latex_citations
        self.hyperlink_color = settings.hyperlink_color
        self.compound_enumerators = settings.compound_enumerators
        self.font_encoding = settings.font_encoding
        self.section_prefix_for_enumerators = (
            settings.section_prefix_for_enumerators)
        self.section_enumerator_separator = (
            settings.section_enumerator_separator.replace('_', '\\_'))
        if self.hyperlink_color == '0':
            self.hyperlink_color = 'black'
            self.colorlinks = 'false'
        else:
            self.colorlinks = 'true'

        # language: labels, bibliographic_fields, and author_separators.
        # to allow writing labes for specific languages.
        self.language = languages.get_language(settings.language_code)
        self.babel = Babel(settings.language_code)
        self.author_separator = self.language.author_separators[0]
        self.d_options = self.settings.documentoptions
        if self.babel.get_language():
            self.d_options += ',%s' % \
                    self.babel.get_language()

        self.d_class = DocumentClass(settings.documentclass)
        # object for a table while proccessing.
        self.active_table = Table('longtable',settings.table_style)

        # HACK.  Should have more sophisticated typearea handling.
        if settings.documentclass.find('scr') == -1:
            self.typearea = '\\usepackage[DIV12]{typearea}\n'
        else:
            if self.d_options.find('DIV') == -1 and self.d_options.find('BCOR') == -1:
                self.typearea = '\\typearea{12}\n'
            else:
                self.typearea = ''

        if self.font_encoding == 'OT1':
            fontenc_header = ''
        elif self.font_encoding == '':
            fontenc_header = '\\usepackage{ae}\n\\usepackage{aeguill}\n'
        else:
            fontenc_header = '\\usepackage[%s]{fontenc}\n' % (self.font_encoding,)
        input_encoding = self.encoding % self.latex_encoding
        if self.settings.graphicx_option == '':
            self.graphicx_package = '\\usepackage{graphicx}\n'
        elif self.settings.graphicx_option.lower() == 'auto':
            self.graphicx_package = '\n'.join(
                ('%Check if we are compiling under latex or pdflatex',
                 '\\ifx\\pdftexversion\\undefined',
                 '  \\usepackage{graphicx}',
                 '\\else',
                 '  \\usepackage[pdftex]{graphicx}',
                 '\\fi\n'))
        else:
            self.graphicx_package = (
                '\\usepackage[%s]{graphicx}\n' % self.settings.graphicx_option)

        self.head_prefix = [
              self.latex_head % (self.d_options,self.settings.documentclass),
              '\\usepackage{babel}\n',     # language is in documents settings.
              fontenc_header,
              '\\usepackage{shortvrb}\n',  # allows verb in footnotes.
              input_encoding,
              # * tabularx: for docinfo, automatic width of columns, always on one page.
              '\\usepackage{tabularx}\n',
              '\\usepackage{longtable}\n',
              self.active_table.used_packages(),
              # possible other packages.
              # * fancyhdr
              # * ltxtable is a combination of tabularx and longtable (pagebreaks).
              #   but ??
              #
              # extra space between text in tables and the line above them
              '\\setlength{\\extrarowheight}{2pt}\n',
              '\\usepackage{amsmath}\n',   # what fore amsmath.
              self.graphicx_package,
              '\\usepackage{color}\n',
              '\\usepackage{multirow}\n',
              '\\usepackage{ifthen}\n',   # before hyperref!
              self.linking % (self.colorlinks, self.hyperlink_color, self.hyperlink_color),
              self.typearea,
              self.generator,
              # latex lengths
              '\\newlength{\\admonitionwidth}\n',
              '\\setlength{\\admonitionwidth}{0.9\\textwidth}\n'
              # width for docinfo tablewidth
              '\\newlength{\\docinfowidth}\n',
              '\\setlength{\\docinfowidth}{0.9\\textwidth}\n'
              # linewidth of current environment, so tables are not wider
              # than the sidebar: using locallinewidth seems to defer evaluation
              # of linewidth, this is fixing it.
              '\\newlength{\\locallinewidth}\n',
              # will be set later.
              ]
        self.head_prefix.extend( latex_headings['optionlist_environment'] )
        self.head_prefix.extend( latex_headings['lineblock_environment'] )
        self.head_prefix.extend( latex_headings['footnote_floats'] )
        self.head_prefix.extend( latex_headings['some_commands'] )
        ## stylesheet is last: so it might be possible to overwrite defaults.
        stylesheet = utils.get_stylesheet_reference(settings)
        if stylesheet:
            settings.record_dependencies.add(stylesheet)
            self.head_prefix.append(self.stylesheet % (stylesheet))

        if self.linking: # and maybe check for pdf
            self.pdfinfo = [ ]
            self.pdfauthor = None
            # pdftitle, pdfsubject, pdfauthor, pdfkeywords, pdfcreator, pdfproducer
        else:
            self.pdfinfo = None
        # NOTE: Latex wants a date and an author, rst puts this into
        #   docinfo, so normally we donot want latex author/date handling.
        # latex article has its own handling of date and author, deactivate.
        # So we always emit \title{...} \author{...} \date{...}, even if the
        # "..." are empty strings.
        self.head = [ ]
        # separate title, so we can appen subtitle.
        self.title = ''
        # if use_latex_docinfo: collects lists of author/organization/contact/address lines
        self.author_stack = []
        self.date = ''

        self.body_prefix = ['\\raggedbottom\n']
        self.body = []
        self.body_suffix = ['\n']
        self.section_level = 0
        self.context = []
        self.topic_classes = []
        # column specification for tables
        self.table_caption = None
        
        # Flags to encode
        # ---------------
        # verbatim: to tell encode not to encode.
        self.verbatim = 0
        # insert_newline: to tell encode to replace blanks by "~".
        self.insert_none_breaking_blanks = 0
        # insert_newline: to tell encode to add latex newline.
        self.insert_newline = 0
        # mbox_newline: to tell encode to add mbox and newline.
        self.mbox_newline = 0

        # Stack of section counters so that we don't have to use_latex_toc.
        # This will grow and shrink as processing occurs.
        # Initialized for potential first-level sections.
        self._section_number = [0]

        # The current stack of enumerations so that we can expand
        # them into a compound enumeration.  
        self._enumeration_counters = []

        # The maximum number of enumeration counters we've used.
        # If we go beyond this number, we need to create a new
        # counter; otherwise, just reuse an old one.
        self._max_enumeration_counters = 0

        self._bibitems = []

        # docinfo.
        self.docinfo = None
        # inside literal block: no quote mangling.
        self.literal_block = 0
        self.literal_block_stack = []
        self.literal = 0
        # true when encoding in math mode
        self.mathmode = 0

    def to_latex_encoding(self,docutils_encoding):
        """
        Translate docutils encoding name into latex's.

        Default fallback method is remove "-" and "_" chars from docutils_encoding.

        """
        tr = {  "iso-8859-1": "latin1",     # west european
                "iso-8859-2": "latin2",     # east european
                "iso-8859-3": "latin3",     # esperanto, maltese
                "iso-8859-4": "latin4",     # north european,scandinavian, baltic
                "iso-8859-5": "iso88595",   # cyrillic (ISO)
                "iso-8859-9": "latin5",     # turkish
                "iso-8859-15": "latin9",    # latin9, update to latin1.
                "mac_cyrillic": "maccyr",   # cyrillic (on Mac)
                "windows-1251": "cp1251",   # cyrillic (on Windows)
                "koi8-r": "koi8-r",         # cyrillic (Russian)
                "koi8-u": "koi8-u",         # cyrillic (Ukrainian)
                "windows-1250": "cp1250",   #
                "windows-1252": "cp1252",   #
                "us-ascii": "ascii",        # ASCII (US)
                # unmatched encodings
                #"": "applemac",
                #"": "ansinew",  # windows 3.1 ansi
                #"": "ascii",    # ASCII encoding for the range 32--127.
                #"": "cp437",    # dos latine us
                #"": "cp850",    # dos latin 1
                #"": "cp852",    # dos latin 2
                #"": "decmulti",
                #"": "latin10",
                #"iso-8859-6": ""   # arabic
                #"iso-8859-7": ""   # greek
                #"iso-8859-8": ""   # hebrew
                #"iso-8859-10": ""   # latin6, more complete iso-8859-4
             }
        if tr.has_key(docutils_encoding.lower()):
            return tr[docutils_encoding.lower()]
        return docutils_encoding.translate(string.maketrans("",""),"_-").lower()

    def language_label(self, docutil_label):
        return self.language.labels[docutil_label]

    latex_equivalents = {
        u'\u00A0' : '~',
        u'\u2013' : '{--}',
        u'\u2014' : '{---}',
        u'\u2018' : '`',
        u'\u2019' : '\'',
        u'\u201A' : ',',
        u'\u201C' : '``',
        u'\u201D' : '\'\'',
        u'\u201E' : ',,',
        u'\u2020' : '{\\dag}',
        u'\u2021' : '{\\ddag}',
        u'\u2026' : '{\\dots}',
        u'\u2122' : '{\\texttrademark}',
        u'\u21d4' : '{$\\Leftrightarrow$}',
    }

    def unicode_to_latex(self,text):
        # see LaTeX codec
        # http://aspn.activestate.com/ASPN/Cookbook/Python/Recipe/252124
        # Only some special chracters are translated, for documents with many
        # utf-8 chars one should use the LaTeX unicode package.
        for uchar in self.latex_equivalents.keys():
            text = text.replace(uchar,self.latex_equivalents[uchar])
        return text

    def encode(self, text):
        """
        Encode special characters (``# $ % & ~ _ ^ \ { }``) in `text` & return
        """
        # Escaping with a backslash does not help with backslashes, ~ and ^.

        #     < > are only available in math-mode or tt font. (really ?)
        #     $ starts math- mode.
        # AND quotes
        if self.verbatim:
            return text
        # compile the regexps once. do it here so one can see them.
        #
        # first the braces.
        if not self.__dict__.has_key('encode_re_braces'):
            self.encode_re_braces = re.compile(r'([{}])')
        text = self.encode_re_braces.sub(r'{\\\1}',text)
        if not self.__dict__.has_key('encode_re_bslash'):
            # find backslash: except in the form '{\{}' or '{\}}'.
            self.encode_re_bslash = re.compile(r'(?<!{)(\\)(?![{}]})')
        # then the backslash: except in the form from line above:
        # either '{\{}' or '{\}}'.
        text = self.encode_re_bslash.sub(r'{\\textbackslash}', text)

        # then dollar
        text = text.replace("$", '{\\$}')
        if not ( self.literal_block or self.literal or self.mathmode ):
            # the vertical bar: in mathmode |,\vert or \mid
            #   in textmode \textbar
            text = text.replace("|", '{\\textbar}')
            text = text.replace("<", '{\\textless}')
            text = text.replace(">", '{\\textgreater}')
        # then
        text = text.replace("&", '{\\&}')
        # the ^:
        # * verb|^| does not work in mbox.
        # * mathmode has wedge. hat{~} would also work.
        # text = text.replace("^", '{\\ensuremath{^\\wedge}}')
        text = text.replace("^", '{\\textasciicircum}')
        text = text.replace("%", '{\\%}')
        text = text.replace("#", '{\\#}')
        text = text.replace("~", '{\\textasciitilde}')
        # Separate compound characters, e.g. "--" to "-{}-".  (The
        # actual separation is done later; see below.)
        separate_chars = '-'
        if self.literal_block or self.literal:
            # In monospace-font, we also separate ",,", "``" and "''"
            # and some other characters which can't occur in
            # non-literal text.
            separate_chars += ',`\'"<>'
            # pdflatex does not produce doublequotes for ngerman.
            text = self.babel.double_quotes_in_tt(text)
            if self.font_encoding == 'OT1':
                # We're using OT1 font-encoding and have to replace
                # underscore by underlined blank, because this has
                # correct width.
                text = text.replace('_', '{\\underline{ }}')
                # And the tt-backslash doesn't work in OT1, so we use
                # a mirrored slash.
                text = text.replace('\\textbackslash', '\\reflectbox{/}')
            else:
                text = text.replace('_', '{\\_}')
        else:
            text = self.babel.quote_quotes(text)
            text = text.replace("_", '{\\_}')
        for char in separate_chars * 2:
            # Do it twice ("* 2") becaues otherwise we would replace
            # "---" by "-{}--".
            text = text.replace(char + char, char + '{}' + char)
        if self.insert_newline or self.literal_block:
            # Insert a blank before the newline, to avoid
            # ! LaTeX Error: There's no line here to end.
            text = text.replace("\n", '~\\\\\n')
        elif self.mbox_newline:
            if self.literal_block:
                closings = "}" * len(self.literal_block_stack)
                openings = "".join(self.literal_block_stack)
            else:
                closings = ""
                openings = ""
            text = text.replace("\n", "%s}\\\\\n\\mbox{%s" % (closings,openings))
        text = text.replace('[', '{[}').replace(']', '{]}')
        if self.insert_none_breaking_blanks:
            text = text.replace(' ', '~')
        if self.latex_encoding != 'utf8':
            text = self.unicode_to_latex(text)
        return text

    def attval(self, text,
               whitespace=re.compile('[\n\r\t\v\f]')):
        """Cleanse, encode, and return attribute value text."""
        return self.encode(whitespace.sub(' ', text))

    def astext(self):
        if self.pdfinfo is not None:
            if self.pdfauthor:
                self.pdfinfo.append('pdfauthor={%s}' % self.pdfauthor)
        if self.pdfinfo:
            pdfinfo = '\\hypersetup{\n' + ',\n'.join(self.pdfinfo) + '\n}\n'
        else:
            pdfinfo = ''
        head = '\\title{%s}\n\\author{%s}\n\\date{%s}\n' % \
               (self.title,
                ' \\and\n'.join(['~\\\\\n'.join(author_lines)
                                 for author_lines in self.author_stack]),
                self.date)
        return ''.join(self.head_prefix + [head] + self.head + [pdfinfo]
                        + self.body_prefix  + self.body + self.body_suffix)

    def visit_Text(self, node):
        self.body.append(self.encode(node.astext()))

    def depart_Text(self, node):
        pass

    def visit_address(self, node):
        self.visit_docinfo_item(node, 'address')

    def depart_address(self, node):
        self.depart_docinfo_item(node)

    def visit_admonition(self, node, name=''):
        self.body.append('\\begin{center}\\begin{sffamily}\n')
        self.body.append('\\fbox{\\parbox{\\admonitionwidth}{\n')
        if name:
            self.body.append('\\textbf{\\large '+ self.language.labels[name] + '}\n');
        self.body.append('\\vspace{2mm}\n')


    def depart_admonition(self, node=None):
        self.body.append('}}\n') # end parbox fbox
        self.body.append('\\end{sffamily}\n\\end{center}\n');

    def visit_attention(self, node):
        self.visit_admonition(node, 'attention')

    def depart_attention(self, node):
        self.depart_admonition()

    def visit_author(self, node):
        self.visit_docinfo_item(node, 'author')

    def depart_author(self, node):
        self.depart_docinfo_item(node)

    def visit_authors(self, node):
        # not used: visit_author is called anyway for each author.
        pass

    def depart_authors(self, node):
        pass

    def visit_block_quote(self, node):
        self.body.append( '\\begin{quote}\n')

    def depart_block_quote(self, node):
        self.body.append( '\\end{quote}\n')

    def visit_bullet_list(self, node):
        if 'contents' in self.topic_classes:
            if not self.use_latex_toc:
                self.body.append( '\\begin{list}{}{}\n' )
        else:
            self.body.append( '\\begin{itemize}\n' )

    def depart_bullet_list(self, node):
        if 'contents' in self.topic_classes:
            if not self.use_latex_toc:
                self.body.append( '\\end{list}\n' )
        else:
            self.body.append( '\\end{itemize}\n' )

    # Imperfect superscript/subscript handling: mathmode italicizes
    # all letters by default.
    def visit_superscript(self, node):
        self.body.append('$^{')
        self.mathmode = 1

    def depart_superscript(self, node):
        self.body.append('}$')
        self.mathmode = 0

    def visit_subscript(self, node):
        self.body.append('$_{')
        self.mathmode = 1

    def depart_subscript(self, node):
        self.body.append('}$')
        self.mathmode = 0

    def visit_caption(self, node):
        self.body.append( '\\caption{' )

    def depart_caption(self, node):
        self.body.append('}')

    def visit_caution(self, node):
        self.visit_admonition(node, 'caution')

    def depart_caution(self, node):
        self.depart_admonition()

    def visit_title_reference(self, node):
        self.body.append( '\\titlereference{' )

    def depart_title_reference(self, node):
        self.body.append( '}' )

    def visit_citation(self, node):
        # TODO maybe use cite bibitems
        if self._use_latex_citations:
            self.context.append(len(self.body))
        else:
            self.body.append('\\begin{figure}[b]')
            for id in node['ids']:
                self.body.append('\\hypertarget{%s}' % id)

    def depart_citation(self, node):
        if self._use_latex_citations:
            size = self.context.pop()
            label = self.body[size]
            text = ''.join(self.body[size+1:])
            del self.body[size:]
            self._bibitems.append([label, text])
        else:
            self.body.append('\\end{figure}\n')

    def visit_citation_reference(self, node):
        if self._use_latex_citations:
            self.body.append('\\cite{')
        else:
            href = ''
            if node.has_key('refid'):
                href = node['refid']
            elif node.has_key('refname'):
                href = self.document.nameids[node['refname']]
            self.body.append('[\\hyperlink{%s}{' % href)

    def depart_citation_reference(self, node):
        if self._use_latex_citations:
            self.body.append('}')
        else:
            self.body.append('}]')

    def visit_classifier(self, node):
        self.body.append( '(\\textbf{' )

    def depart_classifier(self, node):
        self.body.append( '})\n' )

    def visit_colspec(self, node):
        self.active_table.visit_colspec(node)

    def depart_colspec(self, node):
        pass

    def visit_comment(self, node):
        # Escape end of line by a new comment start in comment text.
        self.body.append('%% %s \n' % node.astext().replace('\n', '\n% '))
        raise nodes.SkipNode

    def visit_compound(self, node):
        pass

    def depart_compound(self, node):
        pass

    def visit_contact(self, node):
        self.visit_docinfo_item(node, 'contact')

    def depart_contact(self, node):
        self.depart_docinfo_item(node)

    def visit_container(self, node):
        pass

    def depart_container(self, node):
        pass

    def visit_copyright(self, node):
        self.visit_docinfo_item(node, 'copyright')

    def depart_copyright(self, node):
        self.depart_docinfo_item(node)

    def visit_danger(self, node):
        self.visit_admonition(node, 'danger')

    def depart_danger(self, node):
        self.depart_admonition()

    def visit_date(self, node):
        self.visit_docinfo_item(node, 'date')

    def depart_date(self, node):
        self.depart_docinfo_item(node)

    def visit_decoration(self, node):
        pass

    def depart_decoration(self, node):
        pass

    def visit_definition(self, node):
        self.body.append('%[visit_definition]\n')

    def depart_definition(self, node):
        self.body.append('\n')
        self.body.append('%[depart_definition]\n')

    def visit_definition_list(self, node):
        self.body.append( '\\begin{description}\n' )

    def depart_definition_list(self, node):
        self.body.append( '\\end{description}\n' )

    def visit_definition_list_item(self, node):
        self.body.append('%[visit_definition_list_item]\n')

    def depart_definition_list_item(self, node):
        self.body.append('%[depart_definition_list_item]\n')

    def visit_description(self, node):
        if self.use_optionlist_for_option_list:
            self.body.append( ' ' )
        else:
            self.body.append( ' & ' )

    def depart_description(self, node):
        pass

    def visit_docinfo(self, node):
        self.docinfo = []
        self.docinfo.append('%' + '_'*75 + '\n')
        self.docinfo.append('\\begin{center}\n')
        self.docinfo.append('\\begin{tabularx}{\\docinfowidth}{lX}\n')

    def depart_docinfo(self, node):
        self.docinfo.append('\\end{tabularx}\n')
        self.docinfo.append('\\end{center}\n')
        self.body = self.docinfo + self.body
        # clear docinfo, so field names are no longer appended.
        self.docinfo = None

    def visit_docinfo_item(self, node, name):
        if name == 'author':
            if not self.pdfinfo == None:
                if not self.pdfauthor:
                    self.pdfauthor = self.attval(node.astext())
                else:
                    self.pdfauthor += self.author_separator + self.attval(node.astext())
        if self.use_latex_docinfo:
            if name in ('author', 'organization', 'contact', 'address'):
                # We attach these to the last author.  If any of them precedes
                # the first author, put them in a separate "author" group (for
                # no better semantics).
                if name == 'author' or not self.author_stack:
                    self.author_stack.append([])
                if name == 'address':   # newlines are meaningful
                    self.insert_newline = 1
                    text = self.encode(node.astext())
                    self.insert_newline = 0
                else:
                    text = self.attval(node.astext())
                self.author_stack[-1].append(text)
                raise nodes.SkipNode
            elif name == 'date':
                self.date = self.attval(node.astext())
                raise nodes.SkipNode
        self.docinfo.append('\\textbf{%s}: &\n\t' % self.language_label(name))
        if name == 'address':
            self.insert_newline = 1
            self.docinfo.append('{\\raggedright\n')
            self.context.append(' } \\\\\n')
        else:
            self.context.append(' \\\\\n')
        self.context.append(self.docinfo)
        self.context.append(len(self.body))

    def depart_docinfo_item(self, node):
        size = self.context.pop()
        dest = self.context.pop()
        tail = self.context.pop()
        tail = self.body[size:] + [tail]
        del self.body[size:]
        dest.extend(tail)
        # for address we did set insert_newline
        self.insert_newline = 0

    def visit_doctest_block(self, node):
        self.body.append( '\\begin{verbatim}' )
        self.verbatim = 1

    def depart_doctest_block(self, node):
        self.body.append( '\\end{verbatim}\n' )
        self.verbatim = 0

    def visit_document(self, node):
        self.body_prefix.append('\\begin{document}\n')
        # titled document?
        if self.use_latex_docinfo or len(node) and isinstance(node[0], nodes.title):
            self.body_prefix.append('\\maketitle\n\n')
            # alternative use titlepage environment.
            # \begin{titlepage}
        self.body.append('\n\\setlength{\\locallinewidth}{\\linewidth}\n')

    def depart_document(self, node):
        # TODO insertion point of bibliography should none automatic.
        if self._use_latex_citations and len(self._bibitems)>0:
            widest_label = ""
            for bi in self._bibitems:
                if len(widest_label)<len(bi[0]):
                    widest_label = bi[0]
            self.body.append('\n\\begin{thebibliography}{%s}\n'%widest_label)
            for bi in self._bibitems:
                # cite_key: underscores must not be escaped
                cite_key = bi[0].replace(r"{\_}","_")
                self.body.append('\\bibitem[%s]{%s}{%s}\n' % (bi[0], cite_key, bi[1]))
            self.body.append('\\end{thebibliography}\n')

        self.body_suffix.append('\\end{document}\n')

    def visit_emphasis(self, node):
        self.body.append('\\emph{')
        self.literal_block_stack.append('\\emph{')

    def depart_emphasis(self, node):
        self.body.append('}')
        self.literal_block_stack.pop()

    def visit_entry(self, node):
        self.active_table.visit_entry()
        # cell separation
        if self.active_table.get_entry_number() == 1:
            # if the firstrow is a multirow, this actually is the second row.
            # this gets hairy if rowspans follow each other.
            if self.active_table.get_rowspan(0):
                count = 0
                while self.active_table.get_rowspan(count):
                    count += 1
                    self.body.append(' & ')
                self.active_table.visit_entry() # increment cell count
        else:
            self.body.append(' & ')

        # multi{row,column}
        # IN WORK BUG TODO HACK continues here
        # multirow in LaTeX simply will enlarge the cell over several rows
        # (the following n if n is positive, the former if negative).
        if node.has_key('morerows') and node.has_key('morecols'):
            raise NotImplementedError('Cells that '
            'span multiple rows *and* columns are not supported, sorry.')
        if node.has_key('morerows'):
            count = node['morerows'] + 1
            self.active_table.set_rowspan(self.active_table.get_entry_number()-1,count)
            self.body.append('\\multirow{%d}{%s}{' % \
                    (count,self.active_table.get_column_width()))
            self.context.append('}')
            # BUG following rows must have empty cells.
        elif node.has_key('morecols'):
            # the vertical bar before column is missing if it is the first column.
            # the one after always.
            if self.active_table.get_entry_number() == 1:
                bar1 = self.active_table.get_vertical_bar()
            else:
                bar1 = ''
            count = node['morecols'] + 1
            self.body.append('\\multicolumn{%d}{%sl%s}{' % \
                    (count, bar1, self.active_table.get_vertical_bar()))
            self.context.append('}')
        else:
            self.context.append('')

        # header / not header
        if isinstance(node.parent.parent, nodes.thead):
            self.body.append('\\textbf{')
            self.context.append('}')
        else:
            self.context.append('')

    def depart_entry(self, node):
        self.body.append(self.context.pop()) # header / not header
        self.body.append(self.context.pop()) # multirow/column
        # if following row is spanned from above.
        if self.active_table.get_rowspan(self.active_table.get_entry_number()):
           self.body.append(' & ')
           self.active_table.visit_entry() # increment cell count

    def visit_row(self, node):
        self.active_table.visit_row()

    def depart_row(self, node):
        self.body.extend(self.active_table.depart_row())

    def visit_enumerated_list(self, node):
        # We create our own enumeration list environment.
        # This allows to set the style and starting value
        # and unlimited nesting.
        enum_style = {'arabic':'arabic',
                'loweralpha':'alph',
                'upperalpha':'Alph',
                'lowerroman':'roman',
                'upperroman':'Roman' }
        enum_suffix = ""
        if node.has_key('suffix'):
            enum_suffix = node['suffix']
        enum_prefix = ""
        if node.has_key('prefix'):
            enum_prefix = node['prefix']
        if self.compound_enumerators:
            pref = ""
            if self.section_prefix_for_enumerators and self.section_level:
                for i in range(self.section_level):
                    pref += '%d.' % self._section_number[i]
                pref = pref[:-1] + self.section_enumerator_separator
                enum_prefix += pref
            for ctype, cname in self._enumeration_counters:
                enum_prefix += '\\%s{%s}.' % (ctype, cname)
        enum_type = "arabic"
        if node.has_key('enumtype'):
            enum_type = node['enumtype']
        if enum_style.has_key(enum_type):
            enum_type = enum_style[enum_type]

        counter_name = "listcnt%d" % len(self._enumeration_counters)
        self._enumeration_counters.append((enum_type, counter_name))
        # If we haven't used this counter name before, then create a
        # new counter; otherwise, reset & reuse the old counter.
        if len(self._enumeration_counters) > self._max_enumeration_counters:
            self._max_enumeration_counters = len(self._enumeration_counters)
            self.body.append('\\newcounter{%s}\n' % counter_name)
        else:
            self.body.append('\\setcounter{%s}{0}\n' % counter_name)
            
        self.body.append('\\begin{list}{%s\\%s{%s}%s}\n' % \
            (enum_prefix,enum_type,counter_name,enum_suffix))
        self.body.append('{\n')
        self.body.append('\\usecounter{%s}\n' % counter_name)
        # set start after usecounter, because it initializes to zero.
        if node.has_key('start'):
            self.body.append('\\addtocounter{%s}{%d}\n' \
                    % (counter_name,node['start']-1))
        ## set rightmargin equal to leftmargin
        self.body.append('\\setlength{\\rightmargin}{\\leftmargin}\n')
        self.body.append('}\n')

    def depart_enumerated_list(self, node):
        self.body.append('\\end{list}\n')
        self._enumeration_counters.pop()

    def visit_error(self, node):
        self.visit_admonition(node, 'error')

    def depart_error(self, node):
        self.depart_admonition()

    def visit_field(self, node):
        # real output is done in siblings: _argument, _body, _name
        pass

    def depart_field(self, node):
        self.body.append('\n')
        ##self.body.append('%[depart_field]\n')

    def visit_field_argument(self, node):
        self.body.append('%[visit_field_argument]\n')

    def depart_field_argument(self, node):
        self.body.append('%[depart_field_argument]\n')

    def visit_field_body(self, node):
        # BUG by attach as text we loose references.
        if self.docinfo:
            self.docinfo.append('%s \\\\\n' % self.encode(node.astext()))
            raise nodes.SkipNode
        # BUG: what happens if not docinfo

    def depart_field_body(self, node):
        self.body.append( '\n' )

    def visit_field_list(self, node):
        if not self.docinfo:
            self.body.append('\\begin{quote}\n')
            self.body.append('\\begin{description}\n')

    def depart_field_list(self, node):
        if not self.docinfo:
            self.body.append('\\end{description}\n')
            self.body.append('\\end{quote}\n')

    def visit_field_name(self, node):
        # BUG this duplicates docinfo_item
        if self.docinfo:
            self.docinfo.append('\\textbf{%s}: &\n\t' % self.encode(node.astext()))
            raise nodes.SkipNode
        else:
            self.body.append('\\item [')

    def depart_field_name(self, node):
        if not self.docinfo:
            self.body.append(':]')

    def visit_figure(self, node):
        if (not node.attributes.has_key('align') or
            node.attributes['align'] == 'center'):
            align = 'center'
        else:
            align = 'flush'+node.attributes['align']
        self.body.append( '\\begin{figure}[htbp]\\begin{%s}\n' % align )
        self.context.append( '\\end{%s}\\end{figure}\n' % align )

    def depart_figure(self, node):
        self.body.append( self.context.pop() )

    def visit_footer(self, node):
        self.context.append(len(self.body))

    def depart_footer(self, node):
        start = self.context.pop()
        footer = (['\n\\begin{center}\small\n']
                  + self.body[start:] + ['\n\\end{center}\n'])
        self.body_suffix[:0] = footer
        del self.body[start:]

    def visit_footnote(self, node):
        if self.use_latex_footnotes:
            num,text = node.astext().split(None,1)
            num = self.encode(num.strip())
            self.body.append('\\footnotetext['+num+']')
            self.body.append('{')
        else:
            self.body.append('\\begin{figure}[b]')
            for id in node['ids']:
                self.body.append('\\hypertarget{%s}' % id)

    def depart_footnote(self, node):
        if self.use_latex_footnotes:
            self.body.append('}\n')
        else:
            self.body.append('\\end{figure}\n')

    def visit_footnote_reference(self, node):
        if self.use_latex_footnotes:
            self.body.append("\\footnotemark["+self.encode(node.astext())+"]")
            raise nodes.SkipNode
        href = ''
        if node.has_key('refid'):
            href = node['refid']
        elif node.has_key('refname'):
            href = self.document.nameids[node['refname']]
        format = self.settings.footnote_references
        if format == 'brackets':
            suffix = '['
            self.context.append(']')
        elif format == 'superscript':
            suffix = '\\raisebox{.5em}[0em]{\\scriptsize'
            self.context.append('}')
        else:                           # shouldn't happen
            raise AssertionError('Illegal footnote reference format.')
        self.body.append('%s\\hyperlink{%s}{' % (suffix,href))

    def depart_footnote_reference(self, node):
        if self.use_latex_footnotes:
            return
        self.body.append('}%s' % self.context.pop())

    # footnote/citation label
    def label_delim(self, node, bracket, superscript):
        if isinstance(node.parent, nodes.footnote):
            if self.use_latex_footnotes:
                raise nodes.SkipNode
            if self.settings.footnote_references == 'brackets':
                self.body.append(bracket)
            else:
                self.body.append(superscript)
        else:
            assert isinstance(node.parent, nodes.citation)
            if not self._use_latex_citations:
                self.body.append(bracket)

    def visit_label(self, node):
        self.label_delim(node, '[', '$^{')

    def depart_label(self, node):
        self.label_delim(node, ']', '}$')

    # elements generated by the framework e.g. section numbers.
    def visit_generated(self, node):
        pass

    def depart_generated(self, node):
        pass

    def visit_header(self, node):
        self.context.append(len(self.body))

    def depart_header(self, node):
        start = self.context.pop()
        self.body_prefix.append('\n\\verb|begin_header|\n')
        self.body_prefix.extend(self.body[start:])
        self.body_prefix.append('\n\\verb|end_header|\n')
        del self.body[start:]

    def visit_hint(self, node):
        self.visit_admonition(node, 'hint')

    def depart_hint(self, node):
        self.depart_admonition()

    def visit_image(self, node):
        attrs = node.attributes
        # Add image URI to dependency list, assuming that it's
        # referring to a local file.
        self.settings.record_dependencies.add(attrs['uri'])
        pre = []                        # in reverse order
        post = []
        include_graphics_options = ""
        inline = isinstance(node.parent, nodes.TextElement)
        if attrs.has_key('scale'):
            # Could also be done with ``scale`` option to
            # ``\includegraphics``; doing it this way for consistency.
            pre.append('\\scalebox{%f}{' % (attrs['scale'] / 100.0,))
            post.append('}')
        if attrs.has_key('width'):
            include_graphics_options = '[width=%s]' % attrs['width']
        if attrs.has_key('align'):
            align_prepost = {
                # By default latex aligns the top of an image.
                (1, 'top'): ('', ''),
                (1, 'middle'): ('\\raisebox{-0.5\\height}{', '}'),
                (1, 'bottom'): ('\\raisebox{-\\height}{', '}'),
                (0, 'center'): ('{\\hfill', '\\hfill}'),
                # These 2 don't exactly do the right thing.  The image should
                # be floated alongside the paragraph.  See
                # http://www.w3.org/TR/html4/struct/objects.html#adef-align-IMG
                (0, 'left'): ('{', '\\hfill}'),
                (0, 'right'): ('{\\hfill', '}'),}
            try:
                pre.append(align_prepost[inline, attrs['align']][0])
                post.append(align_prepost[inline, attrs['align']][1])
            except KeyError:
                pass                    # XXX complain here?
        if not inline:
            pre.append('\n')
            post.append('\n')
        pre.reverse()
        self.body.extend( pre )
        self.body.append( '\\includegraphics%s{%s}' % (
                include_graphics_options, attrs['uri'] ) )
        self.body.extend( post )

    def depart_image(self, node):
        pass

    def visit_important(self, node):
        self.visit_admonition(node, 'important')

    def depart_important(self, node):
        self.depart_admonition()

    def visit_interpreted(self, node):
        # @@@ Incomplete, pending a proper implementation on the
        # Parser/Reader end.
        self.visit_literal(node)

    def depart_interpreted(self, node):
        self.depart_literal(node)

    def visit_legend(self, node):
        self.body.append('{\\small ')

    def depart_legend(self, node):
        self.body.append('}')

    def visit_line(self, node):
        self.body.append('\item[] ')

    def depart_line(self, node):
        self.body.append('\n')

    def visit_line_block(self, node):
        if isinstance(node.parent, nodes.line_block):
            self.body.append('\\item[] \n'
                             '\\begin{lineblock}{\\lineblockindentation}\n')
        else:
            self.body.append('\n\\begin{lineblock}{0em}\n')

    def depart_line_block(self, node):
        self.body.append('\\end{lineblock}\n')

    def visit_list_item(self, node):
        # Append "{}" in case the next character is "[", which would break
        # LaTeX's list environment (no numbering and the "[" is not printed).
        self.body.append('\\item {} ')

    def depart_list_item(self, node):
        self.body.append('\n')

    def visit_literal(self, node):
        self.literal = 1
        self.body.append('\\texttt{')

    def depart_literal(self, node):
        self.body.append('}')
        self.literal = 0

    def visit_literal_block(self, node):
        """
        Render a literal-block.

        Literal blocks are used for "::"-prefixed literal-indented
        blocks of text, where the inline markup is not recognized,
        but are also the product of the parsed-literal directive,
        where the markup is respected.
        """
        # In both cases, we want to use a typewriter/monospaced typeface.
        # For "real" literal-blocks, we can use \verbatim, while for all
        # the others we must use \mbox.
        #
        # We can distinguish between the two kinds by the number of
        # siblings the compose this node: if it is composed by a
        # single element, it's surely is either a real one, otherwise
        # it's a parsed-literal that does not contain any markup.
        #
        if (self.settings.use_verbatim_when_possible and (len(node) == 1)
              # in case of a parsed-literal containing just a "**bold**" word:
              and isinstance(node[0], nodes.Text)):
            self.verbatim = 1
            self.body.append('\\begin{quote}\\begin{verbatim}\n')
        else:
            self.literal_block = 1
            self.insert_none_breaking_blanks = 1
            if self.active_table.is_open():
                self.body.append('\n{\\ttfamily \\raggedright \\noindent\n')
            else:
                # no quote inside tables, to avoid vertical sppace between
                # table border and literal block.
                # BUG: fails if normal text preceeds the literal block.
                self.body.append('\\begin{quote}')
                self.body.append('{\\ttfamily \\raggedright \\noindent\n')
            # * obey..: is from julien and never worked for me (grubert).
            #   self.body.append('{\\obeylines\\obeyspaces\\ttfamily\n')

    def depart_literal_block(self, node):
        if self.verbatim:
            self.body.append('\n\\end{verbatim}\\end{quote}\n')
            self.verbatim = 0
        else:
            if self.active_table.is_open():
                self.body.append('\n}\n')
            else:
                self.body.append('\n')
                self.body.append('}\\end{quote}\n')
            self.insert_none_breaking_blanks = 0
            self.literal_block = 0
            # obey end: self.body.append('}\n')

    def visit_meta(self, node):
        self.body.append('[visit_meta]\n')
        # BUG maybe set keywords for pdf
        ##self.head.append(self.starttag(node, 'meta', **node.attributes))

    def depart_meta(self, node):
        self.body.append('[depart_meta]\n')

    def visit_note(self, node):
        self.visit_admonition(node, 'note')

    def depart_note(self, node):
        self.depart_admonition()

    def visit_option(self, node):
        if self.context[-1]:
            # this is not the first option
            self.body.append(', ')

    def depart_option(self, node):
        # flag tha the first option is done.
        self.context[-1] += 1

    def visit_option_argument(self, node):
        """The delimiter betweeen an option and its argument."""
        self.body.append(node.get('delimiter', ' '))

    def depart_option_argument(self, node):
        pass

    def visit_option_group(self, node):
        if self.use_optionlist_for_option_list:
            self.body.append('\\item [')
        else:
            if len(node.astext()) > 14:
                self.body.append('\\multicolumn{2}{l}{')
                self.context.append('} \\\\\n  ')
            else:
                self.context.append('')
            self.body.append('\\texttt{')
        # flag for first option
        self.context.append(0)

    def depart_option_group(self, node):
        self.context.pop() # the flag
        if self.use_optionlist_for_option_list:
            self.body.append('] ')
        else:
            self.body.append('}')
            self.body.append(self.context.pop())

    def visit_option_list(self, node):
        self.body.append('% [option list]\n')
        if self.use_optionlist_for_option_list:
            self.body.append('\\begin{optionlist}{3cm}\n')
        else:
            self.body.append('\\begin{center}\n')
            # BUG: use admwidth or make it relative to textwidth ?
            self.body.append('\\begin{tabularx}{.9\\linewidth}{lX}\n')

    def depart_option_list(self, node):
        if self.use_optionlist_for_option_list:
            self.body.append('\\end{optionlist}\n')
        else:
            self.body.append('\\end{tabularx}\n')
            self.body.append('\\end{center}\n')

    def visit_option_list_item(self, node):
        pass

    def depart_option_list_item(self, node):
        if not self.use_optionlist_for_option_list:
            self.body.append('\\\\\n')

    def visit_option_string(self, node):
        ##self.body.append(self.starttag(node, 'span', '', CLASS='option'))
        pass

    def depart_option_string(self, node):
        ##self.body.append('</span>')
        pass

    def visit_organization(self, node):
        self.visit_docinfo_item(node, 'organization')

    def depart_organization(self, node):
        self.depart_docinfo_item(node)

    def visit_paragraph(self, node):
        index = node.parent.index(node)
        if not ('contents' in self.topic_classes or
                (isinstance(node.parent, nodes.compound) and
                 index > 0 and
                 not isinstance(node.parent[index - 1], nodes.paragraph) and
                 not isinstance(node.parent[index - 1], nodes.compound))):
            self.body.append('\n')

    def depart_paragraph(self, node):
        self.body.append('\n')

    def visit_problematic(self, node):
        self.body.append('{\\color{red}\\bfseries{}')

    def depart_problematic(self, node):
        self.body.append('}')

    def visit_raw(self, node):
        if 'latex' in node.get('format', '').split():
            self.body.append(node.astext())
        raise nodes.SkipNode

    def visit_reference(self, node):
        # BUG: hash_char "#" is trouble some in LaTeX.
        # mbox and other environment do not like the '#'.
        hash_char = '\\#'
        if node.has_key('refuri'):
            href = node['refuri'].replace('#',hash_char)
        elif node.has_key('refid'):
            href = hash_char + node['refid']
        elif node.has_key('refname'):
            href = hash_char + self.document.nameids[node['refname']]
        else:
            raise AssertionError('Unknown reference.')
        self.body.append('\\href{%s}{' % href)

    def depart_reference(self, node):
        self.body.append('}')

    def visit_revision(self, node):
        self.visit_docinfo_item(node, 'revision')

    def depart_revision(self, node):
        self.depart_docinfo_item(node)

    def visit_section(self, node):
        self.section_level += 1
        # Initialize counter for potential subsections:
        self._section_number.append(0)
        # Counter for this section's level (initialized by parent section):
        self._section_number[self.section_level - 1] += 1

    def depart_section(self, node):
        # Remove counter for potential subsections:
        self._section_number.pop()
        self.section_level -= 1

    def visit_sidebar(self, node):
        # BUG:  this is just a hack to make sidebars render something
        self.body.append('\n\\setlength{\\locallinewidth}{0.9\\admonitionwidth}\n')
        self.body.append('\\begin{center}\\begin{sffamily}\n')
        self.body.append('\\fbox{\\colorbox[gray]{0.80}{\\parbox{\\admonitionwidth}{\n')

    def depart_sidebar(self, node):
        self.body.append('}}}\n') # end parbox colorbox fbox
        self.body.append('\\end{sffamily}\n\\end{center}\n');
        self.body.append('\n\\setlength{\\locallinewidth}{\\linewidth}\n')


    attribution_formats = {'dash': ('---', ''),
                           'parentheses': ('(', ')'),
                           'parens': ('(', ')'),
                           'none': ('', '')}

    def visit_attribution(self, node):
        prefix, suffix = self.attribution_formats[self.settings.attribution]
        self.body.append('\n\\begin{flushright}\n')
        self.body.append(prefix)
        self.context.append(suffix)

    def depart_attribution(self, node):
        self.body.append(self.context.pop() + '\n')
        self.body.append('\\end{flushright}\n')

    def visit_status(self, node):
        self.visit_docinfo_item(node, 'status')

    def depart_status(self, node):
        self.depart_docinfo_item(node)

    def visit_strong(self, node):
        self.body.append('\\textbf{')
        self.literal_block_stack.append('\\textbf{')

    def depart_strong(self, node):
        self.body.append('}')
        self.literal_block_stack.pop()

    def visit_substitution_definition(self, node):
        raise nodes.SkipNode

    def visit_substitution_reference(self, node):
        self.unimplemented_visit(node)

    def visit_subtitle(self, node):
        if isinstance(node.parent, nodes.sidebar):
            self.body.append('~\\\\\n\\textbf{')
            self.context.append('}\n\\smallskip\n')
        elif isinstance(node.parent, nodes.document):
            self.title = self.title + \
                '\\\\\n\\large{%s}\n' % self.encode(node.astext())
            raise nodes.SkipNode
        elif isinstance(node.parent, nodes.section):
            self.body.append('\\textbf{')
            self.context.append('}\\vspace{0.2cm}\n\n\\noindent ')

    def depart_subtitle(self, node):
        self.body.append(self.context.pop())

    def visit_system_message(self, node):
        pass

    def depart_system_message(self, node):
        self.body.append('\n')

    def visit_table(self, node):
        if self.active_table.is_open():
            print 'nested tables are not supported'
            raise AssertionError
        self.active_table.open()
        self.body.append('\n' + self.active_table.get_opening())

    def depart_table(self, node):
        self.body.append(self.active_table.get_closing() + '\n')
        self.active_table.close()

    def visit_target(self, node):
        # BUG: why not (refuri or refid or refname) means not footnote ?
        if not (node.has_key('refuri') or node.has_key('refid')
                or node.has_key('refname')):
            for id in node['ids']:
                self.body.append('\\hypertarget{%s}{' % id)
            self.context.append('}' * len(node['ids']))
        else:
            self.context.append('')

    def depart_target(self, node):
        self.body.append(self.context.pop())

    def visit_tbody(self, node):
        # BUG write preamble if not yet done (colspecs not [])
        # for tables without heads.
        if not self.active_table.get('preamble written'):
            self.visit_thead(None)
            # self.depart_thead(None)

    def depart_tbody(self, node):
        pass

    def visit_term(self, node):
        self.body.append('\\item[{')

    def depart_term(self, node):
        # definition list term.
        self.body.append('}] ')

    def visit_tgroup(self, node):
        #self.body.append(self.starttag(node, 'colgroup'))
        #self.context.append('</colgroup>\n')
        pass

    def depart_tgroup(self, node):
        pass

    def visit_thead(self, node):
        self.body.append('{%s}\n' % self.active_table.get_colspecs())
        if self.active_table.caption:
            self.body.append('\\caption{%s}\\\\\n' % self.active_table.caption)
        self.active_table.set('preamble written',1)
        # TODO longtable supports firsthead and lastfoot too.
        self.body.extend(self.active_table.visit_thead())

    def depart_thead(self, node):
        # the table header written should be on every page
        # => \endhead
        self.body.extend(self.active_table.depart_thead())
        # and the firsthead => \endfirsthead
        # BUG i want a "continued from previous page" on every not
        # firsthead, but then we need the header twice.
        #
        # there is a \endfoot and \endlastfoot too.
        # but we need the number of columns to
        # self.body.append('\\multicolumn{%d}{c}{"..."}\n' % number_of_columns)
        # self.body.append('\\hline\n\\endfoot\n')
        # self.body.append('\\hline\n')
        # self.body.append('\\endlastfoot\n')

    def visit_tip(self, node):
        self.visit_admonition(node, 'tip')

    def depart_tip(self, node):
        self.depart_admonition()

    def bookmark(self, node):
        """Append latex href and pdfbookmarks for titles.
        """
        if node.parent['ids']:
            for id in node.parent['ids']:
                self.body.append('\\hypertarget{%s}{}\n' % id)
            if not self.use_latex_toc:
                # BUG level depends on style. pdflatex allows level 0 to 3
                # ToC would be the only on level 0 so i choose to decrement the rest.
                # "Table of contents" bookmark to see the ToC. To avoid this
                # we set all zeroes to one.
                l = self.section_level
                if l>0:
                    l = l-1
                # pdftex does not like "_" subscripts in titles
                text = self.encode(node.astext())
                for id in node.parent['ids']:
                    self.body.append('\\pdfbookmark[%d]{%s}{%s}\n' % \
                                     (l, text, id))

    def visit_title(self, node):
        """Only 3 section levels are supported by LaTeX article (AFAIR)."""

        if isinstance(node.parent, nodes.topic):
            # section titles before the table of contents.
            self.bookmark(node)
            # BUG: latex chokes on center environment with "perhaps a missing item".
            # so we use hfill.
            self.body.append('\\subsubsection*{~\\hfill ')
            # the closing brace for subsection.
            self.context.append('\\hfill ~}\n')
        # TODO: for admonition titles before the first section
        # either specify every possible node or ... ?
        elif isinstance(node.parent, nodes.sidebar) \
        or isinstance(node.parent, nodes.admonition):
            self.body.append('\\textbf{\\large ')
            self.context.append('}\n\\smallskip\n')
        elif isinstance(node.parent, nodes.table):
            # caption must be written after column spec
            self.active_table.caption = self.encode(node.astext())
            raise nodes.SkipNode
        elif self.section_level == 0:
            # document title
            self.title = self.encode(node.astext())
            if not self.pdfinfo == None:
                self.pdfinfo.append( 'pdftitle={%s}' % self.encode(node.astext()) )
            raise nodes.SkipNode
        else:
            self.body.append('\n\n')
            self.body.append('%' + '_' * 75)
            self.body.append('\n\n')
            self.bookmark(node)

            if self.use_latex_toc:
                section_star = ""
            else:
                section_star = "*"

            section_name = self.d_class.section(self.section_level)
            self.body.append('\\%s%s{' % (section_name, section_star))

            self.context.append('}\n')

    def depart_title(self, node):
        self.body.append(self.context.pop())

    def visit_topic(self, node):
        self.topic_classes = node['classes']
        if 'contents' in node['classes'] and self.use_latex_toc:
            self.body.append('\\tableofcontents\n\n\\bigskip\n')
            self.topic_classes = []
            raise nodes.SkipNode

    def visit_inline(self, node): # titlereference
        classes = node.get('classes', ['Unknown', ])
        for cls in classes:
            self.body.append( '\\docutilsrole%s{' % cls)
        self.context.append('}'*len(classes))

    def depart_inline(self, node):
        self.body.append(self.context.pop())

    def depart_topic(self, node):
        self.topic_classes = []
        self.body.append('\n')

    def visit_rubric(self, node):
        self.body.append('\\rubric{')
        self.context.append('}\n')

    def depart_rubric(self, node):
        self.body.append(self.context.pop())

    def visit_transition(self, node):
        self.body.append('\n\n')
        self.body.append('%' + '_' * 75)
        self.body.append('\n\\hspace*{\\fill}\\hrulefill\\hspace*{\\fill}')
        self.body.append('\n\n')

    def depart_transition(self, node):
        pass

    def visit_version(self, node):
        self.visit_docinfo_item(node, 'version')

    def depart_version(self, node):
        self.depart_docinfo_item(node)

    def visit_warning(self, node):
        self.visit_admonition(node, 'warning')

    def depart_warning(self, node):
        self.depart_admonition()

    def unimplemented_visit(self, node):
        raise NotImplementedError('visiting unimplemented node type: %s'
                                  % node.__class__.__name__)

#    def unknown_visit(self, node):
#    def default_visit(self, node):

# vim: set ts=4 et ai :
