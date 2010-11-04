module Selenium
  module WebDriver
    module Firefox

      describe Driver do
        describe ".new" do
          it "should take a Firefox::Profile instance as argument" do
            begin
              profile = Selenium::WebDriver::Firefox::Profile.new
              driver = Selenium::WebDriver.for :firefox, :profile => profile
            ensure
              driver.quit if driver
            end
          end
        end
      end

    end # Firefox
  end # WebDriver
end # Selenium

