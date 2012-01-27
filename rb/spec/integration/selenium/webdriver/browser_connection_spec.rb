require File.expand_path("../spec_helper", __FILE__)

describe "Driver" do
  context "browser connection" do

    compliant_on :browser => nil do
      it "can set the browser offline and online"  do
        driver.navigate.to url_for("html5Page.html")
        driver.should be_online

        driver.online = false
        driver.should_not be_online

        driver.online = true
        driver.should be_online
      end
    end

  end
end
