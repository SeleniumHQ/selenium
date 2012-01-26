require File.expand_path("../spec_helper", __FILE__)

describe "Driver" do
  context "browser connection" do
    it "can set the browser offline"
    it "can set the browser online"
  end

  context "app cache" do
    it "can get the app cache status"
    it "loads from cache when browser is offline"
    it "can get the app cache as a list"
  end

  context "sql database" do
    it "knows the negative last inserted row id"
    it "knows positive last inserted row id"
    it "knows the number of rows affected"
    it "includes inserted rows in the result set"
  end
end

