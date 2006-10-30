#!/usr/bin/perl
use strict;
use warnings;
use lib 'lib';
use WWW::Selenium;

my ($function, @args) = @ARGV;
die 'no function' unless $function;

my $sel = WWW::Selenium->new(browser_url => 'http://www.csc.uvic.ca', browser => '*chrome');
$sel->start;
$sel->open('/~labspg/Reference/javascript/script4.4.html');
my $content = $sel->get_body_text;
die "No happy: ($content)" unless $content =~ /Happiness/;
