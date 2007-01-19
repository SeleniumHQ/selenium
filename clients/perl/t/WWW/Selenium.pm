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
    (my $enc_url = $opts{browser_url}) =~ s#://#%3A%2F%2F#; # simple
    my $url = "http://$opts{host}:$opts{port}/selenium-server/driver/"
                   . "?cmd=getNewBrowserSession&1=$opts{browser}&2=$enc_url";
    is_deeply $Mock_req->new_args, [ 'HTTP::Request', 'GET', $url ];

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
