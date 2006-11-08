package HTTP::Request;
use strict;
use warnings;

# mock library for testing WWW::Selenium

sub new {
    my ($class, %opts) = @_;
    my $self = \%opts;
    bless $self, $class or die "Can't bless $class: $!";
    return $self;
}

1;
