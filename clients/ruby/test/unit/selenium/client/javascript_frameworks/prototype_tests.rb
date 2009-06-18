require File.expand_path(File.dirname(__FILE__) + '/../../../unit_test_helper')

unit_tests do
  
  test "ajax request tracker is Ajax.activeRequestCount" do
    assert_equal "Ajax.activeRequestCount", Selenium::Client::JavascriptFrameworks::Prototype.ajax_request_tracker
  end
  
end