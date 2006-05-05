# Authors: David Goodger, David Priest
# Contact: goodger@python.org
# Revision: $Revision: 3900 $
# Date: $Date: 2005-09-24 17:11:20 +0200 (Sat, 24 Sep 2005) $
# Copyright: This module has been placed in the public domain.

"""
Directives for table elements.
"""

__docformat__ = 'reStructuredText'


import sys
import os.path
from docutils import io, nodes, statemachine, utils
from docutils.utils import SystemMessagePropagation
from docutils.parsers.rst import directives

try:
    import csv                          # new in Python 2.3
except ImportError:
    csv = None

try:
    import urllib2
except ImportError:
    urllib2 = None

try:
    True
except NameError:                       # Python 2.2 & 2.1 compatibility
    True = not 0
    False = not 1


def table(name, arguments, options, content, lineno,
          content_offset, block_text, state, state_machine):
    if not content:
        warning = state_machine.reporter.warning(
            'Content block expected for the "%s" directive; none found.'
            % name, nodes.literal_block(block_text, block_text),
            line=lineno)
        return [warning]
    title, messages = make_title(arguments, state, lineno)
    node = nodes.Element()          # anonymous container for parsing
    state.nested_parse(content, content_offset, node)
    if len(node) != 1 or not isinstance(node[0], nodes.table):
        error = state_machine.reporter.error(
            'Error parsing content block for the "%s" directive: '
            'exactly one table expected.'
            % name, nodes.literal_block(block_text, block_text),
            line=lineno)
        return [error]
    table_node = node[0]
    table_node['classes'] += options.get('class', [])
    if title:
        table_node.insert(0, title)
    return [table_node] + messages

table.arguments = (0, 1, 1)
table.options = {'class': directives.class_option}
table.content = 1

def make_title(arguments, state, lineno):
    if arguments:
        title_text = arguments[0]
        text_nodes, messages = state.inline_text(title_text, lineno)
        title = nodes.title(title_text, '', *text_nodes)
    else:
        title = None
        messages = []
    return title, messages


if csv:
    class DocutilsDialect(csv.Dialect):

        """CSV dialect for `csv_table` directive function."""

        delimiter = ','
        quotechar = '"'
        doublequote = True
        skipinitialspace = True
        lineterminator = '\n'
        quoting = csv.QUOTE_MINIMAL

        def __init__(self, options):
            if options.has_key('delim'):
                self.delimiter = str(options['delim'])
            if options.has_key('keepspace'):
                self.skipinitialspace = False
            if options.has_key('quote'):
                self.quotechar = str(options['quote'])
            if options.has_key('escape'):
                self.doublequote = False
                self.escapechar = str(options['escape'])
            csv.Dialect.__init__(self)


    class HeaderDialect(csv.Dialect):

        """CSV dialect to use for the "header" option data."""

        delimiter = ','
        quotechar = '"'
        escapechar = '\\'
        doublequote = False
        skipinitialspace = True
        lineterminator = '\n'
        quoting = csv.QUOTE_MINIMAL


def csv_table(name, arguments, options, content, lineno,
             content_offset, block_text, state, state_machine):
    try:
        if ( not state.document.settings.file_insertion_enabled
             and (options.has_key('file') or options.has_key('url')) ):
            warning = state_machine.reporter.warning(
                'File and URL access deactivated; ignoring "%s" directive.' %
                name, nodes.literal_block(block_text,block_text), line=lineno)
            return [warning]
        check_requirements(name, lineno, block_text, state_machine)
        title, messages = make_title(arguments, state, lineno)
        csv_data, source = get_csv_data(
            name, options, content, lineno, block_text, state, state_machine)
        table_head, max_header_cols = process_header_option(
            options, state_machine, lineno)
        rows, max_cols = parse_csv_data_into_rows(
            csv_data, DocutilsDialect(options), source, options)
        max_cols = max(max_cols, max_header_cols)
        header_rows = options.get('header-rows', 0) # default 0
        stub_columns = options.get('stub-columns', 0) # default 0
        check_table_dimensions(
            rows, header_rows, stub_columns, name, lineno,
            block_text, state_machine)
        table_head.extend(rows[:header_rows])
        table_body = rows[header_rows:]
        col_widths = get_column_widths(
            max_cols, name, options, lineno, block_text, state_machine)
        extend_short_rows_with_empty_cells(max_cols, (table_head, table_body))
    except SystemMessagePropagation, detail:
        return [detail.args[0]]
    except csv.Error, detail:
        error = state_machine.reporter.error(
            'Error with CSV data in "%s" directive:\n%s' % (name, detail),
            nodes.literal_block(block_text, block_text), line=lineno)
        return [error]
    table = (col_widths, table_head, table_body)
    table_node = state.build_table(table, content_offset, stub_columns)
    table_node['classes'] += options.get('class', [])
    if title:
        table_node.insert(0, title)
    return [table_node] + messages

