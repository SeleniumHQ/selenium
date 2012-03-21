require File.expand_path("../spec_helper", __FILE__)

describe "Options" do
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

    not_compliant_on :browser => [:ie, :android, :iphone, :safari] do
      it "should use DateTime for expires" do
        driver.navigate.to url_for("xhtmlTest.html")

        expected = DateTime.new(2039)
        driver.manage.add_cookie :name    => "foo",
        :value   => "bar",
        :expires => expected

        actual = driver.manage.cookie_named("foo")[:expires]
        actual.should be_kind_of(DateTime)
        actual.should == expected
      end
    end
  end
end
