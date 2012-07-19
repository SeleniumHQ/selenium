require File.expand_path("../spec_helper", __FILE__)

module Selenium
  module WebDriver
    describe Wait do

      def wait(*args) Wait.new(*args) end

      it 'should wait until the returned value is true' do
        returned = true
        wait.until { returned = !returned }.should be_true
      end

      it 'should raise a TimeOutError if the the timer runs out' do
        lambda {
          wait(:timeout => 0.1).until { false }
        }.should raise_error(Error::TimeOutError)
      end

      it "should silently capture NoSuchElementErrors" do
        called = false
        block = lambda {
          if called
            true
          else
            called = true
            raise Error::NoSuchElementError
          end
        }

        wait.until(&block).should be_true
      end

      it "will use the message from any NoSuchElementError raised while waiting" do
        block = lambda { raise Error::NoSuchElementError, "foo" }

        lambda {
          wait(:timeout => 0.5).until(&block)
        }.should raise_error(Error::TimeOutError, /foo/)
      end

      it "should let users configure what exceptions to ignore" do
        lambda {
          wait(:ignore => NoMethodError, :timeout => 0.5).until { raise NoMethodError }
        }.should raise_error(Error::TimeOutError, /NoMethodError/)
      end
    end
  end
end
