# Author: David Goodger
# Contact: goodger@users.sourceforge.net
# Revision: $Revision: 4234 $
# Date: $Date: 2005-12-29 02:14:21 +0100 (Thu, 29 Dec 2005) $
# Copyright: This module has been placed in the public domain.

"""
Directives for figures and simple images.
"""

__docformat__ = 'reStructuredText'


import sys
from docutils import nodes, utils
from docutils.parsers.rst import directives, states
from docutils.nodes import fully_normalize_name, whitespace_normalize_name
from docutils.parsers.rst.roles import set_classes

try:
    import Image                        # PIL
except ImportError:
    Image = None

align_h_values = ('left', 'center', 'right')
align_v_values = ('top', 'middle', 'bottom')
align_values = align_v_values + align_h_values

def align(argument):
    return directives.choice(argument, align_values)

def image(name, arguments, options, content, lineno,
          content_offset, block_text, state, state_machine):
    if options.has_key('align'):
        # check for align_v values only
        if isinstance(state, states.SubstitutionDef):
            if options['align'] not in align_v_values:
                error = state_machine.reporter.error(
                    'Error in "%s" directive: "%s" is not a valid value for '
                    'the "align" option within a substitution definition.  '
                    'Valid values for "align" are: "%s".'
                    % (name, options['align'], '", "'.join(align_v_values)),
                    nodes.literal_block(block_text, block_text), line=lineno)
                return [error]
        elif options['align'] not in align_h_values:
            error = state_machine.reporter.error(
                'Error in "%s" directive: "%s" is not a valid value for '
                'the "align" option.  Valid values for "align" are: "%s".'
                % (name, options['align'], '", "'.join(align_h_values)),
                nodes.literal_block(block_text, block_text), line=lineno)
            return [error]
    messages = []
    reference = directives.uri(arguments[0])
    options['uri'] = reference
    reference_node = None
    if options.has_key('target'):
        block = states.escape2null(options['target']).splitlines()
        block = [line for line in block]
        target_type, data = state.parse_target(block, block_text, lineno)
        if target_type == 'refuri':
            reference_node = nodes.reference(refuri=data)
        elif target_type == 'refname':
            reference_node = nodes.reference(
                refname=fully_normalize_name(data),
                name=whitespace_normalize_name(data))
            reference_node.indirect_reference_name = data
            state.document.note_refname(reference_node)
        else:                           # malformed target
            messages.append(data)       # data is a system message
        del options['target']
    set_classes(options)
    image_node = nodes.image(block_text, **options)
    if reference_node:
        reference_node += image_node
        return messages + [reference_node]
    else:
        return messages + [image_node]

image.arguments = (1, 0, 1)
image.options = {'alt': directives.unchanged,
                 'height': directives.length_or_unitless,
                 'width': directives.length_or_percentage_or_unitless,
                 'scale': directives.nonnegative_int,
                 'align': align,
                 'target': directives.unchanged_required,
                 'class': directives.class_option}

def figure_align(argument):
    return directives.choice(argument, align_h_values)

def figure(name, arguments, options, content, lineno,
           content_offset, block_text, state, state_machine):
    figwidth = options.get('figwidth')
    if figwidth:
        del options['figwidth']
    figclasses = options.get('figclass')
    if figclasses:
        del options['figclass']
    align = options.get('align')
    if align:
        del options['align']
    (image_node,) = image(name, arguments, options, content, lineno,
                         content_offset, block_text, state, state_machine)
    if isinstance(image_node, nodes.system_message):
        return [image_node]
    figure_node = nodes.figure('', image_node)
    if figwidth == 'image':
        if Image and state.document.settings.file_insertion_enabled:
            # PIL doesn't like Unicode paths:
            try:
                i = Image.open(str(image_node['uri']))
            except (IOError, UnicodeError):
                pass
            else:
                state.document.settings.record_dependencies.add(image_node['uri'])
                figure_node['width'] = i.size[0]
    elif figwidth is not None:
        figure_node['width'] = figwidth
    if figclasses:
        figure_node['classes'] += figclasses
    if align:
        figure_node['align'] = align
    if content:
        node = nodes.Element()          # anonymous container for parsing
        state.nested_parse(content, content_offset, node)
        first_node = node[0]
        if isinstance(first_node, nodes.paragraph):
            caption = nodes.caption(first_node.rawsource, '',
                                    *first_node.children)
            figure_node += caption
        elif not (isinstance(first_node, nodes.comment)
                  and len(first_node) == 0):
            error = state_machine.reporter.error(
                  'Figure caption must be a paragraph or empty comment.',
                  nodes.literal_block(block_text, block_text), line=lineno)
            return [figure_node, error]
        if len(node) > 1:
            figure_node += nodes.legend('', *node[1:])
    return [figure_node]

def figwidth_value(argument):
    if argument.lower() == 'image':
        return 'image'
    else:
        return directives.nonnegative_int(argument)

figure.arguments = (1, 0, 1)
figure.options = {'figwidth': figwidth_value,
                  'figclass': directives.class_option}
figure.options.update(image.options)
figure.options['align'] = figure_align
figure.content = 1
