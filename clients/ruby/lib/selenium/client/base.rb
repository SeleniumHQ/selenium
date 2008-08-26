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
#
#
# Original code by Aslak Hellesoy and Darren Hobbs
#
module Selenium
  module Client
    
    module Base
      include Selenium::Client::SeleneseClient
      include Selenium::Client::GeneratedDriver
  
      def initialize(server_host, server_port, browser_string, browser_url, timeout=30000)
        @server_host = server_host
        @server_port = server_port
        @browser_string = browser_string
        @browser_url = browser_url
        @timeout = timeout
        @extension_js = ""
        @session_id = nil
      end
      
      def set_extension_js(extension_js)
        @extension_js = extension_js
      end
      
      def start()
        result = get_string("getNewBrowserSession", [@browser_string, @browser_url, @extension_js])
        @session_id = result
      end
      
      def stop()
        do_command("testComplete", [])
        @session_id = nil
      end

      def start_new_browser_session
        start
      end
      
      def close_current_browser_session
        stop
      end
      
      def session_started?
        not @session_id.nil?
      end
      
      def chrome_backend?
        ["*chrome", "*firefox", "*firefox2", "*firefox3"].include?(@browser_string)
      end
      
    end
  
  end
end
