#!/usr/bin/perl
use strict;
use warnings;
use lib 'lib';
use Test::WWW::Selenium;
use WWW::Selenium::Util qw(server_is_running);
use Test::More;

my ($host, $port) = server_is_running();
if ($host and $port) {
    plan tests => 10;
}
else {
    plan skip_all => "No selenium server found!";
    exit 0;
}

my $sel = Test::WWW::Selenium->new(
    host        => $host,
    port        => $port,
    browser     => "*mock",
    browser_url => "http://$host:$port",
);
$sel->open("/selenium-server/tests/html/test_i18n.html");

my $romance = "\x{00FC}\x{00F6}\x{00E4}\x{00DC}\x{00D6}\x{00C4} \x{00E7}\x{00E8}\x{00E9} \x{00BF}\x{00F1} \x{00E8}\x{00E0}\x{00F9}\x{00F2}";
my $korean = "\x{C5F4}\x{C5D0}";
my $chinese = "\x{4E2D}\x{6587}";
my $japanese = "\x{307E}\x{3077}";
my $dangerous = "&%?\\+|,%*";

verify_text($romance, "romance");
verify_text($korean, "korean");
verify_text($chinese, "chinese");
verify_text($japanese, "japanese");
verify_text($dangerous, "dangerous");

# todo: looks like destory() haven't been invoked $sel.stop() on linux, which
# will left one firefox window not closed for each build running. 
# Somebody who knows perl well please check this out!!
$sel->stop();


sub verify_text {
	my $expected = shift;
	my $id = shift;
	$sel->is_text_present_ok($expected);
    $sel->text_is($id, $expected);
}
