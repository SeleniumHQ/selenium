module Selenium
  module WebDriver
    module Firefox

      # @api private
      class Bridge < Remote::Bridge

        def initialize(opts = {})
          @launcher   = create_launcher(opts)

          http_client = opts.delete(:http_client)

          unless opts.empty?
            raise ArgumentError, "unknown option#{'s' if opts.size != 1}: #{opts.inspect}"
          end

          @launcher.launch

          remote_opts = {
            :url                  => @launcher.url,
            :desired_capabilities => :firefox
          }

          remote_opts.merge!(:http_client => http_client) if http_client

          super(remote_opts)
        end

        def browser
          :firefox
        end

        def driver_extensions
          [DriverExtensions::TakesScreenshot]
        end

        def quit
          super
          @launcher.quit

          nil
        end

        private

        def create_launcher(opts)
          Launcher.new(
            Binary.new,
            opts.delete(:port) || DEFAULT_PORT,
            opts.delete(:profile)
          )
        end

      end # Bridge
    end # Firefox
  end # WebDriver
end # Selenium
