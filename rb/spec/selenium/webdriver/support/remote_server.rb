require "socket"

module Selenium
  module WebDriver
    module SpecSupport

      #
      # Launch the remote server (through ./go)
      #

      class RemoteServer

        def initialize
          @host = "127.0.0.1"
          @port = 4444 # TODO: random port - env var maybe?

          @build = Build.new("//remote/server:server:run")
        end

        def start
          @build.go
          sleep 1 until listening?
        end

        def stop
          @build.kill
        end

        def url
          "http://#{@host}:#{@port}/wd/hub"
        end

        private

        def listening?
          $stderr.puts "waiting for #{url}"
          TCPSocket.new(@host, @port).close
          true
        rescue Errno::ECONNREFUSED
          false
        end
      end

    end # SpecSupport
  end # WebDriver
end # Selenium