#line 1
package Module::Install::Metadata;

use Module::Install::Base;
@ISA = qw{Module::Install::Base};

$VERSION = '0.61';

use strict 'vars';

my @scalar_keys = qw{
    name module_name abstract author version license
    distribution_type perl_version tests
};

my @tuple_keys = qw{
    build_requires requires recommends bundles
};

sub Meta            { shift        }
sub Meta_ScalarKeys { @scalar_keys }
sub Meta_TupleKeys  { @tuple_keys  }

foreach my $key (@scalar_keys) {
    *$key = sub {
        my $self = shift;
        return $self->{values}{$key} if defined wantarray and !@_;
        $self->{values}{$key} = shift;
        return $self;
    };
}

foreach my $key (@tuple_keys) {
    *$key = sub {
        my $self = shift;
        return $self->{values}{$key} unless @_;

        my @rv;
        while (@_) {
            my $module = shift or last;
            my $version = shift || 0;
            if ( $module eq 'perl' ) {
                $version =~ s{^(\d+)\.(\d+)\.(\d+)}
                             {$1 + $2/1_000 + $3/1_000_000}e;
                $self->perl_version($version);
                next;
            }
            my $rv = [ $module, $version ];
            push @rv, $rv;
        }
        push @{ $self->{values}{$key} }, @rv;
        @rv;
    };
}

sub sign {
    my $self = shift;
    return $self->{'values'}{'sign'} if defined wantarray and !@_;
    $self->{'values'}{'sign'} = ( @_ ? $_[0] : 1 );
    return $self;
}

sub dynamic_config {
	my $self = shift;
	unless ( @_ ) {
		warn "You MUST provide an explicit true/false value to dynamic_config, skipping\n";
		return $self;
	}
	$self->{'values'}{'dynamic_config'} = $_[0] ? 1 : 0;
	return $self;
}

sub all_from {
    my ( $self, $file ) = @_;

    unless ( defined($file) ) {
        my $name = $self->name
            or die "all_from called with no args without setting name() first";
        $file = join('/', 'lib', split(/-/, $name)) . '.pm';
        $file =~ s{.*/}{} unless -e $file;
        die "all_from: cannot find $file from $name" unless -e $file;
    }

    $self->version_from($file)      unless $self->version;
    $self->perl_version_from($file) unless $self->perl_version;

    # The remaining probes read from POD sections; if the file
    # has an accompanying .pod, use that instead
    my $pod = $file;
    if ( $pod =~ s/\.pm$/.pod/i and -e $pod ) {
        $file = $pod;
    }

    $self->author_from($file)   unless $self->author;
    $self->license_from($file)  unless $self->license;
    $self->abstract_from($file) unless $self->abstract;
}

sub provides {
    my $self     = shift;
    my $provides = ( $self->{values}{provides} ||= {} );
    %$provides = (%$provides, @_) if @_;
    return $provides;
}

sub auto_provides {
    my $self = shift;
    return $self unless $self->is_admin;

    unless (-e 'MANIFEST') {
        warn "Cannot deduce auto_provides without a MANIFEST, skipping\n";
        return $self;
    }

    # Avoid spurious warnings as we are not checking manifest here.

    local $SIG{__WARN__} = sub {1};
    require ExtUtils::Manifest;
    local *ExtUtils::Manifest::manicheck = sub { return };

    require Module::Build;
    my $build = Module::Build->new(
        dist_name    => $self->{name},
        dist_version => $self->{version},
        license      => $self->{license},
    );
    $self->provides(%{ $build->find_dist_packages || {} });
}

sub feature {
    my $self     = shift;
    my $name     = shift;
    my $features = ( $self->{values}{features} ||= [] );

    my $mods;

    if ( @_ == 1 and ref( $_[0] ) ) {
        # The user used ->feature like ->features by passing in the second
        # argument as a reference.  Accomodate for that.
        $mods = $_[0];
    } else {
        $mods = \@_;
    }

    my $count = 0;
    push @$features, (
        $name => [
            map {
                ref($_) ? ( ref($_) eq 'HASH' ) ? %$_
                                                : @$_
                        : $_
            } @$mods
        ]
    );

    return @$features;
}

