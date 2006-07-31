package Test::LongString;

use strict;
use vars qw($VERSION @ISA @EXPORT $Max $Context);

$VERSION = 0.09;

use Test::Builder;
my $Tester = new Test::Builder();

use Exporter;
@ISA    = ('Exporter');
@EXPORT = qw( is_string is_string_nows like_string unlike_string
    contains_string lacks_string );

# Maximum string length displayed in diagnostics
$Max = 50;

# Amount of context provided when starting displaying a string in the middle
$Context = 10;

sub import {
    (undef, my %args) = @_;
    $Max = $args{max} if defined $args{max};
    @_ = $_[0];
    goto &Exporter::import;
}

# _display($string, [$offset = 0])
# Formats a string for display. Begins at $offset minus $Context.
# This function ought to be configurable, à la od(1).

sub _display {
    my $s = shift;
    if (!defined $s) { return 'undef'; }
    if (length($s) > $Max) {
	my $offset = shift || 0;
	if (defined $Context) {
	    $offset -= $Context;
	    $offset < 0 and $offset = 0;
	}
	else {
	    $offset = 0;
	}
	$s = sprintf(qq("%.${Max}s"...), substr($s, $offset));
	$s = "...$s" if $offset;
    }
    else {
	$s = qq("$s");
    }
    $s =~ s/([\0-\037\200-\377])/sprintf('\x{%02x}',ord $1)/eg;
    return $s;
}

# I'm not too happy with this function. And you ?
sub _common_prefix_length {
    my ($x, $y) = (shift, shift);
    my $r = 0;
    while (length($x) && length($y)) {
	my ($x1,$x2) = $x =~ /(.)(.*)/s;
	my ($y1,$y2) = $y =~ /(.)(.*)/s;
	if ($x1 eq $y1) {
	    $x = $x2;
	    $y = $y2;
	    ++$r;
	}
	else {
	    last;
	}
    }
    $r;
}

sub contains_string($$;$) {
    my ($str,$sub,$name) = @_;

    my $ok;
    if (!defined $str) {
        $Tester->ok($ok = 0, $name);
        $Tester->diag("String to look in is undef");
    } elsif (!defined $sub) {
        $Tester->ok($ok = 0, $name);
        $Tester->diag("String to look for is undef");
    } else {
        my $index = index($str, $sub);
        $ok = ($index >= 0);
        $Tester->ok($ok, $name);
        if (!$ok) {
            my ($g, $e) = (_display($str), _display($sub));
            $Tester->diag(<<DIAG);
    searched: $g
  can't find: $e
DIAG
        }
    }
    return $ok;
}

sub lacks_string($$;$) {
    my ($str,$sub,$name) = @_;

    my $ok;
    if (!defined $str) {
        $Tester->ok($ok = 0, $name);
        $Tester->diag("String to look in is undef");
    } elsif (!defined $sub) {
        $Tester->ok($ok = 0, $name);
        $Tester->diag("String to look for is undef");
    } else {
        my $index = index($str, $sub);
        $ok = ($index < 0);
        $Tester->ok($ok, $name);
        if (!$ok) {
            my ($g, $e) = (_display($str), _display($sub));
            $Tester->diag(<<DIAG);
    searched: $g
   and found: $e
 at position: $index
DIAG
        }
    }
    return $ok;
}

sub is_string ($$;$) {
    my ($got, $expected, $name) = @_;
    if (!defined $got || !defined $expected) {
	my $ok = !defined $got && !defined $expected;
	$Tester->ok($ok, $name);
	if (!$ok) {
	    my ($g, $e) = (_display($got), _display($expected));
	    $Tester->diag(<<DIAG);
         got: $g
    expected: $e
DIAG
	}
	return $ok;
    }
    if ($got eq $expected) {
	$Tester->ok(1, $name);
	return 1;
    }
    else {
	$Tester->ok(0, $name);
	my $common_prefix = _common_prefix_length($got,$expected);
	my ($g, $e) = (
	    _display($got, $common_prefix),
	    _display($expected, $common_prefix),
	);
	$Tester->diag(<<DIAG);
         got: $g
      length: ${\(length $got)}
    expected: $e
      length: ${\(length $expected)}
    strings begin to differ at char ${\($common_prefix + 1)}
DIAG
	return 0;
    }
}

sub is_string_nows ($$;$) {
    my ($got, $expected, $name) = @_;
    if (!defined $got || !defined $expected) {
	my $ok = !defined $got && !defined $expected;
	$Tester->ok($ok, $name);
	if (!$ok) {
	    my ($g, $e) = (_display($got), _display($expected));
	    $Tester->diag(<<DIAG);
         got: $g
    expected: $e
DIAG
	}
	return $ok;
    }
    s/\s+//g for (my $got_nows = $got), (my $expected_nows = $expected);
    if ($got_nows eq $expected_nows) {
	$Tester->ok(1, $name);
	return 1;
    }
    else {
	$Tester->ok(0, $name);
	my $common_prefix = _common_prefix_length($got_nows,$expected_nows);
	my ($g, $e) = (
	    _display($got_nows, $common_prefix),
	    _display($expected_nows, $common_prefix),
	);
	$Tester->diag(<<DIAG);
after whitespace removal:
         got: $g
      length: ${\(length $got_nows)}
    expected: $e
      length: ${\(length $expected_nows)}
    strings begin to differ at char ${\($common_prefix + 1)}
DIAG
	return 0;
    }
}

sub like_string ($$;$) {
    _like($_[0],$_[1],'=~',$_[2]);
}

