module Selenium
  module Client
    
		# Driver constructor and session management commands
		#
		# Original code by Aslak Hellesoy and Darren Hobbs
    module Base
      include Selenium::Client::Protocol
      include Selenium::Client::GeneratedDriver
      include Selenium::Client::Extensions
      include Selenium::Client::Idiomatic

      attr_reader :browser_string
  
      def initialize(server_host, server_port, browser_string, browser_url, timeout_in_seconds=300)
        @server_host = server_host
        @server_port = server_port
        @browser_string = browser_string
        @browser_url = browser_url
        @timeout = timeout_in_seconds
        @extension_js = ""
        @session_id = nil
      end
      
      def session_started?
        not @session_id.nil?
      end

      def start_new_browser_session
        result = string_command "getNewBrowserSession", [@browser_string, @browser_url, @extension_js]
        @session_id = result
        # Consistent timeout on the remote control and driver side.
        # Intuitive and this is what you want 90% of the time
        self.remote_control_timeout_in_seconds = @timeout 
      end
      
      def close_current_browser_session
        remote_control_command "testComplete"
        @session_id = nil
      end
      
      def start
        start_new_browser_session
      end
      
      def stop
	      close_current_browser_session
      end
            
      def chrome_backend?
        ["*chrome", "*firefox", "*firefox2", "*firefox3"].include?(@browser_string)
      end

      def javascript_extension=(new_javascript_extension)
        @extension_js = new_javascript_extension
	    end
	
      def set_extension_js(new_javascript_extension)
	      javascript_extension = new_javascript_extension
      end
      
    end
  
  end
end
