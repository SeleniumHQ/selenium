module Selenium
  module WebDriver
    module IE

      #
      # @api private
      #

      class Bridge < Remote::Bridge

        HOST            = Platform.localhost
        DEFAULT_PORT    = 5555
        DEFAULT_TIMEOUT = 30

        def initialize(opts = {})
          timeout = opts[:timeout] || DEFAULT_TIMEOUT
          @port   = opts[:port] || DEFAULT_PORT
          @speed  = opts[:speed] || :fast

          @server_pointer = Lib.start_server @port

          host = Platform.localhost

          unless SocketPoller.new(host, @port, timeout).connected?
            raise "unable to connect to IE server within #{timeout} seconds"
          end

          super(:url                  => "http://#{host}:#{@port}",
                :desired_capabilities => :internet_explorer)
        end

        def browser
          :internet_explorer
        end

        def driver_extensions
          [DriverExtensions::TakesScreenshot, DriverExtensions::HasInputDevices]
        end

        def quit
          super
          Lib.stop_server(@server_pointer)

          nil
        end

      end # Bridge
    end # IE
  end # WebDriver
end # Selenium
