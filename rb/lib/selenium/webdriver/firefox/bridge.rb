module Selenium
  module WebDriver
    module Firefox

      # @api private
      class Bridge < Remote::Bridge

        def initialize(opts = {})
          port        = opts.delete(:port) || DEFAULT_PORT
          profile     = opts.delete(:profile)
          http_client = opts.delete(:http_client)
          proxy       = opts.delete(:proxy)

          caps = opts.delete(:desired_capabilities) do
            Remote::Capabilities.firefox(:native_events => DEFAULT_ENABLE_NATIVE_EVENTS)
          end

          @launcher = create_launcher(port, profile)

          unless opts.empty?
            raise ArgumentError, "unknown option#{'s' if opts.size != 1}: #{opts.inspect}"
          end

          @launcher.launch

          caps.proxy = proxy if proxy

          remote_opts = {
            :url                  => @launcher.url,
            :desired_capabilities => caps
          }

          remote_opts.merge!(:http_client => http_client) if http_client

          begin
            super(remote_opts)
          rescue
            @launcher.quit
            raise
          end
        end

        def browser
          :firefox
        end

        def driver_extensions
          [
            DriverExtensions::TakesScreenshot,
            DriverExtensions::HasInputDevices
          ]
        end

        def quit
          super
          nil
        ensure
          @launcher.quit
        end

        private

        def create_launcher(port, profile)
          Launcher.new Binary.new, port, profile
        end

      end # Bridge
    end # Firefox
  end # WebDriver
end # Selenium
