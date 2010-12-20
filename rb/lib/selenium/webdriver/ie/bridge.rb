module Selenium
  module WebDriver
    module IE

      #
      # @api private
      #

      class Bridge < Remote::Bridge

        HOST = "localhost"

        DEFAULT_PORT    = 5555
        DEFAULT_TIMEOUT = 30

        def initialize(opts = {})
          timeout = opts[:timeout] || DEFAULT_TIMEOUT
          @port   = opts[:port] || DEFAULT_PORT
          @speed  = opts[:speed] || :fast

          @server_pointer = Lib.start_server @port

          unless SocketPoller.new(HOST, @port, timeout).connected?
            raise "unable to connect to IE server within #{timeout} seconds"
          end

          super(:url                  => "http://#{HOST}:#{@port}",
                :desired_capabilities => :internet_explorer)
        end

        def browser
          :internet_explorer
        end

        def driver_extensions
          []
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
