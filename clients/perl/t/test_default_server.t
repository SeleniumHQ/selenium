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

use Test::WWW::Selenium;

use lib 't/lib';
use SeleniumUtil qw(server_is_running);
use Test::More;
if (server_is_running) {
    plan tests => 6;
}
else {
    plan skip_all => "No selenium server found!";
    exit 0;
}


my $sel = Test::WWW::Selenium->new( host => "localhost", 
                                      port => 4444, 
                                      browser => "*firefox", 
                                      browser_url => "http://localhost:4444",
                                    );
$sel->open_ok("/selenium-server/tests/html/test_click_page1.html");
$sel->text_contains("link", "Click here for next page", "link contains expected text");
@links = $sel->get_all_links();
ok(@links > 3);
is($links[3], "linkToAnchorOnThisPage");
$sel->click("link");
$sel->wait_for_page_to_load(5000);
$sel->location_like(qr"/selenium-server/tests/html/test_click_page2.html");
$sel->click("previousPage");
$sel->wait_for_page_to_load(5000);
$sel->location_like(qr"/selenium-server/tests/html/test_click_page1.html");
