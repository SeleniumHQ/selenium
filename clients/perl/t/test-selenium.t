#!/usr/bin/perl
use strict;
use warnings;
use Test::More tests => 11;

BEGIN {
    use lib 't/lib'; # use mock libraries
    use_ok 'LWP::UserAgent';
    use_ok 'HTTP::Response';
    use lib 'lib';
    use_ok 'Test::WWW::Selenium';
}

# singleton user agent for mocking Test::WWW::Selenium
my $ua = LWP::UserAgent->new;

Good_usage: {
    # This will start up a browser right away
    $ua->{res} = HTTP::Response->new(content => 'OK,SESSION_ID');
    my $sel = Test::WWW::Selenium->new(browser_url => 'http://foo.com');
    isa_ok $sel, 'Test::WWW::Selenium';
    is $sel->{session_id}, 'SESSION_ID';

    # try a command
    $ua->{res} = HTTP::Response->new(content => 'OK,Some Title');
    $sel->title_is('Some Title');
    is $ua->{req}, 'http://localhost:4444/selenium-server/driver/?cmd=getTitle'
                   . '&sessionId=SESSION_ID';

    # finish it off
    $ua->{res} = HTTP::Response->new(content => 'OK');
    $sel = undef; 
    is $sel->{session_id}, undef;
    is $ua->{req}, 'http://localhost:4444/selenium-server/driver/'
                   . '?cmd=testComplete&sessionId=SESSION_ID';
}

Comparators: {
    ok 1;
}

no_locatior: { 
    ok 1;
}

