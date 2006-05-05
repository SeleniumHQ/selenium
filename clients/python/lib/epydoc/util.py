# epydoc -- Utility functions
#
# Copyright (C) 2005 Edward Loper
# Author: Edward Loper <edloper@loper.org>
# URL: <http://epydoc.sf.net>
#
# $Id: util.py 1166 2006-04-05 16:49:40Z edloper $

"""
Miscellaneous utility functions that are used by multiple modules.

@group Python source types: is_module_file, is_package_dir, is_pyname,
    py_src_filename
@group Text processing: wordwrap, decode_with_backslashreplace,
    plaintext_to_html
"""
__docformat__ = 'epytext en'

import os, os.path, re

######################################################################
## Python Source Types
######################################################################

PY_SRC_EXTENSIONS = ['.py', '.pyw']
PY_BIN_EXTENSIONS = ['.pyc', '.so', '.pyd']

def is_module_file(path):
    (dir, filename) = os.path.split(path)
    (basename, extension) = os.path.splitext(filename)
    return (os.path.isfile(path) and
            re.match('[a-zA-Z_]\w*$', basename) and
            extension in PY_SRC_EXTENSIONS+PY_BIN_EXTENSIONS)

def is_src_filename(filename):
    if not isinstance(filename, basestring): return False
    return os.path.splitext(filename)[1] in PY_SRC_EXTENSIONS
    
def is_package_dir(dirname):
    """
    Return true if the given directory is a valid package directory
    (i.e., it names a directory that contsains a valid __init__ file,
    and its name is a valid identifier).
    """
    # Make sure it's a directory.
    if not os.path.isdir(dirname):
        return False
    # Make sure it's a valid identifier.  (Special case for
    # "foo/", where os.path.split -> ("foo", "").)
    (parent, dir) = os.path.split(dirname)
    if dir == '': (parent, dir) = os.path.split(parent)
    if not re.match('\w+$', dir):
        return False
    
    for name in os.listdir(dirname):
        filename = os.path.join(dirname, name)
        if name.startswith('__init__.') and is_module_file(filename):
            return True
    else:
        return False

def is_pyname(name):
    return re.match(r"\w+(\.\w+)*$", name)

def py_src_filename(filename):
    basefile, extension = os.path.splitext(filename)
    if extension in PY_SRC_EXTENSIONS:
        return filename
    else:
        for ext in PY_SRC_EXTENSIONS:
            if os.path.isfile('%s%s' % (basefile, ext)):
                return '%s%s' % (basefile, ext)
        else:
            raise ValueError('Could not find a corresponding '
                             'Python source file.')

def munge_script_name(filename):
    name = os.path.split(filename)[1]
    name = re.sub(r'\W', '_', name)
    return 'script-'+name

######################################################################
## Text Processing
######################################################################

def decode_with_backslashreplace(s):
    r"""
    Convert the given 8-bit string into unicode, treating any
    character c such that ord(c)<128 as an ascii character, and
    converting any c such that ord(c)>128 into a backslashed escape
    sequence.

        >>> decode_with_backslashreplace('abc\xff\xe8')
        u'abc\\xff\\xe8'
    """
    # s.encode('string-escape') is not appropriate here, since it
    # also adds backslashes to some ascii chars (eg \ and ').
    assert isinstance(s, str)
    return (s
            .decode('latin1')
            .encode('ascii', 'backslashreplace')
            .decode('ascii'))

def wordwrap(str, indent=0, right=75, startindex=0, splitchars=''):
    """
    Word-wrap the given string.  I.e., add newlines to the string such
    that any lines that are longer than C{right} are broken into
    shorter lines (at the first whitespace sequence that occurs before
    index C{right}).  If the given string contains newlines, they will
    I{not} be removed.  Any lines that begin with whitespace will not
    be wordwrapped.

    @param indent: If specified, then indent each line by this number
        of spaces.
    @type indent: C{int}
    @param right: The right margin for word wrapping.  Lines that are
        longer than C{right} will be broken at the first whitespace
        sequence before the right margin.
    @type right: C{int}
    @param startindex: If specified, then assume that the first line
        is already preceeded by C{startindex} characters.
    @type startindex: C{int}
    @param splitchars: A list of non-whitespace characters which can
        be used to split a line.  (E.g., use '/\\' to allow path names
        to be split over multiple lines.)
    @rtype: C{str}
    """
    if splitchars:
        chunks = re.split(r'( +|\n|[^ \n%s]*[%s])' %
                          (re.escape(splitchars), re.escape(splitchars)),
                          str.expandtabs())
    else:
        chunks = re.split(r'( +|\n)', str.expandtabs())
    result = [' '*(indent-startindex)]
    charindex = max(indent, startindex)
    for chunknum, chunk in enumerate(chunks):
        if (charindex+len(chunk) > right and charindex > 0) or chunk == '\n':
            result.append('\n' + ' '*indent)
            charindex = indent
            if chunk[:1] not in ('\n', ' '):
                result.append(chunk)
                charindex += len(chunk)
        else:
            result.append(chunk)
            charindex += len(chunk)
    return ''.join(result).rstrip()+'\n'

