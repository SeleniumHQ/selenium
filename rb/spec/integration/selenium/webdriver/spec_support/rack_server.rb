# frozen_string_literal: true

# Licensed to the Software Freedom Conservancy (SFC) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The SFC licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

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
          if Platform.jruby? || Platform.windows?
            start_threaded
          else
            start_forked
          end

          return if SocketPoller.new(@host, @port, START_TIMEOUT).connected?

          raise "rack server not launched in #{START_TIMEOUT} seconds"
        end

        def run
          handler.run @app, Host: @host, Port: @port, AccessLog: [], Logger: WEBrick::Log.new(nil, 0)
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
          handlers = if RUBY_PLATFORM.match?(/mswin|msys|mingw32/)
                       %w[mongrel webrick]
                     else
                       %w[thin mongrel webrick]
                     end

          handler = handlers.find { |h| load_handler h }
          constant = handler == 'webrick' ? 'WEBrick' : handler.capitalize
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

        class TestApp
          BASIC_AUTH_CREDENTIALS = %w[test test].freeze

          def initialize(file_root)
            @static = Rack::File.new(file_root)
          end

          def call(env)
            case env['PATH_INFO']
            when '/upload'
              req = Rack::Request.new(env)
              body = case req['upload']
                     when Array
                       req['upload'].map { |upload| upload[:tempfile].read }.join("\n")
                     when Hash
                       req['upload'][:tempfile].read
                     end

              [200, {'Content-Type' => 'text/html'}, [body]]
            else
              @static.call env
            end
          end
        end
      end # RackServer
    end # SpecSupport
  end # WebDriver
end # Selenium
