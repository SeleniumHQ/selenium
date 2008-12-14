#!/usr/bin/perl
use strict;
use warnings;
use Test::More tests => 26;
use Test::Exception;

# The purpose of these tests are to ensure that WWW::Selenium does not 
# break backwards compatibility with previously released versions.

BEGIN {
    use lib 'lib';
    use_ok 't::WWW::Selenium';  # subclass for testing
}

my $sel = t::WWW::Selenium->new;
isa_ok $sel, 't::WWW::Selenium';
$sel->open;

Simple_check: {
    $sel->_method_exists("is_location");
    $sel->_method_exists("get_checked");
    $sel->_method_exists("is_selected");
    $sel->_method_exists("get_selected_options");
    $sel->_method_exists("get_absolute_location");
}

Is_location: {
    # is_location now uses get_location under the hood
    True: {
        $sel->_set_mock_response_content('http://example.com');
        ok $sel->is_location('example.com');
    }

    False: {
        $sel->_set_mock_response_content('http://examplebad.com');
        ok !$sel->is_location('monkey.com');
    }
}

Get_checked: {
    True: {
        $sel->_set_mock_response_content('1');
        is $sel->get_checked('id=foo'), 'true';
    }

    False: {
        $sel->_set_mock_response_content('0');
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
        $sel->_set_mock_response_content('ape,monkey');
        ok $sel->is_selected('id=foo', 'monkey');
    }

    False: {
        $sel->_set_mock_response_content('ape,human');
        ok !$sel->is_selected('id=foo', 'monkey');
    }

    Label: {
        $sel->_set_mock_response_content('ape,monkey');
        ok $sel->is_selected('id=foo', 'label=monkey');
    }

    Value: {
        $sel->_set_mock_response_content('ape,monkey');
        ok $sel->is_selected('id=foo', 'value=monkey');
    }

    Id: {
        $sel->_set_mock_response_content('ape,monkey');
        ok $sel->is_selected('id=foo', 'id=monkey');
    }

    Index_true: {
        $sel->_set_mock_response_content('1,2,3');
        ok $sel->is_selected('id=foo', 'index=2');
    }

    Index_false: {
        $sel->_set_mock_response_content('1,3,4');
        ok !$sel->is_selected('id=foo', 'index=2');
    }

    Element_does_not_exist: {
        my $error_msg = "Element id=foo not found";
        $sel->_set_mock_response_content("ERROR: $error_msg");
        throws_ok { $sel->is_selected('id=foo', 'value=monkey') }
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

Get_absolute_location: {
    $sel->_set_mock_response_content('http://example.com');
    is $sel->get_absolute_location, 'http://example.com';
}
