#!/usr/bin/perl
use strict;
use warnings;
use Test::More qw/no_plan/;
use Test::Differences;
use lib 'util';

BEGIN: {
    use_ok 'WWW::Selenium::XMLParseUtils',
           qw/extract_functions html2pod strip_blockquotes/;
}

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

Extract_functions: {
    my $xml = <<'EOT';
<function name="click">

<param name="locator">an element locator</param>

<comment>Clicks on a link, button, checkbox or radio button. If the click action
causes a new page to load (like a link usually does), call
waitForPageToLoad.</comment>

</function>
<function name="doubleClick">

<param name="locator">an element locator</param>

<comment>Double clicks on a link, button, checkbox or radio button. If the double click action
causes a new page to load (like a link usually does), call
waitForPageToLoad.</comment>

</function>
EOT
    my @functions;
    push @functions, <<'EOT';
=item $sel-E<gt>click($locator)

Clicks on a link, button, checkbox or radio button. If the click action
causes a new page to load (like a link usually does), call
waitForPageToLoad.

=over

$locator is an element locator

=back

=cut

sub click {
    my $self = shift;
    $self->do_command("click", @_);
}

EOT
    push @functions, <<'EOT';
=item $sel-E<gt>double_click($locator)

Double clicks on a link, button, checkbox or radio button. If the double click action
causes a new page to load (like a link usually does), call
waitForPageToLoad.

=over

$locator is an element locator

=back

=cut

sub double_click {
    my $self = shift;
    $self->do_command("doubleClick", @_);
}

EOT

    my @got = extract_functions($xml);
    is scalar(@got), scalar(@functions);
    for my $i (0 .. @got-1) {
        eq_or_diff $got[$i]->{text}, $functions[$i];
    }
}

Extract_functions_two_params: {
    my $xml = <<'EOT';
<function name="clickAt">

<param name="locator">an element locator</param>

<param name="coordString">specifies the x,y position (i.e. - 10,20) of the mouse      event relative to the element returned by the locator.</param>

<comment>Clicks on a link, button, checkbox or radio button. If the click action
causes a new page to load (like a link usually does), call
waitForPageToLoad.

Beware of http://jira.openqa.org/browse/SEL-280, which will lead some event handlers to
get null event arguments.  Read the bug for more details, including a workaround.</comment>

</function>
EOT
    my @functions;
    push @functions, <<'EOT';
=item $sel-E<gt>click_at($locator, $coord_string)

Clicks on a link, button, checkbox or radio button. If the click action
causes a new page to load (like a link usually does), call
waitForPageToLoad.

Beware of http://jira.openqa.org/browse/SEL-280, which will lead some event handlers to
get null event arguments.  Read the bug for more details, including a workaround.

=over

$locator is an element locator

$coord_string is specifies the x,y position (i.e. - 10,20) of the mouse      event relative to the element returned by the locator.

=back

=cut

sub click_at {
    my $self = shift;
    $self->do_command("clickAt", @_);
}

EOT

    my @got = extract_functions($xml);
    is scalar(@got), scalar(@functions);
    for my $i (0 .. @got-1) {
        eq_or_diff $got[$i]->{text}, $functions[$i];
    }
}

Function_with_return_type: {
    my $xml = <<'EOT';
<function name="getLogMessages">

<return type="string">all log messages seen since the last call to this API</return>

<comment>Return the contents of the log.

<p>This is a placeholder intended to make the code generator make this API
available to clients.  The selenium server will intercept this call, however,
and return its recordkeeping of log messages since the last call to this API.
Thus this code in JavaScript will never be called.</p>

<p>The reason I opted for a servercentric solution is to be able to support
multiple frames served from different domains, which would break a
centralized JavaScript logging mechanism under some conditions.</p></comment>

</function>
EOT
    my @functions;
    push @functions, <<'EOT';
=item $sel-E<gt>get_log_messages()

Return the contents of the log.

This is a placeholder intended to make the code generator make this API
available to clients.  The selenium server will intercept this call, however,
and return its recordkeeping of log messages since the last call to this API.
Thus this code in JavaScript will never be called.

The reason I opted for a servercentric solution is to be able to support
multiple frames served from different domains, which would break a
centralized JavaScript logging mechanism under some conditions.

=over

Returns all log messages seen since the last call to this API

=back

=cut

sub get_log_messages {
    my $self = shift;
    return $self->get_string("getLogMessages", @_);
}

EOT

    my @got = extract_functions($xml);
    is scalar(@got), scalar(@functions);
    for my $i (0 .. @got-1) {
        eq_or_diff $got[$i]->{text}, $functions[$i];
    }
}
