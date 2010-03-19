require "rack"

module Selenium
  module WebDriver
    module SpecSupport
      class RackServer

        HOST = 'localhost'
        PORT = 8182

        def initialize(path)
          @path = path
          @app  = Rack::File.new(path)
        end

        def start
          if Platform.jruby? || Platform.win?
            @thread = Thread.new { run }
          else
            @pid = fork { run }
          end

          sleep 0.1 until listening?
        end

        def run
          Rack::Handler::WEBrick.run(@app, :Host => HOST, :Port => PORT)
        end

        def where_is(file)
          "http://#{HOST}:#{PORT}/#{file}"
        end

        def stop
          if defined?(@thread) && @thread
            @thread.kill
          elsif defined?(@pid) && @pid
            Process.kill('KILL', @pid)
            Process.waitpid(@pid)
          end
        end

        def listening?
          TCPSocket.new(HOST, PORT).close
          true
        rescue
          false
        end

      end # RackServer
    end # SpecSupport
  end # WebDriver
end # Selenium
