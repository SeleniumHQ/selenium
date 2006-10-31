#!/usr/bin/perl
use strict;
use warnings;
use Test::More tests => 20;
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
    True: {
        $sel->_set_mock_response_content('true');
        is $sel->get_checked('id=foo'), 'true';
    }

    False: {
        $sel->_set_mock_response_content('false');
        is $sel->get_checked('id=foo'), 'false';
    }

    Element_does_not_exist: {
        my $error_msg = "Element id=foo not found";
        $sel->_set_mock_response_content("ERROR: $error_msg");
        throws_ok { $sel->get_checked('id=foo') }
                  qr/\Q$error_msg\E/;
    }
}

Is_selected: {
    True: {
        $sel->_set_mock_response_content('true');
        ok $sel->is_selected('id=foo');
    }

    False: {
        $sel->_set_mock_response_content('false');
        ok !$sel->is_selected('id=foo');
    }

    Element_does_not_exist: {
        my $error_msg = "Element id=foo not found";
        $sel->_set_mock_response_content("ERROR: $error_msg");
        throws_ok { $sel->is_selected('id=foo') }
                  qr/\Q$error_msg\E/;
    }
}

Get_selected_options: {
    None_selected: {
        $sel->_set_mock_response_content('');
        is_deeply [$sel->get_selected_options('id=foo')], [''];
    }

    One_selected: {
        $sel->_set_mock_response_content('first response');
        is_deeply [$sel->get_selected_options('id=foo')], ['first response'];
    }

    Two_selected: {
        $sel->_set_mock_response_content('first response,second');
        is_deeply [$sel->get_selected_options('id=foo')], 
                  ['first response', 'second'];
    }
}
