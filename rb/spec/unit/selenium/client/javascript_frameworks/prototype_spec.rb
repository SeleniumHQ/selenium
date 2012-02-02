require File.expand_path("../../spec_helper", __FILE__)

describe Selenium::Client::JavascriptFrameworks::Prototype do

  it "returns 'Ajax.activeRequestCount'" do
    art = Selenium::Client::JavascriptFrameworks::Prototype.ajax_request_tracker
    art.should == "Ajax.activeRequestCount"
  end

end