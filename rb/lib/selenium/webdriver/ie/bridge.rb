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
          caps           = opts.delete(:desired_capabilities) { Remote::Capabilities.internet_explorer }
          timeout        = opts.delete(:timeout) { DEFAULT_TIMEOUT }
          port           = opts.delete(:port) { PortProber.above(DEFAULT_PORT) }
          http_client    = opts.delete(:http_client)
          ignore_mode    = opts.delete(:introduce_flakiness_by_ignoring_security_domains)
          native_events  = opts.delete(:native_events) != false
          implementation = opts.delete(:implementation)

          @server = Server.get(:implementation => implementation)

          @server.log_level = opts.delete(:log_level) if opts[:log_level]
          @server.log_file  = opts.delete(:log_file) if opts[:log_file]

          unless opts.empty?
            raise ArgumentError, "unknown option#{'s' if opts.size != 1}: #{opts.inspect}"
          end

          @port = @server.start Integer(port), timeout

          if ignore_mode
            caps['ignoreProtectedModeSettings'] = true
          end

          caps['nativeEvents'] = native_events

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
          nil
        ensure
          @server.stop
        end

      end # Bridge
    end # IE
  end # WebDriver
end # Selenium
