# Author: David Goodger
# Contact: goodger@users.sourceforge.net
# Revision: $Revision: 4456 $
# Date: $Date: 2006-03-31 05:36:28 +0200 (Fri, 31 Mar 2006) $
# Copyright: This module has been placed in the public domain.

"""
Simple HyperText Markup Language document tree Writer.

The output conforms to the XHTML version 1.0 Transitional DTD
(*almost* strict).  The output contains a minimum of formatting
information.  The cascading style sheet "html4css1.css" is required
for proper viewing with a modern graphical browser.
"""

__docformat__ = 'reStructuredText'


import sys
import os
import os.path
import codecs
import time
import re
from types import ListType
try:
    import Image                        # check for the Python Imaging Library
except ImportError:
    Image = None
import docutils
from docutils import frontend, nodes, utils, writers, languages


class Writer(writers.Writer):

    supported = ('html', 'html4css1', 'xhtml')
    """Formats this writer supports."""

    default_stylesheet = 'html4css1.css'

    default_stylesheet_path = utils.relative_path(
        os.path.join(os.getcwd(), 'dummy'),
        os.path.join(os.path.dirname(__file__), default_stylesheet))

    default_template = 'template.txt'

    default_template_path = utils.relative_path(
        os.path.join(os.getcwd(), 'dummy'),
        os.path.join(os.path.dirname(__file__), default_template))

    settings_spec = (
        'HTML-Specific Options',
        None,
        (('Specify the template file (UTF-8 encoded).  Default is "%s".'
          % default_template_path,
          ['--template'],
          {'default': default_template_path, 'metavar': '<file>'}),
        ('Specify a stylesheet URL, used verbatim.  Overrides '
          '--stylesheet-path.',
          ['--stylesheet'],
          {'metavar': '<URL>', 'overrides': 'stylesheet_path'}),
         ('Specify a stylesheet file, relative to the current working '
          'directory.  The path is adjusted relative to the output HTML '
          'file.  Overrides --stylesheet.  Default: "%s"'
          % default_stylesheet_path,
          ['--stylesheet-path'],
          {'metavar': '<file>', 'overrides': 'stylesheet',
           'default': default_stylesheet_path}),
         ('Embed the stylesheet in the output HTML file.  The stylesheet '
          'file must be accessible during processing (--stylesheet-path is '
          'recommended).  This is the default.',
          ['--embed-stylesheet'],
          {'default': 1, 'action': 'store_true',
           'validator': frontend.validate_boolean}),
         ('Link to the stylesheet in the output HTML file.  Default: '
          'embed the stylesheet, do not link to it.',
          ['--link-stylesheet'],
          {'dest': 'embed_stylesheet', 'action': 'store_false',
           'validator': frontend.validate_boolean}),
         ('Specify the initial header level.  Default is 1 for "<h1>".  '
          'Does not affect document title & subtitle (see --no-doc-title).',
          ['--initial-header-level'],
          {'choices': '1 2 3 4 5 6'.split(), 'default': '1',
           'metavar': '<level>'}),
         ('Specify the maximum width (in characters) for one-column field '
          'names.  Longer field names will span an entire row of the table '
          'used to render the field list.  Default is 14 characters.  '
          'Use 0 for "no limit".',
          ['--field-name-limit'],
          {'default': 14, 'metavar': '<level>',
           'validator': frontend.validate_nonnegative_int}),
         ('Specify the maximum width (in characters) for options in option '
          'lists.  Longer options will span an entire row of the table used '
          'to render the option list.  Default is 14 characters.  '
          'Use 0 for "no limit".',
          ['--option-limit'],
          {'default': 14, 'metavar': '<level>',
           'validator': frontend.validate_nonnegative_int}),
         ('Format for footnote references: one of "superscript" or '
          '"brackets".  Default is "brackets".',
          ['--footnote-references'],
          {'choices': ['superscript', 'brackets'], 'default': 'brackets',
           'metavar': '<format>',
           'overrides': 'trim_footnote_reference_space'}),
         ('Format for block quote attributions: one of "dash" (em-dash '
          'prefix), "parentheses"/"parens", or "none".  Default is "dash".',
          ['--attribution'],
          {'choices': ['dash', 'parentheses', 'parens', 'none'],
           'default': 'dash', 'metavar': '<format>'}),
         ('Remove extra vertical whitespace between items of "simple" bullet '
          'lists and enumerated lists.  Default: enabled.',
          ['--compact-lists'],
          {'default': 1, 'action': 'store_true',
           'validator': frontend.validate_boolean}),
         ('Disable compact simple bullet and enumerated lists.',
          ['--no-compact-lists'],
          {'dest': 'compact_lists', 'action': 'store_false'}),
         ('Remove extra vertical whitespace between items of simple field '
          'lists.  Default: enabled.',
          ['--compact-field-lists'],
          {'default': 1, 'action': 'store_true',
           'validator': frontend.validate_boolean}),
         ('Disable compact simple field lists.',
          ['--no-compact-field-lists'],
          {'dest': 'compact_field_lists', 'action': 'store_false'}),
         ('Omit the XML declaration.  Use with caution.',
          ['--no-xml-declaration'],
          {'dest': 'xml_declaration', 'default': 1, 'action': 'store_false',
           'validator': frontend.validate_boolean}),
         ('Obfuscate email addresses to confuse harvesters while still '
          'keeping email links usable with standards-compliant browsers.',
          ['--cloak-email-addresses'],
          {'action': 'store_true', 'validator': frontend.validate_boolean}),))

    settings_defaults = {'output_encoding_error_handler': 'xmlcharrefreplace'}

    relative_path_settings = ('stylesheet_path',)

    config_section = 'html4css1 writer'
    config_section_dependencies = ('writers',)

    visitor_attributes = (
        'head_prefix', 'head', 'stylesheet', 'body_prefix',
        'body_pre_docinfo', 'docinfo', 'body', 'body_suffix',
        'title', 'subtitle', 'header', 'footer', 'meta', 'fragment',
        'html_prolog', 'html_head', 'html_title', 'html_subtitle',
        'html_body')

    def __init__(self):
        writers.Writer.__init__(self)
        self.translator_class = HTMLTranslator

    def translate(self):
        self.visitor = visitor = self.translator_class(self.document)
        self.document.walkabout(visitor)
        for attr in self.visitor_attributes:
            setattr(self, attr, getattr(visitor, attr))
        self.output = self.apply_template()

    def apply_template(self):
        template_file = codecs.open(
            self.document.settings.template, 'r', 'utf-8')
        template = template_file.read()
        template_file.close()
        subs = self.interpolation_dict()
        return template % subs

    def interpolation_dict(self):
        subs = {}
        settings = self.document.settings
        for attr in self.visitor_attributes:
            subs[attr] = ''.join(getattr(self, attr)).rstrip('\n')
        subs['encoding'] = settings.output_encoding
        subs['version'] = docutils.__version__
        return subs

    def assemble_parts(self):
        writers.Writer.assemble_parts(self)
        for part in self.visitor_attributes:
            self.parts[part] = ''.join(getattr(self, part))


