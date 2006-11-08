package HTTP::Response;
use strict;
use warnings;

# mock library for testing WWW::Selenium

sub new {
    my ($class, %opts) = @_;
    $opts{is_success} = 1 unless defined $opts{is_success};
    my $self = \%opts;
    bless $self, $class or die "Can't bless $class: $!";
    return $self;
}

sub is_success { $_[0]->{is_success} }
sub status_line { $_[0]->{status_line} }
sub content { $_[0]->{content} || '' }

1;
