module Selenium
  module WebDriver
    module Firefox
      class ExtensionConnection

        def initialize(host, port)
          @host = host
          @port = port
        end

        def connect(timeout = 20)
          Timeout.timeout(timeout) {
            loop do
              begin
                return new_socket
              rescue Errno::ECONNREFUSED, Errno::ENOTCONN => e
                $stderr.puts "#{self} caught #{e.message}" if $DEBUG
                sleep 0.250
              end
            end
          }
        end

        def new_socket
          @socket = TCPSocket.new(@host, @port)
          @socket.sync = true

          @socket
        end

        def connected?
          @socket && !@socket.closed?
        end

        def send_string(str)
          str = <<-HTTP
GET / HTTP/1.1
Host: localhost
Content-Length: #{str.length}

#{str}
HTTP
          @socket.write str
          @socket.flush
        end

        def quit
          command = {'commandName' => 'quit', 'context' => ''}
          send_string(command.to_json)
        ensure
          @socket.close
        end

        def close
          @socket.close
        end

        def read_response
          resp     = ""
          received = ""

          until resp.include?("\n\n")
            received = @socket.recv 1
            if received
              resp += received
            end
          end

          length      = resp.split(":")[1].lstrip!.to_i
          json_string = @socket.recv length

          if json_string.empty?
            raise Error::WebDriverError, "empty response from extension"
          end

          JSON.parse json_string
        end

      end # ExtensionConnection
    end # Firefox
  end # WebDriver
end # Selenium
