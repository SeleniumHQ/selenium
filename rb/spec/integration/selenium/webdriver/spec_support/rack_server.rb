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

require 'openssl'
require 'rack'
require 'rack/handler/webrick'
require 'webrick/https'

module Selenium
  module WebDriver
    module SpecSupport
      class RackServer
        def initialize(path, certificates:)
          @app = TestApp.new(path)
          @host = ENV.fetch('localhost', 'localhost')
          @certificates = certificates
        end

        def start
          @servers = [server, server(**ssl_options)]
          @port, @secure_port = @servers.map { |server| server.listeners.first.addr[1] }
          @threads = @servers.map { |server| Thread.new { server.start } }
        end

        def where_is(file, secure: false)
          secure ? "https://#{@host}:#{@secure_port}/#{file}" : "http://#{@host}:#{@port}/#{file}"
        end

        def stop
          @servers&.each(&:shutdown)
          @threads&.each(&:join)
        end

        private

        def server(**ssl)
          options = {BindAddress: @host, Port: 0, AccessLog: [], Logger: WEBrick::Log.new(nil, 0)}
          server = WEBrick::HTTPServer.new(**options, **ssl)
          server.mount '/', Rack::Handler::WEBrick, @app
          server
        end

        def ssl_options
          {
            SSLEnable: true,
            SSLCertificate: OpenSSL::X509::Certificate.new(File.read(File.join(@certificates, 'localhost.crt'))),
            SSLPrivateKey: OpenSSL::PKey.read(File.read(File.join(@certificates, 'localhost.key')))
          }
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