def plaintext_to_html(s):
    """
    @return: An HTML string that encodes the given plaintext string.
    In particular, special characters (such as C{'<'} and C{'&'})
    are escaped.
    @rtype: C{string}
    """
    s = s.replace('&', '&amp;').replace('"', '&quot;')
    s = s.replace('<', '&lt;').replace('>', '&gt;')
    return s
        
def plaintext_to_latex(str, nbsp=0, breakany=0):
    """
    @return: A LaTeX string that encodes the given plaintext string.
    In particular, special characters (such as C{'$'} and C{'_'})
    are escaped, and tabs are expanded.
    @rtype: C{string}
    @param breakany: Insert hyphenation marks, so that LaTeX can
    break the resulting string at any point.  This is useful for
    small boxes (e.g., the type box in the variable list table).
    @param nbsp: Replace every space with a non-breaking space
    (C{'~'}).
    """
    # These get converted to hyphenation points later
    if breakany: str = re.sub('(.)', '\\1\1', str)

    # These get converted to \textbackslash later.
    str = str.replace('\\', '\0')

    # Expand tabs
    str = str.expandtabs()

    # These elements need to be backslashed.
    str = re.sub(r'([#$&%_\${}])', r'\\\1', str)

    # These elements have special names.
    str = str.replace('|', '{\\textbar}')
    str = str.replace('<', '{\\textless}')
    str = str.replace('>', '{\\textgreater}')
    str = str.replace('^', '{\\textasciicircum}')
    str = str.replace('~', '{\\textasciitilde}')
    str = str.replace('\0', r'{\textbackslash}')

    # replace spaces with non-breaking spaces
    if nbsp: str = str.replace(' ', '~')

    # Convert \1's to hyphenation points.
    if breakany: str = str.replace('\1', r'\-')
    
    return str

class RunSubprocessError(OSError):
    def __init__(self, cmd, out, err):
        OSError.__init__(self, '%s failed' % cmd[0])
        self.out = out
        self.err = err

def run_subprocess(cmd, data=None):
    """
    Execute the command C{cmd} in a subprocess.
    
    @param cmd: The command to execute, specified as a list
        of string.
    @param data: A string containing data to send to the
        subprocess.
    @return: A tuple C{(out, err)}.
    @raise OSError: If there is any problem executing the
        command, or if its exitval is not 0.
    """
    if isinstance(cmd, basestring):
        cmd = cmd.split()

    # Under Python 2.4+, use subprocess
    try:
        from subprocess import Popen, PIPE
        pipe = Popen(cmd, stdin=PIPE, stdout=PIPE, stderr=PIPE)
        out, err = pipe.communicate(data)
        if hasattr(pipe, 'returncode'):
            if pipe.returncode == 0:
                return out, err
            else:
                raise RunSubprocessError(cmd, out, err)
        else:
            # Assume that there was an error iff anything was written
            # to the child's stderr.
            if err == '':
                return out, err
            else:
                raise RunSubprocessError(cmd, out, err)
    except ImportError:
        pass

    # Under Python 2.3 or earlier, on unix, use popen2.Popen3 so we
    # can access the return value.
    import popen2
    if hasattr(popen2, 'Popen3'):
        pipe = popen2.Popen3(' '.join(cmd), True)
        to_child = pipe.tochild
        from_child = pipe.fromchild
        child_err = pipe.childerr
        if data:
            to_child.write(data)
        to_child.close()
        out = err = ''
        while pipe.poll() is None:
            out += from_child.read()
            err += child_err.read()
        out += from_child.read()
        err += child_err.read()
        if pipe.wait() == 0:
            return out, err
        else:
            raise RunSubprocessError(cmd, out, err)

    # Under Python 2.3 or earlier, on non-unix, use os.popen3
    else:
        to_child, from_child, child_err = os.popen3(' '.join(cmd), 'b')
        if data:
            to_child.write(data)
        to_child.close()
        err = child_err.read()
        out = from_child.read()
        # Assume that there was an error iff anything was written
        # to the child's stderr.
        if err == '':
            return out, err
        else:
            raise RunSubprocessError(cmd, out, err)
