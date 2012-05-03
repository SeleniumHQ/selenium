module Selenium
  module WebDriver
    module Safari

      class Bridge < Remote::Bridge
        COMMAND_TIMEOUT = 60


        def initialize(opts = {})
          port = Integer(opts[:port] || PortProber.random)
          timeout = Integer(opts[:timeout] || COMMAND_TIMEOUT)

          @command_id ||= 0

          @server = Server.new(port, timeout)
          @server.start

          @browser = Browser.new
          @browser.start(prepare_connect_file)

          @server.wait_for_connection

          super(:desired_capabilities => :safari)
        end

        def quit
          super

          @server.stop
          @browser.stop
        end

        def driver_extensions
          []
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

          if raw['id'] != @command_id.to_s
            raise Error::WebDriverError, "response id does not match command id"
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

      end

    end
  end
end
