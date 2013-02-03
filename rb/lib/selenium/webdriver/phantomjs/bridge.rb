module Selenium
  module WebDriver
    module PhantomJS

      # @api private
      class Bridge < Remote::Bridge

        def initialize(options = {})
          remote_options = {}

          remote_options[:desired_capabilities] = Remote::Capabilities.phantomjs
          remote_options[:http_client] = options.delete(:http_client) if options.has_key? :http_client

          if options.has_key?(:url)
            remote_options[:url] = options.delete(:url)
          else
            service_options = {}
            service_options[:debugger] = options.delete(:debugger) if options.has_key? :debugger
            service_options[:debugger_port] = options.delete(:debugger_port) if options.has_key? :debugger_port

            @service = Service.default_service service_options
            @service.start

            remote_options[:url] = @service.uri
          end

          super remote_options
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
