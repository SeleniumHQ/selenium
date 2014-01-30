module Selenium
  module WebDriver
    module Remote

      describe Driver do
        it "should expose session_id" do
          driver.session_id.should be_kind_of(String)
        end

        it "should expose remote status" do
          driver.should be_kind_of(DriverExtensions::HasRemoteStatus)
          driver.remote_status.should be_kind_of(Hash)
        end
      end

    end # Remote
  end # WebDriver
end # Selenium