csv_table.arguments = (0, 1, 1)
csv_table.options = {'header-rows': directives.nonnegative_int,
                     'stub-columns': directives.nonnegative_int,
                     'header': directives.unchanged,
                     'widths': directives.positive_int_list,
                     'file': directives.path,
                     'url': directives.uri,
                     'encoding': directives.encoding,
                     'class': directives.class_option,
                     # field delimiter char
                     'delim': directives.single_char_or_whitespace_or_unicode,
                     # treat whitespace after delimiter as significant
                     'keepspace': directives.flag,
                     # text field quote/unquote char:
                     'quote': directives.single_char_or_unicode,
                     # char used to escape delim & quote as-needed:
                     'escape': directives.single_char_or_unicode,}
csv_table.content = 1

def check_requirements(name, lineno, block_text, state_machine):
    if not csv:
        error = state_machine.reporter.error(
            'The "%s" directive is not compatible with this version of '
            'Python (%s).  Requires the "csv" module, new in Python 2.3.'
            % (name, sys.version.split()[0]),
            nodes.literal_block(block_text, block_text), line=lineno)
        raise SystemMessagePropagation(error)

def get_csv_data(name, options, content, lineno, block_text,
                 state, state_machine):
    """
    CSV data can come from the directive content, from an external file, or
    from a URL reference.
    """
    encoding = options.get('encoding', state.document.settings.input_encoding)
    if content:                         # CSV data is from directive content
        if options.has_key('file') or options.has_key('url'):
            error = state_machine.reporter.error(
                  '"%s" directive may not both specify an external file and '
                  'have content.' % name,
                  nodes.literal_block(block_text, block_text), line=lineno)
            raise SystemMessagePropagation(error)
        source = content.source(0)
        csv_data = content
    elif options.has_key('file'):       # CSV data is from an external file
        if options.has_key('url'):
            error = state_machine.reporter.error(
                  'The "file" and "url" options may not be simultaneously '
                  'specified for the "%s" directive.' % name,
                  nodes.literal_block(block_text, block_text), line=lineno)
            raise SystemMessagePropagation(error)
        source_dir = os.path.dirname(
            os.path.abspath(state.document.current_source))
        source = os.path.normpath(os.path.join(source_dir, options['file']))
        source = utils.relative_path(None, source)
        try:
            state.document.settings.record_dependencies.add(source)
            csv_file = io.FileInput(
                source_path=source, encoding=encoding,
                error_handler
                    =state.document.settings.input_encoding_error_handler,
                handle_io_errors=None)
            csv_data = csv_file.read().splitlines()
        except IOError, error:
            severe = state_machine.reporter.severe(
                  'Problems with "%s" directive path:\n%s.' % (name, error),
                  nodes.literal_block(block_text, block_text), line=lineno)
            raise SystemMessagePropagation(severe)
    elif options.has_key('url'):        # CSV data is from a URL
        if not urllib2:
            severe = state_machine.reporter.severe(
                  'Problems with the "%s" directive and its "url" option: '
                  'unable to access the required functionality (from the '
                  '"urllib2" module).' % name,
                  nodes.literal_block(block_text, block_text), line=lineno)
            raise SystemMessagePropagation(severe)
        source = options['url']
        try:
            csv_text = urllib2.urlopen(source).read()
        except (urllib2.URLError, IOError, OSError, ValueError), error:
            severe = state_machine.reporter.severe(
                  'Problems with "%s" directive URL "%s":\n%s.'
                  % (name, options['url'], error),
                  nodes.literal_block(block_text, block_text), line=lineno)
            raise SystemMessagePropagation(severe)
        csv_file = io.StringInput(
            source=csv_text, source_path=source, encoding=encoding,
            error_handler=state.document.settings.input_encoding_error_handler)
        csv_data = csv_file.read().splitlines()
    else:
        error = state_machine.reporter.warning(
            'The "%s" directive requires content; none supplied.' % (name),
            nodes.literal_block(block_text, block_text), line=lineno)
        raise SystemMessagePropagation(error)
    return csv_data, source

