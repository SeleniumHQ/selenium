require File.expand_path(File.dirname(__FILE__) + '/../spec_helper')

describe "Session Management" do
  it "can call stop even when session was not started" do
    in_separate_driver do
      3.times { selenium_driver.close_current_browser_session }
    end
  end
end