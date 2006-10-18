# Copyright 2006 ThoughtWorks, Inc
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
#


package WWW::Selenium;
use LWP::UserAgent;
use HTTP::Request;
use URI::Escape;
use Carp qw(croak);

use strict;
use warnings;

our $VERSION = '0.27';

=head1 NAME

WWW::Selenium - Perl Client for the Selenium Remote Control test tool

=head1 SYNOPSIS

    use WWW::Selenium;
    
    my $sel = WWW::Selenium->new( host => "localhost", 
                                  port => 4444, 
                                  browser => "*iexplore", 
                                  browser_url => "http://www.google.com",
                                );
    
    $sel->start;
    $sel->open("http://www.google.com");
    $sel->type("q", "hello world");
    $sel->click("btnG");
    $sel->wait_for_page_to_load(5000);
    print $sel->get_title;
    $sel->stop;

=head1 DESCRIPTION

Selenium Remote Control (SRC) is a test tool that allows you to write
automated web application UI tests in any programming language against
any HTTP website using any mainstream JavaScript-enabled browser.  SRC
provides a Selenium Server, which can automatically start/stop/control
any supported browser. It works by using Selenium Core, a pure-HTML+JS
library that performs automated tasks in JavaScript; the Selenium
Server communicates directly with the browser using AJAX
(XmlHttpRequest).

L<http://www.openqa.org/selenium-rc/>

This module sends commands directly to the Server using simple HTTP
GET/POST requests.  Using this module together with the Selenium
Server, you can automatically control any supported browser.

To use this module, you need to have already downloaded and started
the Selenium Server.  (The Selenium Server is a Java application.)

=cut

#Defines an object that runs Selenium commands.


=head3 Element Locators


Element Locators tell Selenium which HTML element a command refers to.
The format of a locator is:

I<locatorType>B<=>I<argument>

We support the following strategies for locating elements:



=over


=item B<identifier>=I<id>

Select the element with the specified @id attribute. If no match is
found, select the first element whose @name attribute is I<id>.
(This is normally the default; see below.)

=item B<id>=I<id>

Select the element with the specified @id attribute.

=item B<name>=I<name>

Select the first element with the specified @name attribute.



=over


=item * username

=item * name=username


=back


The name may optionally be followed by one or more I<element-filters>, separated from the name by whitespace.  If the I<filterType> is not specified, B<value> is assumed.



=over


=item * name=flavour value=chocolate


=back


=item B<dom>=I<javascriptExpression>


Find an element using JavaScript traversal of the HTML Document Object
Model. DOM locators I<must> begin with "document.".


=over


=item * dom=document.forms['myForm'].myDropdown

=item * dom=document.images[56]


=back



=item B<xpath>=I<xpathExpression>

Locate an element using an XPath expression.


=over


=item * xpath=//img[@alt='The image alt text']

=item * xpath=//table[@id='table1']//tr[4]/td[2]


=back


=item B<link>=I<textPattern>

Select the link (anchor) element which contains text matching the
specified I<pattern>.


=over


=item * link=The link text


=back



=back

Without an explicit locator prefix, Selenium uses the following default
strategies:



=over


=item * B<dom>, for locators starting with "document."

=item * B<xpath>, for locators starting with "//"

=item * B<identifier>, otherwise


=back

=head3 Element Filters

Element filters can be used with a locator to refine a list of candidate elements.  They are currently used only in the 'name' element-locator.
Filters look much like locators, ie.

I<filterType>B<=>I<argument>

Supported element-filters are:

B<value=>I<valuePattern>

Matches elements based on their values.  This is particularly useful for refining a list of similarly-named toggle-buttons.

B<index=>I<index>

Selects a single element based on its position in the list (offset from zero).

=head3 String-match Patterns


Various Pattern syntaxes are available for matching string values:



=over


=item B<glob:>I<pattern>

