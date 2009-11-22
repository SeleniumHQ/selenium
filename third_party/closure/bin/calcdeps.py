#!/usr/bin/env python
#
# Copyright 2006 Google Inc. All Rights Reserved.


"""Calculates Javascript dependencies without requiring Google3.

It iterates over a number of search paths and builds a dependency tree.  With
the inputs provided, it walks the dependency tree and outputs all the files
required for compilation.\n
"""





import distutils.version
import logging
import optparse
import os
import re
import subprocess
import sys


req_regex = re.compile('goog\.require\([\'\"]([^\)]+)[\'\"]\)')
prov_regex = re.compile('goog\.provide\([\'\"]([^\)]+)[\'\"]\)')
ns_regex = re.compile('^ns:((\w+\.)*(\w+))$')
version_regex = re.compile('[\.0-9]+')


def IsValidFile(ref):
  """Returns true if the provided reference is a file and exists."""
  return os.path.isfile(ref)


def IsJsFile(ref):
  """Returns true if the provided reference is a Javascript file."""
  return ref.endswith('.js')


def IsNamespace(ref):
  """Returns true if the provided reference is a namespace."""
  return re.match(ns_regex, ref) is not None


def IsDirectory(ref):
  """Returns true if the provided reference is a directory."""
  return os.path.isdir(ref)


def ExpandDirectories(refs):
  """Expands any directory references into inputs.

  Description:
    Looks for any directories in the provided references.  Found directories
    are recursively searched for .js files, which are then added to the result
    list.

  Args:
    refs: a list of references such as files, directories, and namespaces

  Returns:
    A list of references with directories removed and replaced by any
    .js files that are found in them.
  """
  result = []
  for ref in refs:
    if IsDirectory(ref):
      # Disable 'Unused variable' for subdirs
      # pylint: disable-msg=W0612
      for (directory, subdirs, filenames) in os.walk(ref):
        for filename in filenames:
          if IsJsFile(filename):
            result.append(os.path.join(directory, filename))
    else:
      result.append(ref)
  return result


class DependencyInfo(object):
  """Represents a dependency that is used to build and walk a tree."""

  def __init__(self, filename):
    self.filename = filename
    self.provides = []
    self.requires = []

  def __str__(self):
    return '%s Provides: %s Requires: %s' % (self.filename,
                                             repr(self.provides),
                                             repr(self.requires))


def BuildDependenciesFromFiles(files):
  """Build a list of dependencies from a list of files.

  Description:
    Takes a list of files, extracts their provides and requires, and builds
    out a list of dependency objects.

  Args:
    files: a list of files to be parsed for goog.provides and goog.requires.

  Returns:
    A list of dependency objects, one for each file in the files argument.
  """
  result = []
  for filename in files:
    # Python 3 requires the file encoding to be specified
    if (sys.version_info[0] < 3):
      file_handle = open(filename, 'r')
    else:
      file_handle = open(filename, 'r', encoding='utf8')
    dep = DependencyInfo(filename)
    try:
      for line in file_handle:
        if re.match(req_regex, line):
          dep.requires.append(re.search(req_regex, line).group(1))
        if re.match(prov_regex, line):
          dep.provides.append(re.search(prov_regex, line).group(1))
    finally:
      file_handle.close()
    result.append(dep)
  return result


def BuildDependencyHashFromDependencies(deps):
  """Builds a hash for searching dependencies by the namespaces they provide.

  Description:
    Dependency objects can provide multiple namespaces.  This method enumerates
    the provides of each dependency and adds them to a hash that can be used
    to easily resolve a given dependency by a namespace it provides.

  Args:
    deps: a list of dependency objects used to build the hash.

  Raises:
    Exception: If a multiple files try to provide the same namepace.

  Returns:
    A hash table { namespace: dependency } that can be used to resolve a
    dependency by a namespace it provides.
  """
  dep_hash = {}
  for dep in deps:
    for provide in dep.provides:
      if provide in dep_hash:
        raise Exception('Duplicate provide (%s) in (%s, %s)' % (
            provide,
            dep_hash[provide].filename,
            dep.filename))
      dep_hash[provide] = dep
  return dep_hash


