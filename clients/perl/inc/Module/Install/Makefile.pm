#line 1
package Module::Install::Makefile;

use strict 'vars';
use Module::Install::Base;
use ExtUtils::MakeMaker ();

use vars qw{$VERSION @ISA};
BEGIN {
	$VERSION = '0.61';
	@ISA     = qw{Module::Install::Base};
}

sub Makefile { $_[0] }

my %seen = ();

sub prompt {
    shift;

    # Infinite loop protection
    my @c = caller();
    if ( ++$seen{"$c[1]|$c[2]|$_[0]"} > 3 ) {
        die "Caught an potential prompt infinite loop ($c[1]|$c[2]|$_[0])";
    }

    # In automated testing, always use defaults
    if ( $ENV{AUTOMATED_TESTING} and ! $ENV{PERL_MM_USE_DEFAULT} ) {
        local $ENV{PERL_MM_USE_DEFAULT} = 1;
        goto &ExtUtils::MakeMaker::prompt;
    } else {
        goto &ExtUtils::MakeMaker::prompt;
    }
}

sub makemaker_args {
    my $self = shift;
    my $args = ($self->{makemaker_args} ||= {});
    %$args = ( %$args, @_ ) if @_;
    $args;
}

# For mm args that take multiple space-seperated args,
# append an argument to the current list.
sub makemaker_append {
    my $self = shift;
    my $name = shift;
    my $args = $self->makemaker_args;
    $args->{name} = defined $args->{$name}
    	? join( ' ', $args->{name}, @_ )
    	: join( ' ', @_ );
}

sub build_subdirs {
    my $self    = shift;
    my $subdirs = $self->makemaker_args->{DIR} ||= [];
    for my $subdir (@_) {
        push @$subdirs, $subdir;
    }
}

sub clean_files {
    my $self  = shift;
    my $clean = $self->makemaker_args->{clean} ||= {};
    %$clean = (
        %$clean, 
        FILES => join(' ', grep length, $clean->{FILES}, @_),
    );
}

sub realclean_files {
    my $self  = shift;
    my $realclean = $self->makemaker_args->{realclean} ||= {};
    %$realclean = (
        %$realclean, 
        FILES => join(' ', grep length, $realclean->{FILES}, @_),
    );
}

sub libs {
    my $self = shift;
    my $libs = ref $_[0] ? shift : [ shift ];
    $self->makemaker_args( LIBS => $libs );
}

sub inc {
    my $self = shift;
    $self->makemaker_args( INC => shift );
}

sub write {
    my $self = shift;
    die "&Makefile->write() takes no arguments\n" if @_;

    my $args = $self->makemaker_args;
    $args->{DISTNAME} = $self->name;
    $args->{NAME}     = $self->module_name || $self->name || $self->determine_NAME($args);
    $args->{VERSION}  = $self->version || $self->determine_VERSION($args);
    $args->{NAME}     =~ s/-/::/g;
    if ( $self->tests ) {
        $args->{test} = { TESTS => $self->tests };
    }
    if ($] >= 5.005) {
        $args->{ABSTRACT} = $self->abstract;
        $args->{AUTHOR}   = $self->author;
    }
    if ( eval($ExtUtils::MakeMaker::VERSION) >= 6.10 ) {
        $args->{NO_META} = 1;
    }
    if ( eval($ExtUtils::MakeMaker::VERSION) > 6.17 and $self->sign ) {
        $args->{SIGN} = 1;
    }
    unless ( $self->is_admin ) {
        delete $args->{SIGN};
    }

    # merge both kinds of requires into prereq_pm
    my $prereq = ($args->{PREREQ_PM} ||= {});
    %$prereq = ( %$prereq, map { @$_ } map { @$_ } grep $_,
                 ($self->build_requires, $self->requires) );

    # merge both kinds of requires into prereq_pm
    my $subdirs = ($args->{DIR} ||= []);
    if ($self->bundles) {
        foreach my $bundle (@{ $self->bundles }) {
            my ($file, $dir) = @$bundle;
            push @$subdirs, $dir if -d $dir;
            delete $prereq->{$file};
        }
    }

    if ( my $perl_version = $self->perl_version ) {
        eval "use $perl_version; 1"
            or die "ERROR: perl: Version $] is installed, "
                . "but we need version >= $perl_version";
    }

    my %args = map { ( $_ => $args->{$_} ) } grep {defined($args->{$_})} keys %$args;
    if ($self->admin->preop) {
        $args{dist} = $self->admin->preop;
    }

    my $mm = ExtUtils::MakeMaker::WriteMakefile(%args);
    $self->fix_up_makefile($mm->{FIRST_MAKEFILE} || 'Makefile');
}

sub fix_up_makefile {
    my $self          = shift;
    my $makefile_name = shift;
    my $top_class     = ref($self->_top) || '';
    my $top_version   = $self->_top->VERSION || '';

    my $preamble = $self->preamble 
        ? "# Preamble by $top_class $top_version\n"
            . $self->preamble
        : '';
    my $postamble = "# Postamble by $top_class $top_version\n"
        . ($self->postamble || '');

    local *MAKEFILE;
    open MAKEFILE, "< $makefile_name" or die "fix_up_makefile: Couldn't open $makefile_name: $!";
    my $makefile = do { local $/; <MAKEFILE> };
    close MAKEFILE or die $!;

    $makefile =~ s/\b(test_harness\(\$\(TEST_VERBOSE\), )/$1'inc', /;
    $makefile =~ s/( -I\$\(INST_ARCHLIB\))/ -Iinc$1/g;
    $makefile =~ s/( "-I\$\(INST_LIB\)")/ "-Iinc"$1/g;
    $makefile =~ s/^(FULLPERL = .*)/$1 "-Iinc"/m;
    $makefile =~ s/^(PERL = .*)/$1 "-Iinc"/m;

    # XXX - This is currently unused; not sure if it breaks other MM-users
    # $makefile =~ s/^pm_to_blib\s+:\s+/pm_to_blib :: /mg;

    open  MAKEFILE, "> $makefile_name" or die "fix_up_makefile: Couldn't open $makefile_name: $!";
    print MAKEFILE  "$preamble$makefile$postamble" or die $!;
    close MAKEFILE  or die $!;

    1;
}

sub preamble {
    my ($self, $text) = @_;
    $self->{preamble} = $text . $self->{preamble} if defined $text;
    $self->{preamble};
}

sub postamble {
    my ($self, $text) = @_;
    $self->{postamble} ||= $self->admin->postamble;
    $self->{postamble} .= $text if defined $text;
    $self->{postamble}
}

1;

__END__

#line 324
