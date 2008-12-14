#!/usr/bin/perl
use strict;
use warnings;
use Test::More;
use Test::Exception;
use Test::Mock::LWP;
use Test::Builder::Tester tests => 48;
Test::Builder::Tester::color(1);

BEGIN {
    use lib 'lib';
    use_ok 'Test::WWW::Selenium';
}

Good_usage: {
    my $sel;
    Start_a_browser: {
        $Mock_resp->mock('content' => sub { 'OK,SESSION_ID' });
        $sel = Test::WWW::Selenium->new(browser_url => 'http://foo.com');
        isa_ok $sel, 'Test::WWW::Selenium';
        is $sel->{session_id}, 'SESSION_ID', 'correct session id';
    }

    Test_page_title: {
        $Mock_resp->mock('content' => sub { 'OK,Some Title' });
        $sel->open;
        test_out("ok 1 - get_title, 'Some Title'");
        $sel->title_is('Some Title');
        test_test('title_is passes');
        req_ok('cmd=getTitle&sessionId=SESSION_ID');
    }

    Browser_gets_closed: {
        $Mock_resp->mock('content' => sub { 'OK' });
        $sel = undef; 
        req_ok('cmd=testComplete&sessionId=SESSION_ID');
    }
}

Comparators: {
    # run these tests twice, the first time will create the function,
    # the second time will use the auto-loaded function
  for(1 .. 2) {
    $Mock_resp->mock('content' => sub { 'OK,SESSION_ID' });
    my $sel = Test::WWW::Selenium->new(browser_url => 'http://foo.com');
    $sel->open;
    is_pass: {
        $Mock_resp->mock('content' => sub { 'OK,foo' });
        test_out('ok 1 - bar');
        $sel->text_is('id', 'foo', 'bar');
        test_test('is pass');
    }
    is_fail: {
        $Mock_resp->mock('content' => sub { 'OK,baz' });
        test_out('not ok 1 - bar');
        test_fail(+1);
        $sel->text_is('id', 'foo', 'bar');
        test_test(skip_err => 1, title => 'is fail');
    }
    isnt_pass: {
        $Mock_resp->mock('content' => sub { 'OK,baz' });
        test_out('ok 1 - bar');
        $sel->text_isnt('id', 'foo', 'bar');
        test_test('isnt pass');
    }
    isnt_fail: {
        $Mock_resp->mock('content' => sub { 'OK,foo' });
        test_out('not ok 1 - bar');
        test_fail(+1);
        $sel->text_isnt('id', 'foo', 'bar');
        test_test(skip_err => 1, title => 'isnt fail');
    }
    like_pass: {
        $Mock_resp->mock('content' => sub { 'OK,foo' });
        test_out('ok 1 - bar');
        $sel->text_like('id', qr/foo/, 'bar');
        test_test('like pass');
    }
    like_fail: {
        $Mock_resp->mock('content' => sub { 'OK,baz' });
        test_out('not ok 1 - bar');
        test_fail(+1);
        $sel->text_like('id', qr/foo/, 'bar');
        test_test(skip_err => 1, title => 'like fail');
    }
    unlike_pass: {
        $Mock_resp->mock('content' => sub { 'OK,baz' });
        test_out('ok 1 - bar');
        $sel->text_unlike('id', qr/foo/, 'bar');
        test_test('unlike pass');
    }
    unlike_fail: {
        $Mock_resp->mock('content' => sub { 'OK,foo' });
        test_out('not ok 1 - bar');
        test_fail(+1);
        $sel->text_unlike('id', qr/foo/, 'bar');
        test_test(skip_err => 1, title => 'unlike fail');
    }
    # for $sel DESTROY
    $Mock_resp->mock('content' => sub { 'OK' });
  }
}

Commands: {
    $Mock_resp->mock('content' => sub { 'OK,SESSION_ID' });
    my $sel = Test::WWW::Selenium->new(browser_url => 'http://foo.com');
    $sel->open;
    click_pass: {
        $Mock_resp->mock('content' => sub { 'OK' });
        test_out('ok 1 - click, id, bar');
        $sel->click_ok('id', 'bar');
        test_test('click pass');
    }
    click_fail: {
        $Mock_resp->mock('content' => sub { 'Failed to click' });
        test_out('not ok 1 - click, id, bar');
        test_err("# Error requesting http://localhost:4444/selenium-server/driver/?cmd=click&1=id&2=bar&sessionId=SESSION_ID:");
        test_err("# Failed to click");
        test_fail(+1);
        $sel->click_ok('id', 'bar');
        test_test(skip_err => 1, title => 'click fail');
    }
    # for $sel DESTROY
    $Mock_resp->mock('content' => sub { 'OK' });
}

