# Author: David Goodger
# Contact: goodger@users.sourceforge.net
# Revision: $Revision: 4506 $
# Date: $Date: 2006-04-12 03:12:31 +0200 (Wed, 12 Apr 2006) $
# Copyright: This module has been placed in the public domain.

"""
I/O classes provide a uniform API for low-level input and output.  Subclasses
will exist for a variety of input/output mechanisms.
"""

__docformat__ = 'reStructuredText'

import sys
try:
    import locale
except:
    pass
import re
from types import UnicodeType
from docutils import TransformSpec


class Input(TransformSpec):

    """
    Abstract base class for input wrappers.
    """

    component_type = 'input'

    default_source_path = None

    def __init__(self, source=None, source_path=None, encoding=None,
                 error_handler='strict'):
        self.encoding = encoding
        """Text encoding for the input source."""

        self.error_handler = error_handler
        """Text decoding error handler."""

        self.source = source
        """The source of input data."""

        self.source_path = source_path
        """A text reference to the source."""

        if not source_path:
            self.source_path = self.default_source_path

        self.successful_encoding = None
        """The encoding that successfully decoded the source data."""

    def __repr__(self):
        return '%s: source=%r, source_path=%r' % (self.__class__, self.source,
                                                  self.source_path)

    def read(self):
        raise NotImplementedError

    def decode(self, data):
        """
        Decode a string, `data`, heuristically.
        Raise UnicodeError if unsuccessful.

        The client application should call ``locale.setlocale`` at the
        beginning of processing::

            locale.setlocale(locale.LC_ALL, '')
        """
        if self.encoding and self.encoding.lower() == 'unicode':
            assert isinstance(data, UnicodeType), (
                'input encoding is "unicode" '
                'but input is not a unicode object')
        if isinstance(data, UnicodeType):
            # Accept unicode even if self.encoding != 'unicode'.
            return data
        if self.encoding:
            # We believe the user/application when the encoding is
            # explicitly given.
            encodings = [self.encoding]
        else:
            data_encoding = self.determine_encoding_from_data(data)
            if data_encoding:
                # If the data declares its encoding (explicitly or via a BOM),
                # we believe it.
                encodings = [data_encoding]
            else:
                # Apply heuristics only if no encoding is explicitly given and
                # no BOM found.  Start with UTF-8, because that only matches
                # data that *IS* UTF-8:
                encodings = ['utf-8']
                try:
                    encodings.append(locale.nl_langinfo(locale.CODESET))
                except:
                    pass
                try:
                    encodings.append(locale.getlocale()[1])
                except:
                    pass
                try:
                    encodings.append(locale.getdefaultlocale()[1])
                except:
                    pass
                # fallback encoding:
                encodings.append('latin-1')
        error = None
        error_details = ''
        for enc in encodings:
            if not enc:
                continue
            try:
                decoded = unicode(data, enc, self.error_handler)
                self.successful_encoding = enc
                # Return decoded, removing BOMs.
                return decoded.replace(u'\ufeff', u'')
            except (UnicodeError, LookupError), error:
                pass
        if error is not None:
            error_details = '\n(%s: %s)' % (error.__class__.__name__, error)
        raise UnicodeError(
            'Unable to decode input data.  Tried the following encodings: '
            '%s.%s'
            % (', '.join([repr(enc) for enc in encodings if enc]),
               error_details))

    coding_slug = re.compile("coding[:=]\s*([-\w.]+)")
    """Encoding declaration pattern."""

    byte_order_marks = (('\xef\xbb\xbf', 'utf-8'),
                        ('\xfe\xff', 'utf-16-be'),
                        ('\xff\xfe', 'utf-16-le'),)
    """Sequence of (start_bytes, encoding) tuples to for encoding detection.
    The first bytes of input data are checked against the start_bytes strings.
    A match indicates the given encoding."""

    def determine_encoding_from_data(self, data):
        """
        Try to determine the encoding of `data` by looking *in* `data`.
        Check for a byte order mark (BOM) or an encoding declaration.
        """
        # check for a byte order mark:
        for start_bytes, encoding in self.byte_order_marks:
            if data.startswith(start_bytes):
                return encoding
        # check for an encoding declaration pattern in first 2 lines of file:
        for line in data.splitlines()[:2]:
            match = self.coding_slug.search(line)
            if match:
                return match.group(1)
        return None


