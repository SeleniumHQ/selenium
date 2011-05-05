require File.expand_path("../spec_helper", __FILE__)

describe Selenium::WebDriver::SocketPoller do
  let(:poller)         { Selenium::WebDriver::SocketPoller.new("localhost", 1234, 5, 0.05)  }
  let(:socket)         { mock Socket, :close => true}

  before do
    Socket.should_receive(:new).any_number_of_times.and_return socket
  end

  describe "#connected?" do
    it "returns true when the socket is listening" do
      socket.should_receive(:connect_nonblock).and_raise(Errno::ECONNREFUSED)
      socket.should_receive(:connect_nonblock).and_raise(Errno::EISCONN)

      poller.should be_connected
    end

    it "returns false if the socket is not listening after the given timeout" do
      start = Time.parse("2010-01-01 00:00:00")
      wait  = Time.parse("2010-01-01 00:00:04")
      stop  = Time.parse("2010-01-01 00:00:06")

      Time.should_receive(:now).and_return(start, wait, stop)
      socket.should_receive(:connect_nonblock).and_raise(Errno::ECONNREFUSED)

      poller.should_not be_connected
    end
  end

  describe "#closed?" do
    it "returns true when the socket is closed" do
      socket.should_receive(:connect_nonblock).twice.and_raise Errno::EISCONN
      socket.should_receive(:connect_nonblock).and_raise Errno::ECONNREFUSED

      poller.should be_closed
    end

    it "returns false if the socket is still listening after the given timeout" do
      start = Time.parse("2010-01-01 00:00:00")
      wait  = Time.parse("2010-01-01 00:00:04")
      stop  = Time.parse("2010-01-01 00:00:06")

      Time.should_receive(:now).and_return(start, wait, stop)
      socket.should_receive(:connect_nonblock).and_raise Errno::EISCONN

      poller.should_not be_closed
    end
  end

end
