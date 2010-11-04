require File.expand_path("../spec_helper", __FILE__)

describe "Wait" do
  def wait(*args) Selenium::WebDriver::Wait.new(*args) end
  
  it 'should wait until the returned value is true' do
    returned = true
    wait.until { returned = !returned }.should be_true
  end

  it 'should raise a TimeOutError if the the timer runs out' do
    lambda {
      wait(:timeout => 0.1).until { false }
    }.should raise_error(Selenium::WebDriver::Error::TimeOutError)
  end

  it "should silently capture NoSuchElementErrors" do
    called = false
    block = lambda {
      if called
        true
      else
        called = true
        raise Selenium::WebDriver::Error::NoSuchElementError
      end
    }

    wait.until(&block).should be_true
  end

  it "will use the message from any NoSuchElementError raised while waiting" do
    block = lambda { raise Selenium::WebDriver::Error::NoSuchElementError, "foo" }

    lambda {
      wait(:timeout => 0.5).until(&block)
    }.should raise_error(Selenium::WebDriver::Error::TimeOutError, /foo/)
  end


end
