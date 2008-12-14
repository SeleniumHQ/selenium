#!/usr/bin/perl
use strict;
use warnings;
use Test::More tests => 23;
use Test::Exception;
use Test::Mock::LWP;

# Tests for enhancements to help users find their problems faster

BEGIN {
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
    like $Mock_req->new_args->[4], qr/\Qcmd=open&1=%2F\E/, 'open specified /';
}

Double_start: {
    my $sel = t::WWW::Selenium->new; # calls start() automatically
    $sel->start;
    is $Mock_req->new_args, undef;
}

Auto_stop: {
    my $sel = t::WWW::Selenium->new;
    $sel->open('/');
    $sel->_set_mock_response_content('http://example.com');
    $sel->get_location;
    $sel = undef;
    like $Mock_req->new_args->[4], qr/cmd=testComplete/, 'auto-stop';
}

Auto_stop_off: {
    my $sel = t::WWW::Selenium->new(auto_stop => 0);
    $sel->open('/');
    $sel->_set_mock_response_content('http://example.com');
    $sel->get_location;
    $sel = undef;
    unlike $Mock_req->new_args->[4], qr/cmd=testComplete/, 'not auto-stop';
}

Do_command_open: {
    my $sel = t::WWW::Selenium->new;
    $sel->do_command(qw(open /));
    $sel->_set_mock_response_content('http://example.com');
    lives_ok { $sel->get_location };
}

Set_timeout_before_open: {
    my $sel = t::WWW::Selenium->new;
    lives_ok { $sel->set_timeout(3000) };
}