sub unlike_string ($$;$) {
    _like($_[0],$_[1],'!~',$_[2]);
}

# mostly from Test::Builder::_regex_ok
sub _like {
    local $Test::Builder::Level = $Test::Builder::Level + 1;
    my ($got, $regex, $cmp, $name) = @_;
    my $ok = 0;
    my $usable_regex = $Tester->maybe_regex($regex);
    unless (defined $usable_regex) {
	$ok = $Tester->ok( 0, $name );
	$Tester->diag("    '$regex' doesn't look much like a regex to me.");
	return $ok;
    }
    {
	local $^W = 0;
	my $test = $got =~ /$usable_regex/ ? 1 : 0;
	$test = !$test if $cmp eq '!~';
	$ok = $Tester->ok( $test, $name );
    }
    unless( $ok ) {
	my $g = _display($got);
	my $match = $cmp eq '=~' ? "doesn't match" : "matches";
	my $l = defined $got ? length $got : '-';
	$Tester->diag(sprintf(<<DIAGNOSTIC, $g, $match, $regex));
         got: %s
      length: $l
    %13s '%s'
DIAGNOSTIC
    }
    return $ok;
}

1;

__END__

=head1 NAME

Test::LongString - tests strings for equality, with more helpful failures

=head1 SYNOPSIS

    use Test::More tests => 1;
    use Test::LongString;
    like_string( $html, qr/(perl|cpan)\.org/ );

    #     Failed test (html-test.t at line 12)
    #          got: "<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Trans"...
    #       length: 58930
    #     doesn't match '(?-xism:(perl|cpan)\.org)'

=head1 DESCRIPTION

This module provides some drop-in replacements for the string
comparison functions of L<Test::More>, but which are more suitable
when you test against long strings.  If you've ever had to search
for text in a multi-line string like an HTML document, or find
specific items in binary data, this is the module for you.

=head1 FUNCTIONS

=head2 is_string( $string, $expected [, $label ] )

C<is_string()> is equivalent to C<Test::More::is()>, but with more
helpful diagnostics in case of failure.

=over

=item *

It doesn't print the entire strings in the failure message.

=item *

It reports the lengths of the strings that have been compared.

=item *

It reports the length of the common prefix of the strings.

=item *

In the diagnostics, non-ASCII characters are escaped as C<\x{xx}>.

=back

For example:

    is_string( $soliloquy, $juliet );

    #     Failed test (soliloquy.t at line 15)
    #          got: "To be, or not to be: that is the question:\x{0a}Whether"...
    #       length: 1490
    #     expected: "O Romeo, Romeo,\x{0a}wherefore art thou Romeo?\x{0a}Deny thy"...
    #       length: 154
    #     strings begin to differ at char 1

=head2 is_string_nows( $string, $expected [, $label ] )

Like C<is_string()>, but removes whitepace (in the C<\s> sense) from the
arguments before comparing them.

=head2 like_string( $string, qr/regex/ [, $label ] )

=head2 unlike_string( $string, qr/regex/ [, $label ] )

C<like_string()> and C<unlike_string()> are replacements for
C<Test::More:like()> and C<unlike()> that only print the beginning
of the received string in the output.  Unfortunately, they can't
print out the position where the regex failed to match.

    like_string( $soliloquy, qr/Romeo|Juliet|Mercutio|Tybalt/ );

    #     Failed test (soliloquy.t at line 15)
    #          got: "To be, or not to be: that is the question:\x{0a}Whether"...
    #       length: 1490
    #     doesn't match '(?-xism:Romeo|Juliet|Mercutio|Tybalt)'

=head2 contains_string( $string, $substring [, $label ] )

C<contains_string()> searches for I<$substring> in I<$string>.  It's
the same as C<like_string()>, except that it's not a regular
expression search.

    contains_string( $soliloquy, "Romeo" );

    #     Failed test (soliloquy.t at line 10)
    #         searched: "To be, or not to be: that is the question:\x{0a}Whether"...
    #   and can't find: "Romeo"

=head2 lacks_string( $string, $substring [, $label ] )

C<lacks_string()> makes sure that I<$substring> does NOT exist in
I<$string>.  It's the same as C<like_string()>, except that it's not a
regular expression search.

    lacks_string( $soliloquy, "slings" );

    #     Failed test (soliloquy.t at line 10)
    #         searched: "To be, or not to be: that is the question:\x{0a}Whether"...
    #        and found: "slings"
    #      at position: 147

=head1 CONTROLLING OUTPUT

By default, only the first 50 characters of the compared strings
are shown in the failure message.  This value is in
C<$Test::LongString::Max>, and can be set at run-time.

You can also set it by specifying an argument to C<use>:

    use Test::LongString max => 100;

When the compared strings begin to differ after a large prefix,
Test::LongString will not print them from the beginning, but will start at the
middle, more precisely at C<$Test::LongString::Context> characters before the
first difference. By default this value is 10 characters. If you want
Test::LongString to always print the beginning of compared strings no matter
where they differ, undefine C<$Test::LongString::Context>.

=head1 AUTHOR

Written by Rafael Garcia-Suarez. Thanks to Mark Fowler (and to Joss Whedon) for
the inspirational L<Acme::Test::Buffy>. Thanks to Andy Lester for lots of patches.

This program is free software; you may redistribute it and/or modify it under
the same terms as Perl itself.

=head1 SEE ALSO

L<Test::Builder>, L<Test::Builder::Tester>, L<Test::More>.

=cut