no_locatior: { 
    $Mock_resp->mock('content' => sub { 'OK,SESSION_ID' });
    for my $getter (qw(alert prompt absolute_location title)) {
        $Mock_resp->mock('content' => sub { 'OK,SESSION_ID' });
        my $sel = Test::WWW::Selenium->new(browser_url => 'http://foo.com');
        $sel->open;
        my $method = "${getter}_is";
        is_pass: {
            $Mock_resp->mock('content' => sub { 'OK,foo' });
            test_out('ok 1 - bar');
            $sel->$method('foo', 'bar');
            test_test('is pass');
        }
        is_fail: {
            $Mock_resp->mock('content' => sub { 'OK,baz' });
            test_out('not ok 1 - bar');
            test_fail(+1);
            $sel->$method('foo', 'bar');
            test_test(skip_err => 1, title => 'is fail');
        }
        # for $sel DESTROY
        $Mock_resp->mock('content' => sub { 'OK' });
    }
}

Non_existant_command: {
    $Mock_resp->mock('content' => sub { 'OK,SESSION_ID' });
    my $sel = Test::WWW::Selenium->new(browser_url => 'http://foo.com');
    isa_ok $sel, 'Test::WWW::Selenium';
    $sel->open;
    $Mock_resp->mock('content' => sub { 'OK' });
    throws_ok { $sel->drink_coffee_ok } qr/Can't locate object method/;
    # for $sel DESTROY
    $Mock_resp->mock('content' => sub { 'OK' });
}

Relative_location: {
    $Mock_resp->mock('content' => sub { 'OK,SESSION_ID' });
    my $sel = Test::WWW::Selenium->new(browser_url => 'http://foo.com');
    $sel->open;
    get_location: {
        my @locations = ('http://example.com/',
                         'http://example.com/bar',
                         'http://example.com:8080/baz',
                        );
        for my $abs (@locations) {
            $Mock_resp->mock('content' => sub { "OK,$abs" });
            is $sel->get_location, $abs, "location $abs";
        }
    }
    location_is_pass: {
        $Mock_resp->mock('content' => sub { 'OK,http://foo.com:23/monkey/man' });
        test_out('ok 1 - bar');
        $sel->location_is('http://foo.com:23/monkey/man', 'bar');
        test_test('is pass');
    }
    location_is_fail: {
        $Mock_resp->mock('content' => sub { 'OK,http://foo.com:23/monkey/man' });
        test_out('not ok 1 - bar');
        test_fail(+1);
        $sel->location_is('foo', 'bar');
        test_test(skip_err => 1, title => 'is fail');
    }
    # for $sel DESTROY
    $Mock_resp->mock('content' => sub { 'OK' });
}

Default_test_names: {
    Default_names_off: {
        $Mock_resp->mock('content' => sub { 'OK,SESSION_ID' });
        my $sel = Test::WWW::Selenium->new(browser_url => 'http://foo.com', 
                                           default_names => 0);
        $sel->open;
        $Mock_resp->mock('content' => sub { 'OK' });
        test_out('ok 1');
        $sel->click_ok('id', 'bar');
        test_test('default names off');
    }
    Test_name_provided: {
        $Mock_resp->mock('content' => sub { 'OK,SESSION_ID' });
        my $sel = Test::WWW::Selenium->new(browser_url => 'http://foo.com', 
                                           default_names => 1);
        $sel->open;
        $Mock_resp->mock('content' => sub { 'OK' });
        test_out('ok 1 - test name');
        $sel->click_ok('id', 'bar', 'test name');
        test_test('default names on with test name');
    }
    No_test_name_provided: {
        $Mock_resp->mock('content' => sub { 'OK,SESSION_ID' });
        my $sel = Test::WWW::Selenium->new(browser_url => 'http://foo.com');
        $sel->open;
        $Mock_resp->mock('content' => sub { 'OK' });
        test_out('ok 1 - click, id, bar');
        $sel->click_ok('id', 'bar');
        test_test('default names on with test name');
    }
}

exit;


sub req_ok {
    my $content = shift;
    my $args = $Mock_req->new_args;
    is $args->[0], 'HTTP::Request';
    is $args->[1], 'POST';
    is $args->[2], 'http://localhost:4444/selenium-server/driver/';
    is $args->[4], $content;
}

