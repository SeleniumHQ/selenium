# Author: David Goodger
# Contact: goodger@users.sourceforge.net
# Revision: $Revision: 4152 $
# Date: $Date: 2005-12-08 00:46:30 +0100 (Thu, 08 Dec 2005) $
# Copyright: This module has been placed in the public domain.

"""
Miscellaneous utilities for the documentation utilities.
"""

__docformat__ = 'reStructuredText'

import sys
import os
import os.path
import types
import warnings
import unicodedata
from types import StringType, UnicodeType
from docutils import ApplicationError, DataError
from docutils import frontend, nodes


class SystemMessage(ApplicationError):

    def __init__(self, system_message, level):
        Exception.__init__(self, system_message.astext())
        self.level = level


class SystemMessagePropagation(ApplicationError): pass


class Reporter:

    """
    Info/warning/error reporter and ``system_message`` element generator.

    Five levels of system messages are defined, along with corresponding
    methods: `debug()`, `info()`, `warning()`, `error()`, and `severe()`.

    There is typically one Reporter object per process.  A Reporter object is
    instantiated with thresholds for reporting (generating warnings) and
    halting processing (raising exceptions), a switch to turn debug output on
    or off, and an I/O stream for warnings.  These are stored as instance
    attributes.

    When a system message is generated, its level is compared to the stored
    thresholds, and a warning or error is generated as appropriate.  Debug
    messages are produced iff the stored debug switch is on, independently of
    other thresholds.  Message output is sent to the stored warning stream if
    not set to ''.

    The Reporter class also employs a modified form of the "Observer" pattern
    [GoF95]_ to track system messages generated.  The `attach_observer` method
    should be called before parsing, with a bound method or function which
    accepts system messages.  The observer can be removed with
    `detach_observer`, and another added in its place.

    .. [GoF95] Gamma, Helm, Johnson, Vlissides. *Design Patterns: Elements of
       Reusable Object-Oriented Software*. Addison-Wesley, Reading, MA, USA,
       1995.
    """

    levels = 'DEBUG INFO WARNING ERROR SEVERE'.split()
    """List of names for system message levels, indexed by level."""

    def __init__(self, source, report_level, halt_level, stream=None,
                 debug=0, encoding='ascii', error_handler='replace'):
        """
        :Parameters:
            - `source`: The path to or description of the source data.
            - `report_level`: The level at or above which warning output will
              be sent to `stream`.
            - `halt_level`: The level at or above which `SystemMessage`
              exceptions will be raised, halting execution.
            - `debug`: Show debug (level=0) system messages?
            - `stream`: Where warning output is sent.  Can be file-like (has a
              ``.write`` method), a string (file name, opened for writing),
              '' (empty string, for discarding all stream messages) or
              `None` (implies `sys.stderr`; default).
            - `encoding`: The encoding for stderr output.
            - `error_handler`: The error handler for stderr output encoding.
        """

        self.source = source
        """The path to or description of the source data."""

        self.encoding = encoding
        """The character encoding for the stderr output."""

        self.error_handler = error_handler
        """The character encoding error handler."""

        self.debug_flag = debug
        """Show debug (level=0) system messages?"""

        self.report_level = report_level
        """The level at or above which warning output will be sent
        to `self.stream`."""

        self.halt_level = halt_level
        """The level at or above which `SystemMessage` exceptions
        will be raised, halting execution."""

        if stream is None:
            stream = sys.stderr
        elif type(stream) in (StringType, UnicodeType):
            # Leave stream untouched if it's ''.
            if stream != '':
                if type(stream) == StringType:
                    stream = open(stream, 'w')
                elif type(stream) == UnicodeType:
                    stream = open(stream.encode(), 'w')

        self.stream = stream
        """Where warning output is sent."""

        self.observers = []
        """List of bound methods or functions to call with each system_message
        created."""

        self.max_level = -1
        """The highest level system message generated so far."""

    def set_conditions(self, category, report_level, halt_level,
                       stream=None, debug=0):
        warnings.warn('docutils.utils.Reporter.set_conditions deprecated; '
                      'set attributes via configuration settings or directly',
                      DeprecationWarning, stacklevel=2)
        self.report_level = report_level
        self.halt_level = halt_level
        if stream is None:
            stream = sys.stderr
        self.stream = stream
        self.debug_flag = debug

    def attach_observer(self, observer):
        """
        The `observer` parameter is a function or bound method which takes one
        argument, a `nodes.system_message` instance.
        """
        self.observers.append(observer)

    def detach_observer(self, observer):
        self.observers.remove(observer)

    def notify_observers(self, message):
        for observer in self.observers:
            observer(message)

    def system_message(self, level, message, *children, **kwargs):
        """
        Return a system_message object.

        Raise an exception or generate a warning if appropriate.
        """
        attributes = kwargs.copy()
        if kwargs.has_key('base_node'):
            source, line = get_source_line(kwargs['base_node'])
            del attributes['base_node']
            if source is not None:
                attributes.setdefault('source', source)
            if line is not None:
                attributes.setdefault('line', line)
        attributes.setdefault('source', self.source)
        msg = nodes.system_message(message, level=level,
                                   type=self.levels[level],
                                   *children, **attributes)
        if self.stream and (level >= self.report_level
                            or self.debug_flag and level == 0):
            msgtext = msg.astext().encode(self.encoding, self.error_handler)
            print >>self.stream, msgtext
        if level >= self.halt_level:
            raise SystemMessage(msg, level)
        if level > 0 or self.debug_flag:
            self.notify_observers(msg)
        self.max_level = max(level, self.max_level)
        return msg

    def debug(self, *args, **kwargs):
        """
        Level-0, "DEBUG": an internal reporting issue. Typically, there is no
        effect on the processing. Level-0 system messages are handled
        separately from the others.
        """
        if self.debug_flag:
            return self.system_message(0, *args, **kwargs)

    def info(self, *args, **kwargs):
        """
        Level-1, "INFO": a minor issue that can be ignored. Typically there is
        no effect on processing, and level-1 system messages are not reported.
        """
        return self.system_message(1, *args, **kwargs)

    def warning(self, *args, **kwargs):
        """
        Level-2, "WARNING": an issue that should be addressed. If ignored,
        there may be unpredictable problems with the output.
        """
        return self.system_message(2, *args, **kwargs)

    def error(self, *args, **kwargs):
        """
        Level-3, "ERROR": an error that should be addressed. If ignored, the
        output will contain errors.
        """
        return self.system_message(3, *args, **kwargs)

    def severe(self, *args, **kwargs):
        """
        Level-4, "SEVERE": a severe error that must be addressed. If ignored,
        the output will contain severe errors. Typically level-4 system
        messages are turned into exceptions which halt processing.
        """
        return self.system_message(4, *args, **kwargs)


