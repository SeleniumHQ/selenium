require File.expand_path("../../spec_helper", __FILE__)

describe Selenium::Client::JavascriptFrameworks::JQuery do

  it "returns 'jQuery.active'" do
    art = Selenium::Client::JavascriptFrameworks::JQuery.ajax_request_tracker
    art.should == "jQuery.active"
  end

end