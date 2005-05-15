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
require 'selenium'

selenium = Selenium::WebrickCommandProcessor.new.proxy

#browser = Selenium::WindowsIEBrowserLauncher.new
browser = Selenium::WindowsDefaultBrowserLauncher.new
#browser = Selenium::UnixSpecifiedPathBrowserLauncher.new('open -a /Applications/Firefox.app')
browser.launch("http://localhost:7896/selenium-driver/SeleneseRunner.html")

# Send some commands to the browser
puts selenium.open('/test_click_page1.html')
puts selenium.verify_text('link', 'Click here for next page')
puts selenium.click_and_wait('link')
puts selenium.verify_location('/test_click_page2.html')
puts selenium.click_and_wait('previousPage')

begin
  puts selenium.verify_text("link", "This is WRONG") # should fail
rescue SeleniumCommandError
  puts 'expected error occurred'
else
  puts 'FAIL -- expected error not thrown'
end

puts selenium.verify_element_present("link")
puts selenium.test_complete()

browser.close