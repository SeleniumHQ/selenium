package LWP::UserAgent;
use strict;
use warnings;
use Carp qw(confess);
use HTTP::Response; # mocked

# mock library for testing WWW::Selenium

my $self; # singleton

sub new {
    my $class = shift;
    return $self if $self; # already initialized
    $self = {};
    bless $self, $class or die "Can't bless $class: $!";
    return $self;
}

sub request {
    my (undef, $req) = @_;
    $self->{req} = $req->{GET};
    $self->{res} ||= HTTP::Response->new(content => 'OK');
    return delete $self->{res}
}

1;

