# Copyright 2004 ThoughtWorks, Inc
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
require 'selenese'

puts "Go to http://localhost:7896/SeleneseRunner.html"

browser = Selenium::Browser.new.proxy

# Send some commands to the browser
puts browser.doCommand('|open|/tests/html/test_click_page1.html||')
puts browser.doCommand('|verifyText|link|Click here for next page|')
puts browser.doCommand('|clickAndWait|link||')
puts browser.doCommand('|verifyLocation|/tests/html/test_click_page2.html||')
puts browser.doCommand('|clickAndWait|previousPage||')

# These examples use method_missing
puts browser.verifyText("link", "This is WRONG")
puts browser.verifyElementPresent("link")

#finish the test
puts browser.doCommand('|testComplete|')