Match a string against a "glob" (aka "wildmat") pattern. "Glob" is a
kind of limited regular-expression syntax typically used in command-line
shells. In a glob pattern, "*" represents any sequence of characters, and "?"
represents any single character. Glob patterns match against the entire
string.

=item B<regexp:>I<regexp>

Match a string using a regular-expression. The full power of JavaScript
regular-expressions is available.

=item B<exact:>I<string>

Match a string exactly, verbatim, without any of that fancy wildcard
stuff.


=back

If no pattern prefix is specified, Selenium assumes that it's a "glob"
pattern.



=cut

eval 'require Encode';
my $encode_present = !$@;
Encode->import('decode_utf8') if $encode_present;

### This part is hard-coded in the XSL
sub new {
    my ($class, %args) = @_;
    my $self = { # default args:
                 host => 'localhost',
                 port => 4444,
                 browser_start_command => delete $args{browser} || '*firefox',
                 %args,
               };
    croak 'browser_url is mandatory!' unless $self->{browser_url};
    bless $self, $class or die "Can't bless $class: $!";
    return $self;
}

sub start {
    my $self = shift;
    $self->{session_id} = $self->get_string("getNewBrowserSession", 
                                            $self->{browser_start_command}, 
                                            $self->{browser_url});
}

sub stop {
    my $self = shift;
    $self->do_command("testComplete");
    $self->{session_id} = undef;
}

sub do_command {
    my ($self, $command, @args) = @_;
    $command = uri_escape($command);
    my $fullurl = "http://$self->{host}:$self->{port}/selenium-server/driver/"
                  . "\?cmd=$command";
    my $i = 1;
    @args = grep defined, @args;
    while (@args) {
        $fullurl .= "&$i=" . URI::Escape::uri_escape_utf8(shift @args);
        $i++;
    }
    if (defined $self->{session_id}) {
        $fullurl .= "&sessionId=$self->{session_id}";
    }
    print "---> Requesting $fullurl\n" if $self->{verbose};

    # We use the full version of LWP to make sure we issue an 
    # HTTP 1.1 request (SRC-25)
    my $ua = LWP::UserAgent->new;
    my $response = $ua->request( HTTP::Request->new(GET => $fullurl) );
    my $result;
    if ($response->is_success) {
        $result = $response->content;
        print "Got result: $result\n" if $self->{verbose};
    }
    else {
        die "Error requesting $fullurl:\n" . $response->status_line . "\n";
    }
    $result = decode_utf8($result) if $encode_present;
    die "Error requesting $fullurl:\n$result\n" unless $result =~ /^OK/;
    return $result;
}

sub get_string {
    my $self = shift;
    my $result = $self->do_command(@_);
    return substr($result, 3);
}

