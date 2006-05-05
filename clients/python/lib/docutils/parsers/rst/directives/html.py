# Author: David Goodger
# Contact: goodger@users.sourceforge.net
# Revision: $Revision: 3038 $
# Date: $Date: 2005-03-14 17:16:57 +0100 (Mon, 14 Mar 2005) $
# Copyright: This module has been placed in the public domain.

"""
Directives for typically HTML-specific constructs.
"""

__docformat__ = 'reStructuredText'

import sys
from docutils import nodes, utils
from docutils.parsers.rst import states
from docutils.transforms import components


def meta(name, arguments, options, content, lineno,
         content_offset, block_text, state, state_machine):
    node = nodes.Element()
    if content:
        new_line_offset, blank_finish = state.nested_list_parse(
              content, content_offset, node, initial_state='MetaBody',
              blank_finish=1, state_machine_kwargs=metaSMkwargs)
        if (new_line_offset - content_offset) != len(content):
            # incomplete parse of block?
            error = state_machine.reporter.error(
                'Invalid meta directive.',
                nodes.literal_block(block_text, block_text), line=lineno)
            node += error
    else:
        error = state_machine.reporter.error(
            'Empty meta directive.',
            nodes.literal_block(block_text, block_text), line=lineno)
        node += error
    return node.children

meta.content = 1

def imagemap(name, arguments, options, content, lineno,
             content_offset, block_text, state, state_machine):
    return []


class MetaBody(states.SpecializedBody):

    class meta(nodes.Special, nodes.PreBibliographic, nodes.Element):
        """HTML-specific "meta" element."""
        pass

    def field_marker(self, match, context, next_state):
        """Meta element."""
        node, blank_finish = self.parsemeta(match)
        self.parent += node
        return [], next_state, []

    def parsemeta(self, match):
        name = self.parse_field_marker(match)
        indented, indent, line_offset, blank_finish = \
              self.state_machine.get_first_known_indented(match.end())
        node = self.meta()
        pending = nodes.pending(components.Filter,
                                {'component': 'writer',
                                 'format': 'html',
                                 'nodes': [node]})
        node['content'] = ' '.join(indented)
        if not indented:
            line = self.state_machine.line
            msg = self.reporter.info(
                  'No content for meta tag "%s".' % name,
                  nodes.literal_block(line, line),
                  line=self.state_machine.abs_line_number())
            return msg, blank_finish
        tokens = name.split()
        try:
            attname, val = utils.extract_name_value(tokens[0])[0]
            node[attname.lower()] = val
        except utils.NameValueError:
            node['name'] = tokens[0]
        for token in tokens[1:]:
            try:
                attname, val = utils.extract_name_value(token)[0]
                node[attname.lower()] = val
            except utils.NameValueError, detail:
                line = self.state_machine.line
                msg = self.reporter.error(
                      'Error parsing meta tag attribute "%s": %s.'
                      % (token, detail), nodes.literal_block(line, line),
                      line=self.state_machine.abs_line_number())
                return msg, blank_finish
        self.document.note_pending(pending)
        return pending, blank_finish


metaSMkwargs = {'state_classes': (MetaBody,)}
