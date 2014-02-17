module Selenium
  module WebDriver
    module Safari

      class Bridge < Remote::Bridge
        COMMAND_TIMEOUT = 60

        def initialize(opts = {})
          timeout     = Integer(opts[:timeout] || COMMAND_TIMEOUT)
          caps        = fetch_capability_options(opts)
          safari_opts = caps['safari.options']

          @command_id ||= 0

          unless safari_opts['skipExtensionInstallation']
            @extension = Extension.new(:data_dir => safari_opts['dataDir'])
            @extension.install
          end

          # TODO: handle safari_opts['cleanSession']
          @server = Server.new(safari_opts['port'], timeout)
          @server.start

          @safari = Browser.new
          @safari.start(prepare_connect_file)

          @server.wait_for_connection

          super(desired_capabilities: caps)
        end

        def quit
          super

          @server.stop
          @safari.stop
          @extension && @extension.uninstall
        end

        def driver_extensions
          [
            DriverExtensions::TakesScreenshot,
            DriverExtensions::HasInputDevices
          ]
        end

        private

        def create_session(desired_capabilities)
          resp = raw_execute :newSession, {}, :desiredCapabilities => desired_capabilities
          Remote::Capabilities.json_create resp.fetch('value')
        end

        def raw_execute(command, opts = {}, command_hash = nil)
          @command_id += 1

          params = {}
          opts.each do |key, value|
            params[camel_case(key.to_s)] = value
          end

          params.merge!(command_hash) if command_hash

          @server.send(
            :origin  => "webdriver",
            :type    => "command",
            :command => { :id => @command_id.to_s, :name => command, :parameters => params}
          )

          raw = @server.receive
          response = raw.fetch('response')

          status_code = response['status']
          if status_code != 0
            raise Error.for_code(status_code), response['value']['message']
          end

          if raw['id'].to_s != @command_id.to_s
            raise Error::WebDriverError, "response id does not match command id: #{raw['id']} != #{@command_id}"
          end

          response
        end

        def camel_case(str)
          parts = str.split('_')
          parts[1..-1].map { |e| e.capitalize! }

          parts.join
        end

        def prepare_connect_file
          # TODO: use tempfile?
          path = File.join(Dir.tmpdir, "safaridriver-#{Time.now.to_i}.html")

          File.open(path, 'w') do |io|
            io << "<!DOCTYPE html><script>window.location = '#{@server.uri}';</script>"
          end

          FileReaper << path
          path.gsub! "/", "\\" if Platform.windows?

          path
        end

        def fetch_capability_options(opts)
          # TODO: deprecate
          #
          #   :custom_data_dir (replaced by :data_dir)
          #   :install_extension (replaced by :skip_extension_installation)

          capabilities   = opts.fetch(:desired_capabilities) { Remote::Capabilities.safari }
          safari_options = capabilities['safari.options'] ||= {}

          port          = Integer(opts[:port] || safari_options['port'] || PortProber.random)
          data_dir      = opts[:custom_data_dir] || opts[:data_dir] || safari_options['dataDir']
          clean_session = opts.fetch(:clean_session) { safari_options['cleanSession'] }

          skip_extension = false

          if opts.key?(:install_extension)
            skip_extension = !opts[:install_extension]
          elsif opts.key?(:skip_extension_installation)
            skip_extension = opts[:skip_extension_installation]
          elsif safari_options['skipExtensionInstallation'] != nil
            skip_extension = opts['skipExtensionInstallation']
          end

          safari_options['port']                      = port
          safari_options['skipExtensionInstallation'] = skip_extension
          safari_options['dataDir']                   = data_dir
          safari_options['cleanSession']              = clean_session

          # TODO: customDriverExtension

          capabilities
        end

      end

    end
  end
end
