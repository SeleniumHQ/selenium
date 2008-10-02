require File.expand_path(__FILE__ + '/../../spec_helper')

describe "Cookie Handling" do

  it "delete all cookies" do
    selenium_driver.start_new_browser_session
  
    page.open "http://localhost:4444/selenium-server/tests/html/path1/cookie1.html"
    page.delete_all_visible_cookies
    page.cookies.should be_empty
    page.open "http://localhost:4444/selenium-server/tests/html/path2/cookie2.html"
    page.delete_all_visible_cookies
    page.cookies.should be_empty
  end
  
  it "can set cookies" do
    selenium_driver.start_new_browser_session
  
    page.open "http://localhost:4444/selenium-server/tests/html/path1/cookie1.html"
    page.create_cookie "addedCookieForPath1=new value1"
    page.create_cookie "addedCookieForPath2=new value2", :path => "/selenium-server/tests/html/path2/", :max_age => 60
    page.open "http://localhost:4444/selenium-server/tests/html/path1/cookie1.html"
    if selenium_driver.browser_string =~ /safari/
	    pending "Safari does not support this yet"
	  else 
      page.cookies.should =~ /addedCookieForPath1=new value1/
    end
    page.cookie?("addedCookieForPath1").should be_true
    page.cookie("addedCookieForPath1").should eql("new value1")
    page.cookie?("testCookie").should be_false
    page.cookie?("addedCookieForPath2").should be_false
  	page.delete_cookie "addedCookieForPath1", "/selenium-server/tests/html/path1/"
  	page.cookies.should be_empty
    page.open "http://localhost:4444/selenium-server/tests/html/path2/cookie2.html"
    page.cookie("addedCookieForPath2").should eql("new value2")
    page.cookie?("addedCookieForPath1").should be_false
  	page.delete_cookie "addedCookieForPath2", "/selenium-server/tests/html/path2/"
  	page.delete_cookie "addedCookieForPath2"
  	page.cookies.should be_empty
  end
	
	  it "Testing creating cookies with same name but diffrent paths" do
		  pending "not working yet" do
			  selenium_driver.start_new_browser_session

	  	  page.create_cookie "testCookieWithSameName=new value1", :path => "/"
		    page.create_cookie "testCookieWithSameName=new value2", :path => "/selenium-server/tests/html/path2/"
	      page.open "/selenium-server/tests/html/path1/cookie1.html"
		    page.cookie("testCookieWithSameName").should eql("new value1")
	      page.open "/selenium-server/tests/html/path2/cookie2.html"
		    page.cookies.should =~ /testCookieWithSameName=new value1/
		    page.cookies.should =~ /testCookieWithSameName=new value2/
	      page.delete_cookie "testCookieWithSameName", "/selenium-server/tests/html/path2/"
	      page.open "/selenium-server/tests/html/path2/cookie2.html"
		    page.cookie("testCookieWithSameName").should eql("new value1")
		  # verifyNotCookie /testCookieWithSameName=new value2/, &nbsp;
		end
	end
  
end
