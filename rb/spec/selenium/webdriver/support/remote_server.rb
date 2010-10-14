require "socket"

module Selenium
  module WebDriver
    module SpecSupport

      #
      # Wrap the standalone jar
      #

      class RemoteServer

        DEFAULT_TIMEOUT = 30

        def initialize(path, opts = {})
          raise Errno::ENOENT, path unless File.exist?(path)
          @path = path

          @host = "127.0.0.1"
          @port = opts[:port] || 4444

          @process = ChildProcess.build("java", "-jar", path, "-port", @port.to_s)
        end

        def start(timeout = DEFAULT_TIMEOUT)
          @process.start
          unless SocketPoller.new(@host, @port, timeout).success?
            raise "remote server not launched in #{timeout} seconds"
          end
        end

        def stop
          @process.stop if @process.alive?
        end

        def url
          "http://#{@host}:#{@port}/wd/hub"
        end
      end

    end # SpecSupport
  end # WebDriver
end # Selenium