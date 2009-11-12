require "#{File.dirname(__FILE__)}/spec_helper"

describe "Options" do
  not_compliant_on :browser => :ie do
    describe "cookie management" do
      it "should get all" do
        driver.navigate.to url_for("xhtmlTest.html")
        driver.manage.add_cookie :name => "foo", :value => "bar"

        cookies = driver.manage.all_cookies

        cookies.should have(1).things
        cookies.first[:name].should == "foo"
        cookies.first[:value].should == "bar"
      end

      it "should delete one" do
        driver.navigate.to url_for("xhtmlTest.html")

        driver.manage.add_cookie :name => "foo", :value => "bar"
        driver.manage.delete_cookie("foo")
      end

      it "should delete all" do
        driver.navigate.to url_for("xhtmlTest.html")

        driver.manage.add_cookie :name => "foo", :value => "bar"
        driver.manage.delete_all_cookies
        driver.manage.all_cookies.should be_empty
      end

      it "should use DateTime for expires"
    end
  end

  it "should be able to get and set speed" do
    driver.manage.speed = :slow
    driver.manage.speed.should == :slow

    driver.manage.speed = :fast
    driver.manage.speed.should == :fast
  end
end



