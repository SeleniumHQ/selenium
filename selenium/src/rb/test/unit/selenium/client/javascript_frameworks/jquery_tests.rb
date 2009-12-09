require File.expand_path(File.dirname(__FILE__) + '/../../../unit_test_helper')

unit_tests do
  
  test "ajax request tracker is jQuery.active" do
    assert_equal "jQuery.active", Selenium::Client::JavascriptFrameworks::JQuery.ajax_request_tracker
  end
  
end