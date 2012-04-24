module Selenium
  module WebDriver
    module Safari

      class Server
        def initialize(port, command_timeout)
          @port  = port
          @command_timeout = command_timeout
          @frame = LibWebSocket::Frame.new
        end

        def start
          @server = TCPServer.new(Platform.localhost, @port)
        end

        def stop
          @server.close if @server && !@server.closed?
          @ws.close if @ws && !@ws.closed?
        end

        def send(command)
          json = WebDriver.json_dump(command)
          puts ">>> #{json}" if $DEBUG

          frame = LibWebSocket::Frame.new(json).to_s

          @ws.write frame
          @ws.flush
        end

        def receive
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

            @frame.append(data)
          end

          puts "<<< #{msg}" if $DEBUG

          WebDriver.json_load msg
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
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Server: safaridriver-ruby
        HEADERS

        HEADERS.gsub!("\n", "\r\n")

        HTML = <<-HTML
<!DOCTYPE html>
<h2>SafariDriver requesting connection at %s</h2>
<script>
// Must wait for onload so the injected script is loaded by the
// SafariDriver extension.
window.onload = function() {
  window.postMessage({
    'type': 'connect',
    'origin': 'webdriver',
    'url': '%s'
  }, '*');
};
</script>
        HTML

        def process_initial_http_request
          http = @server.accept

          req = ''
          until req.include?("\r\n\r\n")
            req << http.read(1)
          end

          http << HEADERS
          http << "\r\n\r\n"
          http << HTML % [ws_uri, ws_uri]

          http.close
        end

        def process_handshake
          @ws = @server.accept
          hs  = LibWebSocket::OpeningHandshake::Server.new

          req = ''
          until hs.done?
            data = @ws.getc || next
            req << data.chr

            unless hs.parse(data.chr)
              if req.include? "favicon.ico"
                @ws.close
                process_handshake
                return
              else
                raise Error::WebDriverError, "#{hs.error}: #{req}"
              end
            end
          end

          @ws.write(hs.to_s)
          @ws.flush

          puts "handshake complete" if $DEBUG
          @server.close
        end
      end

    end
  end
end
