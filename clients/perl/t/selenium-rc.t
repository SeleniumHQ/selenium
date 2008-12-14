#!/usr/bin/perl
use strict;
use warnings;
use Test::More tests => 50;
use Test::Exception;
use Test::Mock::LWP;

BEGIN {
    use lib 'lib';
    use_ok 'WWW::Selenium';
    use_ok 'Test::WWW::Selenium';
}

Good_usage: {
    my $sel = WWW::Selenium->new( host => 'localhost', 
                                  port => 4444, 
                                  browser => '*firefox', 
                                  browser_url => 'http://foo.com'
                                );
    isa_ok $sel, 'WWW::Selenium';
    is $sel->{host}, 'localhost';
    is $sel->{port}, 4444;
    is $sel->{browser_start_command}, '*firefox';
    is $sel->{browser_url}, 'http://foo.com';
    is $sel->{session_id}, undef;

    Start_up_selenium: {
        $Mock_resp->mock( content => sub {'OK,SESSION_ID'} );
        $sel->start;
        is $sel->{session_id}, 'SESSION_ID';
        req_ok('cmd=getNewBrowserSession&1=*firefox&2=http%3A%2F%2Ffoo.com&3=');
        $Mock_resp->mock( content => sub { 'OK' } );
        $sel->open;
    }

    Execute_command: {
        $Mock_resp->mock( content => sub { 'OK,Some Title' } );
        is $sel->get_title, 'Some Title';
        req_ok('cmd=getTitle&sessionId=SESSION_ID');
    }

    Close_down_selenium: {
        $Mock_resp->mock( content => sub { 'OK' } );
        $sel->stop;
        is $sel->{session_id}, undef;
        req_ok('cmd=testComplete&sessionId=SESSION_ID');
    }
}

No_browser_url: {
    throws_ok { WWW::Selenium->new } qr#browser_url is mandatory#;
}

Default_args: {
    my $sel = WWW::Selenium->new( browser_url => 'http://foo.com' );
    is $sel->{host}, 'localhost';
    is $sel->{port}, 4444;
    is $sel->{browser_start_command}, '*firefox';
    is $sel->{browser_url}, 'http://foo.com';
    is $sel->{session_id}, undef;
}

start_fails: {
    my $sel = WWW::Selenium->new( browser_url => 'http://foo.com' );
    $Mock_resp->mock( content => sub { 'Error: foo' } );
    throws_ok { $sel->start } qr#Error: foo#;
}

Failing_command: {
    my $sel = WWW::Selenium->new( browser_url => 'http://foo.com' );
    $Mock_resp->mock( content => sub { 'OK,SESSION_ID' } );
    $sel->start;
    $sel->open;
    $Mock_resp->mock( content => sub { 'Error: foo' } );
    throws_ok { $sel->get_title } qr#Error: foo#;
    $Mock_resp->mock( content => sub { 'OK' } );
}
 
Multi_values: {
    my $sel = WWW::Selenium->new( browser_url => 'http://foo.com' );
    $Mock_resp->mock( content => sub { 'OK,SESSION_ID' } );
    $sel->start;
    $sel->open;

    my %testcases = (
            'one,two,three' => [qw(one two three)],
            'one\\,two'      => ['one,two'],
    );
    my %skip_testcases = (
            'veni\, vidi\, vici,c:\\foo\\bar,c:\\I came\, I \\saw\\\, I conquered',
                            => ['veni, vidi, vici',
                                'c:\foo\bar',
                                'c:\I came, I \saw\, I conquered',
                               ],
            'one\\\\,two'    => ['one\\,two'], 
            'one\\\\\\,two'  => ['one\\', 'two'],
    );
    my $tester = sub {
        my $tests = shift;
        for my $k (keys %$tests) {
            $Mock_resp->mock( content => sub { "OK,$k" } );
            my $fields = [$sel->get_all_fields];
            is_deeply $fields, $tests->{$k}, "parsing $k";
        }
    };
    $tester->(\%testcases);
    TODO: {
        local $TODO = 'Need to fix get_string_array';
        $tester->(\%skip_testcases);
    }
}

Stop_called_twice: {
    my $sel = WWW::Selenium->new( browser_url => 'http://foo.com' );
    $Mock_resp->mock( content => sub { 'OK,SESSION_ID' } );
    $sel->start;
    is $sel->{session_id}, 'SESSION_ID';
    $Mock_resp->mock( content => sub { 'OK' } );
    $sel->stop;
    is $sel->{session_id}, undef;
    req_ok('cmd=testComplete&sessionId=SESSION_ID');
    $sel->stop;
    is_deeply $Mock_req->new_args, undef;
}

With_session_id: {
    my $sel = Test::WWW::Selenium->new(
        browser_url => 'http://foo.com',
        session_id  => 'MY_ID',
    );
    $Mock_resp->mock( content => sub { die "Should never be called!" } );
    $sel->start;
    is $sel->{session_id}, 'MY_ID';
    $Mock_resp->mock( content => sub { 'OK' } );
    $sel->stop;
    is $sel->{session_id}, undef;
    req_ok('cmd=testComplete&sessionId=MY_ID');
    $sel->stop;
    is_deeply $Mock_req->new_args, undef;
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

