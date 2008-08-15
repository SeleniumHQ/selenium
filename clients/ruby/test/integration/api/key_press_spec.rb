require File.expand_path(__FILE__ + '/../../spec_helper')

describe "Key Press" do
    
  it "Triggers autocomplete events" do
    start
    open "http://www.irian.at/selenium-server/tests/html/ajax/ajax_autocompleter2_test.html"
    key_press 'ac4', 74
    sleep 0.5
    key_press 'ac4', 97
    key_press 'ac4', 110
    sleep 0.5
    assert_equal('Jane Agnews', get_text('ac4update'))
    key_press 'ac4', '\9'
    sleep 0.5
    assert_equal('Jane Agnews', get_value('ac4'))
  end
    
end
