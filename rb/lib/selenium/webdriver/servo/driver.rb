module Selenium
  module WebDriver
    module Servo
      class Driver < WebDriver::Driver
        include DriverExtensions::HasTouchScreen
        include DriverExtensions::HasWebStorage
        include DriverExtensions::TakesScreenshot

        def initialize(opts = {})
          opts[:desired_capabilities] = Selenium::WebDriver::Remote::Capabilities.new

          unless opts.key?(:url)
            driver_path = opts.delete(:driver_path)
            port = opts.delete(:port) || Service::DEFAULT_PORT

            opts[:driver_opts] ||= {}
            if opts.key? :service_log_path
              WebDriver.logger.deprecate ':service_log_path', "driver_opts: {log_path: '#{opts[:service_log_path]}'}"
              opts[:driver_opts][:log_path] = opts.delete :service_log_path
            end

            if opts.key? :service_args
              WebDriver.logger.deprecate ':service_args', "driver_opts: {args: #{opts[:service_args]}}"
              opts[:driver_opts][:args] = opts.delete(:service_args)
            end

            @service = Service.new(driver_path, port, opts.delete(:driver_opts))
            @service.start

            opts[:url] = @service.uri
          end

          listener = opts.delete(:listener)
          @bridge = Remote::Bridge.handshake(opts)
          super(@bridge, listener: listener)
        end

        def browser
          :servo
        end

        def quit
          super
        ensure
          @service.stop if @service
        end

        private

        #def create_capabilities(opts)
        #  caps = opts.delete(:desired_capabilities) { Remote::Capabilities.chrome }
        #  options = opts.delete(:options) { Options.new }

        #  args = opts.delete(:args) || opts.delete(:switches)
        #  if args
        #    WebDriver.logger.deprecate ':args or :switches', 'Selenium::WebDriver::Chrome::Options#add_argument'
        #    raise ArgumentError, ':args must be an Array of Strings' unless args.is_a? Array
        #    args.each { |arg| options.add_argument(arg.to_s) }
        #  end

        #  profile = opts.delete(:profile)
        #  if profile
        #    profile = profile.as_json

        #    if options.args.none? { |arg| arg =~ /user-data-dir/ }
        #      options.add_argument("--user-data-dir=#{profile[:directory]}")
        #    end

        #    if profile[:extensions]
        #      WebDriver.logger.deprecate 'Using Selenium::WebDriver::Chrome::Profile#extensions',
        #                                 'Selenium::WebDriver::Chrome::Options#add_extension'
        #      profile[:extensions].each do |extension|
        #        options.add_encoded_extension(extension)
        #      end
        #    end
        #  end

        #  detach = opts.delete(:detach)
        #  options.add_option(:detach, true) if detach

        #  prefs = opts.delete(:prefs)
        #  if prefs
        #    WebDriver.logger.deprecate ':prefs', 'Selenium::WebDriver::Chrome::Options#add_preference'
        #    prefs.each do |key, value|
        #      options.add_preference(key, value)
        #    end
        #  end

        #  options = options.as_json
        #  caps[:chrome_options] = options unless options.empty?

        #  caps[:proxy] = opts.delete(:proxy) if opts.key?(:proxy)
        #  caps[:proxy] ||= opts.delete('proxy') if opts.key?('proxy')

        #  caps
        #end
      end # Driver
    end # Chrome
  end # WebDriver
end # Selenium
