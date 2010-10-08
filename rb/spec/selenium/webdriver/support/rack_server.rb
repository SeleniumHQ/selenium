require "rack"
require "socket"

module Selenium
  module WebDriver
    module SpecSupport
      class RackServer

        START_TIMEOUT = 15

        def initialize(path, port = nil)
          @path = path
          @app  = Rack::File.new(path)

          @host = "127.0.0.1"
          @port = Integer(port || find_free_port_above(8180))
        end

        def start
          if Platform.jruby?
            start_threaded
          elsif Platform.win?
            start_windows
          else
            start_forked
          end

          unless SocketPoller.new(@host, @port, START_TIMEOUT).success?
            raise "rack server not launched in #{START_TIMEOUT} seconds"
          end
        end

        def run
          handler.run(@app, :Host => @host, :Port => @port)
        end

        def where_is(file)
          "http://#{@host}:#{@port}/#{file}"
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


        private

        def handler
          handler = %w[thin mongrel webrick].find { |h| load_handler h }

          constant = handler == 'webrick' ? "WEBrick" : handler.capitalize
          Rack::Handler.const_get constant
        end

        def load_handler(handler)
          require handler
          true
        rescue LoadError
          false
        end

        def find_free_port_above(port)
          try_port = port
          begin
            TCPServer.new(@host, try_port).close
          rescue
            raise if try_port > port + 100
            try_port += 1
            retry
          end

          try_port
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
            @process = ChildProcess.build("ruby", "-r", "rubygems", __FILE__, @path, @port).start
          else
            start_threaded
          end
        end

      end # RackServer
    end # SpecSupport
  end # WebDriver
end # Selenium

if __FILE__ == $0
  Selenium::WebDriver::SpecSupport::RackServer.new(ARGV[0], ARGV[1]).run
end
