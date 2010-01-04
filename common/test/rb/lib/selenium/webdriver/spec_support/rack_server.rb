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
          if [:windows, :java].include? Platform.platform
            @thread = Thread.new { run }
          else
            @pid = fork { run }
          end
          sleep 2
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

      end # RackServer
    end # SpecSupport
  end # WebDriver
end # Selenium
