#!/usr/bin/perl
use strict;
use warnings;
use lib 'lib';
use WWW::Selenium;

my ($function, @args) = @ARGV;
die 'no function' unless $function;

my $sel = WWW::Selenium->new(browser_url => 'http://www.csc.uvic.ca', browser => '*chrome', verbose => 1);
$sel->start;
$sel->open('http://www.csc.uvic.ca/~labspg/Reference/javascript/script4.9.html');
my $content = $sel->get_body_text;

$sel->select('name=order', 'a box of cereal');
$sel->add_selection('name=order', '100 lbs. blueberries');
print "$function=(", join(',', $sel->$function(@args)), ")\n";


$sel->close;
