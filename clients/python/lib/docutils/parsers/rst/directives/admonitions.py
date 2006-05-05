# Author: David Goodger
# Contact: goodger@users.sourceforge.net
# Revision: $Revision: 3155 $
# Date: $Date: 2005-04-02 23:57:06 +0200 (Sat, 02 Apr 2005) $
# Copyright: This module has been placed in the public domain.

"""
Admonition directives.
"""

__docformat__ = 'reStructuredText'


from docutils.parsers.rst import states, directives
from docutils import nodes


def make_admonition(node_class, name, arguments, options, content, lineno,
                       content_offset, block_text, state, state_machine):
    if not content:
        error = state_machine.reporter.error(
            'The "%s" admonition is empty; content required.' % (name),
            nodes.literal_block(block_text, block_text), line=lineno)
        return [error]
    text = '\n'.join(content)
    admonition_node = node_class(text)
    if arguments:
        title_text = arguments[0]
        textnodes, messages = state.inline_text(title_text, lineno)
        admonition_node += nodes.title(title_text, '', *textnodes)
        admonition_node += messages
        if options.has_key('class'):
            classes = options['class']
        else:
            classes = ['admonition-' + nodes.make_id(title_text)]
        admonition_node['classes'] += classes
    state.nested_parse(content, content_offset, admonition_node)
    return [admonition_node]

def admonition(*args):
    return make_admonition(nodes.admonition, *args)

admonition.arguments = (1, 0, 1)
admonition.options = {'class': directives.class_option}
admonition.content = 1

def attention(*args):
    return make_admonition(nodes.attention, *args)

attention.content = 1

def caution(*args):
    return make_admonition(nodes.caution, *args)

caution.content = 1

def danger(*args):
    return make_admonition(nodes.danger, *args)

danger.content = 1

def error(*args):
    return make_admonition(nodes.error, *args)

error.content = 1

def hint(*args):
    return make_admonition(nodes.hint, *args)

hint.content = 1

def important(*args):
    return make_admonition(nodes.important, *args)

important.content = 1

def note(*args):
    return make_admonition(nodes.note, *args)

note.content = 1

def tip(*args):
    return make_admonition(nodes.tip, *args)

tip.content = 1

def warning(*args):
    return make_admonition(nodes.warning, *args)

warning.content = 1
