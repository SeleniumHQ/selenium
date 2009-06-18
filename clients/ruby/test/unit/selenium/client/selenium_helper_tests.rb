require File.expand_path(File.dirname(__FILE__) + '/../../unit_test_helper')

unit_tests do
  
  test "delegates open to @selenium" do
    object = Class.new do
      include SeleniumHelper
      attr_accessor :selenium      
    end.new
    
    object.selenium = mock("selenium")
    object.selenium.expects(:open).with(:the_url).returns(:the_result)
    
    assert_equal :the_result, object.open(:the_url)
  end

  test "delegates type to @selenium" do
    object = Class.new do
      include SeleniumHelper
      attr_accessor :selenium      
    end.new
    
    object.selenium = mock("selenium")
    object.selenium.expects(:type).with(:the_locator, :the_value) \
                   .returns(:the_result)
    
    assert_equal :the_result, object.type(:the_locator, :the_value)
  end

  test "delegates select to @selenium" do
    object = Class.new do
      include SeleniumHelper
      attr_accessor :selenium      
    end.new
    
    object.selenium = mock("selenium")
    object.selenium.expects(:type).with(:the_input_locator, 
                                        :the_option_locator) \
                                  .returns(:the_result)
    
    assert_equal :the_result, object.type(:the_input_locator, :the_option_locator)
  end

  test "delegates to any no-arg method defined on @selenium" do
    object = Class.new do
      include SeleniumHelper
      attr_accessor :selenium      
    end.new
    
    object.selenium = mock("selenium")
    object.selenium.expects(:a_noarg_method).with().returns(:the_result)
    
    assert_equal :the_result, object.a_noarg_method
  end

  test "delegates to any arg method defined on @selenium" do
    object = Class.new do
      include SeleniumHelper
      attr_accessor :selenium      
    end.new
    
    object.selenium = mock("selenium")
    object.selenium.expects(:a_method).with(:alpha, :beta)\
                   .returns(:the_result)
    
    assert_equal :the_result, object.a_method(:alpha, :beta)
  end

  test "calls default method_missing when a method is not defined on @selenium" do
    object = Class.new do
      include SeleniumHelper
      attr_accessor :selenium      
    end.new
    
    object.selenium = mock("selenium")
    
    assert_raises(NoMethodError) { object.a_method(:alpha, :beta) }
  end

end
