#!/usr/bin/env python

import re
import sys

for line in sys.stdin:
  if line == '\n' or line[0] == '#':
    print "%s" % line,
    continue

  line = line.rstrip("\n");
  parts = line.split(";", 3)
  if len(parts) != 3:
    print "line garbled: %s" % line,
    continue

  #
  # The test cases are written such that the "limit" argument is passed through
  # unmodified for the Perl and Java tests.  However, Python treats "limit" as
  # the max number of splits, rather than the maximum number of fields (as these
  # other languages do), so we must subtract 1 to get the corresponding Python
  # argument.  -1 and 0 are special: they have special semantics in Perl and
  # Java, and both behave as 0 in Python.  The really problematic case is 1: in
  # Java and Perl, this means "split the string into one field", or return an
  # array with 1 element which is the entire string.  Python has no form of
  # "split" that does this; since "limit" is the number of splits, that would be
  # 0, but that value means "no limit".  We fake it by not doing the split at
  # all, since this isn't the kind of behavior difference we're looking for.
  #
  limit = int(parts[0]);
  if limit == 1:
    print "%s\n" % parts[2],
    continue

  if limit != 0 and limit != -1:
    limit -= 1;
  results = re.split(parts[1], parts[2], limit)
  print "%s\n" % ";".join(results),
