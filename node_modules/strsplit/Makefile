#
# Copyright (c) 2012, Joyent, Inc. All rights reserved.
#
# Makefile: basic Makefile for template API service
#
# This Makefile is a template for new repos. It contains only repo-specific
# logic and uses included makefiles to supply common targets (javascriptlint,
# jsstyle, restdown, etc.), which are used by other repos as well. You may well
# need to rewrite most of this file, but you shouldn't need to touch the
# included makefiles.
#
# If you find yourself adding support for new targets that could be useful for
# other projects too, you should add these to the original versions of the
# included Makefiles (in eng.git) so that other teams can use them too.
#

#
# Tools
#
NPM		 = npm

#
# Files
#
JS_FILES	:= $(shell find lib tests -name '*.js')
JSL_CONF_NODE	 = tools/jsl.node.conf
JSL_FILES_NODE   = $(JS_FILES)
JSSTYLE_FILES	 = $(JS_FILES)

TEST_FILES       = java.csv perl.csv python.csv js-strsplit.csv
TEST_OUTPUTS     = $(TEST_FILES:%=tests/%)
CLEAN_FILES	+= $(TEST_OUTPUTS) tests/StringSplitTest.class

#
# Repo-specific targets
#
.PHONY: all
all: $(TEST_OUTPUTS)
	$(NPM) install

.PHONY: test
test: $(TEST_OUTPUTS)
	tests/tst.strsplit.sh
	tests/tst.strpatterns.js
	@echo All tests passed.

tests/java.csv: tests/testcases.csv tests/StringSplitTest.class
	java -cp tests StringSplitTest < $< > $@

tests/StringSplitTest.class: tests/StringSplitTest.java
	javac $^

tests/js-strsplit.csv: tests/testcases.csv tests/strsplit.js
	tests/strsplit.js < $< > $@

tests/perl.csv: tests/testcases.csv tests/strsplit.pl
	tests/strsplit.pl < $< > $@

tests/python.csv: tests/testcases.csv tests/strsplit.py
	tests/strsplit.py < $< > $@

DISTCLEAN_FILES += node_modules

include ./Makefile.targ
