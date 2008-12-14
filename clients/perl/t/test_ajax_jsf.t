#!/usr/bin/perl
# Copyright 2006 ThoughtWorks, Inc.
# 
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# 
#     http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

use strict;
use warnings;
use lib 'lib';
use Test::WWW::Selenium;
use WWW::Selenium::Util qw(server_is_running);
use Test::More;

my ($host, $port) = server_is_running();
if ($host and $port) {
    plan tests => 3;
}
else {
    plan skip_all => "No selenium server found!";
    exit 0;
}

my $sel = Test::WWW::Selenium->new(
    host        => $host,
    port        => $port,
    browser     => "*firefox",
    browser_url => "http://www.irian.at",
);
my $input_id = 'ac4';
my $update_id = 'ac4update';
$sel->open_ok("http://www.irian.at/selenium-server/tests/html/ajax/ajax_autocompleter2_test.html");
$sel->key_press($input_id, 74);
sleep 1;
$sel->key_press($input_id, 97);
$sel->key_press($input_id, 110);
sleep 1;
# how to assert text/value of input field?
$sel->is_text_present_ok("Jane Agnews");
$sel->key_press($input_id, "\\9");
sleep 1;
$sel->is_text_present_ok("Jane Agnews");
