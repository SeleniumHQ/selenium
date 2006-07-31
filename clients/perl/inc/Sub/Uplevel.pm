package Sub::Uplevel;

use 5.006;

use strict;
use vars qw($VERSION @ISA @EXPORT);
$VERSION = "0.13";

# We have to do this so the CORE::GLOBAL versions override the builtins
_setup_CORE_GLOBAL();

require Exporter;
@ISA = qw(Exporter);
@EXPORT = qw(uplevel);

=head1 NAME

Sub::Uplevel - apparently run a function in a higher stack frame

=head1 SYNOPSIS

  use Sub::Uplevel;

  sub foo {
      print join " - ", caller;
  }

  sub bar {
      uplevel 1, \&foo;
  }

  #line 11
  bar();    # main - foo.plx - 11

=head1 DESCRIPTION

Like Tcl's uplevel() function, but not quite so dangerous.  The idea
is just to fool caller().  All the really naughty bits of Tcl's
uplevel() are avoided.

B<THIS IS NOT THE SORT OF THING YOU WANT TO DO EVERYDAY>

=over 4

=item B<uplevel>

  uplevel $num_frames, \&func, @args;

Makes the given function think it's being executed $num_frames higher
than the current stack level.  So when they use caller($frames) it
will actually give caller($frames + $num_frames) for them.

C<uplevel(1, \&some_func, @_)> is effectively C<goto &some_func> but
you don't immediately exit the current subroutine.  So while you can't
do this:

    sub wrapper {
        print "Before\n";
        goto &some_func;
        print "After\n";
    }

you can do this:

    sub wrapper {
        print "Before\n";
        my @out = uplevel 1, &some_func;
        print "After\n";
        return @out;
    }


=cut

our @Up_Frames; # uplevel stack

sub uplevel {
    my($num_frames, $func, @args) = @_;
    
    local @Up_Frames = ($num_frames, @Up_Frames );
    return $func->(@args);
}


sub _setup_CORE_GLOBAL {
    no warnings 'redefine';

    *CORE::GLOBAL::caller = sub(;$) {
        my $height = $_[0] || 0;

        # shortcut if no uplevels have been called
        # always add +1 to CORE::caller to skip this function's caller
        return CORE::caller( $height + 1 ) if ! @Up_Frames;

=begin _private

So it has to work like this:

    Call stack               Actual     uplevel 1
CORE::GLOBAL::caller
Carp::short_error_loc           0
Carp::shortmess_heavy           1           0
Carp::croak                     2           1
try_croak                       3           2
uplevel                         4            
function_that_called_uplevel    5            
caller_we_want_to_see           6           3
its_caller                      7           4

So when caller(X) winds up below uplevel(), it only has to use  
CORE::caller(X+1) (to skip CORE::GLOBAL::caller).  But when caller(X)
winds up no or above uplevel(), it's CORE::caller(X+1+uplevel+1).

Which means I'm probably going to have to do something nasty like walk
up the call stack on each caller() to see if I'm going to wind up   
before or after Sub::Uplevel::uplevel().

=end _private

=begin _dagolden

I found the description above a bit confusing.  Instead, this is the logic
that I found clearer when CORE::GLOBAL::caller is invoked and we have to
walk up the call stack:

* if searching up to the requested height in the real call stack doesn't find
a call to uplevel, then we can return the result at that height in the
call stack

* if we find a call to uplevel, we need to keep searching upwards beyond the
requested height at least by the amount of upleveling requested for that
call to uplevel (from the Up_Frames stack set during the uplevel call)

* additionally, we need to hide the uplevel subroutine call, too, so we search
upwards one more level for each call to uplevel

* when we've reached the top of the search, we want to return that frame
in the call stack, i.e. the requested height plus any uplevel adjustments
found during the search

=end _dagolden
        
=cut

        my $saw_uplevel = 0;
        my $adjust = 0;

        # walk up the call stack to fight the right package level to return;
        # look one higher than requested for each call to uplevel found
        # and adjust by the amount found in the Up_Frames stack for that call

        for ( my $up = 0; $up <= $height + $adjust; $up++ ) {
            my @caller = CORE::caller($up + 1); 
            if( defined $caller[0] && $caller[0] eq __PACKAGE__ ) {
                # add one for each uplevel call seen
                # and look into the uplevel stack for the offset
                $adjust += 1 + $Up_Frames[$saw_uplevel];
                $saw_uplevel++;
            }
        }

        my @caller = CORE::caller($height + $adjust + 1);

        if( wantarray ) {
            if( !@_ ) {
                @caller = @caller[0..2];
            }
            return @caller;
        }
        else {
            return $caller[0];
        }
    }; # sub

}

=back

=head1 EXAMPLE

The main reason I wrote this module is so I could write wrappers
around functions and they wouldn't be aware they've been wrapped.

    use Sub::Uplevel;

    my $original_foo = \&foo;

    *foo = sub {
        my @output = uplevel 1, $original_foo;
        print "foo() returned:  @output";
        return @output;
    };

If this code frightens you B<you should not use this module.>


=head1 BUGS and CAVEATS

Sub::Uplevel must be used as early as possible in your program's
compilation.

Well, the bad news is uplevel() is about 5 times slower than a normal
function call.  XS implementation anyone?

Blows over any CORE::GLOBAL::caller you might have (and if you do,
you're just sick).


=head1 HISTORY

Those who do not learn from HISTORY are doomed to repeat it.

The lesson here is simple:  Don't sit next to a Tcl programmer at the
dinner table.


=head1 THANKS

Thanks to Brent Welch, Damian Conway and Robin Houston.


=head1 AUTHORS

David A Golden E<lt>dagolden@cpan.orgE<gt> (current maintainer)

Michael G Schwern E<lt>schwern@pobox.comE<gt> (original author)

=head1 LICENSE

Copyright by Michael G Schwern, David A Golden

This program is free software; you can redistribute it and/or modify it
under the same terms as Perl itself.

See http://www.perl.com/perl/misc/Artistic.html


=head1 SEE ALSO

PadWalker (for the similar idea with lexicals), Hook::LexWrap, 
Tcl's uplevel() at http://www.scriptics.com/man/tcl8.4/TclCmd/uplevel.htm

=cut


1;