class Output(TransformSpec):

    """
    Abstract base class for output wrappers.
    """

    component_type = 'output'

    default_destination_path = None

    def __init__(self, destination=None, destination_path=None,
                 encoding=None, error_handler='strict'):
        self.encoding = encoding
        """Text encoding for the output destination."""

        self.error_handler = error_handler or 'strict'
        """Text encoding error handler."""

        self.destination = destination
        """The destination for output data."""

        self.destination_path = destination_path
        """A text reference to the destination."""

        if not destination_path:
            self.destination_path = self.default_destination_path

    def __repr__(self):
        return ('%s: destination=%r, destination_path=%r'
                % (self.__class__, self.destination, self.destination_path))

    def write(self, data):
        """`data` is a Unicode string, to be encoded by `self.encode`."""
        raise NotImplementedError

    def encode(self, data):
        if self.encoding and self.encoding.lower() == 'unicode':
            assert isinstance(data, UnicodeType), (
                'the encoding given is "unicode" but the output is not '
                'a Unicode string')
            return data
        if not isinstance(data, UnicodeType):
            # Non-unicode (e.g. binary) output.
            return data
        else:
            try:
                return data.encode(self.encoding, self.error_handler)
            except ValueError:
                # ValueError is raised if there are unencodable chars
                # in data and the error_handler isn't found.
                if self.error_handler == 'xmlcharrefreplace':
                    # We are using xmlcharrefreplace with a Python
                    # version that doesn't support it (2.1 or 2.2), so
                    # we emulate its behavior.
                    return ''.join([self.xmlcharref_encode(char)
                                    for char in data])
                else:
                    raise

    def xmlcharref_encode(self, char):
        """Emulate Python 2.3's 'xmlcharrefreplace' encoding error handler."""
        try:
            return char.encode(self.encoding, 'strict')
        except UnicodeError:
            return '&#%i;' % ord(char)


class FileInput(Input):

    """
    Input for single, simple file-like objects.
    """

    def __init__(self, source=None, source_path=None,
                 encoding=None, error_handler='strict',
                 autoclose=1, handle_io_errors=1):
        """
        :Parameters:
            - `source`: either a file-like object (which is read directly), or
              `None` (which implies `sys.stdin` if no `source_path` given).
            - `source_path`: a path to a file, which is opened and then read.
            - `encoding`: the expected text encoding of the input file.
            - `error_handler`: the encoding error handler to use.
            - `autoclose`: close automatically after read (boolean); always
              false if `sys.stdin` is the source.
            - `handle_io_errors`: summarize I/O errors here, and exit?
        """
        Input.__init__(self, source, source_path, encoding, error_handler)
        self.autoclose = autoclose
        self.handle_io_errors = handle_io_errors
        if source is None:
            if source_path:
                try:
                    self.source = open(source_path)
                except IOError, error:
                    if not handle_io_errors:
                        raise
                    print >>sys.stderr, '%s: %s' % (error.__class__.__name__,
                                                    error)
                    print >>sys.stderr, (
                        'Unable to open source file for reading (%r).  Exiting.'
                        % source_path)
                    sys.exit(1)
            else:
                self.source = sys.stdin
                self.autoclose = None
        if not source_path:
            try:
                self.source_path = self.source.name
            except AttributeError:
                pass

    def read(self):
        """
        Read and decode a single file and return the data (Unicode string).
        """
        try:
            data = self.source.read()
        finally:
            if self.autoclose:
                self.close()
        return self.decode(data)

    def close(self):
        self.source.close()


class FileOutput(Output):

    """
    Output for single, simple file-like objects.
    """

    def __init__(self, destination=None, destination_path=None,
                 encoding=None, error_handler='strict', autoclose=1,
                 handle_io_errors=1):
        """
        :Parameters:
            - `destination`: either a file-like object (which is written
              directly) or `None` (which implies `sys.stdout` if no
              `destination_path` given).
            - `destination_path`: a path to a file, which is opened and then
              written.
            - `autoclose`: close automatically after write (boolean); always
              false if `sys.stdout` is the destination.
        """
        Output.__init__(self, destination, destination_path,
                        encoding, error_handler)
        self.opened = 1
        self.autoclose = autoclose
        self.handle_io_errors = handle_io_errors
        if destination is None:
            if destination_path:
                self.opened = None
            else:
                self.destination = sys.stdout
                self.autoclose = None
        if not destination_path:
            try:
                self.destination_path = self.destination.name
            except AttributeError:
                pass

    def open(self):
        try:
            self.destination = open(self.destination_path, 'w')
        except IOError, error:
            if not self.handle_io_errors:
                raise
            print >>sys.stderr, '%s: %s' % (error.__class__.__name__,
                                            error)
            print >>sys.stderr, ('Unable to open destination file for writing '
                                 '(%r).  Exiting.' % self.destination_path)
            sys.exit(1)
        self.opened = 1

    def write(self, data):
        """Encode `data`, write it to a single file, and return it."""
        output = self.encode(data)
        if not self.opened:
            self.open()
        try:
            self.destination.write(output)
        finally:
            if self.autoclose:
                self.close()
        return output

    def close(self):
        self.destination.close()
        self.opened = None


class StringInput(Input):

    """
    Direct string input.
    """

    default_source_path = '<string>'

    def read(self):
        """Decode and return the source string."""
        return self.decode(self.source)


class StringOutput(Output):

    """
    Direct string output.
    """

    default_destination_path = '<string>'

    def write(self, data):
        """Encode `data`, store it in `self.destination`, and return it."""
        self.destination = self.encode(data)
        return self.destination


class NullInput(Input):

    """
    Degenerate input: read nothing.
    """

    default_source_path = 'null input'

    def read(self):
        """Return a null string."""
        return u''


class NullOutput(Output):

    """
    Degenerate output: write nothing.
    """

    default_destination_path = 'null output'

    def write(self, data):
        """Do nothing ([don't even] send data to the bit bucket)."""
        pass


class DocTreeInput(Input):

    """
    Adapter for document tree input.

    The document tree must be passed in the ``source`` parameter.
    """

    default_source_path = 'doctree input'

    def read(self):
        """Return the document tree."""
        return self.source
