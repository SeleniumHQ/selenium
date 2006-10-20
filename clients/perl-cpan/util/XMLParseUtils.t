#!/usr/bin/perl
use strict;
use warnings;
use Test::More qw/no_plan/;
use lib 'util';
use XMLParseUtils qw/strip_blockquotes/;

Single_line: {
    my $xml = '<blockquote>Monkey</blockquote>';
    my $pod = <<EOT;

=over

Monkey

=back

EOT
    is strip_blockquotes($xml), $pod;
}

Split_single_line: {
    my $xml = <<EOT;
<blockquote>
Matches elements based on their values.  This is particularly useful for refining a list of similarly-named toggle-buttons.</blockquote>
EOT
    my $pod = <<EOT;

=over

Matches elements based on their values.  This is particularly useful for refining a list of similarly-named toggle-buttons.

=back

EOT
    is strip_blockquotes($xml), $pod;
}

Split_single_line: {
    my $xml = <<EOT;
<blockquote>
Thing one
Thing two
</blockquote>
EOT
    my $pod = <<EOT;

=over

Thing one
Thing two

=back

EOT
    is strip_blockquotes($xml), $pod;
}

Nested_blocks: {
    my $xml = <<EOT;
<blockquote>
Thing one
<blockquote>
Thing two
</blockquote>
Thing three
</blockquote>
EOT
    my $pod = <<EOT;

=over

Thing one

=over

Thing two

=back


Thing three

=back

EOT
    is strip_blockquotes($xml), $pod;
}
