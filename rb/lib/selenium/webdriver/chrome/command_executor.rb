module Selenium
  module WebDriver
    module Chrome

      # @private
      class CommandExecutor
        HTML_TEMPLATE = "HTTP/1.1 200 OK\r\nContent-Length: %d\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n%s"
        JSON_TEMPLATE = "HTTP/1.1 200 OK\r\nContent-Length: %d\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n%s"

        def initialize
          @server       = TCPServer.new(localhost, 0)
          @queue        = Queue.new

          @accepted_any = false
          @next_socket  = nil
          @listening    = true

          Thread.new { start_run_loop }
        end

        def execute(command)
          until accepted_any?
            Thread.pass
            sleep 0.01
          end

          json = command.to_json
          data = JSON_TEMPLATE % [json.length, json]

          @next_socket.write data
          @next_socket.close

          JSON.parse read_response(@queue.pop)
        end

        def close
          stop_listening
          close_sockets
          @server.close unless @server.closed?
        rescue IOError
          nil
        end

        def port
          @server.addr[1]
        end

        def uri
          "http://localhost:#{port}/chromeCommandExecutor"
        end

        private

        def localhost
          Platform.ironruby? ? "localhost" : "0.0.0.0" # yeah, weird..
        end

        def start_run_loop
          while(@listening) do
            socket = @server.accept

            if socket.read(1) == "G" # initial GET(s)
              write_holding_page_to socket
            else
              if accepted_any?
                @queue << socket
              else
                read_response(socket)
                @accepted_any = true
              end
            end
          end
        rescue IOError, Errno::EBADF
          raise if @listening
        end

        def read_response(socket)
          result = ''
          seen_double_crlf = false

          while line = next_line(socket)
            seen_double_crlf = true if line.empty?
            result << "#{line}\n" if seen_double_crlf
          end

          @next_socket = socket

          result.strip!
        end

        def accepted_any?
          @accepted_any
        end

        def close_sockets
          @next_socket.close if @next_socket
          @queue.pop.close until @queue.empty?
        end

        def stop_listening
          @listening = false
        end

        def next_line(socket)
          return if socket.closed?
          input = socket.gets

          raise Error::WebDriverError, "unexpected EOF from Chrome" if input.nil?

          line = input.chomp
          return if line == "EOResponse"

          line
        end

        def write_holding_page_to(socket)
          msg = %[<html><head><script type='text/javascript'>if (window.location.search == '') { setTimeout("window.location = window.location.href + '?reloaded'", 5000); }</script></head><body><p>ChromeDriver server started and connected.  Please leave this tab open.</p></body></html>]

          socket.write HTML_TEMPLATE % [msg.length, msg]
          socket.close
        end

      end # CommandExecutor
    end # Chrome
  end # WebDriver
end # Selenium
