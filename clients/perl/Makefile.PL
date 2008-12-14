#!/usr/bin/perl -w
use warnings;
use strict;
use inc::Module::Install;

# Need to explicitly pre-load this so it doesn't conflict with a mocked one
# created by loading Test::Mock::LWP
use LWP::UserAgent;

name            'Test-WWW-Selenium';
author          'Luke Closs <test-www-selenium@awesnob.com>';
requires       'LWP::UserAgent'  => 0;
requires       'URI::Escape'     => '1.31';
build_requires 'Test::More'      => '0.42';
build_requires 'Test::Exception' => 0;
build_requires 'Test::Mock::LWP' => 0;
build_requires 'Test::Pod'       => 0;
license 'perl';

# Auto-install all dependencies from CPAN
auto_install;

# Generate the Makefile
WriteAll;
