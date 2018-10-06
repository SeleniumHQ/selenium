#!/bin/bash

#
# The main test suite for strsplit is to run the body of test cases in
# testcases.csv and compare the output to that of Java and Perl, whose
# implementations we intend to mirror exactly.  All of these outputs have been
# generated automatically by "make test".  errexit will cause this script to
# exit with failure if any of these operations fail.
#
set -o errexit

cd $(dirname $0)

set -o xtrace
diff js-strsplit.csv perl.csv > /dev/null
diff js-strsplit.csv java.csv > /dev/null
set +o xtrace

echo "Test PASSED"