sub get_string_array {
    my $self = shift;
    my $result = $self->get_string(@_);
    my $token = "";
    my @tokens = ();
    my @chars = split(//, $result);
    for (my $i = 0; $i < @chars; $i++) {
        my $char = $chars[$i];
        if ($char eq '\\') {
            $i++;
            $char = $chars[$i];
            $token .= $char;
        } elsif ($char eq ',') {
            push (@tokens, $token);
            $token = "";
        } else {
            $token .= $char;
        }
    }
    push (@tokens, $token);
    return @tokens;
}

sub get_number {
    my $self = shift;
    my $result = $self->get_string(@_);
    # Is there something else I need to do here?
    return $result;
}

sub get_number_array {
    my $self = shift;
    my @result = $self->get_string_array(@_);
    # Is there something else I need to do here?
    return @result;
}

sub get_boolean {
    my $self = shift;
    my $result = $self->get_string(@_);
    if ($result eq "true") {
        return 1;
    }
    if ($result eq "false") {
        return 0;
    }
    die "result is neither 'true' nor 'false': $result";
}

sub get_boolean_array {
    my $self = shift;
    my @result = $self->get_string_array(@_);
    my @boolarr = ();
    for (my $i = 0; $i < @result; $i++) {
        if ($result[$i] eq "true") {
            push (@boolarr, 1);
            next;
        }
        if ($result[$i] eq "false") {
            push (@boolarr, 1);
            next;
        }
        die "result is neither 'true' nor 'false': ". $result[$i];
    }
    return @boolarr;
}

=head2 METHODS

The following methods are available:

=over

=item $sel = WWW::Selenium-E<gt>new( %args )

Constructs a new C<WWW::Selenium> object, specifying a Selenium Server
host/port, a command to launch the browser, and a starting URL for the
browser.

Options:

=over

=item * C<host>

host is the host name on which the Selenium Server resides.

=item * C<port>

port is the port on which the Selenium Server is listening.

=item * C<browser_url>

browser_url is the starting URL including just a domain name.  We'll
start the browser pointing at the Selenium resources on this URL,
e.g. "http://www.google.com" would send the browser to
"http://www.google.com/selenium-server/SeleneseRunner.html"

=item * C<browser> or C<browser_start_command>

This is the command string used to launch the browser, e.g.
"*firefox", "*iexplore" or "/usr/bin/firefox"

This option may be any one of the following:

=over

=item * C<*firefox [absolute path]>

Automatically launch a new Firefox process using a custom Firefox
profile.
This profile will be automatically configured to use the Selenium
Server as a proxy and to have all annoying prompts
("save your password?" "forms are insecure" "make Firefox your default
browser?" disabled.  You may optionally specify
an absolute path to your firefox executable, or just say "*firefox". 
If no absolute path is specified, we'll look for
firefox.exe in a default location (normally c:\program files\mozilla
firefox\firefox.exe), which you can override by
setting the Java system property C<firefoxDefaultPath> to the correct
path to Firefox.

=item * C<*iexplore [absolute path]>

Automatically launch a new Internet Explorer process using custom
Windows registry settings.
This process will be automatically configured to use the Selenium
Server as a proxy and to have all annoying prompts
("save your password?" "forms are insecure" "make Firefox your default
browser?" disabled.  You may optionally specify
an absolute path to your iexplore executable, or just say "*iexplore". 
If no absolute path is specified, we'll look for
iexplore.exe in a default location (normally c:\program files\internet
explorer\iexplore.exe), which you can override by
setting the Java system property C<iexploreDefaultPath> to the correct
path to Internet Explorer.

=item * C</path/to/my/browser [other arguments]>

You may also simply specify the absolute path to your browser
executable, or use a relative path to your executable (which we'll try
to find on your path).  B<Warning:> If you
specify your own custom browser, it's up to you to configure it
correctly.  At a minimum, you'll need to configure your
browser to use the Selenium Server as a proxy, and disable all
browser-specific prompting.

=back

=back

=cut

### From here on, everything's auto-generated from XML



=item * $sel-E<gt>click($locator)

Clicks on a link, button, checkbox or radio button. If the click action
causes a new page to load (like a link usually does), call
waitForPageToLoad.

$locator is an element locator.  

=cut

sub click {
    my $self = shift;
    $self->do_command("click", @_);
}


=item * $sel-E<gt>fire_event($locator, $event_name)

Explicitly simulate an event, to trigger the corresponding "onI<event>"
handler.

$locator is an element locator.  
$event_name is the event name, e.g. "focus" or "blur".  

=cut

sub fire_event {
    my $self = shift;
    $self->do_command("fireEvent", @_);
}


=item * $sel-E<gt>key_press($locator, $keycode)

Simulates a user pressing and releasing a key.

$locator is an element locator.  
$keycode is the numeric keycode of the key to be pressed, normally the
            ASCII value of that key..  

=cut

sub key_press {
    my $self = shift;
    $self->do_command("keyPress", @_);
}


=item * $sel-E<gt>key_down($locator, $keycode)

Simulates a user pressing a key (without releasing it yet).

$locator is an element locator.  
$keycode is the numeric keycode of the key to be pressed, normally the
            ASCII value of that key..  

=cut

sub key_down {
    my $self = shift;
    $self->do_command("keyDown", @_);
}


=item * $sel-E<gt>key_up($locator, $keycode)

Simulates a user releasing a key.

$locator is an element locator.  
$keycode is the numeric keycode of the key to be released, normally the
            ASCII value of that key..  

=cut

sub key_up {
    my $self = shift;
    $self->do_command("keyUp", @_);
}


=item * $sel-E<gt>mouse_over($locator)

Simulates a user hovering a mouse over the specified element.

$locator is an element locator.  

=cut

sub mouse_over {
    my $self = shift;
    $self->do_command("mouseOver", @_);
}


=item * $sel-E<gt>mouse_down($locator)

Simulates a user pressing the mouse button (without releasing it yet) on
the specified element.

$locator is an element locator.  

=cut

sub mouse_down {
    my $self = shift;
    $self->do_command("mouseDown", @_);
}


=item * $sel-E<gt>type($locator, $value)

Sets the value of an input field, as though you typed it in.

Can also be used to set the value of combo boxes, check boxes, etc. In these cases,
value should be the value of the option selected, not the visible text.


$locator is an element locator.  
$value is the value to type.  

=cut

sub type {
    my $self = shift;
    $self->do_command("type", @_);
}


=item * $sel-E<gt>check($locator)

Check a toggle-button (checkbox/radio)

$locator is an element locator.  

=cut

sub check {
    my $self = shift;
    $self->do_command("check", @_);
}


=item * $sel-E<gt>uncheck($locator)

Uncheck a toggle-button (checkbox/radio)

$locator is an element locator.  

=cut

sub uncheck {
    my $self = shift;
    $self->do_command("uncheck", @_);
}


=item * $sel-E<gt>select($select_locator, $option_locator)

Select an option from a drop-down using an option locator.


Option locators provide different ways of specifying options of an HTML
Select element (e.g. for selecting a specific option, or for asserting
that the selected option satisfies a specification). There are several
forms of Select Option Locator.



=over


=item * B<label>=I<labelPattern>

matches options based on their labels, i.e. the visible text. (This
is the default.)


=over


=item * label=regexp:^[Oo]ther


=back


=item * B<value>=I<valuePattern>

matches options based on their values.


=over


=item * value=other


=back


=item * B<id>=I<id>

matches options based on their ids.


=over


=item * id=option1


=back


=item * B<index>=I<index>

matches an option based on its index (offset from zero).


=over


=item * index=2


=back



=back

If no option locator prefix is provided, the default behaviour is to match on B<label>.



$select_locator is an element locator identifying a drop-down menu.  
$option_locator is an option locator (a label by default).  

=cut

sub select {
    my $self = shift;
    $self->do_command("select", @_);
}


=item * $sel-E<gt>add_selection($locator, $option_locator)

Add a selection to the set of selected options in a multi-select element using an option locator.

@see #doSelect for details of option locators

$locator is an element locator identifying a multi-select box.  
$option_locator is an option locator (a label by default).  

=cut

sub add_selection {
    my $self = shift;
    $self->do_command("addSelection", @_);
}


=item * $sel-E<gt>remove_selection($locator, $option_locator)

Remove a selection from the set of selected options in a multi-select element using an option locator.

@see #doSelect for details of option locators

$locator is an element locator identifying a multi-select box.  
$option_locator is an option locator (a label by default).  

=cut

sub remove_selection {
    my $self = shift;
    $self->do_command("removeSelection", @_);
}


=item * $sel-E<gt>submit($form_locator)

Submit the specified form. This is particularly useful for forms without
submit buttons, e.g. single-input "Search" forms.

$form_locator is an element locator for the form you want to submit.  

=cut

sub submit {
    my $self = shift;
    $self->do_command("submit", @_);
}


=item * $sel-E<gt>open($url)

Opens an URL in the test frame. This accepts both relative and absolute
URLs.

The "open" command waits for the page to load before proceeding,
ie. the "AndWait" suffix is implicit.

I<Note>: The URL must be on the same domain as the runner HTML
due to security restrictions in the browser (Same Origin Policy). If you
need to open an URL on another domain, use the Selenium Server to start a
new browser session on that domain.

$url is the URL to open; may be relative or absolute.  

=cut

sub open {
    my $self = shift;
    $self->do_command("open", @_);
}


=item * $sel-E<gt>select_window($window_i_d)

Selects a popup window; once a popup window has been selected, all
commands go to that window. To select the main window again, use "null"
as the target.

$window_i_d is the JavaScript window ID of the window to select.  

=cut

sub select_window {
    my $self = shift;
    $self->do_command("selectWindow", @_);
}


=item * $sel-E<gt>wait_for_pop_up($window_i_d, $timeout)

Waits for a popup window to appear and load up.

$window_i_d is the JavaScript window ID of the window that will appear.  
$timeout is a timeout in milliseconds, after which the action will return with an error.  

=cut

sub wait_for_pop_up {
    my $self = shift;
    $self->do_command("waitForPopUp", @_);
}


=item * $sel-E<gt>choose_cancel_on_next_confirmation()

By default, Selenium's overridden window.confirm() function will
return true, as if the user had manually clicked OK.  After running
this command, the next call to confirm() will return false, as if
the user had clicked Cancel.


=cut

sub choose_cancel_on_next_confirmation {
    my $self = shift;
    $self->do_command("chooseCancelOnNextConfirmation", @_);
}


=item * $sel-E<gt>answer_on_next_prompt($answer)

Instructs Selenium to return the specified answer string in response to
the next JavaScript prompt [window.prompt()].

$answer is the answer to give in response to the prompt pop-up.  

=cut

sub answer_on_next_prompt {
    my $self = shift;
    $self->do_command("answerOnNextPrompt", @_);
}


=item * $sel-E<gt>go_back()

Simulates the user clicking the "back" button on their browser.


=cut

sub go_back {
    my $self = shift;
    $self->do_command("goBack", @_);
}


=item * $sel-E<gt>refresh()

Simulates the user clicking the "Refresh" button on their browser.


=cut

sub refresh {
    my $self = shift;
    $self->do_command("refresh", @_);
}


=item * $sel-E<gt>close()

Simulates the user clicking the "close" button in the titlebar of a popup
window or tab.


=cut

sub close {
    my $self = shift;
    $self->do_command("close", @_);
}


=item * $sel-E<gt>is_alert_present()

Has an alert occurred?


This function never throws an exception




=cut

sub is_alert_present {
    my $self = shift;
    return $self->get_boolean("isAlertPresent", @_);
}


=item * $sel-E<gt>is_prompt_present()

Has a prompt occurred?


This function never throws an exception




=cut

sub is_prompt_present {
    my $self = shift;
    return $self->get_boolean("isPromptPresent", @_);
}


=item * $sel-E<gt>is_confirmation_present()

Has confirm() been called?


This function never throws an exception




=cut

sub is_confirmation_present {
    my $self = shift;
    return $self->get_boolean("isConfirmationPresent", @_);
}


=item * $sel-E<gt>get_alert()

Retrieves the message of a JavaScript alert generated during the previous action, or fail if there were no alerts.

Getting an alert has the same effect as manually clicking OK. If an
alert is generated but you do not get/verify it, the next Selenium action
will fail.
NOTE: under Selenium, JavaScript alerts will NOT pop up a visible alert
dialog.
NOTE: Selenium does NOT support JavaScript alerts that are generated in a
page's onload() event handler. In this case a visible dialog WILL be
generated and Selenium will hang until someone manually clicks OK.



=cut

sub get_alert {
    my $self = shift;
    return $self->get_string("getAlert", @_);
}


=item * $sel-E<gt>get_confirmation()

Retrieves the message of a JavaScript confirmation dialog generated during
the previous action.


By default, the confirm function will return true, having the same effect
as manually clicking OK. This can be changed by prior execution of the
chooseCancelOnNextConfirmation command. If an confirmation is generated
but you do not get/verify it, the next Selenium action will fail.


NOTE: under Selenium, JavaScript confirmations will NOT pop up a visible
dialog.


NOTE: Selenium does NOT support JavaScript confirmations that are
generated in a page's onload() event handler. In this case a visible
dialog WILL be generated and Selenium will hang until you manually click
OK.




=cut

sub get_confirmation {
    my $self = shift;
    return $self->get_string("getConfirmation", @_);
}


=item * $sel-E<gt>get_prompt()

Retrieves the message of a JavaScript question prompt dialog generated during
the previous action.

Successful handling of the prompt requires prior execution of the
answerOnNextPrompt command. If a prompt is generated but you
do not get/verify it, the next Selenium action will fail.
NOTE: under Selenium, JavaScript prompts will NOT pop up a visible
dialog.
NOTE: Selenium does NOT support JavaScript prompts that are generated in a
page's onload() event handler. In this case a visible dialog WILL be
generated and Selenium will hang until someone manually clicks OK.



=cut

sub get_prompt {
    my $self = shift;
    return $self->get_string("getPrompt", @_);
}


=item * $sel-E<gt>get_absolute_location()

Gets the absolute URL of the current page.


=cut

sub get_absolute_location {
    my $self = shift;
    return $self->get_string("getAbsoluteLocation", @_);
}


=item * $sel-E<gt>is_location($expected_location)

Verify the location of the current page ends with the expected location.
If an URL querystring is provided, this is checked as well.

$expected_location is the location to match.  

=cut

sub is_location {
    my $self = shift;
    return $self->get_boolean("isLocation", @_);
}


=item * $sel-E<gt>get_title()

Gets the title of the current page.


=cut

sub get_title {
    my $self = shift;
    return $self->get_string("getTitle", @_);
}


=item * $sel-E<gt>get_body_text()

Gets the entire text of the page.


=cut

sub get_body_text {
    my $self = shift;
    return $self->get_string("getBodyText", @_);
}


=item * $sel-E<gt>get_value($locator)

Gets the (whitespace-trimmed) value of an input field (or anything else with a value parameter).
For checkbox/radio elements, the value will be "on" or "off" depending on
whether the element is checked or not.

$locator is an element locator.  

=cut

sub get_value {
    my $self = shift;
    return $self->get_string("getValue", @_);
}


=item * $sel-E<gt>get_text($locator)

Gets the text of an element. This works for any element that contains
text. This command uses either the textContent (Mozilla-like browsers) or
the innerText (IE-like browsers) of the element, which is the rendered
text shown to the user.

$locator is an element locator.  

=cut

sub get_text {
    my $self = shift;
    return $self->get_string("getText", @_);
}


=item * $sel-E<gt>get_eval($script)

Gets the result of evaluating the specified JavaScript snippet.  The snippet may 
have multiple lines, but only the result of the last line will be returned.

Note that, by default, the snippet will run in the context of the "selenium"
object itself, so C<this> will refer to the Selenium object, and C<window> will
refer to the top-level runner test window, not the window of your application.
If you need a reference to the window of your application, you can refer
to C<this.browserbot.getCurrentWindow()> and if you need to use
a locator to refer to a single element in your application page, you can
use C<this.page().findElement("foo")> where "foo" is your locator.


$script is the JavaScript snippet to run.  

=cut

sub get_eval {
    my $self = shift;
    return $self->get_string("getEval", @_);
}


=item * $sel-E<gt>get_checked($locator)

Gets whether a toggle-button (checkbox/radio) is checked.  Fails if the specified element doesn't exist or isn't a toggle-button.

$locator is an element locator pointing to a checkbox or radio button.  

=cut

sub get_checked {
    my $self = shift;
    return $self->get_string("getChecked", @_);
}


=item * $sel-E<gt>get_table($table_cell_address)

Gets the text from a cell of a table. The cellAddress syntax
tableLocator.row.column, where row and column start at 0.

$table_cell_address is a cell address, e.g. "foo.1.4".  

=cut

sub get_table {
    my $self = shift;
    return $self->get_string("getTable", @_);
}


=item * $sel-E<gt>is_selected($locator, $option_locator)

Verifies that the selected option of a drop-down satisfies the optionSpecifier.

See the select command for more information about option locators.


$locator is an element locator.  
$option_locator is an option locator, typically just an option label (e.g. "John Smith").  

=cut

sub is_selected {
    my $self = shift;
    return $self->get_boolean("isSelected", @_);
}


=item * $sel-E<gt>get_selected_options($locator)

Gets all option labels for selected options in the specified select or multi-select element.

$locator is an element locator.  

=cut

sub get_selected_options {
    my $self = shift;
    return $self->get_string_array("getSelectedOptions", @_);
}


=item * $sel-E<gt>get_select_options($locator)

Gets all option labels in the specified select drop-down.

$locator is an element locator.  

=cut

sub get_select_options {
    my $self = shift;
    return $self->get_string_array("getSelectOptions", @_);
}


=item * $sel-E<gt>get_attribute($attribute_locator)

Gets the value of an element attribute.

$attribute_locator is an element locator followed by an.  

=cut

sub get_attribute {
    my $self = shift;
    return $self->get_string("getAttribute", @_);
}


=item * $sel-E<gt>is_text_present($pattern)

Verifies that the specified text pattern appears somewhere on the rendered page shown to the user.

$pattern is a pattern to match with the text of the page.  

=cut

sub is_text_present {
    my $self = shift;
    return $self->get_boolean("isTextPresent", @_);
}


=item * $sel-E<gt>is_element_present($locator)

Verifies that the specified element is somewhere on the page.

$locator is an element locator.  

=cut

sub is_element_present {
    my $self = shift;
    return $self->get_boolean("isElementPresent", @_);
}


=item * $sel-E<gt>is_visible($locator)

Determines if the specified element is visible. An
element can be rendered invisible by setting the CSS "visibility"
property to "hidden", or the "display" property to "none", either for the
element itself or one if its ancestors.  This method will fail if
the element is not present.

$locator is an element locator.  

=cut

sub is_visible {
    my $self = shift;
    return $self->get_boolean("isVisible", @_);
}


=item * $sel-E<gt>is_editable($locator)

Determines whether the specified input element is editable, ie hasn't been disabled.
This method will fail if the specified element isn't an input element.

$locator is an element locator.  

=cut

sub is_editable {
    my $self = shift;
    return $self->get_boolean("isEditable", @_);
}


=item * $sel-E<gt>get_all_buttons()

Returns the IDs of all buttons on the page.

If a given button has no ID, it will appear as "" in this array.



=cut

sub get_all_buttons {
    my $self = shift;
    return $self->get_string_array("getAllButtons", @_);
}


=item * $sel-E<gt>get_all_links()

Returns the IDs of all links on the page.

If a given link has no ID, it will appear as "" in this array.



=cut

sub get_all_links {
    my $self = shift;
    return $self->get_string_array("getAllLinks", @_);
}


=item * $sel-E<gt>get_all_fields()

Returns the IDs of all input fields on the page.

If a given field has no ID, it will appear as "" in this array.



=cut

sub get_all_fields {
    my $self = shift;
    return $self->get_string_array("getAllFields", @_);
}


=item * $sel-E<gt>get_html_source()

Returns the entire HTML source between the opening and
closing "html" tags.


=cut

sub get_html_source {
    my $self = shift;
    return $self->get_string("getHtmlSource", @_);
}


=item * $sel-E<gt>set_cursor_position($locator, $position)

Moves the text cursor to the specified position in the given input element or textarea.
This method will fail if the specified element isn't an input element or textarea.

$locator is an element locator pointing to an input element or textarea.  
$position is the numerical position of the cursor in the field; position should be 0 to move the position to the beginning of the field.  You can also set the cursor to -1 to move it to the end of the field..  

=cut

sub set_cursor_position {
    my $self = shift;
    $self->do_command("setCursorPosition", @_);
}


=item * $sel-E<gt>get_cursor_position($locator)

Retrieves the text cursor position in the given input element or textarea; beware, this may not work perfectly on all browsers.

Specifically, if the cursor/selection has been cleared by JavaScript, this command will tend to
return the position of the last location of the cursor, even though the cursor is now gone from the page.  This is filed as SEL-243.

This method will fail if the specified element isn't an input element or textarea, or there is no cursor in the element.

$locator is an element locator pointing to an input element or textarea.  

=cut

sub get_cursor_position {
    my $self = shift;
    return $self->get_number("getCursorPosition", @_);
}


=item * $sel-E<gt>set_context($context, $log_level_threshold)

Writes a message to the status bar and adds a note to the browser-side
log.

If logLevelThreshold is specified, set the threshold for logging
to that level (debug, info, warn, error).
(Note that the browser-side logs will I<not> be sent back to the
server, and are invisible to the Client Driver.)


$context is the message to be sent to the browser.  
$log_level_threshold is one of "debug", "info", "warn", "error", sets the threshold for browser-side logging.  

=cut

sub set_context {
    my $self = shift;
    $self->do_command("setContext", @_);
}


=item * $sel-E<gt>get_expression($expression)

Returns the specified expression.

This is useful because of JavaScript preprocessing.
It is used to generate commands like assertExpression and storeExpression.


$expression is the value to return.  

=cut

sub get_expression {
    my $self = shift;
    return $self->get_string("getExpression", @_);
}


=item * $sel-E<gt>wait_for_condition($script, $timeout)

Runs the specified JavaScript snippet repeatedly until it evaluates to "true".
The snippet may have multiple lines, but only the result of the last line
will be considered.

Note that, by default, the snippet will be run in the runner's test window, not in the window
of your application.  To get the window of your application, you can use
the JavaScript snippet C<selenium.browserbot.getCurrentWindow()>, and then
run your JavaScript in there


$script is the JavaScript snippet to run.  
$timeout is a timeout in milliseconds, after which this command will return with an error.  

=cut

sub wait_for_condition {
    my $self = shift;
    $self->do_command("waitForCondition", @_);
}


=item * $sel-E<gt>set_timeout($timeout)

Specifies the amount of time that Selenium will wait for actions to complete.

Actions that require waiting include "open" and the "waitFor*" actions.

The default timeout is 30 seconds.

$timeout is a timeout in milliseconds, after which the action will return with an error.  

=cut

sub set_timeout {
    my $self = shift;
    $self->do_command("setTimeout", @_);
}


=item * $sel-E<gt>wait_for_page_to_load($timeout)

Waits for a new page to load.

You can use this command instead of the "AndWait" suffixes, "clickAndWait", "selectAndWait", "typeAndWait" etc.
(which are only available in the JS API).
Selenium constantly keeps track of new pages loading, and sets a "newPageLoaded"
flag when it first notices a page load.  Running any other Selenium command after
turns the flag to false.  Hence, if you want to wait for a page to load, you must
wait immediately after a Selenium command that caused a page-load.


$timeout is a timeout in milliseconds, after which this command will return with an error.  

=cut

sub wait_for_page_to_load {
    my $self = shift;
    $self->do_command("waitForPageToLoad", @_);
}

=pod

=back

=cut

1;

__END__

=head1 SEE ALSO

For more information about Selenium Remote Control, visit the website
at L<http://www.openqa.org/selenium-rc/>.

=head1 BUGS

The Selenium Remote Control JIRA issue tracking system is available
online at L<http://jira.openqa.org/browse/SRC>.

=head1 AUTHOR

Maintained by Dan Fabulich <dfabulich@warpmail.net>

=head1 LICENSE

Copyright (c) 2006 ThoughtWorks, Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.


