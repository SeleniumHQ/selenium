module Selenium
  module WebDriver
    module PhantomJS


      # @api private
      class Bridge < Remote::Bridge

        def initialize(opts = {})
          http_client = opts.delete(:http_client)
          caps        = opts.delete(:desired_capabilities) { Remote::Capabilities.phantomjs }

          if opts.has_key?(:url)
            url = opts.delete(:url)
          else
            args = opts.delete(:args) || caps['phantomjs.cli.args']
            port = opts.delete(:port)

            @service = Service.default_service(port)
            @service.start(args)

            url = @service.uri
          end

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
