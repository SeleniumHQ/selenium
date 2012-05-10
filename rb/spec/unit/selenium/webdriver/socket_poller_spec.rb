require File.expand_path("../spec_helper", __FILE__)

module Selenium
  module WebDriver
    describe SocketPoller do
      let(:poller)         { Selenium::WebDriver::SocketPoller.new("localhost", 1234, 5, 0.05)  }
      let(:socket)         { mock Socket, :close => true}

      def setup_connect(*states)
        # TODO(jari): find a cleaner way to solve the platform-specific collaborators
        if Platform.jruby?
          states.each { |state|
            if state
              TCPSocket.should_receive(:new).and_return socket
            else
              TCPSocket.should_receive(:new).and_raise Errno::ECONNREFUSED
            end
          }
        else
          Socket.should_receive(:new).any_number_of_times.and_return socket
          states.each { |state|
            socket.should_receive(:connect_nonblock).
                   and_raise(state ? Errno::EISCONN.new("connection in progress") : Errno::ECONNREFUSED.new("connection refused"))
          }
        end
      end

      describe "#connected?" do
        it "returns true when the socket is listening" do
          setup_connect false, true
          poller.should be_connected
        end

        it "returns false if the socket is not listening after the given timeout" do
          setup_connect false

          start = Time.parse("2010-01-01 00:00:00")
          wait  = Time.parse("2010-01-01 00:00:04")
          stop  = Time.parse("2010-01-01 00:00:06")

          Time.should_receive(:now).and_return(start, wait, stop)
          poller.should_not be_connected
        end
      end

      describe "#closed?" do
        it "returns true when the socket is closed" do
          setup_connect true, true, false

          poller.should be_closed
        end

        it "returns false if the socket is still listening after the given timeout" do
          setup_connect true

          start = Time.parse("2010-01-01 00:00:00")
          wait  = Time.parse("2010-01-01 00:00:04")
          stop  = Time.parse("2010-01-01 00:00:06")

          # on rbx, we can't add expectations to Time.now since it will be called by the kernel code.
          poller.should_receive(:time_now).and_return(start, wait, stop)
          poller.should_not be_closed
        end
      end

    end
  end
end
