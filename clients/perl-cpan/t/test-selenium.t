#!/usr/bin/perl
use strict;
use warnings;
use Test::More;
use Test::Exception;
use Test::Builder::Tester tests => 44;
Test::Builder::Tester::color(1);

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
    my $sel;
    Start_a_browser: {
        local $ua->{res} = HTTP::Response->new(content => 'OK,SESSION_ID');
        $sel = Test::WWW::Selenium->new(browser_url => 'http://foo.com');
        isa_ok $sel, 'Test::WWW::Selenium';
        is $sel->{session_id}, 'SESSION_ID', 'correct session id';
        $sel->open;
    }

    Test_page_title: {
        local $ua->{res} = HTTP::Response->new(content => 'OK,Some Title');
        test_out("ok 1 - get_title, 'Some Title'");
        $sel->title_is('Some Title');
        test_test('title_is passes');
        is $ua->{req}, 'http://localhost:4444/selenium-server/driver/'
                       . '?cmd=getTitle&sessionId=SESSION_ID',
           'correct page title url';
    }

    Browser_gets_closed: {
        local $ua->{res} = HTTP::Response->new(content => 'OK');
        $sel = undef; 
        is $ua->{req}, 'http://localhost:4444/selenium-server/driver/'
                       . '?cmd=testComplete&sessionId=SESSION_ID',
           'testComplete request sent on DESTROY';
    }
}

Comparators: {
    # run these tests twice, the first time will create the function,
    # the second time will use the auto-loaded function
  for(1 .. 2) {
    $ua->{res} = HTTP::Response->new(content => 'OK,SESSION_ID');
    my $sel = Test::WWW::Selenium->new(browser_url => 'http://foo.com');
    $sel->open;
    is_pass: {
        local $ua->{res} = HTTP::Response->new(content => 'OK,foo');
        test_out('ok 1 - bar');
        $sel->text_is('id', 'foo', 'bar');
        test_test('is pass');
    }
    is_fail: {
        local $ua->{res} = HTTP::Response->new(content => 'OK,baz');
        test_out('not ok 1 - bar');
        test_fail(+1);
        $sel->text_is('id', 'foo', 'bar');
        test_test(skip_err => 1, title => 'is fail');
    }
    isnt_pass: {
        local $ua->{res} = HTTP::Response->new(content => 'OK,baz');
        test_out('ok 1 - bar');
        $sel->text_isnt('id', 'foo', 'bar');
        test_test('isnt pass');
    }
    isnt_fail: {
        local $ua->{res} = HTTP::Response->new(content => 'OK,foo');
        test_out('not ok 1 - bar');
        test_fail(+1);
        $sel->text_isnt('id', 'foo', 'bar');
        test_test(skip_err => 1, title => 'isnt fail');
    }
    like_pass: {
        local $ua->{res} = HTTP::Response->new(content => 'OK,foo');
        test_out('ok 1 - bar');
        $sel->text_like('id', qr/foo/, 'bar');
        test_test('like pass');
    }
    like_fail: {
        local $ua->{res} = HTTP::Response->new(content => 'OK,baz');
        test_out('not ok 1 - bar');
        test_fail(+1);
        $sel->text_like('id', qr/foo/, 'bar');
        test_test(skip_err => 1, title => 'like fail');
    }
    unlike_pass: {
        local $ua->{res} = HTTP::Response->new(content => 'OK,baz');
        test_out('ok 1 - bar');
        $sel->text_unlike('id', qr/foo/, 'bar');
        test_test('unlike pass');
    }
    unlike_fail: {
        local $ua->{res} = HTTP::Response->new(content => 'OK,foo');
        test_out('not ok 1 - bar');
        test_fail(+1);
        $sel->text_unlike('id', qr/foo/, 'bar');
        test_test(skip_err => 1, title => 'unlike fail');
    }
    # for $sel DESTROY
    $ua->{res} = HTTP::Response->new(content => 'OK');
  }
}

Commands: {
    local $ua->{res} = HTTP::Response->new(content => 'OK,SESSION_ID');
    my $sel = Test::WWW::Selenium->new(browser_url => 'http://foo.com');
    $sel->open;
    click_pass: {
        local $ua->{res} = HTTP::Response->new(content => 'OK');
        test_out('ok 1 - click, id, bar');
        $sel->click_ok('id', 'bar');
        test_test('click pass');
    }
    click_fail: {
        local $ua->{res} = HTTP::Response->new(content => 'Failed to click');
        test_out('not ok 1 - click, id, bar');
        test_err("# Error requesting http://localhost:4444/selenium-server/driver/?cmd=click&1=id&2=bar&sessionId=SESSION_ID:");
        test_err("# Failed to click");
        test_fail(+1);
        $sel->click_ok('id', 'bar');
        test_test(skip_err => 1, title => 'click fail');
    }
    # for $sel DESTROY
    $ua->{res} = HTTP::Response->new(content => 'OK');
}

