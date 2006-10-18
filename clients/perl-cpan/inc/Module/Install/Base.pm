#line 1
package Module::Install::Base;

$VERSION = '0.61';

# Suspend handler for "redefined" warnings
BEGIN {
	my $w = $SIG{__WARN__};
	$SIG{__WARN__} = sub { $w };
}

### This is the ONLY module that shouldn't have strict on
# use strict;

#line 41

sub new {
    my ($class, %args) = @_;

    foreach my $method ( qw(call load) ) {
        *{"$class\::$method"} = sub {
            shift()->_top->$method(@_);
        } unless defined &{"$class\::$method"};
    }

    bless( \%args, $class );
}

#line 61

sub AUTOLOAD {
    my $self = shift;
    local $@;
    my $autoload = eval { $self->_top->autoload } or return;
    goto &$autoload;
}

#line 76

sub _top { $_[0]->{_top} }

#line 89

sub admin {
    $_[0]->_top->{admin} or Module::Install::Base::FakeAdmin->new;
}

sub is_admin {
    $_[0]->admin->VERSION;
}

sub DESTROY {}

package Module::Install::Base::FakeAdmin;

my $Fake;
sub new { $Fake ||= bless(\@_, $_[0]) }

sub AUTOLOAD {}

sub DESTROY {}

# Restore warning handler
BEGIN {
	$SIG{__WARN__} = $SIG{__WARN__}->();
}

1;

#line 138
