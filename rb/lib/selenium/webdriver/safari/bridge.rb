module Selenium
  module WebDriver
    module Safari

      class Bridge < Remote::Bridge
        def initialize(opts = {})
          port = Integer(opts[:port] || PortProber.random)

          @command_id ||= 0

          @server = Server.new(port)
          @server.start

          @browser = Browser.new
          @browser.start(prepare_connect_file)

          @server.wait_for_connection

          super()
        end

        def quit
          super

          @server.stop
          @browser.stop
        end

        private

        def create_session(desired_capabilities)
          resp = raw_execute :newSession, {}, :desiredCapabilities => desired_capabilities
          Remote::Capabilities.json_create resp.fetch('value')
        end

        def raw_execute(command, opts = {}, command_hash = nil)
          @command_id += 1

          opts.merge!(command_hash) if command_hash

          @server.send :id         => @command_id.to_s,
                       :name       => command,
                       :parameters => opts

          @server.receive
        end

        def prepare_connect_file
          # TODO: use tempfile?
          path = File.join(Dir.tmpdir, "safaridriver-#{Time.now.to_i}.html")

          File.open(path, 'w') do |io|
            io << "<!DOCTYPE html><script>window.location = '#{@server.uri}';</script>"
          end

          FileReaper << path

          path
        end

      end

    end
  end
end
