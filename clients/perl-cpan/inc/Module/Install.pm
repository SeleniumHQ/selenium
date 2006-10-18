#line 1
package Module::Install;

# For any maintainers:
# The load order for Module::Install is a bit magic.
# It goes something like this...
#
# IF ( host has Module::Install installed, creating author mode ) {
#     1. Makefile.PL calls "use inc::Module::Install"
#     2. $INC{inc/Module/Install.pm} set to installed version of inc::Module::Install
#     3. The installed version of inc::Module::Install loads
#     4. inc::Module::Install calls "require Module::Install"
#     5. The ./inc/ version of Module::Install loads
# } ELSE {
#     1. Makefile.PL calls "use inc::Module::Install"
#     2. $INC{inc/Module/Install.pm} set to ./inc/ version of Module::Install
#     3. The ./inc/ version of Module::Install loads
# }

use 5.004;
use strict 'vars';

use vars qw{$VERSION};
BEGIN {
    # All Module::Install core packages now require synchronised versions.
    # This will be used to ensure we don't accidentally load old or
    # different versions of modules.
    # This is not enforced yet, but will be some time in the next few
    # releases once we can make sure it won't clash with custom
    # Module::Install extensions.
    $VERSION = '0.61';
}

# Whether or not inc::Module::Install is actually loaded, the
# $INC{inc/Module/Install.pm} is what will still get set as long as
# the caller loaded module this in the documented manner.
# If not set, the caller may NOT have loaded the bundled version, and thus
# they may not have a MI version that works with the Makefile.PL. This would
# result in false errors or unexpected behaviour. And we don't want that.
my $file = join( '/', 'inc', split /::/, __PACKAGE__ ) . '.pm';
unless ( $INC{$file} ) {
    die <<"END_DIE";
Please invoke ${\__PACKAGE__} with:

    use inc::${\__PACKAGE__};

not:

    use ${\__PACKAGE__};

END_DIE
}

use Cwd        ();
use File::Find ();
use File::Path ();
use FindBin;

*inc::Module::Install::VERSION = *VERSION;
@inc::Module::Install::ISA     = __PACKAGE__;

sub autoload {
    my $self = shift;
    my $who  = $self->_caller;
    my $cwd  = Cwd::cwd();
    my $sym  = "${who}::AUTOLOAD";
    $sym->{$cwd} = sub {
        my $pwd = Cwd::cwd();
        if ( my $code = $sym->{$pwd} ) {
            # delegate back to parent dirs
            goto &$code unless $cwd eq $pwd;
        }
        $$sym =~ /([^:]+)$/ or die "Cannot autoload $who - $sym";
        unshift @_, ($self, $1);
        goto &{$self->can('call')} unless uc($1) eq $1;
    };
}

sub import {
    my $class = shift;
    my $self  = $class->new(@_);
    my $who   = $self->_caller;

    unless ( -f $self->{file} ) {
        require "$self->{path}/$self->{dispatch}.pm";
        File::Path::mkpath("$self->{prefix}/$self->{author}");
        $self->{admin} = "$self->{name}::$self->{dispatch}"->new( _top => $self );
        $self->{admin}->init;
        @_ = ($class, _self => $self);
        goto &{"$self->{name}::import"};
    }

    *{"${who}::AUTOLOAD"} = $self->autoload;
    $self->preload;

    # Unregister loader and worker packages so subdirs can use them again
    delete $INC{"$self->{file}"};
    delete $INC{"$self->{path}.pm"};
}

sub preload {
    my ($self) = @_;

    unless ( $self->{extensions} ) {
        $self->load_extensions(
            "$self->{prefix}/$self->{path}", $self
        );
    }

    my @exts = @{$self->{extensions}};
    unless ( @exts ) {
        my $admin = $self->{admin};
        @exts = $admin->load_all_extensions;
    }

    my %seen;
    foreach my $obj ( @exts ) {
        while (my ($method, $glob) = each %{ref($obj) . '::'}) {
            next unless exists &{ref($obj).'::'.$method};
            next if $method =~ /^_/;
            next if $method eq uc($method);
            $seen{$method}++;
        }
    }

    my $who = $self->_caller;
    foreach my $name ( sort keys %seen ) {
        *{"${who}::$name"} = sub {
            ${"${who}::AUTOLOAD"} = "${who}::$name";
            goto &{"${who}::AUTOLOAD"};
        };
    }
}

