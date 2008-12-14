package t::WWW::Selenium;
use strict;
use warnings;
use Test::More;
use Test::Exception;
use Test::Mock::LWP;
use base 'WWW::Selenium';

sub new {
    my $class = shift;
    my %opts = (
        host => 'localhost', 
        port => 4444, 
        browser => '*firefox', 
        browser_url => 'http://example.com',
        no_deprecation_msg => 1,
        @_,
    );
    my $self = $class->SUPER::new( %opts );

    # Store mock www user agent and startup a session
    $self->_set_mock_response_content('FAKE_SESSION_ID');
    $self->start;

    # Test that the session was started as we expect
    my $req_args = $Mock_req->new_args;
    my $content = pop @$req_args;
    is $content, 'cmd=getNewBrowserSession&1=*firefox&2=http%3A%2F%2Fexample.com&3=';
    my $headers = pop @$req_args;
    my $url = "http://$opts{host}:$opts{port}/selenium-server/driver/";
    is_deeply $req_args, [ 'HTTP::Request', 'POST', $url ];

    return $self;
}

sub _set_mock_response_content {
    my ($self, $content) = @_;
    my $msg = $content;
    if (length($msg) == 0 or $msg !~ /^ERROR/) {
        $msg = "OK,$msg";
    }
    $Mock_resp->mock( content => sub { $msg } );
}

sub _method_exists {
    my ($self, $method, $return_type) = @_;
    my $response = 'Something';
    $response = 'true' if $method =~ m/^(?:is_|get_whether)/i;
    $self->_set_mock_response_content($response);
    lives_ok { $self->$method('one', 'two') } "$method lives";
}
1;
