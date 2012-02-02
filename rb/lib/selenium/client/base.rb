module Selenium
  module Client

		# Driver constructor and session management commands
    module Base
      include Selenium::Client::Protocol
      include Selenium::Client::GeneratedDriver
      include Selenium::Client::Extensions
      include Selenium::Client::Idiomatic

      attr_reader :host, :port, :browser_string, :browser_url,
                  :default_timeout_in_seconds,
                  :default_javascript_framework,
                  :highlight_located_element_by_default

      #
      # Create a new client driver
      #
      # Example:
      #
      # Selenium::Client::Driver.new \
      #     :host => "localhost",
      #     :port => 4444,
      #     :browser => "*firefox",
      #     :timeout_in_seconds => 10,
      #     :url => "http://localhost:3000",
      #
      # You can also set the default javascript framework used for :wait_for
      # AJAX and effects semantics (:prototype is the default value):
      #
      # Selenium::Client::Driver.new \
      #     :host => "localhost",
      #     :port => 4444,
      #     :browser => "*firefox",
      #     :timeout_in_seconds => 10,
      #     :url => "http://localhost:3000",
      #     :javascript_framework => :jquery
      #
      # You can also enables automatic highlighting of located elements
      # by passing the highlight_located_element option, e.g.
      #
      # Selenium::Client::Driver.new \
      #     :host => "localhost",
      #     :port => 4444,
      #     :browser => "*firefox",
      #     :highlight_located_element => true
      #
      def initialize(*args)
        if args[0].kind_of?(Hash)
          options = args[0]
          @host = options[:host]
          @port = options[:port].to_i
          @browser_string = options[:browser]
          @browser_url = options[:url]
          @default_timeout_in_seconds = (options[:timeout_in_seconds] || 300).to_i
          @default_javascript_framework = options[:javascript_framework] || :prototype
          @highlight_located_element_by_default = options[:highlight_located_element] || false
        else
          @host = args[0]
          @port = args[1].to_i
          @browser_string = args[2]
          @browser_url = args[3]
          @default_timeout_in_seconds = (args[4] || 300).to_i
          @default_javascript_framework = :prototype
          @highlight_located_element_by_default = false
        end

        @extension_js = ""
        @session_id = nil
      end

      def session_started?
        not @session_id.nil?
      end

      # Starts a new browser session (launching a new browser matching
      # configuration provided at driver creation time).
      #
      # Browser session specific option can also be provided. e.g.
      #
      #    driver.start_new_browser_session(:captureNetworkTraffic => true)
      #
      def start_new_browser_session(options={})
        start_args = [@browser_string, @browser_url, @extension_js]

        if driver = options.delete(:driver)
          expected_browser_string = "*webdriver"
          unless @browser_string == expected_browser_string
            raise ArgumentError, "can't use :driver unless the browser string is #{expected_browser_string.inspect} (got #{@browser_string.inspect})"
          end

          sid = driver.capabilities['webdriver.remote.sessionid']
          sid or raise ArgumentError, "This driver can not be wrapped in the RC API."

          start_args << "webdriver.remote.sessionid=#{sid}"
        end

        start_args << options.collect {|key,value| "#{key.to_s}=#{value.to_s}"}.sort.join(";")

        @session_id = string_command "getNewBrowserSession", start_args
        # Consistent timeout on the remote control and driver side.
        # Intuitive and this is what you want 90% of the time
        self.remote_control_timeout_in_seconds = @default_timeout_in_seconds
        self.highlight_located_element = true if highlight_located_element_by_default
      end

      def close_current_browser_session
        remote_control_command "testComplete" if @session_id
        @session_id = nil
      end

      def start(opts = {})
        start_new_browser_session opts
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
	    alias :set_extension_js :javascript_extension=

    end

  end
end
