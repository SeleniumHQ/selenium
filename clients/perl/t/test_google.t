#!/usr/bin/perl
use strict;
use warnings;
use lib 'lib';
use Test::WWW::Selenium;
use WWW::Selenium::Util qw(server_is_running);
use Test::More;

my ($host, $port) = server_is_running();
if ($host and $port) {
    plan tests => 1;
}
else {
    plan skip_all => "No selenium server found!";
    exit 0;
}


my $sel = Test::WWW::Selenium->new(
    host        => $host,
    port        => $port,
    browser     => "*firefox",
    browser_url => "http://www.google.com/webhp",
);
$sel->open("http://www.google.com/webhp");
$sel->type("q", "hello world");
$sel->click("btnG");
$sel->wait_for_page_to_load(5000);
$sel->title_like(qr/Google Search/);