def process_header_option(options, state_machine, lineno):
    source = state_machine.get_source(lineno - 1)
    table_head = []
    max_header_cols = 0
    if options.has_key('header'):       # separate table header in option
        rows, max_header_cols = parse_csv_data_into_rows(
            options['header'].split('\n'), HeaderDialect(), source, options)
        table_head.extend(rows)
    return table_head, max_header_cols

def parse_csv_data_into_rows(csv_data, dialect, source, options):
    # csv.py doesn't do Unicode; encode temporarily as UTF-8
    csv_reader = csv.reader([line.encode('utf-8') for line in csv_data],
                            dialect=dialect)
    rows = []
    max_cols = 0
    for row in csv_reader:
        row_data = []
        for cell in row:
            # decode UTF-8 back to Unicode
            cell_text = unicode(cell, 'utf-8')
            cell_data = (0, 0, 0, statemachine.StringList(
                cell_text.splitlines(), source=source))
            row_data.append(cell_data)
        rows.append(row_data)
        max_cols = max(max_cols, len(row))
    return rows, max_cols

def check_table_dimensions(rows, header_rows, stub_columns, name, lineno,
                           block_text, state_machine):
    if len(rows) < header_rows:
        error = state_machine.reporter.error(
            '%s header row(s) specified but only %s row(s) of data supplied '
            '("%s" directive).' % (header_rows, len(rows), name),
            nodes.literal_block(block_text, block_text), line=lineno)
        raise SystemMessagePropagation(error)
    if len(rows) == header_rows > 0:
        error = state_machine.reporter.error(
            'Insufficient data supplied (%s row(s)); no data remaining for '
            'table body, required by "%s" directive.' % (len(rows), name),
            nodes.literal_block(block_text, block_text), line=lineno)
        raise SystemMessagePropagation(error)
    for row in rows:
        if len(row) < stub_columns:
            error = state_machine.reporter.error(
                '%s stub column(s) specified but only %s columns(s) of data '
                'supplied ("%s" directive).' % (stub_columns, len(row), name),
                nodes.literal_block(block_text, block_text), line=lineno)
            raise SystemMessagePropagation(error)
        if len(row) == stub_columns > 0:
            error = state_machine.reporter.error(
                'Insufficient data supplied (%s columns(s)); no data remaining '
                'for table body, required by "%s" directive.'
                % (len(row), name),
                nodes.literal_block(block_text, block_text), line=lineno)
            raise SystemMessagePropagation(error)

def get_column_widths(max_cols, name, options, lineno, block_text,
                      state_machine):
    if options.has_key('widths'):
        col_widths = options['widths']
        if len(col_widths) != max_cols:
            error = state_machine.reporter.error(
              '"%s" widths do not match the number of columns in table (%s).'
              % (name, max_cols),
              nodes.literal_block(block_text, block_text), line=lineno)
            raise SystemMessagePropagation(error)
    elif max_cols:
        col_widths = [100 / max_cols] * max_cols
    else:
        error = state_machine.reporter.error(
            'No table data detected in CSV file.',
            nodes.literal_block(block_text, block_text), line=lineno)
        raise SystemMessagePropagation(error)
    return col_widths

def extend_short_rows_with_empty_cells(columns, parts):
    for part in parts:
        for row in part:
            if len(row) < columns:
                row.extend([(0, 0, 0, [])] * (columns - len(row)))

