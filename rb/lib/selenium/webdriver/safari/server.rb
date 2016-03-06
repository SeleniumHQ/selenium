# encoding: utf-8
#
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

module Selenium
  module WebDriver
    module Safari

      class Server
        SOCKET_LOCK_TIMEOUT = 45

        def initialize(port, command_timeout)
          @port = port
          @command_timeout = command_timeout
        end

        def start
          Platform.exit_hook { stop } # make sure we don't leave the server running

          socket_lock.locked do
            find_free_port
            start_server
          end
        end

        def stop
          @server.close if @server && !@server.closed?
          @ws.close if @ws && !@ws.closed?
        end

        def send(command)
          json = JSON.generate(command)
          puts ">>> #{json}" if $DEBUG

          frame = WebSocket::Frame::Outgoing::Server.new(:version => @version, :data => json, :type => :text)

          @ws.write frame.to_s
          @ws.flush
        end

        def receive
          @frame ||= WebSocket::Frame::Incoming::Server.new(:version => @version)

          until msg = @frame.next
            end_time = Time.now + @command_timeout

            begin
              data = @ws.read_nonblock(1)
            rescue Errno::EWOULDBLOCK, Errno::EAGAIN
              now = Time.now
              if now >= end_time
                raise Error::TimeOutError, "timed out waiting for Safari to respond"
              end

              IO.select([@ws], nil, nil, end_time - now)
              retry
            end

            @frame << data
          end

          puts "<<< #{msg}" if $DEBUG

          JSON.parse msg.to_s
        end

        def ws_uri
          "ws://#{Platform.localhost}:#{@port}/wd"
        end

        def uri
          "http://#{Platform.localhost}:#{@port}"
        end

        def wait_for_connection
          # TODO: timeouts / non-blocking accept
          process_initial_http_request
          process_handshake
        end

        HEADERS = <<-HEADERS
HTTP/1.1 %d %s
Content-Type: text/html; charset=utf-8
Server: safaridriver-ruby
        HEADERS

        HEADERS.gsub!("\n", "\r\n")

        def html
          "<!DOCTYPE html><script>#{Safari.resource_path.join('client.js').read}</script>"
        end

        def process_initial_http_request
          http = @server.accept

          req = ''
          until req.include?("\r\n\r\n")
            req << http.read(1)
          end

          if !req.include?("?url=")
            http << HEADERS % [302, 'Moved Temporarily']
            http << "Location: #{uri}?url=#{encode_form_component ws_uri}\r\n"
            http << "\r\n\r\n"
            http.close

            process_initial_http_request
          else
            http << HEADERS % [200, 'OK']
            http << "\r\n\r\n"
            http << html
            http.close
          end
        end

        def process_handshake
          @ws = @server.accept
          hs  = WebSocket::Handshake::Server.new

          req = ''
          until hs.finished?
            data = @ws.getc || next

            req << data.chr
            hs << data
          end

          unless hs.valid?
            if req.include? "favicon.ico"
              @ws.close
              process_handshake
              return
            else
              raise Error::WebDriverError, "#{hs.error}: #{req}"
            end
          end

          @ws.write(hs.to_s)
          @ws.flush

          puts "handshake complete, v#{hs.version}" if $DEBUG
          @server.close
          @version = hs.version
        end

        def encode_form_component(str)
          if URI.respond_to?(:encode_www_form_component) # >= 1.9
            URI.encode_www_form_component(str)
          else
            # best effort for 1.8
            str.gsub(":", '%3A').gsub('/', '%2F')
          end
        end

        private

        def start_server
          @server = TCPServer.new(Platform.localhost, @port)
        end

        def find_free_port
          @port = PortProber.above @port
        end

        def socket_lock
          @socket_lock ||= SocketLock.new(@port - 1, SOCKET_LOCK_TIMEOUT)
        end

      end # Server
    end # Safari
  end # WebDriver
end # Selenium
