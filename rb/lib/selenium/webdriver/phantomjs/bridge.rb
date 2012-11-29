module Selenium
  module WebDriver
    module PhantomJS

      # @api private
      class Bridge < Remote::Bridge

        def initialize(opts = {})
          http_client = opts.delete(:http_client)

          if opts.has_key?(:url)
            url = opts.delete(:url)
          else
            @service = Service.default_service
            @service.start

            url = @service.uri
          end

          caps = Remote::Capabilities.phantomjs

          remote_opts = {
            :url                  => url,
            :desired_capabilities => caps
          }

          remote_opts.merge!(:http_client => http_client) if http_client

          super(remote_opts)
        end

        def browser
          :phantomjs
        end

        def driver_extensions
          [
            DriverExtensions::TakesScreenshot,
            DriverExtensions::HasInputDevices
          ]
        end

        def capabilities
          @capabilities ||= Remote::Capabilities.phantomjs
        end

        def quit
          super
        ensure
          @service.stop if @service
        end

      end # Bridge
    end # PhantomJS
  end # WebDriver
end # Selenium
