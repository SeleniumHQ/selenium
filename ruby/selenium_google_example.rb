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
require 'jsrpc'

puts "Go to http://localhost:7896/RpcTestRunner.html"

browser = Selenium::Browser.new.proxy
s = browser.selenium

# Selenium interaction starts here...

s.doOpen("http://www.google.com/")
s.doType("q", "Selenium")
s.assertTextPresent("thoughtworks")
