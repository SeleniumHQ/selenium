module Selenium
  module WebDriver
    module Firefox

      describe Bridge do
        it "raises ArgumentError if passed invalid options" do
          lambda { Bridge.new(:foo => 'bar') }.should raise_error(ArgumentError)
        end
      end

    end # Firefox
  end # WebDriver
end # Selenium

