#!/usr/bin/perl
use strict;
use warnings;
use Test::More;
use lib 'lib';

BEGIN {
    unless ($ENV{SRC_LIVE_TESTS}) {
        plan skip_all => 'not running live interweb tests';
	exit;
    }

    plan tests => 3;
    use_ok 'Test::WWW::Selenium';
}

my $tws = Test::WWW::Selenium->new(browser_url => 'http://example.com');
isa_ok $tws, 'Test::WWW::Selenium';

$tws->open('/');
$tws->title_is('Example Web Page');
$tws->click_ok("name=RFC 2606");
$tws->wait_for_page_to_load;
$tws->text_like(qr/Reserved Top Level DNS Names/);
my $location = $tws->get_location;
is $location, 'http://www.rfc-editor.org/rfc/rfc2606.txt', 'get_location is absolute';
