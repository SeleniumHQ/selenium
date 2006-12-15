#!/usr/bin/perl
use strict;
use warnings;
use Test::More tests => 36;
use Test::Exception;

BEGIN {
    use lib 't/lib'; # use mock libraries
    use_ok 'LWP::UserAgent';
    use_ok 'HTTP::Response';
    use lib 'lib';
    use_ok 'WWW::Selenium';
}

# singleton user agent for mocking WWW::Selenium
my $ua = LWP::UserAgent->new;

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

    # now start up selenium
    $ua->{res} = HTTP::Response->new(content => 'OK,SESSION_ID');
    $sel->start;
    is $ua->{req}, 'http://localhost:4444/selenium-server/driver/'
                   . '?cmd=getNewBrowserSession&1=*firefox&2=http%3A%2F%2Ffoo.com';
    is $sel->{session_id}, 'SESSION_ID';
    $sel->open;

    # try some commands
    $ua->{res} = HTTP::Response->new(content => 'OK,Some Title');
    is $sel->get_title, 'Some Title';
    is $ua->{req}, 'http://localhost:4444/selenium-server/driver/?cmd=getTitle'
                   . '&sessionId=SESSION_ID';

    # finish it off
    $ua->{res} = HTTP::Response->new(content => 'OK');
    $sel->stop;
    is $sel->{session_id}, undef;
    is $ua->{req}, 'http://localhost:4444/selenium-server/driver/'
                   . '?cmd=testComplete&sessionId=SESSION_ID';
}

No_browser_url: {
    throws_ok { WWW::Selenium->new } qr#browser_url is mandatory#;
}

Default_args: {
    my $sel = WWW::Selenium->new( browser_url => 'http://foo.com' );
    isa_ok $sel, 'WWW::Selenium';
    is $sel->{host}, 'localhost';
    is $sel->{port}, 4444;
    is $sel->{browser_start_command}, '*firefox';
    is $sel->{browser_url}, 'http://foo.com';
    is $sel->{session_id}, undef;
}

start_fails: {
    my $sel = WWW::Selenium->new( browser_url => 'http://foo.com' );
    isa_ok $sel, 'WWW::Selenium';
    $ua->{res} = HTTP::Response->new(content => 'Error: foo');
    throws_ok { $sel->start } qr#Error: foo#;
}

Failing_command: {
    my $sel = WWW::Selenium->new( browser_url => 'http://foo.com' );
    isa_ok $sel, 'WWW::Selenium';
    $ua->{res} = HTTP::Response->new(content => 'OK,SESSION_ID');
    $sel->start;
    $sel->open;
    $ua->{res} = HTTP::Response->new(content => 'Error: foo');
    throws_ok { $sel->get_title } qr#Error: foo#;
}
 
Multi_values: {
    my $sel = WWW::Selenium->new( browser_url => 'http://foo.com' );
    isa_ok $sel, 'WWW::Selenium';
    $ua->{res} = HTTP::Response->new(content => 'OK,SESSION_ID');
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
            $ua->{res} = HTTP::Response->new(content => "OK,$k");
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
    isa_ok $sel, 'WWW::Selenium';
    $ua->{res} = HTTP::Response->new(content => 'OK,SESSION_ID');
    $sel->start;
    $ua->{res} = HTTP::Response->new(content => 'OK');
    $sel->stop;
    is $sel->{session_id}, undef;
    is $ua->{req}, 'http://localhost:4444/selenium-server/driver/'
                   . '?cmd=testComplete&sessionId=SESSION_ID';
    $ua->{req} = undef;
    $sel->stop;
    is $ua->{req}, undef;
}