def list_table(name, arguments, options, content, lineno,
               content_offset, block_text, state, state_machine):
    """
    Implement tables whose data is encoded as a uniform two-level bullet list.
    For further ideas, see
    http://docutils.sf.net/docs/dev/rst/alternatives.html#list-driven-tables
    """ 
    if not content:
        error = state_machine.reporter.error(
            'The "%s" directive is empty; content required.' % name,
            nodes.literal_block(block_text, block_text), line=lineno)
        return [error]
    title, messages = make_title(arguments, state, lineno)
    node = nodes.Element()          # anonymous container for parsing
    state.nested_parse(content, content_offset, node)
    try:
        num_cols, col_widths = check_list_content(
            node, name, options, content, lineno, block_text, state_machine)
        table_data = [[item.children for item in row_list[0]]
                      for row_list in node[0]]
        header_rows = options.get('header-rows', 0) # default 0
        stub_columns = options.get('stub-columns', 0) # default 0
        check_table_dimensions(
            table_data, header_rows, stub_columns, name, lineno,
            block_text, state_machine)
    except SystemMessagePropagation, detail:
        return [detail.args[0]]
    table_node = build_table_from_list(table_data, col_widths,
                                       header_rows, stub_columns)
    table_node['classes'] += options.get('class', [])
    if title:
        table_node.insert(0, title)
    return [table_node] + messages

list_table.arguments = (0, 1, 1)
list_table.options = {'header-rows': directives.nonnegative_int,
                      'stub-columns': directives.nonnegative_int,
                      'widths': directives.positive_int_list,
                      'class': directives.class_option}
list_table.content = 1

def check_list_content(node, name, options, content, lineno, block_text,
                       state_machine):
    if len(node) != 1 or not isinstance(node[0], nodes.bullet_list):
        error = state_machine.reporter.error(
            'Error parsing content block for the "%s" directive: '
            'exactly one bullet list expected.' % name,
            nodes.literal_block(block_text, block_text), line=lineno)
        raise SystemMessagePropagation(error)
    list_node = node[0]
    # Check for a uniform two-level bullet list:
    for item_index in range(len(list_node)):
        item = list_node[item_index]
        if len(item) != 1 or not isinstance(item[0], nodes.bullet_list):
            error = state_machine.reporter.error(
                'Error parsing content block for the "%s" directive: '
                'two-level bullet list expected, but row %s does not contain '
                'a second-level bullet list.' % (name, item_index + 1),
                nodes.literal_block(block_text, block_text), line=lineno)
            raise SystemMessagePropagation(error)
        elif item_index:
            # ATTN pychecker users: num_cols is guaranteed to be set in the
            # "else" clause below for item_index==0, before this branch is
            # triggered.
            if len(item[0]) != num_cols:
                error = state_machine.reporter.error(
                    'Error parsing content block for the "%s" directive: '
                    'uniform two-level bullet list expected, but row %s does '
                    'not contain the same number of items as row 1 (%s vs %s).'
                    % (name, item_index + 1, len(item[0]), num_cols),
                    nodes.literal_block(block_text, block_text), line=lineno)
                raise SystemMessagePropagation(error)
        else:
            num_cols = len(item[0])
    col_widths = get_column_widths(
        num_cols, name, options, lineno, block_text, state_machine)
    if len(col_widths) != num_cols:
        error = state_machine.reporter.error(
            'Error parsing "widths" option of the "%s" directive: '
            'number of columns does not match the table data (%s vs %s).'
            % (name, len(col_widths), num_cols),
            nodes.literal_block(block_text, block_text), line=lineno)
        raise SystemMessagePropagation(error)
    return num_cols, col_widths

def build_table_from_list(table_data, col_widths, header_rows, stub_columns):
    table = nodes.table()
    tgroup = nodes.tgroup(cols=len(col_widths))
    table += tgroup
    for col_width in col_widths:
        colspec = nodes.colspec(colwidth=col_width)
        if stub_columns:
            colspec.attributes['stub'] = 1
            stub_columns -= 1
        tgroup += colspec
    rows = []
    for row in table_data:
        row_node = nodes.row()
        for cell in row:
            entry = nodes.entry()
            entry += cell
            row_node += entry
        rows.append(row_node)
    if header_rows:
        thead = nodes.thead()
        thead.extend(rows[:header_rows])
        tgroup += thead
    tbody = nodes.tbody()
    tbody.extend(rows[header_rows:])
    tgroup += tbody
    return table