sub new {
    my ($class, %args) = @_;

    # ignore the prefix on extension modules built from top level.
    my $base_path = Cwd::abs_path($FindBin::Bin);
    unless ( Cwd::abs_path(Cwd::cwd()) eq $base_path ) {
        delete $args{prefix};
    }

    return $args{_self} if $args{_self};

    $args{dispatch} ||= 'Admin';
    $args{prefix}   ||= 'inc';
    $args{author}   ||= ($^O eq 'VMS' ? '_author' : '.author');
    $args{bundle}   ||= 'inc/BUNDLES';
    $args{base}     ||= $base_path;
    $class =~ s/^\Q$args{prefix}\E:://;
    $args{name}     ||= $class;
    $args{version}  ||= $class->VERSION;
    unless ( $args{path} ) {
        $args{path}  = $args{name};
        $args{path}  =~ s!::!/!g;
    }
    $args{file}     ||= "$args{base}/$args{prefix}/$args{path}.pm";

    bless( \%args, $class );
}

sub call {
	my ($self, $method) = @_;
	my $obj = $self->load($method) or return;
        splice(@_, 0, 2, $obj);
	goto &{$obj->can($method)};
}

sub load {
    my ($self, $method) = @_;

    $self->load_extensions(
        "$self->{prefix}/$self->{path}", $self
    ) unless $self->{extensions};

    foreach my $obj (@{$self->{extensions}}) {
        return $obj if $obj->can($method);
    }

    my $admin = $self->{admin} or die <<"END_DIE";
The '$method' method does not exist in the '$self->{prefix}' path!
Please remove the '$self->{prefix}' directory and run $0 again to load it.
END_DIE

    my $obj = $admin->load($method, 1);
    push @{$self->{extensions}}, $obj;

    $obj;
}

sub load_extensions {
    my ($self, $path, $top) = @_;

    unless ( grep { lc $_ eq lc $self->{prefix} } @INC ) {
        unshift @INC, $self->{prefix};
    }

    foreach my $rv ( $self->find_extensions($path) ) {
        my ($file, $pkg) = @{$rv};
        next if $self->{pathnames}{$pkg};

        local $@;
        my $new = eval { require $file; $pkg->can('new') };
        unless ( $new ) {
            warn $@ if $@;
            next;
        }
        $self->{pathnames}{$pkg} = delete $INC{$file};
        push @{$self->{extensions}}, &{$new}($pkg, _top => $top );
    }

    $self->{extensions} ||= [];
}

sub find_extensions {
    my ($self, $path) = @_;

    my @found;
    File::Find::find( sub {
        my $file = $File::Find::name;
        return unless $file =~ m!^\Q$path\E/(.+)\.pm\Z!is;
        my $subpath = $1;
        return if lc($subpath) eq lc($self->{dispatch});

        $file = "$self->{path}/$subpath.pm";
        my $pkg = "$self->{name}::$subpath";
        $pkg =~ s!/!::!g;

        # If we have a mixed-case package name, assume case has been preserved
        # correctly.  Otherwise, root through the file to locate the case-preserved
        # version of the package name.
        if ( $subpath eq lc($subpath) || $subpath eq uc($subpath) ) {
            open PKGFILE, "<$subpath.pm" or die "find_extensions: Can't open $subpath.pm: $!";
            my $in_pod = 0;
            while ( <PKGFILE> ) {
                $in_pod = 1 if /^=\w/;
                $in_pod = 0 if /^=cut/;
                next if ($in_pod || /^=cut/);  # skip pod text
                next if /^\s*#/;               # and comments
                if ( m/^\s*package\s+($pkg)\s*;/i ) {
                    $pkg = $1;
                    last;
                }
            }
            close PKGFILE;
        }

        push @found, [ $file, $pkg ];
    }, $path ) if -d $path;

    @found;
}

sub _caller {
    my $depth = 0;
    my $call  = caller($depth);
    while ( $call eq __PACKAGE__ ) {
        $depth++;
        $call = caller($depth);
    }
    return $call;
}

1;