class ExtensionOptionError(DataError): pass
class BadOptionError(ExtensionOptionError): pass
class BadOptionDataError(ExtensionOptionError): pass
class DuplicateOptionError(ExtensionOptionError): pass


def extract_extension_options(field_list, options_spec):
    """
    Return a dictionary mapping extension option names to converted values.

    :Parameters:
        - `field_list`: A flat field list without field arguments, where each
          field body consists of a single paragraph only.
        - `options_spec`: Dictionary mapping known option names to a
          conversion function such as `int` or `float`.

    :Exceptions:
        - `KeyError` for unknown option names.
        - `ValueError` for invalid option values (raised by the conversion
           function).
        - `TypeError` for invalid option value types (raised by conversion
           function).
        - `DuplicateOptionError` for duplicate options.
        - `BadOptionError` for invalid fields.
        - `BadOptionDataError` for invalid option data (missing name,
          missing data, bad quotes, etc.).
    """
    option_list = extract_options(field_list)
    option_dict = assemble_option_dict(option_list, options_spec)
    return option_dict

def extract_options(field_list):
    """
    Return a list of option (name, value) pairs from field names & bodies.

    :Parameter:
        `field_list`: A flat field list, where each field name is a single
        word and each field body consists of a single paragraph only.

    :Exceptions:
        - `BadOptionError` for invalid fields.
        - `BadOptionDataError` for invalid option data (missing name,
          missing data, bad quotes, etc.).
    """
    option_list = []
    for field in field_list:
        if len(field[0].astext().split()) != 1:
            raise BadOptionError(
                'extension option field name may not contain multiple words')
        name = str(field[0].astext().lower())
        body = field[1]
        if len(body) == 0:
            data = None
        elif len(body) > 1 or not isinstance(body[0], nodes.paragraph) \
              or len(body[0]) != 1 or not isinstance(body[0][0], nodes.Text):
            raise BadOptionDataError(
                  'extension option field body may contain\n'
                  'a single paragraph only (option "%s")' % name)
        else:
            data = body[0][0].astext()
        option_list.append((name, data))
    return option_list

