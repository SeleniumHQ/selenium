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

require 'delegate'
require 'openssl'
require 'rack'
require 'rack/handler/webrick'

module Selenium
  module WebDriver
    module SpecSupport
      class RackServer
        START_TIMEOUT = 30

        # jruby-openssl reads past the TLS handshake into its own buffer, so WEBrick's readiness poll on the
        # raw socket never fires and the first request on each connection stalls until RequestTimeout.
        module BufferedTlsRequest
          def run(sock)
            if sock.is_a?(OpenSSL::SSL::SSLSocket)
              io = SimpleDelegator.new(sock.to_io)
              io.define_singleton_method(:wait_readable) { |_timeout| true }
              sock.define_singleton_method(:to_io) { io }
            end
            super
          end
        end
        WEBrick::HTTPServer.prepend(BufferedTlsRequest) if Platform.jruby?

        def initialize(path, port, secure_port:, certificates:)
          @path = path
          @app  = TestApp.new(path)

          @host = ENV.fetch('localhost', 'localhost')
          @port = port
          @secure_port = secure_port
          @certificates = certificates
        end

        def start
          if Platform.jruby? || Platform.windows? || Platform.truffleruby?
            start_threaded
          else
            start_forked
          end

          return if [@port, @secure_port].all? { |port| SocketPoller.new(@host, port, START_TIMEOUT).connected? }

          stop
          raise "rack server not launched in #{START_TIMEOUT} seconds"
        end

        def run
          Thread.abort_on_exception = true
          Thread.new { serve(@secure_port, **ssl_options) }
          serve(@port)
        end

        def where_is(file, secure: false)
          secure ? "https://#{@host}:#{@secure_port}/#{file}" : "http://#{@host}:#{@port}/#{file}"
        end

        def stop
          if defined?(@threads) && @threads
            @threads.each(&:kill)
          elsif defined?(@pid) && @pid
            Process.kill('KILL', @pid)
            Process.waitpid(@pid)
          elsif defined?(@process) && @process
            @process.stop
          end
        end

        private

        def serve(port, **ssl)
          options = {Host: @host, Port: port, AccessLog: [], Logger: WEBrick::Log.new(nil, 0)}
          Rack::Handler::WEBrick.run @app, **options, **ssl
        end

        def ssl_options
          {
            SSLEnable: true,
            SSLCertificate: OpenSSL::X509::Certificate.new(File.read(File.join(@certificates, 'localhost.crt'))),
            SSLPrivateKey: OpenSSL::PKey.read(File.read(File.join(@certificates, 'localhost.key')))
          }
        end

        def start_forked
          @pid = fork { run }
        end

        def start_threaded
          Thread.abort_on_exception = true
          @threads = [Thread.new { serve(@port) }, Thread.new { serve(@secure_port, **ssl_options) }]
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
                       req.params['upload'].map { |upload| upload[:tempfile].read }.join("\n")
                     when Hash
                       req.params['upload'][:tempfile].read
                     end

              [200, {'Content-Type' => 'text/html'}, [body]]
            when '/sleep'
              time = Rack::Request.new(env).params['time']
              sleep Integer(time)
              [200, {'Content-Type' => 'text/html'}, ["Slept for #{time}"]]
            when '/basicAuth'
              authorize(env)
            else
              @static.call env
            end
          end

          private

          def authorize(env)
            if authorized?(env)
              status = 200
              header = {'Content-Type' => 'text/html'}
              body = '<h1>authorized</h1>'
            else
              status = 401
              header = {'WWW-Authenticate' => 'Basic realm="basic-auth-test"'}
              body = 'Login please'
            end

            [status, header, [body]]
          end

          def authorized?(env)
            auth = Rack::Auth::Basic::Request.new(env)
            auth.provided? && auth.basic? && auth.credentials && auth.credentials == BASIC_AUTH_CREDENTIALS
          end
        end
      end # RackServer
    end # SpecSupport
  end # WebDriver
end # Selenium
