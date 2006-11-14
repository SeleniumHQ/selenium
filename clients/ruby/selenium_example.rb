#!/usr/bin/env ruby

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


require 'test/unit'
require 'selenium'

class ExampleTest < Test::Unit::TestCase
    include SeleniumHelper
    
    def setup
        @selenium = Selenium::SeleniumDriver.new("localhost", 4444, "*firefox", "http://www.irian.at", 10000);
        @selenium.start
    end
    
    def teardown
        @selenium.stop
    end

    def test_something
        input_id = 'ac4'
        update_id = 'ac4update'
        
        open "http://www.irian.at/selenium-server/tests/html/ajax/ajax_autocompleter2_test.html"
        key_press input_id, 74
        sleep 0.5
        key_press input_id, 97
        key_press input_id, 110
        sleep 0.5
        assert_equal('Jane Agnews', get_text(update_id))
        key_press input_id, '\9'
        sleep 0.5
        assert_equal('Jane Agnews', get_value(input_id))
    end
    
end