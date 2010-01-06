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
              rescue Errno::ECONNREFUSED, Errno::ENOTCONN, SocketError => e
                $stderr.puts "#{self} caught #{e.message} for #{@host}:#{@port}" if $DEBUG
                sleep 0.25
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
          close
        end

        def close
          @socket.close if connected?
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

          length         = Integer(resp.split(":").last.strip)
          json_string    = ''
          bytes_received = 0

          until bytes_received == length
            read_string = @socket.recv(length - bytes_received)

            bytes_received += read_string.length
            json_string << read_string
          end

          if json_string.empty?
            raise Error::WebDriverError, "empty response from extension"
          end

          JSON.parse json_string
        end

      end # ExtensionConnection
    end # Firefox
  end # WebDriver
end # Selenium