def CalculateDependencies(paths, inputs):
  """Calculates the dependencies for given inputs.

  Description:
    This method takes a list of paths (files, directories) and builds a
    searchable data structure based on the namespaces that each .js file
    provides.  It then parses through each input, resolving dependencies
    against this data structure.  The final output is a list of files,
    including the inputs, that represent all of the code that is needed to
    compile the given inputs.

  Args:
    paths: the references (files, directories) that are used to build the
      dependency hash.
    inputs: the inputs (files, directories, namespaces) that have dependencies
      that need to be calculated.

  Raises:
    Exception: if a provided input is invalid.

  Returns:
    A list of all files, including inputs, that are needed to compile the given
    inputs.
  """
  deps = BuildDependenciesFromFiles(paths)
  search_hash = BuildDependencyHashFromDependencies(deps)
  result_list = []
  seen_list = []
  for input_file in inputs:
    if IsNamespace(input_file):
      namespace = re.search(ns_regex, input_file).group(1)
      if namespace not in search_hash:
        raise Exception('Invalid namespace (%s)' % namespace)
      input_file = search_hash[namespace].filename
    if not IsValidFile(input_file) or not IsJsFile(input_file):
      raise Exception('Invalid file (%s)' % input_file)
    seen_list.append(input_file)
    file_handle = open(input_file, 'r')
    try:
      for line in file_handle:
        if re.match(req_regex, line):
          require = re.search(req_regex, line).group(1)
          ResolveDependencies(require, search_hash, result_list, seen_list)
    finally:
      file_handle.close()
    result_list.append(input_file)

  # All files depend on base.js, so put it first.
  base_js_path = FindClosureBasePath(paths)
  if base_js_path:
    result_list.insert(0, base_js_path)
  else:
    logging.warning('Closure Library base.js not found.')

  return result_list


def FindClosureBasePath(paths):
  """Given a list of file paths, return Closure base.js path, if any.

  Args:
    paths: A list of paths.

  Returns:
    The path to Closure's base.js file, if found.
  """

  for path in paths:
    pathname, filename = os.path.split(path)

    if filename == 'base.js':
      f = open(path)

      is_base = False

      # Sanity check that this is the Closure base file.  Check that this
      # is where goog is defined.
      for line in f:
        if line.startswith('var goog = goog || {};'):
          is_base = True
          break

      f.close()

      if is_base:
        return path

def ResolveDependencies(require, search_hash, result_list, seen_list):
  """Takes a given requirement and resolves all of the dependencies for it.

  Description:
    A given requirement may require other dependencies.  This method
    recursively resolves all dependencies for the given requirement.

  Raises:
    Exception: when require does not exist in the search_hash.

  Args:
    require: the namespace to resolve dependencies for.
    search_hash: the data structure used for resolving dependencies.
    result_list: a list of filenames that have been calculated as dependencies.
      This variable is the output for this function.
    seen_list: a list of filenames that have been 'seen'.  This is required
      for the dependency->dependant ordering.
  """
  if require not in search_hash:
    raise Exception('Missing provider for (%s)' % require)

  dep = search_hash[require]
  if not dep.filename in seen_list:
    seen_list.append(dep.filename)
    for sub_require in dep.requires:
      ResolveDependencies(sub_require, search_hash, result_list, seen_list)
    result_list.append(dep.filename)


def GetDepsLine(dep):
  """Returns a JS string for a dependency statement in the deps.js file."""
  return 'goog.addDependency(\'%s\', %s, %s);' % (
      os.path.normpath(dep.filename), dep.provides, dep.requires)


def PrintLine(msg):
  sys.stdout.write(msg)
  sys.stdout.write('\n')


def PrintDeps(source_paths):
  """Print out a deps.js file from a list of source paths."""
  PrintLine('// This file was autogenerated by calcdeps.py')
  for dep in BuildDependenciesFromFiles(source_paths):
    PrintLine(GetDepsLine(dep))


