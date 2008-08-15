require File.expand_path(File.dirname(__FILE__) + '/../spec_helper')

describe "Screenshot" do
  
  it "can capture html for current page" do
    start
    open "http://localhost:4444/selenium-server/tests/html/test_click_page1.html"
    html = get_html_source
    html.should =~ /<head>/
  end
  
  it "captures PNG screenshot OS viewport as a file on Selenium RC local filesystem" do
    start
    FileUtils.rm_rf("/tmp/selenium_screenshot.png")
    open "http://localhost:4444/selenium-server/tests/html/test_click_page1.html"
    capture_screenshot "/tmp/selenium_screenshot.png"
    File.exists?("/tmp/selenium_screenshot.png").should be_true
    File.open("/tmp/selenium_screenshot.png", "r") do |io| 
      magic = io.read(4)
      magic.should == "\211PNG"
    end    
  end

  it "captures PNG screenshot OS viewport as a Base64 encoded PNG image" do
    start
    open "http://localhost:4444/selenium-server/tests/html/test_click_page1.html"
    encodedImage = capture_screenshot_to_string
    pngImage = Base64.decode64(encodedImage)
    pngImage.should =~ /^\211PNG/
  end
    
end