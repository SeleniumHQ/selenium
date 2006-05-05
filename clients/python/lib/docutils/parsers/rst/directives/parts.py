# Author: David Goodger, Dmitry Jemerov
# Contact: goodger@users.sourceforge.net
# Revision: $Revision: 3439 $
# Date: $Date: 2005-06-06 03:20:35 +0200 (Mon, 06 Jun 2005) $
# Copyright: This module has been placed in the public domain.

"""
Directives for document parts.
"""

__docformat__ = 'reStructuredText'

from docutils import nodes, languages
from docutils.transforms import parts
from docutils.parsers.rst import directives


backlinks_values = ('top', 'entry', 'none')

def backlinks(arg):
    value = directives.choice(arg, backlinks_values)
    if value == 'none':
        return None
    else:
        return value

def contents(name, arguments, options, content, lineno,
             content_offset, block_text, state, state_machine):
    """
    Table of contents.

    The table of contents is generated in two passes: initial parse and
    transform.  During the initial parse, a 'pending' element is generated
    which acts as a placeholder, storing the TOC title and any options
    internally.  At a later stage in the processing, the 'pending' element is
    replaced by a 'topic' element, a title and the table of contents proper.
    """
    if not (state_machine.match_titles
            or isinstance(state_machine.node, nodes.sidebar)):
        error = state_machine.reporter.error(
              'The "%s" directive may not be used within topics '
              'or body elements.' % name,
              nodes.literal_block(block_text, block_text), line=lineno)
        return [error]
    document = state_machine.document
    language = languages.get_language(document.settings.language_code)
    if arguments:
        title_text = arguments[0]
        text_nodes, messages = state.inline_text(title_text, lineno)
        title = nodes.title(title_text, '', *text_nodes)
    else:
        messages = []
        if options.has_key('local'):
            title = None
        else:
            title = nodes.title('', language.labels['contents'])
    topic = nodes.topic(classes=['contents'])
    topic['classes'] += options.get('class', [])
    if options.has_key('local'):
        topic['classes'].append('local')
    if title:
        name = title.astext()
        topic += title
    else:
        name = language.labels['contents']
    name = nodes.fully_normalize_name(name)
    if not document.has_name(name):
        topic['names'].append(name)
    document.note_implicit_target(topic)
    pending = nodes.pending(parts.Contents, rawsource=block_text)
    pending.details.update(options)
    document.note_pending(pending)
    topic += pending
    return [topic] + messages

contents.arguments = (0, 1, 1)
contents.options = {'depth': directives.nonnegative_int,
                    'local': directives.flag,
                    'backlinks': backlinks,
                    'class': directives.class_option}

def sectnum(name, arguments, options, content, lineno,
            content_offset, block_text, state, state_machine):
    """Automatic section numbering."""
    pending = nodes.pending(parts.SectNum)
    pending.details.update(options)
    state_machine.document.note_pending(pending)
    return [pending]

sectnum.options = {'depth': int,
                   'start': int,
                   'prefix': directives.unchanged_required,
                   'suffix': directives.unchanged_required}

def header_footer(node, name, arguments, options, content, lineno,
                  content_offset, block_text, state, state_machine):
    """Contents of document header or footer."""
    if not content:
        warning = state_machine.reporter.warning(
            'Content block expected for the "%s" directive; none found.'
            % name, nodes.literal_block(block_text, block_text),
            line=lineno)
        node.append(nodes.paragraph(
            '', 'Problem with the "%s" directive: no content supplied.' % name))
        return [warning]
    text = '\n'.join(content)
    state.nested_parse(content, content_offset, node)
    return []

def header(name, arguments, options, content, lineno,
           content_offset, block_text, state, state_machine):
    decoration = state_machine.document.get_decoration()
    node = decoration.get_header()
    return header_footer(node, name, arguments, options, content, lineno,
                         content_offset, block_text, state, state_machine)

header.content = 1

def footer(name, arguments, options, content, lineno,
           content_offset, block_text, state, state_machine):
    decoration = state_machine.document.get_decoration()
    node = decoration.get_footer()
    return header_footer(node, name, arguments, options, content, lineno,
                         content_offset, block_text, state, state_machine)

footer.content = 1
