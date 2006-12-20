#!/usr/bin/perl
use strict;
use warnings;
use Test::More tests => 14;
use Test::Exception;

# Tests for enhancements to help users find their problems faster

BEGIN {
    use lib 't/lib';
    use_ok 'LWP::UserAgent';    # mocked
    use_ok 'HTTP::Response';    # mocked
    use lib 'lib';
    use_ok 't::WWW::Selenium';  # subclass for testing
}

Forgot_to_open: {
    my $sel = t::WWW::Selenium->new;
    my $error_msg = q{You must open a page before calling getTitle. eg: $sel->open('/');};
    throws_ok { $sel->get_title } qr/\Q$error_msg\E/;
}

Open_default: {
    my $sel = t::WWW::Selenium->new;
    lives_ok { $sel->open };
    like $sel->{__ua}{req}, qr/\Q1=%2F\E/, 'open specified /';
}

Double_start: {
    my $sel = t::WWW::Selenium->new; # calls start() automatically
    delete $sel->{__ua}{req};
    $sel->start;
    is $sel->{__ua}{req}, undef, 'no duplicate session';
}

Auto_stop: {
    my $sel = t::WWW::Selenium->new;
    $sel->open('/');
    $sel->_set_mock_response_content('http://example.com');
    $sel->get_location;
    my $ua = $sel->{__ua};
    $sel = undef;
    like $ua->{req}, qr/cmd=testComplete/, 'auto-stop';
}

Auto_stop_off: {
    my $sel = t::WWW::Selenium->new(auto_stop => 0);
    $sel->open('/');
    $sel->_set_mock_response_content('http://example.com');
    $sel->get_location;
    my $ua = $sel->{__ua};
    $sel = undef;
    unlike $ua->{req}, qr/cmd=testComplete/, 'not auto-stop';
}
