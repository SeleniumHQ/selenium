require File.expand_path("../../spec_helper", __FILE__)

describe Spec::Example::ExampleMethods do
  describe "#reporting_uid" do
    it "is the same when example is the same" do # ???
      example_class = Class.new { include Spec::Example::ExampleMethods }
      example = example_class.new(:a_proxy) do puts "some implementation" end
      example.reporting_uid.should == example.reporting_uid
    end

    it "Example reporting_uid are not equals when implementation is different" do
      example_class = Class.new { include Spec::Example::ExampleMethods }
      first_example = example_class.new(:a_proxy) do puts "some implementation" end
      second_example = example_class.new(:a_proxy) do puts "another implementation" end
      second_example.reporting_uid.should_not == first_example.reporting_uid
    end
  end

  it "exposes execution_error as an instance variable" do
    example_class = Class.new { include Spec::Example::ExampleMethods }
    example = example_class.new(:a_proxy) do puts "some implementation" end
    example.execution_error.should be_nil
  end

  describe "#actual_failure?" do
    it "returns false when execution_error is nil" do
      example_class = Class.new { include Spec::Example::ExampleMethods }
      example = example_class.new(:a_proxy) do puts "some implementation" end
      example.instance_variable_set(:@execution_error, nil)

      example.actual_failure?.should be_false
    end

    it "returns true when execution_error is a StandardError" do
      example_class = Class.new { include Spec::Example::ExampleMethods }
      example = example_class.new(:a_proxy) do puts "some implementation" end
      example.instance_variable_set(:@execution_error, StandardError.new)

      example.actual_failure?.should be_true
    end

    it "returns false when execution_error is an ExamplePendingError" do
      example_class = Class.new { include Spec::Example::ExampleMethods }
      example = example_class.new(:a_proxy) do puts "some implementation" end
      example.instance_variable_set(:@execution_error, Spec::Example::ExamplePendingError.new)

      example.actual_failure?.should be_false
    end

    it "returns false when execution_error is an NotYetImplementedError" do
      example_class = Class.new { include Spec::Example::ExampleMethods }
      example = example_class.new(:a_proxy) do puts "some implementation" end
      example.instance_variable_set(:@execution_error, Spec::Example::NotYetImplementedError.new)

      example.actual_failure?.should be_false
    end

    it "returns false when execution_error is a PendingExampleFixedError" do
      example_class = Class.new { include Spec::Example::ExampleMethods }
      example = example_class.new(:a_proxy) do puts "some implementation" end
      example.instance_variable_set(:@execution_error, Spec::Example::PendingExampleFixedError.new)

      example.actual_failure?.should be_false
    end

    it "returns false when execution_error is a NoDescriptionError" do
      example_class = Class.new { include Spec::Example::ExampleMethods }
      example = example_class.new(:a_proxy) do puts "some implementation" end
      example.instance_variable_set(:@execution_error,
                                    Spec::Example::NoDescriptionError.new(nil, nil))

      example.actual_failure?.should be_false
    end
  end

  describe "#pending_for_browsers" do
    it "yields the block when actual browser does not match any regexp" do
      example_class = Class.new { include Spec::Example::ExampleMethods }
      example = example_class.new(:a_proxy) do puts "some implementation" end
      example.stub!(:selenium_driver).and_return(mock('Driver', :browser_string => "*safari").as_null_object)
      testlogic = mock("testlogic")

      testlogic.should_receive(:trigger)
      example.pending_for_browsers(/firefox/) do
        testlogic.trigger
      end
    end

    it "calls pending when actual browser does match one of the regexps" do
      example_class = Class.new { include Spec::Example::ExampleMethods }
      example = example_class.new(:a_proxy) do puts "some implementation" end
      example.stub!(:selenium_driver).and_return(mock(:browser_string => "*safari").as_null_object)

      example.should_receive(:pending).with("Safari does not support this feature yet")
      example.pending_for_browsers(/safari/) do end
    end

    it "does not trigger test logic when actual browser does match one of the regexp" do
      example_class = Class.new { include Spec::Example::ExampleMethods }
      example = example_class.new(:a_proxy) do puts "some implementation" end
      example.stub!(:selenium_driver).and_return(mock(:browser_string => "*safari").as_null_object)
      example.stub!(:pending)
      testlogic = mock("testlogic")

      testlogic.should_receive(:trigger).never
      example.pending_for_browsers(/safari/) do
        testlogic.trigger
      end
    end

    it "can match multiple regexps" do
      example_class = Class.new { include Spec::Example::ExampleMethods }
      example = example_class.new(:a_proxy) do puts "some implementation" end
      example.stub!(:selenium_driver).and_return(mock(:browser_string => "*safari").as_null_object)

      example.should_receive(:pending).with("Safari does not support this feature yet")
      example.pending_for_browsers(/iexplore/, /safari/, /opera/) do end
    end

    it "is case insensitive" do
      example_class = Class.new { include Spec::Example::ExampleMethods }
      example = example_class.new(:a_proxy) do puts "some implementation" end
      example.stub!(:selenium_driver).and_return(mock(:browser_string => "*safari").as_null_object)

      example.should_receive(:pending).with("Safari does not support this feature yet")
      example.pending_for_browsers(/Safari/) do end
    end
  end

end

describe "Spec::Example::ExampleProxy" do
  describe "#reporting_uid" do
    it "is equal when Example is the same" do
      example = mock('Example', :reporting_uid => 123).as_null_object
      first_proxy = Spec::Example::ExampleProxy.new("first", :actual_example => example)
      second_proxy = Spec::Example::ExampleProxy.new("second", :actual_example => example)
      second_proxy.reporting_uid.should == first_proxy.reporting_uid
    end

    it "is different when Example is not the same" do
      example1 = mock('Example', :reporting_uid => 123).as_null_object
      example2 = mock('Example', :reporting_uid => 456).as_null_object

      first_proxy = Spec::Example::ExampleProxy.new("first", :actual_example => example1)
      second_proxy = Spec::Example::ExampleProxy.new("second", :actual_example => example2)

      second_proxy.reporting_uid.should_not == first_proxy.reporting_uid
    end
  end
end
