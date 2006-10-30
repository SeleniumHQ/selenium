#!/usr/bin/perl
use strict;
use warnings;
use Test::More qw/no_plan/;
use t::Utils qw/method_exists/;
use Test::Exception;

# The purpose of these tests are to ensure that WWW::Selenium does not 
# break backwards compatibility with previously released versions.

BEGIN {
    use lib 't/lib';
    use_ok 'LWP::UserAgent';    # mocked
    use_ok 'HTTP::Response';    # mocked
    use lib 'lib';
    use_ok 't::WWW::Selenium';  # subclass for testing
}

my $sel = t::WWW::Selenium->new;
isa_ok $sel, 't::WWW::Selenium';

Simple_check: {
    $sel->_method_exists("is_location");
    $sel->_method_exists("get_checked");
    $sel->_method_exists("is_selected");
    $sel->_method_exists("get_selected_options");
}

Is_location: {
    True: {
        $sel->_set_mock_response_content('true');
        ok $sel->is_location('example.com');
    }

    False: {
        $sel->_set_mock_response_content('false');
        ok !$sel->is_location('monkey.com');
    }
}

Get_checked: {
    # XXX - Not sure what SeleniumServer actually returns here.
    True: {
        $sel->_set_mock_response_content('checked');
        is $sel->get_checked('id=foo'), 'checked';
    }

    False: {
        $sel->_set_mock_response_content('unchecked');
        is $sel->get_checked('id=foo'), 'unchecked';
    }
}
