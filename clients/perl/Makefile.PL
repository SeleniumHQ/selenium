#!/usr/bin/perl -w
use warnings;
use strict;
use inc::Module::Install;

name            'Test-WWW-Selenium';
build_requires  'Test::More'        => '0.42';
build_requires  'Test::Exception'   => 0;
license         'perl';

# Auto-install all dependencies from CPAN
auto_install;

# Generate the Makefile
WriteAll;
