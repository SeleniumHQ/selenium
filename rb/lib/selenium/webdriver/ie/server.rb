module Selenium
  module WebDriver
    module IE
      class Server

        STOP_TIMEOUT = 5

        def self.get
          binary = Platform.find_binary("IEDriverServer")
          if binary
            new(binary)
          else
            raise Error::WebDriverError,
              "Unable to find standalone executable. Please download the IEDriverServer from http://code.google.com/p/selenium/downloads/list and place the executable on your PATH."
          end
        end

        def initialize(binary_path)
          Platform.assert_executable binary_path

          @binary_path = binary_path
          @process     = nil
        end

        def start(port, timeout)
          return @port if running?

          @port = port

          @process = ChildProcess.new(@binary_path, "--port=#{@port}")
          @process.io.inherit! if $DEBUG
          @process.start

          unless SocketPoller.new(Platform.localhost, @port, timeout).connected?
            raise Error::WebDriverError, "unable to connect to IE server within #{timeout} seconds"
          end

          Platform.exit_hook { stop }

          @port
        end

        def stop
          if running?
            @process.stop STOP_TIMEOUT
          end
        end

        def port
          @port
        end

        def uri
          "http://#{Platform.localhost}:#{port}"
        end

        def running?
          @process && @process.alive?
        end

      end
    end
  end
end