no_locatior: { 
    local $ua->{res} = HTTP::Response->new(content => 'OK,SESSION_ID');
    for my $getter (qw(alert prompt location title)) {
        local $ua->{res} = HTTP::Response->new(content => 'OK,SESSION_ID');
        my $sel = Test::WWW::Selenium->new(browser_url => 'http://foo.com');
        $sel->open;
        my $method = "${getter}_is";
        is_pass: {
            local $ua->{res} = HTTP::Response->new(content => 'OK,foo');
            test_out('ok 1 - bar');
            $sel->$method('foo', 'bar');
            test_test('is pass');
        }
        is_fail: {
            local $ua->{res} = HTTP::Response->new(content => 'OK,baz');
            test_out('not ok 1 - bar');
            test_fail(+1);
            $sel->$method('foo', 'bar');
            test_test(skip_err => 1, title => 'is fail');
        }
        # for $sel DESTROY
        $ua->{res} = HTTP::Response->new(content => 'OK');
    }
}

Non_existant_command: {
    $ua->{res} = HTTP::Response->new(content => 'OK,SESSION_ID');
    my $sel = Test::WWW::Selenium->new(browser_url => 'http://foo.com');
    isa_ok $sel, 'Test::WWW::Selenium';
    $sel->open;
    $ua->{res} = HTTP::Response->new(content => 'OK');
    throws_ok { $sel->drink_coffee_ok } qr/Can't locate object method/;
    # for $sel DESTROY
    $ua->{res} = HTTP::Response->new(content => 'OK');
}

Relative_location: {
    local $ua->{res} = HTTP::Response->new(content => 'OK,SESSION_ID');
    my $sel = Test::WWW::Selenium->new(browser_url => 'http://foo.com');
    $sel->open;
    get_location: {
        my @locations = ('http://example.com/',
                         'http://example.com/bar',
                         'http://example.com:8080/baz',
                        );
        for my $abs (@locations) {
            local $ua->{res} = HTTP::Response->new(content => "OK,$abs");
            is $sel->get_location, $abs, "location $abs";
        }
    }
    location_is_pass: {
        local $ua->{res} = HTTP::Response->new(content => 'OK,http://foo.com:23/monkey/man');
        test_out('ok 1 - bar');
        $sel->location_is('http://foo.com:23/monkey/man', 'bar');
        test_test('is pass');
    }
    location_is_fail: {
        local $ua->{res} = HTTP::Response->new(content => 'OK,http://foo.com:23/monkey/man');
        test_out('not ok 1 - bar');
        test_fail(+1);
        $sel->location_is('foo', 'bar');
        test_test(skip_err => 1, title => 'is fail');
    }
    # for $sel DESTROY
    $ua->{res} = HTTP::Response->new(content => 'OK');
}

Default_test_names: {
    Default_names_off: {
        local $ua->{res} = HTTP::Response->new(content => 'OK,SESSION_ID');
        my $sel = Test::WWW::Selenium->new(browser_url => 'http://foo.com', 
                                           default_names => 0);
        $sel->open;
        local $ua->{res} = HTTP::Response->new(content => 'OK');
        test_out('ok 1');
        $sel->click_ok('id', 'bar');
        test_test('default names off');
    }
    Test_name_provided: {
        local $ua->{res} = HTTP::Response->new(content => 'OK,SESSION_ID');
        my $sel = Test::WWW::Selenium->new(browser_url => 'http://foo.com', 
                                           default_names => 1);
        $sel->open;
        local $ua->{res} = HTTP::Response->new(content => 'OK');
        test_out('ok 1 - test name');
        $sel->click_ok('id', 'bar', 'test name');
        test_test('default names on with test name');
    }
    No_test_name_provided: {
        local $ua->{res} = HTTP::Response->new(content => 'OK,SESSION_ID');
        my $sel = Test::WWW::Selenium->new(browser_url => 'http://foo.com');
        $sel->open;
        local $ua->{res} = HTTP::Response->new(content => 'OK');
        test_out('ok 1 - click, id, bar');
        $sel->click_ok('id', 'bar');
        test_test('default names on with test name');
    }
}