def PrintScript(source_paths):
  for index, dep in enumerate(source_paths):
    PrintLine('// Input %d' % index)
    f = open(dep, 'r')
    PrintLine(f.read())
    f.close()


def GetJavaVersion():
  """Returns the string for the current version of Java installed."""
  proc = subprocess.Popen(['java', '-version'], stderr=subprocess.PIPE)
  proc.wait()
  version_line = proc.stderr.read().splitlines()[0]
  return version_regex.search(version_line).group()


def Compile(compiler_jar_path, source_paths, flags=None):
  """Prepares command-line call to Closure compiler.

  Args:
    compiler_jar_path: Path to the Closure compiler .jar file.
    source_paths: Source paths to build, in order.
    flags: A string of additional flags to pass to Closure compiler.
  """
  args = ['java', '-jar', compiler_jar_path]
  for path in source_paths:
    args += ['--js', path]

  if flags:
    args += [flags]

  logging.info('Compiling with the following command: %s', ' '.join(args))

  # Hands execution over to Java and will never return.
  os.execvp('java', args)


def main():
  """The entrypoint for this script."""

  logging.basicConfig(format='calcdeps.py: %(message)s', level=logging.INFO)

  usage = 'usage: %prog [options] arg'
  parser = optparse.OptionParser(usage)
  parser.add_option('-i',
                    '--input',
                    dest='inputs',
                    action='append',
                    help='The inputs to calculate dependencies for. Valid '
                    'values can be files, directories, or namespaces '
                    '(ns:goog.net.XhrLite).  Only relevant to "list" and '
                    '"script" output.')
  parser.add_option('-p',
                    '--path',
                    dest='paths',
                    action='append',
                    help='The paths that should be traversed to build the '
                    'dependencies.')
  parser.add_option('-o',
                    '--output_mode',
                    dest='output_mode',
                    action='store',
                    default='list',
                    help='The type of output to generate from this script. '
                    'Options are "list" for a list of filenames, "script" '
                    'for a single script containing the contents of all the '
                    'file, "deps" to generate a deps.js file for all '
                    'paths, or "compiled" to produce compiled output with '
                    'the Closure compiler.')
  parser.add_option('-c',
                    '--compiler_jar',
                    dest='compiler_jar',
                    action='store',
                    help='The location of the Closure compiler .jar file.')
  parser.add_option('-f',
                    '--compiler_flags',
                    dest='compiler_flags',
                    action='store',
                    help='Additional flags to pass to the Closure compiler.')

  (options, args) = parser.parse_args()

  search_paths = options.paths
  if not search_paths:
    search_paths = ['.']  # Add default folder if no path is specified.

  search_paths = ExpandDirectories(search_paths)

  if options.output_mode == 'deps':
    PrintDeps(search_paths)
    return

  inputs = options.inputs
  if not inputs:  # Parse stdin
    logging.info('No inputs specified. Reading from stdin...')
    inputs = filter(None, [line.strip('\n') for line in sys.stdin.readlines()])

  logging.info('Scanning files...')
  inputs = ExpandDirectories(inputs)

  logging.info('Finding Closure dependencies...')
  deps = CalculateDependencies(search_paths, inputs)
  output_mode = options.output_mode

  if output_mode == 'script':
    PrintScript(deps)
  elif output_mode == 'list':
    # Just print out a dep per line
    for dep in deps:
      PrintLine(dep)
  elif output_mode == 'compiled':
    # Make sure a .jar is specified.
    if not options.compiler_jar:
      logging.error('--compiler_jar flag must be specified if --output is '
                    '"compiled"')
      sys.exit(-1)

    # User friendly version check.
    if not (distutils.version.LooseVersion(GetJavaVersion()) >
      distutils.version.LooseVersion('1.6')):
      logging.error('Closure Compiler requires Java 1.6 or higher.')
      logging.error('Please visit http://www.java.com/getjava')
      sys.exit(-1)

    Compile(options.compiler_jar, deps, options.compiler_flags)

  else:
    logging.error('Invalid value for --output flag.')
    sys.exit(-1)

if __name__ == '__main__':
  main()
