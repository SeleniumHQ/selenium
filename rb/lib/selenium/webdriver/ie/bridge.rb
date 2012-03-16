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
          timeout     = opts.delete(:timeout) { DEFAULT_TIMEOUT }
          port        = opts.delete(:port) { DEFAULT_PORT }
          http_client = opts.delete(:http_client)
          ignore_mode = opts.delete(:introduce_flakiness_by_ignoring_security_domains)

          unless opts.empty?
            raise ArgumentError, "unknown option#{'s' if opts.size != 1}: #{opts.inspect}"
          end

          @server = Server.new
          @port = @server.start Integer(port), timeout

          caps = Remote::Capabilities.internet_explorer
          if ignore_mode
            caps['ignoreProtectedModeSettings'] = true
          end

          remote_opts = {
            :url => @server.uri,
            :desired_capabilities => caps
          }

          remote_opts[:http_client] = http_client if http_client

          super(remote_opts)
        end

        def browser
          :internet_explorer
        end

        def driver_extensions
          [DriverExtensions::TakesScreenshot, DriverExtensions::HasInputDevices]
        end

        def quit
          super
          @server.stop

          nil
        end

      end # Bridge
    end # IE
  end # WebDriver
end # Selenium
