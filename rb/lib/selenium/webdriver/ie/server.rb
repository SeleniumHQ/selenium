module Selenium
  module WebDriver
    module IE
      class Server

        STOP_TIMEOUT = 5

        def self.get
          binary = IE.driver_path || Platform.find_binary("IEDriverServer")
          if binary
            new(binary)
          else
            raise Error::WebDriverError,
              "Unable to find standalone executable. Please download the IEDriverServer from http://code.google.com/p/selenium/downloads/list and place the executable on your PATH."
          end
        end

        attr_accessor :log_level, :log_file

        def initialize(binary_path, opts = {})
          Platform.assert_executable binary_path

          @binary_path = binary_path
          @process = nil

          opts = opts.dup
          @log_level   = opts.delete(:log_level)
          @log_file    = opts.delete(:log_file)

          unless opts.empty?
            raise ArgumentError, "invalid option#{'s' if opts.size != 1}: #{opts.inspect}"
          end

        end

        def start(port, timeout)
          return @port if running?

          @port = port

          @process = ChildProcess.new(@binary_path, *server_args)
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

        private

        def server_args
          args = ["--port=#{@port}"]

          args << "--log-level=#{@log_level.to_s.upcase}" if @log_level
          args << "--log-file=#{@log_file}" if @log_file

          args
        end

      end
    end
  end
end
