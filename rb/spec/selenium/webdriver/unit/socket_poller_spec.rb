require File.expand_path("../spec_helper", __FILE__)

describe Selenium::WebDriver::SocketPoller do
  let(:poller) { Selenium::WebDriver::SocketPoller.new("somehost", 1234, 5, 0.05) }

  describe "#connected?" do
    it "returns true when the socket is listening" do
      TCPSocket.should_receive(:new).twice.and_raise Errno::ECONNREFUSED
      TCPSocket.should_receive(:new).once.and_return mock("TCPSocket").as_null_object

      poller.should be_connected
    end

    it "returns false if the socket is not listening after the given timeout" do
      start = Time.parse("2010-01-01 00:00:00")
      wait  = Time.parse("2010-01-01 00:00:04")
      stop  = Time.parse("2010-01-01 00:00:06")

      Time.should_receive(:now).and_return(start, wait, stop)
      TCPSocket.should_receive(:new).and_raise Errno::ECONNREFUSED

      poller.should_not be_connected
    end
  end

  describe "#closed?" do
    it "returns true when the socket is closed" do
      TCPSocket.should_receive(:new).twice.and_return mock("TCPSocket").as_null_object
      TCPSocket.should_receive(:new).once.and_raise Errno::ECONNREFUSED

      poller.should be_closed
    end

    it "returns false if the socket is still listening after the given timeout" do
      start = Time.parse("2010-01-01 00:00:00")
      wait  = Time.parse("2010-01-01 00:00:04")
      stop  = Time.parse("2010-01-01 00:00:06")

      Time.should_receive(:now).and_return(start, wait, stop)
      TCPSocket.should_receive(:new).and_return mock("TCPSocket").as_null_object

      poller.should_not be_connected
    end
  end

end
