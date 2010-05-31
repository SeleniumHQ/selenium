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
          if Platform.jruby?
            start_threaded
          elsif Platform.win?
            start_windows
          else
            start_forked
          end

          sleep 0.1 until listening?
        end

        def run
          handler.run(@app, :Host => HOST, :Port => PORT)
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
          elsif defined?(@process) && @process
            @process.kill
          end
        end

        def listening?
          TCPSocket.new(HOST, PORT).close
          true
        rescue
          false
        end

        private

        def handler
          require 'mongrel'
          Rack::Handler::Mongrel
        rescue LoadError
          Rack::Handler::WEBrick
        end

        def start_forked
          @pid = fork { run }
        end

        def start_threaded
          @thread = Thread.new { run }
          sleep 0.5
        end

        def start_windows
          if %w[ie internet_explorer].include? ENV['WD_SPEC_DRIVER']
            # For IE, the combination of Windows + FFI + MRI seems to cause a
            # deadlock with the get() call and the server thread.
            # Workaround by running this file in a subprocess.
            @process = ChildProcess.new("ruby", "-r", "rubygems", __FILE__, @path).start
          else
            start_threaded
          end
        end

      end # RackServer
    end # SpecSupport
  end # WebDriver
end # Selenium

if __FILE__ == $0
  Selenium::WebDriver::SpecSupport::RackServer.new(ARGV.first).run
end
