module Selenium
  module WebDriver
    module Safari

      class Server
        def initialize(port)
          @port  = port
          @hs    = LibWebSocket::OpeningHandshake::Server.new
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
          json = MultiJson.encode(command)
          puts ">>> #{json}" if $DEBUG

          @ws.write @frame.new(json).to_s
          @ws.flush
        end

        def receive
          until msg = @frame.next
            data = @ws.getc
            @frame.append(data.chr)
          end

          puts "<<< #{msg}" if $DEBUG

          MultiJson.decode msg
        end

        def ws_uri
          "ws://#{Platform.localhost}:#{@port}/wd"
        end

        def uri
          "http://#{Platform.localhost}:#{@port}"
        end

        def wait_for_connection
          # TODO: timeouts / non-blocking accept
          http = @server.accept

          http.write <<-HTML
<!DOCTYPE html>
<h2>SafariDriver requesting connection at #{ws_uri}</h2>
<script>
// Must wait for onload so the injected script is loaded by the
// SafariDriver extension.
window.onload = function() {
  window.postMessage({
    'message': 'connect',
    'source': 'webdriver',
    'url': '#{ws_uri}'
  }, '*');
};
</script>
          HTML

          http.close

          @ws = @server.accept
          until @hs.done?
            data = @ws.getc || next
            @hs.parse(data.chr) or raise Error::WebDriverError, @hs.error.to_s
          end

          @ws.write(@hs.to_s)
          @ws.flush

          puts "handshake complete" if $DEBUG
          @server.close
        end

      end

    end
  end
end