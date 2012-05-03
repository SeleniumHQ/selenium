module Selenium
  module WebDriver
    module Opera

      #
      # @api private
      #

      class Service
        MISSING_TEXT = 'Unable to find the Selenium server jar.  Please download the standalone server from http://code.google.com/p/selenium/downloads/list and set the SELENIUM_SERVER_JAR environmental variable to its location.  More info at http://code.google.com/p/selenium/wiki/OperaDriver.'

        def self.selenium_server_jar
          @selenium_server_jar ||= (
            ENV['SELENIUM_SERVER_JAR'] or raise Error::WebDriverError, MISSING_TEXT
          )
        end

        def self.selenium_server_jar=(path)
          Platform.assert_file path
          @selenium_server_jar = path
        end

        def self.default_service(opts = {})
          new selenium_server_jar, opts
        end

        def initialize(jar, opts = {})
          opts.merge! :background => true, :port => PortProber.above(4444)
          opts.merge! :log => !!$DEBUG if $DEBUG
          @server = Selenium::Server.new File.expand_path(jar), opts
        end

        def uri
          @server.webdriver_url
        end

        def start
          @server.start
          Platform.exit_hook { stop }  # make sure we don't leave the server running
        end

        def stop
          @server.stop
        end
      end

    end
  end
end
