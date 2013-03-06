module Selenium
  module WebDriver
    module Remote

      describe Driver do
        it "should expose session_id" do
          driver.session_id.should be_kind_of(String)
        end
      end

    end # Remote
  end # WebDriver
end # Selenium

