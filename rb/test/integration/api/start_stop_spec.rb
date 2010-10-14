require File.expand_path(File.dirname(__FILE__) + '/../spec_helper')

describe "Session Management" do

	it "Can call stop even when session was not started" do
    3.times { selenium_driver.close_current_browser_session }
  end

end