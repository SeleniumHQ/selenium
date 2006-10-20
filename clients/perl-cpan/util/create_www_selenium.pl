#!/usr/bin/perl
use strict;
use warnings;
use lib 'util';
use XMLParseUtils qw/strip_blockquotes/;

my $iedoc = read_iedoc_xml();

# Convert HTML formatting into POD
$iedoc =~ s{^<\?.+?<top>}{#}s;          # xml header
$iedoc =~ s#^<p>([^<]+)</p>$#\n$1\n#smg;        # p's should be spaced out a bit
$iedoc =~ s#^</?(?:p|dl)>##smg;           # <p>s and <dl>s on their own line
$iedoc =~ s#</?(?:p|dl)>##g;                # <p>s and <dl>s 
$iedoc =~ s#<a name="[^"]+">([^<]*)</a>#$1#g;        # don't need anchors
$iedoc =~ s#<h3>([^<]+)</h3>#=head3 $1#g;       # headings
$iedoc =~ s#<em>([^<]+)</em>#I<$1>#g;           # italics
$iedoc =~ s#<strong>([^<]+)</strong>#B<$1>#g;   # italics
$iedoc =~ s#</?dd>#\n#gs;                # item text
$iedoc =~ s#<dt>(.+?)</dt>#=item $1\n#g;        # list items
$iedoc =~ s#<ul[^>]+>#\n=over\n\n#g;           # ul start
$iedoc =~ s#<li>(.+?)</li>#=item * $1\n\n#g;  # ul item
$iedoc =~ s#</ul>#=back\n\n#g;                # ul end

# Un-escape characters
$iedoc =~ s/&#(\d+);/sprintf('%c', $1)/eg;
$iedoc =~ s/&quot;/"/g;

$iedoc = strip_blockquotes($iedoc);

$iedoc =~ s#\n{2,}#\n\n#g;

$iedoc =~ s#^(.+?)</top>##s;
my $selenium_description = $1;

print <<'EOT', $selenium_description;
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

EOT

exit;

sub read_iedoc_xml {
    my $iedoc_file = 'iedoc.xml';
    die "Can't find iedoc.xml" unless -e $iedoc_file;
    open (my $fh, $iedoc_file) or die "Can't open $iedoc_file: $!";
    {
        local $/ = undef;
        $iedoc = <$fh>;
    }
    close $fh;
    return $iedoc;
}
