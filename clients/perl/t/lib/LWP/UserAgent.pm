package LWP::UserAgent;
use strict;
use warnings;

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
    die "test driver should specify a response!" unless $self->{res};
    return delete $self->{res};
}

1;

