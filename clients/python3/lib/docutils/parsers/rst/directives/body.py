# Author: David Goodger
# Contact: goodger@python.org
# Revision: $Revision: 3963 $
# Date: $Date: 2005-10-28 18:12:56 +0200 (Fri, 28 Oct 2005) $
# Copyright: This module has been placed in the public domain.

"""
Directives for additional body elements.

See `docutils.parsers.rst.directives` for API details.
"""

__docformat__ = 'reStructuredText'


import sys
from docutils import nodes
from docutils.parsers.rst import directives
from docutils.parsers.rst.roles import set_classes

              
def topic(name, arguments, options, content, lineno,
          content_offset, block_text, state, state_machine,
          node_class=nodes.topic):
    if not (state_machine.match_titles
            or isinstance(state_machine.node, nodes.sidebar)):
        error = state_machine.reporter.error(
              'The "%s" directive may not be used within topics '
              'or body elements.' % name,
              nodes.literal_block(block_text, block_text), line=lineno)
        return [error]
    if not content:
        warning = state_machine.reporter.warning(
            'Content block expected for the "%s" directive; none found.'
            % name, nodes.literal_block(block_text, block_text),
            line=lineno)
        return [warning]
    title_text = arguments[0]
    textnodes, messages = state.inline_text(title_text, lineno)
    titles = [nodes.title(title_text, '', *textnodes)]
    # sidebar uses this code
    if options.has_key('subtitle'):
        textnodes, more_messages = state.inline_text(options['subtitle'],
                                                     lineno)
        titles.append(nodes.subtitle(options['subtitle'], '', *textnodes))
        messages.extend(more_messages)
    text = '\n'.join(content)
    node = node_class(text, *(titles + messages))
    node['classes'] += options.get('class', [])
    if text:
        state.nested_parse(content, content_offset, node)
    return [node]

topic.arguments = (1, 0, 1)
topic.options = {'class': directives.class_option}
topic.content = 1

def sidebar(name, arguments, options, content, lineno,
            content_offset, block_text, state, state_machine):
    if isinstance(state_machine.node, nodes.sidebar):
        error = state_machine.reporter.error(
              'The "%s" directive may not be used within a sidebar element.'
              % name, nodes.literal_block(block_text, block_text), line=lineno)
        return [error]
    return topic(name, arguments, options, content, lineno,
                 content_offset, block_text, state, state_machine,
                 node_class=nodes.sidebar)

sidebar.arguments = (1, 0, 1)
sidebar.options = {'subtitle': directives.unchanged_required,
                   'class': directives.class_option}
sidebar.content = 1

def line_block(name, arguments, options, content, lineno,
               content_offset, block_text, state, state_machine):
    if not content:
        warning = state_machine.reporter.warning(
            'Content block expected for the "%s" directive; none found.'
            % name, nodes.literal_block(block_text, block_text), line=lineno)
        return [warning]
    block = nodes.line_block(classes=options.get('class', []))
    node_list = [block]
    for line_text in content:
        text_nodes, messages = state.inline_text(line_text.strip(),
                                                 lineno + content_offset)
        line = nodes.line(line_text, '', *text_nodes)
        if line_text.strip():
            line.indent = len(line_text) - len(line_text.lstrip())
        block += line
        node_list.extend(messages)
        content_offset += 1
    state.nest_line_block_lines(block)
    return node_list

line_block.options = {'class': directives.class_option}
line_block.content = 1

def parsed_literal(name, arguments, options, content, lineno,
                   content_offset, block_text, state, state_machine):
    set_classes(options)
    return block(name, arguments, options, content, lineno,
                 content_offset, block_text, state, state_machine,
                 node_class=nodes.literal_block)

parsed_literal.options = {'class': directives.class_option}
parsed_literal.content = 1

def block(name, arguments, options, content, lineno,
          content_offset, block_text, state, state_machine, node_class):
    if not content:
        warning = state_machine.reporter.warning(
            'Content block expected for the "%s" directive; none found.'
            % name, nodes.literal_block(block_text, block_text), line=lineno)
        return [warning]
    text = '\n'.join(content)
    text_nodes, messages = state.inline_text(text, lineno)
    node = node_class(text, '', *text_nodes, **options)
    node.line = content_offset + 1
    return [node] + messages

def rubric(name, arguments, options, content, lineno,
             content_offset, block_text, state, state_machine):
    rubric_text = arguments[0]
    textnodes, messages = state.inline_text(rubric_text, lineno)
    rubric = nodes.rubric(rubric_text, '', *textnodes, **options)
    return [rubric] + messages

rubric.arguments = (1, 0, 1)
rubric.options = {'class': directives.class_option}

def epigraph(name, arguments, options, content, lineno,
             content_offset, block_text, state, state_machine):
    block_quote, messages = state.block_quote(content, content_offset)
    block_quote['classes'].append('epigraph')
    return [block_quote] + messages

epigraph.content = 1

def highlights(name, arguments, options, content, lineno,
             content_offset, block_text, state, state_machine):
    block_quote, messages = state.block_quote(content, content_offset)
    block_quote['classes'].append('highlights')
    return [block_quote] + messages

highlights.content = 1

def pull_quote(name, arguments, options, content, lineno,
             content_offset, block_text, state, state_machine):
    block_quote, messages = state.block_quote(content, content_offset)
    block_quote['classes'].append('pull-quote')
    return [block_quote] + messages

pull_quote.content = 1

def compound(name, arguments, options, content, lineno,
             content_offset, block_text, state, state_machine):
    text = '\n'.join(content)
    if not text:
        error = state_machine.reporter.error(
            'The "%s" directive is empty; content required.' % name,
            nodes.literal_block(block_text, block_text), line=lineno)
        return [error]
    node = nodes.compound(text)
    node['classes'] += options.get('class', [])
    state.nested_parse(content, content_offset, node)
    return [node]

compound.options = {'class': directives.class_option}
compound.content = 1

def container(name, arguments, options, content, lineno,
              content_offset, block_text, state, state_machine):
    text = '\n'.join(content)
    if not text:
        error = state_machine.reporter.error(
            'The "%s" directive is empty; content required.' % name,
            nodes.literal_block(block_text, block_text), line=lineno)
        return [error]
    try:
        if arguments:
            classes = directives.class_option(arguments[0])
        else:
            classes = []
    except ValueError:
        error = state_machine.reporter.error(
            'Invalid class attribute value for "%s" directive: "%s".'
            % (name, arguments[0]),
            nodes.literal_block(block_text, block_text), line=lineno)
        return [error]
    node = nodes.container(text)
    node['classes'].extend(classes)
    state.nested_parse(content, content_offset, node)
    return [node]

container.arguments = (0, 1, 1)
container.content = 1
