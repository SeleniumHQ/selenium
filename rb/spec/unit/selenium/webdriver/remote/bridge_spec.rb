require File.expand_path("../../spec_helper", __FILE__)

module Selenium
  module WebDriver
    module Remote
      
      describe Bridge do
        it "raises ArgumentError if passed invalid options" do
          lambda { Bridge.new(:foo => 'bar') }.should raise_error(ArgumentError)
        end
      end

    end # Remote
  end # WebDriver
end # Selenium

