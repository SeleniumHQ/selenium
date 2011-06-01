module Selenium
  module WebDriver
    module Firefox

      describe Driver do
        it "should accept an array of custom command line switches" do
          begin
            driver = Selenium::WebDriver.for :chrome, :switches => ["--disable-translate"]
          ensure
            driver.quit if driver
          end
        end

        it "should raise ArgumentError if :switches is not an Array" do
          lambda {
            Selenium::WebDriver.for(:chrome, :switches => "--foo")
          }.should raise_error(ArgumentError)
        end
      end

    end # Chrome
  end # WebDriver
end # Selenium

