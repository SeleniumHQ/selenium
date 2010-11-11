require File.expand_path(File.dirname(__FILE__) + '/../spec_helper')

describe "Screenshot" do
  it "can capture html for current page" do
    page.open "http://localhost:4444/selenium-server/tests/html/test_click_page1.html"
    page.get_html_source.should =~ /<head>/
  end

  it "captures PNG screenshot OS viewport as a file on Selenium RC local filesystem" do
    tempfile = File.join(Dir.tmpdir, "selenium_screenshot.png")

    page.open "http://localhost:4444/selenium-server/tests/html/test_click_page1.html"
    page.capture_screenshot tempfile

    File.exists?(tempfile).should be_true
    File.open(tempfile, "r") do |io|
      magic = io.read(4)
      magic.should == "\211PNG"
    end
  end

  it "captures PNG screenshot OS viewport as a Base64 encoded PNG image" do
    page.open "http://localhost:4444/selenium-server/tests/html/test_click_page1.html"
    encodedImage = page.capture_screenshot_to_string
    pngImage = Base64.decode64(encodedImage)

    pngImage.should =~ /^\211PNG/
  end
end