def assemble_option_dict(option_list, options_spec):
    """
    Return a mapping of option names to values.

    :Parameters:
        - `option_list`: A list of (name, value) pairs (the output of
          `extract_options()`).
        - `options_spec`: Dictionary mapping known option names to a
          conversion function such as `int` or `float`.

    :Exceptions:
        - `KeyError` for unknown option names.
        - `DuplicateOptionError` for duplicate options.
        - `ValueError` for invalid option values (raised by conversion
           function).
        - `TypeError` for invalid option value types (raised by conversion
           function).
    """
    options = {}
    for name, value in option_list:
        convertor = options_spec[name]  # raises KeyError if unknown
        if convertor is None:
            raise KeyError(name)        # or if explicitly disabled
        if options.has_key(name):
            raise DuplicateOptionError('duplicate option "%s"' % name)
        try:
            options[name] = convertor(value)
        except (ValueError, TypeError), detail:
            raise detail.__class__('(option: "%s"; value: %r)\n%s'
                                   % (name, value, ' '.join(detail.args)))
    return options


class NameValueError(DataError): pass


def extract_name_value(line):
    """
    Return a list of (name, value) from a line of the form "name=value ...".

    :Exception:
        `NameValueError` for invalid input (missing name, missing data, bad
        quotes, etc.).
    """
    attlist = []
    while line:
        equals = line.find('=')
        if equals == -1:
            raise NameValueError('missing "="')
        attname = line[:equals].strip()
        if equals == 0 or not attname:
            raise NameValueError(
                  'missing attribute name before "="')
        line = line[equals+1:].lstrip()
        if not line:
            raise NameValueError(
                  'missing value after "%s="' % attname)
        if line[0] in '\'"':
            endquote = line.find(line[0], 1)
            if endquote == -1:
                raise NameValueError(
                      'attribute "%s" missing end quote (%s)'
                      % (attname, line[0]))
            if len(line) > endquote + 1 and line[endquote + 1].strip():
                raise NameValueError(
                      'attribute "%s" end quote (%s) not followed by '
                      'whitespace' % (attname, line[0]))
            data = line[1:endquote]
            line = line[endquote+1:].lstrip()
        else:
            space = line.find(' ')
            if space == -1:
                data = line
                line = ''
            else:
                data = line[:space]
                line = line[space+1:].lstrip()
        attlist.append((attname.lower(), data))
    return attlist

def new_reporter(source_path, settings):
    """
    Return a new Reporter object.

    :Parameters:
        `source` : string
            The path to or description of the source text of the document.
        `settings` : optparse.Values object
            Runtime settings.
    """
    reporter = Reporter(
        source_path, settings.report_level, settings.halt_level,
        stream=settings.warning_stream, debug=settings.debug,
        encoding=settings.error_encoding,
        error_handler=settings.error_encoding_error_handler)
    return reporter

def new_document(source_path, settings=None):
    """
    Return a new empty document object.

    :Parameters:
        `source` : string
            The path to or description of the source text of the document.
        `settings` : optparse.Values object
            Runtime settings.  If none provided, a default set will be used.
    """
    if settings is None:
        settings = frontend.OptionParser().get_default_values()
    reporter = new_reporter(source_path, settings)
    document = nodes.document(settings, reporter, source=source_path)
    document.note_source(source_path, -1)
    return document

def clean_rcs_keywords(paragraph, keyword_substitutions):
    if len(paragraph) == 1 and isinstance(paragraph[0], nodes.Text):
        textnode = paragraph[0]
        for pattern, substitution in keyword_substitutions:
            match = pattern.search(textnode.data)
            if match:
                textnode.data = pattern.sub(substitution, textnode.data)
                return

def relative_path(source, target):
    """
    Build and return a path to `target`, relative to `source` (both files).

    If there is no common prefix, return the absolute path to `target`.
    """
    source_parts = os.path.abspath(source or 'dummy_file').split(os.sep)
    target_parts = os.path.abspath(target).split(os.sep)
    # Check first 2 parts because '/dir'.split('/') == ['', 'dir']:
    if source_parts[:2] != target_parts[:2]:
        # Nothing in common between paths.
        # Return absolute path, using '/' for URLs:
        return '/'.join(target_parts)
    source_parts.reverse()
    target_parts.reverse()
    while (source_parts and target_parts
           and source_parts[-1] == target_parts[-1]):
        # Remove path components in common:
        source_parts.pop()
        target_parts.pop()
    target_parts.reverse()
    parts = ['..'] * (len(source_parts) - 1) + target_parts
    return '/'.join(parts)

