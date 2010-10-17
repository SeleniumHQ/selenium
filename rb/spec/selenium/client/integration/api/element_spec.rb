require File.expand_path(__FILE__ + '/../../spec_helper')

describe "Element API" do
  it "can detect element presence" do
    page.open "http://localhost:4444/selenium-server/tests/html/test_element_present.html"
    page.element?('aLink').should be_true

    page.click 'removeLinkAfterAWhile', :wait_for => :no_element, :element => "aLink"
    page.element?('aLink').should be_false

    page.click 'addLinkAfterAWhile', :wait_for => :element, :element => "aLink"
    page.element?('aLink').should be_true
  end
end
