require File.expand_path(File.dirname(__FILE__) + '/spec_helper')

describe "Selenium Screenshot" do
  
  it "can capture html for current page" do
    open "http://www.google.com/webhp?hl=en"
    html = get_html_source
    html.should =~ /<head>/
  end
  
  it "captures PNG screenshot OS viewport as a file on Selenium RC local filesystem" do
    FileUtils.rm_rf("/tmp/selenium_screenshot.png")
    open "http://www.google.com/webhp?hl=en"
    capture_screenshot "/tmp/selenium_screenshot.png"
    File.exists?("/tmp/selenium_screenshot.png").should be_true
    File.open("/tmp/selenium_screenshot.png", "r") do |io| 
      magic = io.read(4)
      magic.should == "\211PNG"
    end    
  end

  it "captures PNG screenshot OS viewport as a Base64 encoded PNG image" do
    open "http://www.google.com/webhp?hl=en"
    encodedImage = capture_screenshot_to_string
    pngImage = Base64.decode64(encodedImage)
    pngImage.should =~ /^\211PNG/
  end
    
end