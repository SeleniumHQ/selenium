require 'rack'
require 'socket'

module Selenium
  module WebDriver
    module SpecSupport
      class RackServer

        START_TIMEOUT = 30

        def initialize(path, port = nil)
          @path = path
          @app  = TestApp.new(path)

          @host = ENV['localhost'] || 'localhost'
          @port = Integer(port || PortProber.above(8180))
        end

        def start
          if Platform.jruby?
            start_threaded
          elsif Platform.windows?
            start_windows
          else
            start_forked
          end

          unless SocketPoller.new(@host, @port, START_TIMEOUT).connected?
            raise "rack server not launched in #{START_TIMEOUT} seconds"
          end
        end

        def run
          handler.run @app, :Host => @host, :Port => @port
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
            @process.stop
          end
        end

        private

        def handler
          # can't use Platform here since it's being run as a file on Windows + IE.
          if RUBY_PLATFORM =~ /mswin|msys|mingw32/
            handlers = %w[mongrel webrick]
          else
            handlers = %w[thin mongrel webrick]
          end

          handler = handlers.find { |h| load_handler h }
          constant = handler == 'webrick' ? "WEBrick" : handler.capitalize
          Rack::Handler.const_get constant
        end

        def load_handler(handler)
          require handler
          true
        rescue LoadError
          false
        end

        def start_forked
          @pid = fork { run }
        end

        def start_threaded
          Thread.abort_on_exception = true
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

        class TestApp
          def initialize(file_root)
            @static = Rack::File.new(file_root)
          end

          def call(env)
            case env['PATH_INFO']
            when "/common/upload"
              req = Rack::Request.new(env)

              status = 200
              header = {"Content-Type" => "text/html"}
              body   = req['upload'][:tempfile].read

              [status, header, [body]]
            else
              @static.call env
            end
          end
        end

      end # RackServer
    end # SpecSupport
  end # WebDriver
end # Selenium

if __FILE__ == $0
  Selenium::WebDriver::SpecSupport::RackServer.new(ARGV[0], ARGV[1]).run
end
