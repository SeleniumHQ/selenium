# epydoc -- Regression testing
#
# Copyright (C) 2005 Edward Loper
# Author: Edward Loper <edloper@loper.org>
# URL: <http://epydoc.sf.net>
#
# $Id: __init__.py 1112 2006-03-22 23:54:25Z dvarrazzo $

"""
Regression testing.
"""
__docformat__ = 'epytext en'

import unittest, doctest, epydoc, os, os.path

def main():
    # Options for doctest:
    options = doctest.ELLIPSIS
    doctest.set_unittest_reportflags(doctest.REPORT_UDIFF)

    # Find all test cases.
    tests = []
    testdir = os.path.join(os.path.split(__file__)[0])
    if testdir == '': testdir = '.'
    for filename in os.listdir(testdir):
        if filename.endswith('.doctest'):
            tests.append(doctest.DocFileSuite(filename, optionflags=options))
            
    # Run all test cases.
    unittest.TextTestRunner(verbosity=2).run(unittest.TestSuite(tests))

if __name__=='__main__':
    main()
