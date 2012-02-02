require File.expand_path("../spec_helper", __FILE__)

describe Selenium::Client::SeleniumHelper do
  class SeleniumHelperClass
    include Selenium::Client::SeleniumHelper
    attr_accessor :selenium
  end

  let :object do
    @object ||= (
      o = SeleniumHelperClass.new
      o.selenium = mock("selenium")

      o
    )
  end

  it "delegates open to @selenium" do
    object.selenium.should_receive(:open).with(:the_url).and_return(:the_result)

    object.open(:the_url).should == :the_result
  end

  it "delegates type to @selenium" do
    object.selenium.should_receive(:type).with(:the_locator, :the_value) \
                   .and_return(:the_result)

    object.type(:the_locator, :the_value).should == :the_result
  end

  it "delegates select to @selenium" do
    object.selenium.should_receive(:type).with(:the_input_locator,
                                        :the_option_locator) \
                                  .and_return(:the_result)

    object.type(:the_input_locator, :the_option_locator).should == :the_result
  end

  it "delegates to any no-arg method defined on @selenium" do
    object.selenium.should_receive(:a_noarg_method).with().and_return(:the_result)

    object.a_noarg_method.should == :the_result
  end

  it "delegates to any arg method defined on @selenium" do
    object.selenium.should_receive(:a_method).with(:alpha, :beta)\
                   .and_return(:the_result)

    object.a_method(:alpha, :beta).should == :the_result
  end

  it "calls default method_missing when a method is not defined on @selenium" do
    lambda { object.a_method(:alpha, :beta) }.should raise_error(NoMethodError)
  end

end
