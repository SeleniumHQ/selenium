# epydoc -- Backwards compatibility
#
# Copyright (C) 2005 Edward Loper
# Author: Edward Loper <edloper@loper.org>
# URL: <http://epydoc.sf.net>
#
# $Id: util.py 956 2006-03-10 01:30:51Z edloper $

"""
Backwards compatibility with previous versions of Python.

This module provides backwards compatibility by defining several
functions and classes that were not available in earlier versions of
Python.  Intented usage:

    >>> from epydoc.compat import *

Currently, epydoc requires Python 2.3+.
"""
__docformat__ = 'epytext'

######################################################################
#{ New in Python 2.4
######################################################################

# set
try:
    set
except NameError:
    try:
        from sets import Set as set
    except ImportError:
        pass # use fallback, in the next section.

# sorted
try: 
    sorted
except NameError:
    def sorted(iterable, cmp=None, key=None, reverse=False):
        if key is None:
            elts = list(iterable)
        else:
            elts = [(key(v), v) for v in iterable]

        if reverse: elts.reverse() # stable sort.
        if cmp is None: elts.sort()
        else: elts.sort(cmp)
        if reverse: elts.reverse()
    
        if key is None:
            return elts
        else:
            return [v for (k,v) in elts]

# reversed
try: 
    reversed
except NameError:
    def reversed(iterable):
        elts = list(iterable)
        elts.reverse()
        return elts

######################################################################
#{ New in Python 2.3
######################################################################
# Below is my initial attempt at backporting enough code that 
# epydoc 3 would run under python 2.2.  However, I'm starting
# to think that it's not worth the trouble.  At the very least,
# epydoc's current unicode handling still doesn't work under
# 2.2 (after the backports below), since the 'xmlcharrefreplace'
# error handler was introduced in python 2.3.

# # basestring
# try:
#     basestring
# except NameError:
#     basestring = (str, unicode)

# # sum
# try:
#     sum
# except NameError:
#     def _add(a,b): return a+b
#     def sum(vals): return reduce(_add, vals, 0)

# # True & False
# try:
#     True
# except NameError:
#     True = 1
#     False = 0

# # enumerate
# try:
#     enumerate
# except NameError:
#     def enumerate(iterable):
#         lst = list(iterable)
#         return zip(range(len(lst)), lst)

# # set
# try:
#     set
# except NameError:
#     class set(dict):
#         def __init__(self, elts=()):
#             dict.__init__(self, [(e,1) for e in elts])
#         def __repr__(self):
#             return 'set(%r)' % list(self)
#         def add(self, key): self[key] = 1
#         def copy(self):
#             return set(dict.copy(self))
#         def difference(self, other):
#             return set([v for v in self if v not in other])
#         def difference_udpate(self, other):
#             newval = self.difference(other)
#             self.clear(); self.update(newval)
#         def discard(self, elt):
#             try: del self[elt]
#             except: pass
#         def intersection(self, other):
#             return self.copy().update(other)
#         def intersection_update(self, other):
#             newval = self.intersection(other)
#             self.clear(); self.update(newval)
#         def issubset(self, other):
#             for elt in self:
#                 if elt not in other: return False
#             return True
#         def issuperset(self, other):
#             for elt in other:
#                 if elt not in self: return False
#             return True
#         def pop(self): self.popitem()[0]
#         def remove(self, elt): del self[elt]
#         def symmetric_difference(self, other):
#             return set([v for v in list(self)+list(other)
#                         if (v in self)^(v in other)])
#         def symmatric_difference_update(self, other):
#             newval = self.symmetric_difference(other)
#             self.clear(); self.update(newval)
#         def union(self, other):
#             return set([v for v in list(self)+list(other)
#                         if (v in self) or (v in other)])
#         def union_update(self, other):
#             newval = self.union(other)
#             self.clear(); self.update(newval)
#         def update(self, other):
#             dict.update(self, set(other))

# # optparse module
# try:
#     import optparse
# except ImportError:
#     import new, sys, getopt
#     class _OptionVals:
#         def __init__(self, vals): self.__dict__.update(vals)
#     class OptionParser:
#         def __init__(self, usage=None, version=None):
#             self.usage = usage
#             self.version = version
#             self.shortops = ['h']
#             self.longops = []
#             self.option_specs = {}
#             self.defaults = {}
#         def fail(self, message, exitval=1):
#             print >>sys.stderr, message
#             system.exit(exitval)
#         def add_option_group(self, group): pass
#         def set_defaults(self, **defaults):
#             self.defaults = defaults.copy()
#         def parse_args(self):
#             try:
#                 (opts, names) = getopt.getopt(sys.argv[1:],
#                                               ''.join(self.shortops),
#                                               self.longops)
#             except getopt.GetoptError, e:
#                 self.fail(e)

#             options = self.defaults.copy()
#             for (opt,val) in opts:
#                 if opt == '-h':
#                     self.fail('No help available')
#                 if opt not in self.option_specs:
#                     self.fail('Unknown option %s' % opt)
#                 (action, dest, const) = self.option_specs[opt]
#                 if action == 'store':
#                     options[dest] = val
#                 elif action == 'store_const':
#                     options[dest] = const
#                 elif action == 'count':
#                     options[dest] = options.get(dest,0)+1
#                 elif action == 'append':
#                     options.setdefault(dest, []).append(val)
#                 else:
#                     self.fail('unsupported action: %s' % action)
#             for (action,dest,const) in self.option_specs.values():
#                 if dest not in options:
#                     if action == 'count': options[dest] = 0
#                     elif action == 'append': options[dest] = []
#                     else: options[dest] = None
#             for name in names:
#                 if name.startswith('-'):
#                     self.fail('names must follow options')
#             return _OptionVals(options), names
#     class OptionGroup:
#         def __init__(self, optparser, name):
#             self.optparser = optparser
#             self.name = name

#         def add_option(self, *args, **kwargs):
#             action = 'store'
#             dest = None
#             const = None
#             for (key,val) in kwargs.items():
#                 if key == 'action': action = val
#                 elif key == 'dest': dest = val
#                 elif key == 'const': const = val
#                 elif key in ('help', 'metavar'): pass
#                 else: self.fail('unsupported: %s' % key)

#             if action not in ('store_const', 'store_true', 'store_false',
#                               'store', 'count', 'append'):
#                 self.fail('unsupported action: %s' % action)

#             optparser = self.optparser
#             for arg in args:
#                 if arg.startswith('--'):
#                     optparser.longops.append(arg[2:])
#                 elif arg.startswith('-') and len(arg)==2:
#                     optparser.shortops += arg[1]
#                     if action in ('store', 'append'):
#                         optparser.shortops += ':'
#                 else:
#                     self.fail('bad option name %s' % arg)
#                 if action == 'store_true':
#                     (action, const) = ('store_const', True)
#                 if action == 'store_false':
#                     (action, const) = ('store_const', False)
#                 optparser.option_specs[arg] = (action, dest, const)

#     # Install a fake module.
#     optparse = new.module('optparse')
#     optparse.OptionParser = OptionParser
#     optparse.OptionGroup = OptionGroup
#     sys.modules['optparse'] = optparse
#     # Clean up
#     del OptionParser, OptionGroup

