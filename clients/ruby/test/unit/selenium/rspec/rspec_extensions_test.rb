require File.expand_path(File.dirname(__FILE__) + '/../../unit_test_helper')

unit_tests do

  test "Example reporting_uid is the same when example is the same" do
    example_class = Class.new { include Spec::Example::ExampleMethods }
    example = example_class.new(:a_proxy) do puts "some implementation" end
    assert_equal example.reporting_uid, example.reporting_uid
  end

  test "Example reporting_uid are not equals when implementation is different" do
    example_class = Class.new { include Spec::Example::ExampleMethods }
    first_example = example_class.new(:a_proxy) do puts "some implementation" end
    second_example = example_class.new(:a_proxy) do puts "another implementation" end
    assert_not_equal first_example.reporting_uid, second_example.reporting_uid
  end

  test "ExampleProxy reporting_uid are equals when Example is the same" do
    example = stub_everything(:reporting_uid => 123)
    first_proxy = Spec::Example::ExampleProxy.new("first", :actual_example => example)
    second_proxy = Spec::Example::ExampleProxy.new("second", :actual_example => example)
    assert_equal first_proxy.reporting_uid, second_proxy.reporting_uid
  end

  test "ExampleProxy reporting_uid are different when Example is not the same" do
    first_proxy = Spec::Example::ExampleProxy.new("first", :actual_example => stub_everything(:reporting_uid => 123))
    second_proxy = Spec::Example::ExampleProxy.new("second", :actual_example => stub_everything(:reporting_uid => 456))
    assert_not_equal first_proxy.reporting_uid, second_proxy.reporting_uid
  end

  test "execution_error is exposed as an instance variable" do
    example_class = Class.new { include Spec::Example::ExampleMethods }
    example = example_class.new(:a_proxy) do puts "some implementation" end
    assert_nil example.execution_error
  end

  test "actual_failure? returns false when execution_error is nil" do
    example_class = Class.new { include Spec::Example::ExampleMethods }
    example = example_class.new(:a_proxy) do puts "some implementation" end
    example.instance_variable_set(:@execution_error, nil)
    
    assert_false example.actual_failure?
  end

  test "actual_failure? returns true when execution_error is a StandardError" do
    example_class = Class.new { include Spec::Example::ExampleMethods }
    example = example_class.new(:a_proxy) do puts "some implementation" end
    example.instance_variable_set(:@execution_error, StandardError.new)
    
    assert_true example.actual_failure?
  end

  test "actual_failure? returns false when execution_error is an ExamplePendingError" do
    example_class = Class.new { include Spec::Example::ExampleMethods }
    example = example_class.new(:a_proxy) do puts "some implementation" end
    example.instance_variable_set(:@execution_error, Spec::Example::ExamplePendingError.new)
    
    assert_false example.actual_failure?
  end

  test "actual_failure? returns false when execution_error is an NotYetImplementedError" do
    example_class = Class.new { include Spec::Example::ExampleMethods }
    example = example_class.new(:a_proxy) do puts "some implementation" end
    example.instance_variable_set(:@execution_error, Spec::Example::NotYetImplementedError.new)
    
    assert_false example.actual_failure?
  end

  test "actual_failure? returns false when execution_error is a PendingExampleFixedError" do
    example_class = Class.new { include Spec::Example::ExampleMethods }
    example = example_class.new(:a_proxy) do puts "some implementation" end
    example.instance_variable_set(:@execution_error, Spec::Example::PendingExampleFixedError.new)
    
    assert_false example.actual_failure?
  end

  test "actual_failure? returns false when execution_error is a NoDescriptionError" do
    example_class = Class.new { include Spec::Example::ExampleMethods }
    example = example_class.new(:a_proxy) do puts "some implementation" end
    example.instance_variable_set(:@execution_error, 
                                 Spec::Example::NoDescriptionError.new(nil, nil))
    
    assert_false example.actual_failure?
  end

  test "pending_for_browsers yields the block when actual browser does not match any regexp" do
    example_class = Class.new { include Spec::Example::ExampleMethods }
    example = example_class.new(:a_proxy) do puts "some implementation" end
    example.stubs(:selenium_driver).returns(stub_everything(:browser_string => "*safari"))
    testlogic = mock("testlogic")

    testlogic.expects(:trigger)
    example.pending_for_browsers(/firefox/) do
      testlogic.trigger      
    end    
  end

  test "pending_for_browsers calls pending when actual browser does match one of the regexp" do
    example_class = Class.new { include Spec::Example::ExampleMethods }
    example = example_class.new(:a_proxy) do puts "some implementation" end
    example.stubs(:selenium_driver).returns(stub_everything(:browser_string => "*safari"))

    example.expects(:pending).with("Safari does not support this feature yet")
    example.pending_for_browsers(/safari/) do end    
  end

  test "pending_for_browsers does not trigger test logic when actual browser does match one of the regexp" do
    example_class = Class.new { include Spec::Example::ExampleMethods }
    example = example_class.new(:a_proxy) do puts "some implementation" end
    example.stubs(:selenium_driver).returns(stub_everything(:browser_string => "*safari"))
    example.stubs(:pending)
    testlogic = mock("testlogic")

    testlogic.expects(:trigger).never
    example.pending_for_browsers(/safari/) do
      testlogic.trigger      
    end    
  end

  test "pending_for_browsers can match multiple regexps" do
    example_class = Class.new { include Spec::Example::ExampleMethods }
    example = example_class.new(:a_proxy) do puts "some implementation" end
    example.stubs(:selenium_driver).returns(stub_everything(:browser_string => "*safari"))

    example.expects(:pending).with("Safari does not support this feature yet")
    example.pending_for_browsers(/iexplore/, /safari/, /opera/) do end    
  end

  test "pending_for_browsers regexp match is case insensitive" do
    example_class = Class.new { include Spec::Example::ExampleMethods }
    example = example_class.new(:a_proxy) do puts "some implementation" end
    example.stubs(:selenium_driver).returns(stub_everything(:browser_string => "*safari"))

    example.expects(:pending).with("Safari does not support this feature yet")
    example.pending_for_browsers(/Safari/) do end    
  end

end
