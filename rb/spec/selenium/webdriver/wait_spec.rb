require File.expand_path("../spec_helper", __FILE__)

describe "Wait" do
  it 'should wait until the returned value is true' do
    returned = true
    WebDriver::Wait.new.until { returned = !returned }.should be_true
  end

  it 'should raise a TimeOutError if the the timer runs out' do
    wait = WebDriver::Wait.new(:timeout => 0.1)
    lambda {
      wait.until { false }
    }.should raise_error(WebDriver::Error::TimeOutError)
  end

  it "should silently capture NoSuchElementErrors" do
    called = false
    block = lambda {
      if called
        true
      else
        called = true
        raise WebDriver::Error::NoSuchElementError
      end
    }

    WebDriver::Wait.new.until(&block).should be_true
  end

  it "will use the message from any NoSuchElementError raised while waiting" do
    block = lambda { raise WebDriver::Error::NoSuchElementError, "foo" }
    wait = WebDriver::Wait.new(:timeout => 0.5)

    lambda {
      wait.until(&block)
    }.should raise_error(WebDriver::Error::TimeOutError, /foo/)
  end


end
