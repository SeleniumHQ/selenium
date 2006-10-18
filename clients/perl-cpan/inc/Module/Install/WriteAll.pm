#line 1
package Module::Install::WriteAll;
use Module::Install::Base; @ISA = qw(Module::Install::Base);

sub WriteAll {
    my $self = shift;
    my %args = (
        meta        => 1,
        sign        => 0,
        inline      => 0,
        check_nmake => 1,
        @_
    );

    $self->sign(1) if $args{sign};
    $self->Meta->write if $args{meta};
    $self->admin->WriteAll(%args) if $self->is_admin;

    if ($0 =~ /Build.PL$/i) {
        $self->Build->write;
    }
    else {
        $self->check_nmake if $args{check_nmake};
        $self->makemaker_args( PL_FILES => {} )
            unless $self->makemaker_args->{'PL_FILES'};

        if ($args{inline}) {
            $self->Inline->write;
        }
        else {
            $self->Makefile->write;
        }
    }
}

1;
