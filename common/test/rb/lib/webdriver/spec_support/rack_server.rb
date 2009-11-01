require "rack"

module WebDriver
  module SpecSupport
    class RackServer

      HOST = 'localhost'
      PORT = 8182

      def initialize
        @app = Rack::File.new("#{File.dirname(__FILE__)}/../../../../../src/web")
      end

      def start
        @pid = fork { Rack::Handler::WEBrick.run(@app, :Host => HOST, :Port => PORT) }
        sleep 2
      end

      def where_is(file)
        "http://#{HOST}:#{PORT}/#{file}"
      end

      def stop
        if @pid
          Process.kill(:INT, @pid)
          Process.waitpid(@pid)
        end
      end

    end # RackServer
  end # SpecSupport
end # WebDriver
