module Selenium
  module WebDriver
    module Chrome

      describe Driver do
        it "should accept an array of custom command line arguments" do
          begin
            driver = Selenium::WebDriver.for :chrome, :args => ["--user-agent=foo;bar"]
            driver.navigate.to url_for("click_jacker.html")

            ua = driver.execute_script "return window.navigator.userAgent"
            ua.should == "foo;bar"
          ensure
            driver.quit if driver
          end
        end

        it "should raise ArgumentError if :args is not an Array" do
          lambda {
            Selenium::WebDriver.for(:chrome, :args => "--foo")
          }.should raise_error(ArgumentError)
        end
      end

    end # Chrome
  end # WebDriver
end # Selenium