def get_stylesheet_reference(settings, relative_to=None):
    """
    Retrieve a stylesheet reference from the settings object.
    """
    if settings.stylesheet_path:
        assert not settings.stylesheet, \
               'stylesheet and stylesheet_path are mutually exclusive.'
        if relative_to == None:
            relative_to = settings._destination
        return relative_path(relative_to, settings.stylesheet_path)
    else:
        return settings.stylesheet

def get_trim_footnote_ref_space(settings):
    """
    Return whether or not to trim footnote space.

    If trim_footnote_reference_space is not None, return it.

    If trim_footnote_reference_space is None, return False unless the
    footnote reference style is 'superscript'.
    """
    if settings.trim_footnote_reference_space is None:
        return hasattr(settings, 'footnote_references') and \
               settings.footnote_references == 'superscript'
    else:
        return settings.trim_footnote_reference_space

def get_source_line(node):
    """
    Return the "source" and "line" attributes from the `node` given or from
    its closest ancestor.
    """
    while node:
        if node.source or node.line:
            return node.source, node.line
        node = node.parent
    return None, None

def escape2null(text):
    """Return a string with escape-backslashes converted to nulls."""
    parts = []
    start = 0
    while 1:
        found = text.find('\\', start)
        if found == -1:
            parts.append(text[start:])
            return ''.join(parts)
        parts.append(text[start:found])
        parts.append('\x00' + text[found+1:found+2])
        start = found + 2               # skip character after escape

def unescape(text, restore_backslashes=0):
    """
    Return a string with nulls removed or restored to backslashes.
    Backslash-escaped spaces are also removed.
    """
    if restore_backslashes:
        return text.replace('\x00', '\\')
    else:
        for sep in ['\x00 ', '\x00\n', '\x00']:
            text = ''.join(text.split(sep))
        return text

east_asian_widths = {'W': 2,   # Wide
                     'F': 2,   # Full-width (wide)
                     'Na': 1,  # Narrow
                     'H': 1,   # Half-width (narrow)
                     'N': 1,   # Neutral (not East Asian, treated as narrow)
                     'A': 1}   # Ambiguous (s/b wide in East Asian context,
                               # narrow otherwise, but that doesn't work)
"""Mapping of result codes from `unicodedata.east_asian_width()` to character
column widths."""

def east_asian_column_width(text):
    if isinstance(text, types.UnicodeType):
        total = 0
        for c in text:
            total += east_asian_widths[unicodedata.east_asian_width(c)]
        return total
    else:
        return len(text)

if hasattr(unicodedata, 'east_asian_width'):
    column_width = east_asian_column_width
else:
    column_width = len


class DependencyList:

    """
    List of dependencies, with file recording support.

    Note that the output file is not automatically closed.  You have
    to explicitly call the close() method.
    """

    def __init__(self, output_file=None, dependencies=[]):
        """
        Initialize the dependency list, automatically setting the
        output file to `output_file` (see `set_output()`) and adding
        all supplied dependencies.
        """
        self.set_output(output_file)
        for i in dependencies:
            self.add(i)

    def set_output(self, output_file):
        """
        Set the output file and clear the list of already added
        dependencies.

        `output_file` must be a string.  The specified file is
        immediately overwritten.

        If output_file is '-', the output will be written to stdout.
        If it is None, no file output is done when calling add().
        """
        self.list = []
        if output_file == '-':
            self.file = sys.stdout
        elif output_file:
            self.file = open(output_file, 'w')
        else:
            self.file = None

    def add(self, filename):
        """
        If the dependency `filename` has not already been added,
        append it to self.list and print it to self.file if self.file
        is not None.
        """
        if not filename in self.list:
            self.list.append(filename)
            if self.file is not None:
                print >>self.file, filename

    def close(self):
        """
        Close the output file.
        """
        self.file.close()
        self.file = None

    def __repr__(self):
        if self.file:
            output_file = self.file.name
        else:
            output_file = None
        return '%s(%r, %s)' % (self.__class__.__name__, output_file, self.list)