class HTMLTranslator(nodes.NodeVisitor):

    """
    This HTML writer has been optimized to produce visually compact
    lists (less vertical whitespace).  HTML's mixed content models
    allow list items to contain "<li><p>body elements</p></li>" or
    "<li>just text</li>" or even "<li>text<p>and body
    elements</p>combined</li>", each with different effects.  It would
    be best to stick with strict body elements in list items, but they
    affect vertical spacing in browsers (although they really
    shouldn't).

    Here is an outline of the optimization:

    - Check for and omit <p> tags in "simple" lists: list items
      contain either a single paragraph, a nested simple list, or a
      paragraph followed by a nested simple list.  This means that
      this list can be compact:

          - Item 1.
          - Item 2.

      But this list cannot be compact:

          - Item 1.

            This second paragraph forces space between list items.

          - Item 2.

    - In non-list contexts, omit <p> tags on a paragraph if that
      paragraph is the only child of its parent (footnotes & citations
      are allowed a label first).

    - Regardless of the above, in definitions, table cells, field bodies,
      option descriptions, and list items, mark the first child with
      'class="first"' and the last child with 'class="last"'.  The stylesheet
      sets the margins (top & bottom respectively) to 0 for these elements.

    The ``no_compact_lists`` setting (``--no-compact-lists`` command-line
    option) disables list whitespace optimization.
    """

    xml_declaration = '<?xml version="1.0" encoding="%s" ?>\n'
    doctype = (
        '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"'
        ' "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\n')
    head_prefix_template = ('<html xmlns="http://www.w3.org/1999/xhtml"'
                            ' xml:lang="%s" lang="%s">\n<head>\n')
    content_type = ('<meta http-equiv="Content-Type"'
                    ' content="text/html; charset=%s" />\n')
    generator = ('<meta name="generator" content="Docutils %s: '
                 'http://docutils.sourceforge.net/" />\n')
    stylesheet_link = '<link rel="stylesheet" href="%s" type="text/css" />\n'
    embedded_stylesheet = '<style type="text/css">\n\n%s\n</style>\n'
    named_tags = ['a', 'applet', 'form', 'frame', 'iframe', 'img', 'map']
    words_and_spaces = re.compile(r'\S+| +|\n')

    def __init__(self, document):
        nodes.NodeVisitor.__init__(self, document)
        self.settings = settings = document.settings
        lcode = settings.language_code
        self.language = languages.get_language(lcode)
        self.meta = [self.content_type % settings.output_encoding,
                     self.generator % docutils.__version__]
        self.head_prefix = []
        self.html_prolog = []
        if settings.xml_declaration:
            self.head_prefix.append(self.xml_declaration
                                    % settings.output_encoding)
            # encoding not interpolated:
            self.html_prolog.append(self.xml_declaration)
        self.head_prefix.extend([self.doctype,
                                 self.head_prefix_template % (lcode, lcode)])
        self.html_prolog.append(self.doctype)
        self.head = self.meta[:]
        stylesheet = utils.get_stylesheet_reference(settings)
        self.stylesheet = []
        if stylesheet:
            if settings.embed_stylesheet:
                stylesheet = utils.get_stylesheet_reference(
                    settings, os.path.join(os.getcwd(), 'dummy'))
                settings.record_dependencies.add(stylesheet)
                stylesheet_text = open(stylesheet).read()
                self.stylesheet = [self.embedded_stylesheet % stylesheet_text]
            else:
                self.stylesheet = [self.stylesheet_link
                                   % self.encode(stylesheet)]
        self.body_prefix = ['</head>\n<body>\n']
        # document title, subtitle display
        self.body_pre_docinfo = []
        # author, date, etc.
        self.docinfo = []
        self.body = []
        self.fragment = []
        self.body_suffix = ['</body>\n</html>\n']
        self.section_level = 0
        self.initial_header_level = int(settings.initial_header_level)
        # A heterogenous stack used in conjunction with the tree traversal.
        # Make sure that the pops correspond to the pushes:
        self.context = []
        self.topic_classes = []
        self.colspecs = []
        self.compact_p = 1
        self.compact_simple = None
        self.compact_field_list = None
        self.in_docinfo = None
        self.in_sidebar = None
        self.title = []
        self.subtitle = []
        self.header = []
        self.footer = []
        self.html_head = [self.content_type] # charset not interpolated
        self.html_title = []
        self.html_subtitle = []
        self.html_body = []
        self.in_document_title = 0
        self.in_mailto = 0
        self.author_in_authors = None

    def astext(self):
        return ''.join(self.head_prefix + self.head
                       + self.stylesheet + self.body_prefix
                       + self.body_pre_docinfo + self.docinfo
                       + self.body + self.body_suffix)

    def encode(self, text):
        """Encode special characters in `text` & return."""
        # @@@ A codec to do these and all other HTML entities would be nice.
        text = text.replace("&", "&amp;")
        text = text.replace("<", "&lt;")
        text = text.replace('"', "&quot;")
        text = text.replace(">", "&gt;")
        text = text.replace("@", "&#64;") # may thwart some address harvesters
        # Replace the non-breaking space character with the HTML entity:
        text = text.replace(u'\u00a0', "&nbsp;")
        return text

    def cloak_mailto(self, uri):
        """Try to hide a mailto: URL from harvesters."""
        # Encode "@" using a URL octet reference (see RFC 1738).
        # Further cloaking with HTML entities will be done in the
        # `attval` function.
        return uri.replace('@', '%40')

    def cloak_email(self, addr):
        """Try to hide the link text of a email link from harversters."""
        # Surround at-signs and periods with <span> tags.  ("@" has
        # already been encoded to "&#64;" by the `encode` method.)
        addr = addr.replace('&#64;', '<span>&#64;</span>')
        addr = addr.replace('.', '<span>&#46;</span>')
        return addr

    def attval(self, text,
               whitespace=re.compile('[\n\r\t\v\f]')):
        """Cleanse, HTML encode, and return attribute value text."""
        encoded = self.encode(whitespace.sub(' ', text))
        if self.in_mailto and self.settings.cloak_email_addresses:
            # Cloak at-signs ("%40") and periods with HTML entities.
            encoded = encoded.replace('%40', '&#37;&#52;&#48;')
            encoded = encoded.replace('.', '&#46;')
        return encoded

    def starttag(self, node, tagname, suffix='\n', empty=0, **attributes):
        """
        Construct and return a start tag given a node (id & class attributes
        are extracted), tag name, and optional attributes.
        """
        tagname = tagname.lower()
        prefix = []
        atts = {}
        ids = []
        for (name, value) in attributes.items():
            atts[name.lower()] = value
        classes = node.get('classes', [])
        if atts.has_key('class'):
            classes.append(atts['class'])
        if classes:
            atts['class'] = ' '.join(classes)
        assert not atts.has_key('id')
        ids.extend(node.get('ids', []))
        if atts.has_key('ids'):
            ids.extend(atts['ids'])
            del atts['ids']
        if ids:
            atts['id'] = ids[0]
            for id in ids[1:]:
                # Add empty "span" elements for additional IDs.  Note
                # that we cannot use empty "a" elements because there
                # may be targets inside of references, but nested "a"
                # elements aren't allowed in XHTML (even if they do
                # not all have a "href" attribute).
                if empty:
                    # Empty tag.  Insert target right in front of element.
                    prefix.append('<span id="%s"></span>' % id)
                else:
                    # Non-empty tag.  Place the auxiliary <span> tag
                    # *inside* the element, as the first child.
                    suffix += '<span id="%s"></span>' % id
        # !!! next 2 lines to be removed in Docutils 0.5:
        if atts.has_key('id') and tagname in self.named_tags:
            atts['name'] = atts['id']   # for compatibility with old browsers
        attlist = atts.items()
        attlist.sort()
        parts = [tagname]
        for name, value in attlist:
            # value=None was used for boolean attributes without
            # value, but this isn't supported by XHTML.
            assert value is not None
            if isinstance(value, ListType):
                values = [unicode(v) for v in value]
                parts.append('%s="%s"' % (name.lower(),
                                          self.attval(' '.join(values))))
            else:
                try:
                    uval = unicode(value)
                except TypeError:       # for Python 2.1 compatibility:
                    uval = unicode(str(value))
                parts.append('%s="%s"' % (name.lower(), self.attval(uval)))
        if empty:
            infix = ' /'
        else:
            infix = ''
        return ''.join(prefix) + '<%s%s>' % (' '.join(parts), infix) + suffix

    def emptytag(self, node, tagname, suffix='\n', **attributes):
        """Construct and return an XML-compatible empty tag."""
        return self.starttag(node, tagname, suffix, empty=1, **attributes)

    # !!! to be removed in Docutils 0.5 (change calls to use "starttag"):
    def start_tag_with_title(self, node, tagname, **atts):
        """ID and NAME attributes will be handled in the title."""
        node = {'classes': node.get('classes', [])}
        return self.starttag(node, tagname, **atts)

    def set_class_on_child(self, node, class_, index=0):
        """
        Set class `class_` on the visible child no. index of `node`.
        Do nothing if node has fewer children than `index`.
        """
        children = [n for n in node if not isinstance(n, nodes.Invisible)]
        try:
            child = children[index]
        except IndexError:
            return
        child['classes'].append(class_)

    def set_first_last(self, node):
        self.set_class_on_child(node, 'first', 0)
        self.set_class_on_child(node, 'last', -1)

    def visit_Text(self, node):
        text = node.astext()
        encoded = self.encode(text)
        if self.in_mailto and self.settings.cloak_email_addresses:
            encoded = self.cloak_email(encoded)
        self.body.append(encoded)

    def depart_Text(self, node):
        pass

    def visit_abbreviation(self, node):
        # @@@ implementation incomplete ("title" attribute)
        self.body.append(self.starttag(node, 'abbr', ''))

    def depart_abbreviation(self, node):
        self.body.append('</abbr>')

    def visit_acronym(self, node):
        # @@@ implementation incomplete ("title" attribute)
        self.body.append(self.starttag(node, 'acronym', ''))

    def depart_acronym(self, node):
        self.body.append('</acronym>')

    def visit_address(self, node):
        self.visit_docinfo_item(node, 'address', meta=None)
        self.body.append(self.starttag(node, 'pre', CLASS='address'))

    def depart_address(self, node):
        self.body.append('\n</pre>\n')
        self.depart_docinfo_item()

    def visit_admonition(self, node, name=''):
        self.body.append(self.start_tag_with_title(
            node, 'div', CLASS=(name or 'admonition')))
        if name:
            node.insert(0, nodes.title(name, self.language.labels[name]))
        self.set_first_last(node)

    def depart_admonition(self, node=None):
        self.body.append('</div>\n')

    def visit_attention(self, node):
        self.visit_admonition(node, 'attention')

    def depart_attention(self, node):
        self.depart_admonition()

    attribution_formats = {'dash': ('&mdash;', ''),
                           'parentheses': ('(', ')'),
                           'parens': ('(', ')'),
                           'none': ('', '')}

    def visit_attribution(self, node):
        prefix, suffix = self.attribution_formats[self.settings.attribution]
        self.context.append(suffix)
        self.body.append(
            self.starttag(node, 'p', prefix, CLASS='attribution'))

    def depart_attribution(self, node):
        self.body.append(self.context.pop() + '</p>\n')

    def visit_author(self, node):
        if isinstance(node.parent, nodes.authors):
            if self.author_in_authors:
                self.body.append('\n<br />')
        else:
            self.visit_docinfo_item(node, 'author')

    def depart_author(self, node):
        if isinstance(node.parent, nodes.authors):
            self.author_in_authors += 1
        else:
            self.depart_docinfo_item()

    def visit_authors(self, node):
        self.visit_docinfo_item(node, 'authors')
        self.author_in_authors = 0      # initialize counter

    def depart_authors(self, node):
        self.depart_docinfo_item()
        self.author_in_authors = None

    def visit_block_quote(self, node):
        self.body.append(self.starttag(node, 'blockquote'))

    def depart_block_quote(self, node):
        self.body.append('</blockquote>\n')

    def check_simple_list(self, node):
        """Check for a simple list that can be rendered compactly."""
        visitor = SimpleListChecker(self.document)
        try:
            node.walk(visitor)
        except nodes.NodeFound:
            return None
        else:
            return 1

    def is_compactable(self, node):
        return ('compact' in node['classes']
                or (self.settings.compact_lists
                    and 'open' not in node['classes']
                    and (self.compact_simple
                         or self.topic_classes == ['contents']
                         or self.check_simple_list(node))))

    def visit_bullet_list(self, node):
        atts = {}
        old_compact_simple = self.compact_simple
        self.context.append((self.compact_simple, self.compact_p))
        self.compact_p = None
        self.compact_simple = self.is_compactable(node)
        if self.compact_simple and not old_compact_simple:
            atts['class'] = 'simple'
        self.body.append(self.starttag(node, 'ul', **atts))

    def depart_bullet_list(self, node):
        self.compact_simple, self.compact_p = self.context.pop()
        self.body.append('</ul>\n')

    def visit_caption(self, node):
        self.body.append(self.starttag(node, 'p', '', CLASS='caption'))

    def depart_caption(self, node):
        self.body.append('</p>\n')

    def visit_caution(self, node):
        self.visit_admonition(node, 'caution')

    def depart_caution(self, node):
        self.depart_admonition()

    def visit_citation(self, node):
        self.body.append(self.starttag(node, 'table',
                                       CLASS='docutils citation',
                                       frame="void", rules="none"))
        self.body.append('<colgroup><col class="label" /><col /></colgroup>\n'
                         '<tbody valign="top">\n'
                         '<tr>')
        self.footnote_backrefs(node)

    def depart_citation(self, node):
        self.body.append('</td></tr>\n'
                         '</tbody>\n</table>\n')

    def visit_citation_reference(self, node):
        href = '#' + node['refid']
        self.body.append(self.starttag(
            node, 'a', '[', CLASS='citation-reference', href=href))

    def depart_citation_reference(self, node):
        self.body.append(']</a>')

    def visit_classifier(self, node):
        self.body.append(' <span class="classifier-delimiter">:</span> ')
        self.body.append(self.starttag(node, 'span', '', CLASS='classifier'))

    def depart_classifier(self, node):
        self.body.append('</span>')

    def visit_colspec(self, node):
        self.colspecs.append(node)
        # "stubs" list is an attribute of the tgroup element:
        node.parent.stubs.append(node.attributes.get('stub'))

    def depart_colspec(self, node):
        pass

    def write_colspecs(self):
        width = 0
        for node in self.colspecs:
            width += node['colwidth']
        for node in self.colspecs:
            colwidth = int(node['colwidth'] * 100.0 / width + 0.5)
            self.body.append(self.emptytag(node, 'col',
                                           width='%i%%' % colwidth))
        self.colspecs = []

    def visit_comment(self, node,
                      sub=re.compile('-(?=-)').sub):
        """Escape double-dashes in comment text."""
        self.body.append('<!-- %s -->\n' % sub('- ', node.astext()))
        # Content already processed:
        raise nodes.SkipNode

    def visit_compound(self, node):
        self.body.append(self.starttag(node, 'div', CLASS='compound'))
        if len(node) > 1:
            node[0]['classes'].append('compound-first')
            node[-1]['classes'].append('compound-last')
            for child in node[1:-1]:
                child['classes'].append('compound-middle')

    def depart_compound(self, node):
        self.body.append('</div>\n')

    def visit_container(self, node):
        self.body.append(self.starttag(node, 'div', CLASS='container'))

    def depart_container(self, node):
        self.body.append('</div>\n')

    def visit_contact(self, node):
        self.visit_docinfo_item(node, 'contact', meta=None)

    def depart_contact(self, node):
        self.depart_docinfo_item()

    def visit_copyright(self, node):
        self.visit_docinfo_item(node, 'copyright')

    def depart_copyright(self, node):
        self.depart_docinfo_item()

    def visit_danger(self, node):
        self.visit_admonition(node, 'danger')

    def depart_danger(self, node):
        self.depart_admonition()

    def visit_date(self, node):
        self.visit_docinfo_item(node, 'date')

    def depart_date(self, node):
        self.depart_docinfo_item()

    def visit_decoration(self, node):
        pass

    def depart_decoration(self, node):
        pass

    def visit_definition(self, node):
        self.body.append('</dt>\n')
        self.body.append(self.starttag(node, 'dd', ''))
        self.set_first_last(node)

    def depart_definition(self, node):
        self.body.append('</dd>\n')

    def visit_definition_list(self, node):
        self.body.append(self.starttag(node, 'dl', CLASS='docutils'))

    def depart_definition_list(self, node):
        self.body.append('</dl>\n')

    def visit_definition_list_item(self, node):
        pass

    def depart_definition_list_item(self, node):
        pass

    def visit_description(self, node):
        self.body.append(self.starttag(node, 'td', ''))
        self.set_first_last(node)

    def depart_description(self, node):
        self.body.append('</td>')

    def visit_docinfo(self, node):
        self.context.append(len(self.body))
        self.body.append(self.starttag(node, 'table',
                                       CLASS='docinfo',
                                       frame="void", rules="none"))
        self.body.append('<col class="docinfo-name" />\n'
                         '<col class="docinfo-content" />\n'
                         '<tbody valign="top">\n')
        self.in_docinfo = 1

    def depart_docinfo(self, node):
        self.body.append('</tbody>\n</table>\n')
        self.in_docinfo = None
        start = self.context.pop()
        self.docinfo = self.body[start:]
        self.body = []

    def visit_docinfo_item(self, node, name, meta=1):
        if meta:
            meta_tag = '<meta name="%s" content="%s" />\n' \
                       % (name, self.attval(node.astext()))
            self.add_meta(meta_tag)
        self.body.append(self.starttag(node, 'tr', ''))
        self.body.append('<th class="docinfo-name">%s:</th>\n<td>'
                         % self.language.labels[name])
        if len(node):
            if isinstance(node[0], nodes.Element):
                node[0]['classes'].append('first')
            if isinstance(node[-1], nodes.Element):
                node[-1]['classes'].append('last')

    def depart_docinfo_item(self):
        self.body.append('</td></tr>\n')

    def visit_doctest_block(self, node):
        self.body.append(self.starttag(node, 'pre', CLASS='doctest-block'))

    def depart_doctest_block(self, node):
        self.body.append('\n</pre>\n')

    def visit_document(self, node):
        self.head.append('<title>%s</title>\n'
                         % self.encode(node.get('title', '')))

    def depart_document(self, node):
        self.fragment.extend(self.body)
        self.body_prefix.append(self.starttag(node, 'div', CLASS='document'))
        self.body_suffix.insert(0, '</div>\n')
        # skip content-type meta tag with interpolated charset value:
        self.html_head.extend(self.head[1:])
        self.html_body.extend(self.body_prefix[1:] + self.body_pre_docinfo
                              + self.docinfo + self.body
                              + self.body_suffix[:-1])

    def visit_emphasis(self, node):
        self.body.append('<em>')

    def depart_emphasis(self, node):
        self.body.append('</em>')

    def visit_entry(self, node):
        atts = {'class': []}
        if isinstance(node.parent.parent, nodes.thead):
            atts['class'].append('head')
        if node.parent.parent.parent.stubs[node.parent.column]:
            # "stubs" list is an attribute of the tgroup element
            atts['class'].append('stub')
        if atts['class']:
            tagname = 'th'
            atts['class'] = ' '.join(atts['class'])
        else:
            tagname = 'td'
            del atts['class']
        node.parent.column += 1
        if node.has_key('morerows'):
            atts['rowspan'] = node['morerows'] + 1
        if node.has_key('morecols'):
            atts['colspan'] = node['morecols'] + 1
            node.parent.column += node['morecols']
        self.body.append(self.starttag(node, tagname, '', **atts))
        self.context.append('</%s>\n' % tagname.lower())
        if len(node) == 0:              # empty cell
            self.body.append('&nbsp;')
        self.set_first_last(node)

    def depart_entry(self, node):
        self.body.append(self.context.pop())

    def visit_enumerated_list(self, node):
        """
        The 'start' attribute does not conform to HTML 4.01's strict.dtd, but
        CSS1 doesn't help. CSS2 isn't widely enough supported yet to be
        usable.
        """
        atts = {}
        if node.has_key('start'):
            atts['start'] = node['start']
        if node.has_key('enumtype'):
            atts['class'] = node['enumtype']
        # @@@ To do: prefix, suffix. How? Change prefix/suffix to a
        # single "format" attribute? Use CSS2?
        old_compact_simple = self.compact_simple
        self.context.append((self.compact_simple, self.compact_p))
        self.compact_p = None
        self.compact_simple = self.is_compactable(node)
        if self.compact_simple and not old_compact_simple:
            atts['class'] = (atts.get('class', '') + ' simple').strip()
        self.body.append(self.starttag(node, 'ol', **atts))

    def depart_enumerated_list(self, node):
        self.compact_simple, self.compact_p = self.context.pop()
        self.body.append('</ol>\n')

    def visit_error(self, node):
        self.visit_admonition(node, 'error')

    def depart_error(self, node):
        self.depart_admonition()

    def visit_field(self, node):
        self.body.append(self.starttag(node, 'tr', '', CLASS='field'))

    def depart_field(self, node):
        self.body.append('</tr>\n')

    def visit_field_body(self, node):
        self.body.append(self.starttag(node, 'td', '', CLASS='field-body'))
        self.set_class_on_child(node, 'first', 0)
        field = node.parent
        if (self.compact_field_list or
            isinstance(field.parent, nodes.docinfo) or
            field.parent.index(field) == len(field.parent) - 1):
            # If we are in a compact list, the docinfo, or if this is
            # the last field of the field list, do not add vertical
            # space after last element.
            self.set_class_on_child(node, 'last', -1)

    def depart_field_body(self, node):
        self.body.append('</td>\n')

    def visit_field_list(self, node):
        self.context.append((self.compact_field_list, self.compact_p))
        self.compact_p = None
        if 'compact' in node['classes']:
            self.compact_field_list = 1
        elif (self.settings.compact_field_lists
              and 'open' not in node['classes']):
            self.compact_field_list = 1
        if self.compact_field_list:
            for field in node:
                field_body = field[-1]
                assert isinstance(field_body, nodes.field_body)
                children = [n for n in field_body
                            if not isinstance(n, nodes.Invisible)]
                if not (len(children) == 0 or
                        len(children) == 1 and
                        isinstance(children[0], nodes.paragraph)):
                    self.compact_field_list = 0
                    break
        self.body.append(self.starttag(node, 'table', frame='void',
                                       rules='none',
                                       CLASS='docutils field-list'))
        self.body.append('<col class="field-name" />\n'
                         '<col class="field-body" />\n'
                         '<tbody valign="top">\n')

    def depart_field_list(self, node):
        self.body.append('</tbody>\n</table>\n')
        self.compact_field_list, self.compact_p = self.context.pop()

    def visit_field_name(self, node):
        atts = {}
        if self.in_docinfo:
            atts['class'] = 'docinfo-name'
        else:
            atts['class'] = 'field-name'
        if ( self.settings.field_name_limit
             and len(node.astext()) > self.settings.field_name_limit):
            atts['colspan'] = 2
            self.context.append('</tr>\n<tr><td>&nbsp;</td>')
        else:
            self.context.append('')
        self.body.append(self.starttag(node, 'th', '', **atts))

    def depart_field_name(self, node):
        self.body.append(':</th>')
        self.body.append(self.context.pop())

    def visit_figure(self, node):
        atts = {'class': 'figure'}
        if node.get('width'):
            atts['style'] = 'width: %spx' % node['width']
        if node.get('align'):
            atts['align'] = node['align']
        self.body.append(self.starttag(node, 'div', **atts))

    def depart_figure(self, node):
        self.body.append('</div>\n')

    def visit_footer(self, node):
        self.context.append(len(self.body))

    def depart_footer(self, node):
        start = self.context.pop()
        footer = [self.starttag(node, 'div', CLASS='footer'),
                  '<hr class="footer" />\n']
        footer.extend(self.body[start:])
        footer.append('\n</div>\n')
        self.footer.extend(footer)
        self.body_suffix[:0] = footer
        del self.body[start:]

    def visit_footnote(self, node):
        self.body.append(self.starttag(node, 'table',
                                       CLASS='docutils footnote',
                                       frame="void", rules="none"))
        self.body.append('<colgroup><col class="label" /><col /></colgroup>\n'
                         '<tbody valign="top">\n'
                         '<tr>')
        self.footnote_backrefs(node)

    def footnote_backrefs(self, node):
        backlinks = []
        backrefs = node['backrefs']
        if self.settings.footnote_backlinks and backrefs:
            if len(backrefs) == 1:
                self.context.append('')
                self.context.append(
                    '<a class="fn-backref" href="#%s" name="%s">'
                    % (backrefs[0], node['ids'][0]))
            else:
                i = 1
                for backref in backrefs:
                    backlinks.append('<a class="fn-backref" href="#%s">%s</a>'
                                     % (backref, i))
                    i += 1
                self.context.append('<em>(%s)</em> ' % ', '.join(backlinks))
                self.context.append('<a name="%s">' % node['ids'][0])
        else:
            self.context.append('')
            self.context.append('<a name="%s">' % node['ids'][0])
        # If the node does not only consist of a label.
        if len(node) > 1:
            # If there are preceding backlinks, we do not set class
            # 'first', because we need to retain the top-margin.
            if not backlinks:
                node[1]['classes'].append('first')
            node[-1]['classes'].append('last')

    def depart_footnote(self, node):
        self.body.append('</td></tr>\n'
                         '</tbody>\n</table>\n')

    def visit_footnote_reference(self, node):
        href = '#' + node['refid']
        format = self.settings.footnote_references
        if format == 'brackets':
            suffix = '['
            self.context.append(']')
        else:
            assert format == 'superscript'
            suffix = '<sup>'
            self.context.append('</sup>')
        self.body.append(self.starttag(node, 'a', suffix,
                                       CLASS='footnote-reference', href=href))

    def depart_footnote_reference(self, node):
        self.body.append(self.context.pop() + '</a>')

    def visit_generated(self, node):
        pass

    def depart_generated(self, node):
        pass

    def visit_header(self, node):
        self.context.append(len(self.body))

    def depart_header(self, node):
        start = self.context.pop()
        header = [self.starttag(node, 'div', CLASS='header')]
        header.extend(self.body[start:])
        header.append('\n<hr class="header"/>\n</div>\n')
        self.body_prefix.extend(header)
        self.header.extend(header)
        del self.body[start:]

    def visit_hint(self, node):
        self.visit_admonition(node, 'hint')

    def depart_hint(self, node):
        self.depart_admonition()

    def visit_image(self, node):
        atts = {}
        atts['src'] = node['uri']
        if node.has_key('width'):
            atts['width'] = node['width']
        if node.has_key('height'):
            atts['height'] = node['height']
        if node.has_key('scale'):
            if Image and not (node.has_key('width')
                              and node.has_key('height')):
                try:
                    im = Image.open(str(atts['src']))
                except (IOError, # Source image can't be found or opened
                        UnicodeError):  # PIL doesn't like Unicode paths.
                    pass
                else:
                    if not atts.has_key('width'):
                        atts['width'] = str(im.size[0])
                    if not atts.has_key('height'):
                        atts['height'] = str(im.size[1])
                    del im
            for att_name in 'width', 'height':
                if atts.has_key(att_name):
                    match = re.match(r'([0-9.]+)(\S*)$', atts[att_name])
                    assert match
                    atts[att_name] = '%s%s' % (
                        float(match.group(1)) * (float(node['scale']) / 100),
                        match.group(2))
        style = []
        for att_name in 'width', 'height':
            if atts.has_key(att_name):
                if re.match(r'^[0-9.]+$', atts[att_name]):
                    # Interpret unitless values as pixels.
                    atts[att_name] += 'px'
                style.append('%s: %s;' % (att_name, atts[att_name]))
                del atts[att_name]
        if style:
            atts['style'] = ' '.join(style)
        atts['alt'] = node.get('alt', atts['src'])
        if (isinstance(node.parent, nodes.TextElement) or
            (isinstance(node.parent, nodes.reference) and
             not isinstance(node.parent.parent, nodes.TextElement))):
            # Inline context or surrounded by <a>...</a>.
            suffix = ''
        else:
            suffix = '\n'
        if node.has_key('align'):
            if node['align'] == 'center':
                # "align" attribute is set in surrounding "div" element.
                self.body.append('<div align="center" class="align-center">')
                self.context.append('</div>\n')
                suffix = ''
            else:
                # "align" attribute is set in "img" element.
                atts['align'] = node['align']
                self.context.append('')
            atts['class'] = 'align-%s' % node['align']
        else:
            self.context.append('')
        self.body.append(self.emptytag(node, 'img', suffix, **atts))

    def depart_image(self, node):
        self.body.append(self.context.pop())

    def visit_important(self, node):
        self.visit_admonition(node, 'important')

    def depart_important(self, node):
        self.depart_admonition()

    def visit_inline(self, node):
        self.body.append(self.starttag(node, 'span', ''))

    def depart_inline(self, node):
        self.body.append('</span>')

    def visit_label(self, node):
        self.body.append(self.starttag(node, 'td', '%s[' % self.context.pop(),
                                       CLASS='label'))

    def depart_label(self, node):
        self.body.append(']</a></td><td>%s' % self.context.pop())

    def visit_legend(self, node):
        self.body.append(self.starttag(node, 'div', CLASS='legend'))

    def depart_legend(self, node):
        self.body.append('</div>\n')

    def visit_line(self, node):
        self.body.append(self.starttag(node, 'div', suffix='', CLASS='line'))
        if not len(node):
            self.body.append('<br />')

    def depart_line(self, node):
        self.body.append('</div>\n')

    def visit_line_block(self, node):
        self.body.append(self.starttag(node, 'div', CLASS='line-block'))

    def depart_line_block(self, node):
        self.body.append('</div>\n')

    def visit_list_item(self, node):
        self.body.append(self.starttag(node, 'li', ''))
        if len(node):
            node[0]['classes'].append('first')

    def depart_list_item(self, node):
        self.body.append('</li>\n')

    def visit_literal(self, node):
        """Process text to prevent tokens from wrapping."""
        self.body.append(
            self.starttag(node, 'tt', '', CLASS='docutils literal'))
        text = node.astext()
        for token in self.words_and_spaces.findall(text):
            if token.strip():
                # Protect text like "--an-option" from bad line wrapping:
                self.body.append('<span class="pre">%s</span>'
                                 % self.encode(token))
            elif token in ('\n', ' '):
                # Allow breaks at whitespace:
                self.body.append(token)
            else:
                # Protect runs of multiple spaces; the last space can wrap:
                self.body.append('&nbsp;' * (len(token) - 1) + ' ')
        self.body.append('</tt>')
        # Content already processed:
        raise nodes.SkipNode

    def visit_literal_block(self, node):
        self.body.append(self.starttag(node, 'pre', CLASS='literal-block'))

    def depart_literal_block(self, node):
        self.body.append('\n</pre>\n')

    def visit_meta(self, node):
        meta = self.emptytag(node, 'meta', **node.non_default_attributes())
        self.add_meta(meta)

    def depart_meta(self, node):
        pass

    def add_meta(self, tag):
        self.meta.append(tag)
        self.head.append(tag)

    def visit_note(self, node):
        self.visit_admonition(node, 'note')

    def depart_note(self, node):
        self.depart_admonition()

    def visit_option(self, node):
        if self.context[-1]:
            self.body.append(', ')
        self.body.append(self.starttag(node, 'span', '', CLASS='option'))

    def depart_option(self, node):
        self.body.append('</span>')
        self.context[-1] += 1

    def visit_option_argument(self, node):
        self.body.append(node.get('delimiter', ' '))
        self.body.append(self.starttag(node, 'var', ''))

    def depart_option_argument(self, node):
        self.body.append('</var>')

    def visit_option_group(self, node):
        atts = {}
        if ( self.settings.option_limit
             and len(node.astext()) > self.settings.option_limit):
            atts['colspan'] = 2
            self.context.append('</tr>\n<tr><td>&nbsp;</td>')
        else:
            self.context.append('')
        self.body.append(
            self.starttag(node, 'td', CLASS='option-group', **atts))
        self.body.append('<kbd>')
        self.context.append(0)          # count number of options

    def depart_option_group(self, node):
        self.context.pop()
        self.body.append('</kbd></td>\n')
        self.body.append(self.context.pop())

    def visit_option_list(self, node):
        self.body.append(
              self.starttag(node, 'table', CLASS='docutils option-list',
                            frame="void", rules="none"))
        self.body.append('<col class="option" />\n'
                         '<col class="description" />\n'
                         '<tbody valign="top">\n')

    def depart_option_list(self, node):
        self.body.append('</tbody>\n</table>\n')

    def visit_option_list_item(self, node):
        self.body.append(self.starttag(node, 'tr', ''))

    def depart_option_list_item(self, node):
        self.body.append('</tr>\n')

    def visit_option_string(self, node):
        pass

    def depart_option_string(self, node):
        pass

    def visit_organization(self, node):
        self.visit_docinfo_item(node, 'organization')

    def depart_organization(self, node):
        self.depart_docinfo_item()

    def should_be_compact_paragraph(self, node):
        """
        Determine if the <p> tags around paragraph ``node`` can be omitted.
        """
        if (isinstance(node.parent, nodes.document) or
            isinstance(node.parent, nodes.compound)):
            # Never compact paragraphs in document or compound.
            return 0
        for key, value in node.attlist():
            if (node.is_not_default(key) and
                not (key == 'classes' and value in
                     ([], ['first'], ['last'], ['first', 'last']))):
                # Attribute which needs to survive.
                return 0
        first = isinstance(node.parent[0], nodes.label) # skip label
        for child in node.parent.children[first:]:
            # only first paragraph can be compact
            if isinstance(child, nodes.Invisible):
                continue
            if child is node:
                break
            return 0
        if ( self.compact_simple
             or self.compact_field_list
             or (self.compact_p
                 and (len(node.parent) == 1
                      or len(node.parent) == 2
                      and isinstance(node.parent[0], nodes.label)))):
            return 1
        return 0

    def visit_paragraph(self, node):
        if self.should_be_compact_paragraph(node):
            self.context.append('')
        else:
            self.body.append(self.starttag(node, 'p', ''))
            self.context.append('</p>\n')

    def depart_paragraph(self, node):
        self.body.append(self.context.pop())

    def visit_problematic(self, node):
        if node.hasattr('refid'):
            self.body.append('<a href="#%s" name="%s">' % (node['refid'],
                                                           node['ids'][0]))
            self.context.append('</a>')
        else:
            self.context.append('')
        self.body.append(self.starttag(node, 'span', '', CLASS='problematic'))

    def depart_problematic(self, node):
        self.body.append('</span>')
        self.body.append(self.context.pop())

    def visit_raw(self, node):
        if 'html' in node.get('format', '').split():
            t = isinstance(node.parent, nodes.TextElement) and 'span' or 'div'
            if node['classes']:
                self.body.append(self.starttag(node, t, suffix=''))
            self.body.append(node.astext())
            if node['classes']:
                self.body.append('</%s>' % t)
        # Keep non-HTML raw text out of output:
        raise nodes.SkipNode

    def visit_reference(self, node):
        if node.has_key('refuri'):
            href = node['refuri']
            if ( self.settings.cloak_email_addresses
                 and href.startswith('mailto:')):
                href = self.cloak_mailto(href)
                self.in_mailto = 1
        else:
            assert node.has_key('refid'), \
                   'References must have "refuri" or "refid" attribute.'
            href = '#' + node['refid']
        atts = {'href': href, 'class': 'reference'}
        if not isinstance(node.parent, nodes.TextElement):
            assert len(node) == 1 and isinstance(node[0], nodes.image)
            atts['class'] += ' image-reference'
        self.body.append(self.starttag(node, 'a', '', **atts))

    def depart_reference(self, node):
        self.body.append('</a>')
        if not isinstance(node.parent, nodes.TextElement):
            self.body.append('\n')
        self.in_mailto = 0

    def visit_revision(self, node):
        self.visit_docinfo_item(node, 'revision', meta=None)

    def depart_revision(self, node):
        self.depart_docinfo_item()

    def visit_row(self, node):
        self.body.append(self.starttag(node, 'tr', ''))
        node.column = 0

    def depart_row(self, node):
        self.body.append('</tr>\n')

    def visit_rubric(self, node):
        self.body.append(self.starttag(node, 'p', '', CLASS='rubric'))

    def depart_rubric(self, node):
        self.body.append('</p>\n')

    def visit_section(self, node):
        self.section_level += 1
        self.body.append(
            self.start_tag_with_title(node, 'div', CLASS='section'))

    def depart_section(self, node):
        self.section_level -= 1
        self.body.append('</div>\n')

    def visit_sidebar(self, node):
        self.body.append(
            self.start_tag_with_title(node, 'div', CLASS='sidebar'))
        self.set_first_last(node)
        self.in_sidebar = 1

    def depart_sidebar(self, node):
        self.body.append('</div>\n')
        self.in_sidebar = None

    def visit_status(self, node):
        self.visit_docinfo_item(node, 'status', meta=None)

    def depart_status(self, node):
        self.depart_docinfo_item()

    def visit_strong(self, node):
        self.body.append('<strong>')

    def depart_strong(self, node):
        self.body.append('</strong>')

    def visit_subscript(self, node):
        self.body.append(self.starttag(node, 'sub', ''))

    def depart_subscript(self, node):
        self.body.append('</sub>')

    def visit_substitution_definition(self, node):
        """Internal only."""
        raise nodes.SkipNode

    def visit_substitution_reference(self, node):
        self.unimplemented_visit(node)

    def visit_subtitle(self, node):
        if isinstance(node.parent, nodes.sidebar):
            self.body.append(self.starttag(node, 'p', '',
                                           CLASS='sidebar-subtitle'))
            self.context.append('</p>\n')
        elif isinstance(node.parent, nodes.document):
            self.body.append(self.starttag(node, 'h2', '', CLASS='subtitle'))
            self.context.append('</h2>\n')
            self.in_document_title = len(self.body)
        elif isinstance(node.parent, nodes.section):
            tag = 'h%s' % (self.section_level + self.initial_header_level - 1)
            self.body.append(
                self.starttag(node, tag, '', CLASS='section-subtitle') +
                self.starttag({}, 'span', '', CLASS='section-subtitle'))
            self.context.append('</span></%s>\n' % tag)

    def depart_subtitle(self, node):
        self.body.append(self.context.pop())
        if self.in_document_title:
            self.subtitle = self.body[self.in_document_title:-1]
            self.in_document_title = 0
            self.body_pre_docinfo.extend(self.body)
            self.html_subtitle.extend(self.body)
            del self.body[:]

    def visit_superscript(self, node):
        self.body.append(self.starttag(node, 'sup', ''))

    def depart_superscript(self, node):
        self.body.append('</sup>')

    def visit_system_message(self, node):
        self.body.append(self.starttag(node, 'div', CLASS='system-message'))
        self.body.append('<p class="system-message-title">')
        attr = {}
        backref_text = ''
        if node['ids']:
            attr['name'] = node['ids'][0]
        if len(node['backrefs']):
            backrefs = node['backrefs']
            if len(backrefs) == 1:
                backref_text = ('; <em><a href="#%s">backlink</a></em>'
                                % backrefs[0])
            else:
                i = 1
                backlinks = []
                for backref in backrefs:
                    backlinks.append('<a href="#%s">%s</a>' % (backref, i))
                    i += 1
                backref_text = ('; <em>backlinks: %s</em>'
                                % ', '.join(backlinks))
        if node.hasattr('line'):
            line = ', line %s' % node['line']
        else:
            line = ''
        if attr:
            a_start = self.starttag({}, 'a', '', **attr)
            a_end = '</a>'
        else:
            a_start = a_end = ''
        self.body.append('System Message: %s%s/%s%s '
                         '(<tt class="docutils">%s</tt>%s)%s</p>\n'
                         % (a_start, node['type'], node['level'], a_end,
                            self.encode(node['source']), line, backref_text))

    def depart_system_message(self, node):
        self.body.append('</div>\n')

    def visit_table(self, node):
        self.body.append(
            self.starttag(node, 'table', CLASS='docutils', border="1"))

    def depart_table(self, node):
        self.body.append('</table>\n')

    def visit_target(self, node):
        if not (node.has_key('refuri') or node.has_key('refid')
                or node.has_key('refname')):
            self.body.append(self.starttag(node, 'span', '', CLASS='target'))
            self.context.append('</span>')
        else:
            self.context.append('')

    def depart_target(self, node):
        self.body.append(self.context.pop())

    def visit_tbody(self, node):
        self.write_colspecs()
        self.body.append(self.context.pop()) # '</colgroup>\n' or ''
        self.body.append(self.starttag(node, 'tbody', valign='top'))

    def depart_tbody(self, node):
        self.body.append('</tbody>\n')

    def visit_term(self, node):
        self.body.append(self.starttag(node, 'dt', ''))

    def depart_term(self, node):
        """
        Leave the end tag to `self.visit_definition()`, in case there's a
        classifier.
        """
        pass

    def visit_tgroup(self, node):
        # Mozilla needs <colgroup>:
        self.body.append(self.starttag(node, 'colgroup'))
        # Appended by thead or tbody:
        self.context.append('</colgroup>\n')
        node.stubs = []

    def depart_tgroup(self, node):
        pass

    def visit_thead(self, node):
        self.write_colspecs()
        self.body.append(self.context.pop()) # '</colgroup>\n'
        # There may or may not be a <thead>; this is for <tbody> to use:
        self.context.append('')
        self.body.append(self.starttag(node, 'thead', valign='bottom'))

    def depart_thead(self, node):
        self.body.append('</thead>\n')

    def visit_tip(self, node):
        self.visit_admonition(node, 'tip')

    def depart_tip(self, node):
        self.depart_admonition()

    def visit_title(self, node, move_ids=1):
        """Only 6 section levels are supported by HTML."""
        check_id = 0
        close_tag = '</p>\n'
        if isinstance(node.parent, nodes.topic):
            self.body.append(
                  self.starttag(node, 'p', '', CLASS='topic-title first'))
            check_id = 1
        elif isinstance(node.parent, nodes.sidebar):
            self.body.append(
                  self.starttag(node, 'p', '', CLASS='sidebar-title'))
            check_id = 1
        elif isinstance(node.parent, nodes.Admonition):
            self.body.append(
                  self.starttag(node, 'p', '', CLASS='admonition-title'))
            check_id = 1
        elif isinstance(node.parent, nodes.table):
            self.body.append(
                  self.starttag(node, 'caption', ''))
            check_id = 1
            close_tag = '</caption>\n'
        elif isinstance(node.parent, nodes.document):
            self.body.append(self.starttag(node, 'h1', '', CLASS='title'))
            self.context.append('</h1>\n')
            self.in_document_title = len(self.body)
        else:
            assert isinstance(node.parent, nodes.section)
            h_level = self.section_level + self.initial_header_level - 1
            atts = {}
            if (len(node.parent) >= 2 and
                isinstance(node.parent[1], nodes.subtitle)):
                atts['CLASS'] = 'with-subtitle'
            self.body.append(
                  self.starttag(node, 'h%s' % h_level, '', **atts))
            atts = {}
            # !!! conditional to be removed in Docutils 0.5:
            if move_ids:
                if node.parent['ids']:
                    atts['ids'] = node.parent['ids']
            if node.hasattr('refid'):
                atts['class'] = 'toc-backref'
                atts['href'] = '#' + node['refid']
            if atts:
                self.body.append(self.starttag({}, 'a', '', **atts))
                self.context.append('</a></h%s>\n' % (h_level))
            else:
                self.context.append('</h%s>\n' % (h_level))
        # !!! conditional to be removed in Docutils 0.5:
        if check_id:
            if node.parent['ids']:
                atts={'ids': node.parent['ids']}
                self.body.append(
                    self.starttag({}, 'a', '', **atts))
                self.context.append('</a>' + close_tag)
            else:
                self.context.append(close_tag)

    def depart_title(self, node):
        self.body.append(self.context.pop())
        if self.in_document_title:
            self.title = self.body[self.in_document_title:-1]
            self.in_document_title = 0
            self.body_pre_docinfo.extend(self.body)
            self.html_title.extend(self.body)
            del self.body[:]

    def visit_title_reference(self, node):
        self.body.append(self.starttag(node, 'cite', ''))

    def depart_title_reference(self, node):
        self.body.append('</cite>')

    def visit_topic(self, node):
        self.body.append(self.start_tag_with_title(node, 'div', CLASS='topic'))
        self.topic_classes = node['classes']

    def depart_topic(self, node):
        self.body.append('</div>\n')
        self.topic_classes = []

    def visit_transition(self, node):
        self.body.append(self.emptytag(node, 'hr', CLASS='docutils'))

    def depart_transition(self, node):
        pass

    def visit_version(self, node):
        self.visit_docinfo_item(node, 'version', meta=None)

    def depart_version(self, node):
        self.depart_docinfo_item()

    def visit_warning(self, node):
        self.visit_admonition(node, 'warning')

    def depart_warning(self, node):
        self.depart_admonition()

    def unimplemented_visit(self, node):
        raise NotImplementedError('visiting unimplemented node type: %s'
                                  % node.__class__.__name__)


class SimpleListChecker(nodes.GenericNodeVisitor):

    """
    Raise `nodes.NodeFound` if non-simple list item is encountered.

    Here "simple" means a list item containing nothing other than a single
    paragraph, a simple list, or a paragraph followed by a simple list.
    """

    def default_visit(self, node):
        raise nodes.NodeFound

    def visit_bullet_list(self, node):
        pass

    def visit_enumerated_list(self, node):
        pass

    def visit_list_item(self, node):
        children = []
        for child in node.children:
            if not isinstance(child, nodes.Invisible):
                children.append(child)
        if (children and isinstance(children[0], nodes.paragraph)
            and (isinstance(children[-1], nodes.bullet_list)
                 or isinstance(children[-1], nodes.enumerated_list))):
            children.pop()
        if len(children) <= 1:
            return
        else:
            raise nodes.NodeFound

    def visit_paragraph(self, node):
        raise nodes.SkipNode

    def invisible_visit(self, node):
        """Invisible nodes should be ignored."""
        raise nodes.SkipNode

    visit_comment = invisible_visit
    visit_substitution_definition = invisible_visit
    visit_target = invisible_visit
    visit_pending = invisible_visit
