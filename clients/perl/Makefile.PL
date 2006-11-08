#!/usr/bin/perl -w
use warnings;
use strict;
use inc::Module::Install;

name            'Test-WWW-Selenium';
author          'Luke Closs <test-www-selenium@awesnob.com>';
build_requires  'Test::More'        => '0.42';
build_requires  'Test::Exception'   => 0;
build_requires  'Test::Pod'   => 0;
license         'perl';

# Auto-install all dependencies from CPAN
auto_install;

# Generate the Makefile
WriteAll;