sub features {
    my $self = shift;
    while ( my ( $name, $mods ) = splice( @_, 0, 2 ) ) {
        $self->feature( $name, @$mods );
    }
    return $self->{values}->{features}
    	? @{ $self->{values}->{features} }
    	: ();
}

sub no_index {
    my $self = shift;
    my $type = shift;
    push @{ $self->{values}{no_index}{$type} }, @_ if $type;
    return $self->{values}{no_index};
}

sub read {
    my $self = shift;
    $self->include_deps( 'YAML', 0 );

    require YAML;
    my $data = YAML::LoadFile('META.yml');

    # Call methods explicitly in case user has already set some values.
    while ( my ( $key, $value ) = each %$data ) {
        next unless $self->can($key);
        if ( ref $value eq 'HASH' ) {
            while ( my ( $module, $version ) = each %$value ) {
                $self->can($key)->($self, $module => $version );
            }
        }
        else {
            $self->can($key)->($self, $value);
        }
    }
    return $self;
}

sub write {
    my $self = shift;
    return $self unless $self->is_admin;
    $self->admin->write_meta;
    return $self;
}

sub version_from {
    my ( $self, $file ) = @_;
    require ExtUtils::MM_Unix;
    $self->version( ExtUtils::MM_Unix->parse_version($file) );
}

sub abstract_from {
    my ( $self, $file ) = @_;
    require ExtUtils::MM_Unix;
    $self->abstract(
        bless(
            { DISTNAME => $self->name },
            'ExtUtils::MM_Unix'
        )->parse_abstract($file)
     );
}

sub _slurp {
    my ( $self, $file ) = @_;

    local *FH;
    open FH, "< $file" or die "Cannot open $file.pod: $!";
    do { local $/; <FH> };
}

sub perl_version_from {
    my ( $self, $file ) = @_;

    if (
        $self->_slurp($file) =~ m/
        ^
        use \s*
        v?
        ([\d\.]+)
        \s* ;
    /ixms
      )
    {
        $self->perl_version($1);
    }
    else {
        warn "Cannot determine perl version info from $file\n";
        return;
    }
}

sub author_from {
    my ( $self, $file ) = @_;
    my $content = $self->_slurp($file);
    if ($content =~ m/
        =head \d \s+ (?:authors?)\b \s*
        ([^\n]*)
        |
        =head \d \s+ (?:licen[cs]e|licensing|copyright|legal)\b \s*
        .*? copyright .*? \d\d\d[\d.]+ \s* (?:\bby\b)? \s*
        ([^\n]*)
    /ixms) {
        my $author = $1 || $2;
        $author =~ s{E<lt>}{<}g;
        $author =~ s{E<gt>}{>}g;
        $self->author($author); 
    }
    else {
        warn "Cannot determine author info from $file\n";
    }
}

sub license_from {
    my ( $self, $file ) = @_;

    if (
        $self->_slurp($file) =~ m/
        =head \d \s+
        (?:licen[cs]e|licensing|copyright|legal)\b
        (.*?)
        (=head\\d.*|=cut.*|)
        \z
    /ixms
      )
    {
        my $license_text = $1;
        my @phrases      = (
            'under the same (?:terms|license) as perl itself' => 'perl',
            'GNU public license'                              => 'gpl',
            'GNU lesser public license'                       => 'gpl',
            'BSD license'                                     => 'bsd',
            'Artistic license'                                => 'artistic',
            'GPL'                                             => 'gpl',
            'LGPL'                                            => 'lgpl',
            'BSD'                                             => 'bsd',
            'Artistic'                                        => 'artistic',
        );
        while ( my ( $pattern, $license ) = splice( @phrases, 0, 2 ) ) {
            $pattern =~ s{\s+}{\\s+}g;
            if ( $license_text =~ /\b$pattern\b/i ) {
                $self->license($license);
                return 1;
            }
        }
    }

    warn "Cannot determine license info from $file\n";
    return 'unknown';
}

1;
