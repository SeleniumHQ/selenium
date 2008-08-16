require File.expand_path(__FILE__ + '/../../spec_helper')

describe "Key Press" do
    
  it "Triggers autocomplete events" do
    selenium_driver.start_new_browser_session

    page.open "http://localhost:4444/selenium-server/tests/html/ajax/ajax_autocompleter2_test.html"
    page.key_press 'ac4', 74
    sleep 0.5
    page.key_press 'ac4', 97
    page.key_press 'ac4', 110
    sleep 0.5
    page.get_text('ac4update').should eql('Jane Agnews')
    page.key_press 'ac4', '\9'
    sleep 0.5
    page.get_value('ac4').should eql('Jane Agnews')
  end
    
end
