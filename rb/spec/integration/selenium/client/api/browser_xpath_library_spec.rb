require File.expand_path(__FILE__ + '/../../spec_helper')

describe "Browser XPath Library" do

  it "can be set to default" do
    page.browser_xpath_library = :default
  end

  it "can be set to ajaxslt" do
    page.browser_xpath_library = :ajaxslt
  end

  it "can be set to javascript-xpath" do
    page.browser_xpath_library = :'javascript-xpath'
  end

end
