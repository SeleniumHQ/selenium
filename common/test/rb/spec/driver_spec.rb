require "#{File.dirname(__FILE__)}/spec_helper"

describe "Driver" do
  it "should get the page title" do
    driver.navigate.to url_for("xhtmlTest.html")
    driver.title.should == "XHTML Test Page"
  end

  it "should get the page source" do
    driver.navigate.to url_for("xhtmlTest.html")
    driver.page_source.should match(%r[<title>XHTML Test Page</title>]i)
  end

  not_compliant_on :browser => [:ie, :chrome] do
    it "should refresh the page" do
      driver.navigate.to url_for("javascriptPage.html")
      driver.find_element(:link_text, 'Update a div').click
      driver.find_element(:id, 'dynamo').text.should == "Fish and chips!"
      driver.navigate.refresh
      driver.find_element(:id, 'dynamo').text.should == "What's for dinner?"
    end
  end

  compliant_on :driver => [:firefox, :chrome] do
    it "should save a screenshot" do
      driver.navigate.to url_for("xhtmlTest.html")
      path = "screenshot_tmp.png"

      begin
        driver.save_screenshot path
        File.exist?(path).should be_true # sic
        File.size(path).should > 0
      ensure
        File.delete(path) if File.exist?(path)
      end
    end

    it "should return a screenshot in the specified format" do
      driver.navigate.to url_for("xhtmlTest.html")

      ss = driver.screenshot_as(:png)
      ss.should be_kind_of(String)
      ss.size.should > 0
    end

    it "raises an error when given an unknown format" do
      lambda { driver.screenshot_as(:jpeg) }.should raise_error(WebDriver::Error::UnsupportedOperationError)
    end
  end

  describe "one element" do
    it "should find by id" do
      driver.navigate.to url_for("xhtmlTest.html")
      element = driver.find_element(:id, "id1")
      element.should be_kind_of(WebDriver::Element)
      element.text.should == "Foo"
    end

    it "should find by field name" do
      driver.navigate.to url_for("formPage.html")
      driver.find_element(:name, "x").value.should == "name"
    end

    it "should find by class name" do
      driver.navigate.to url_for("xhtmlTest.html")
      driver.find_element(:class, "header").text.should == "XHTML Might Be The Future"
    end

    it "should find by link text" do
      driver.navigate.to url_for("xhtmlTest.html")
      driver.find_element(:link, "Foo").text.should == "Foo"
    end

    it "should find by xpath" do
      driver.navigate.to url_for("xhtmlTest.html")
      driver.find_element(:xpath, "//h1").text.should == "XHTML Might Be The Future"
    end

    not_compliant_on :driver => [:ie, :remote] do
      it "should find by css selector" do
        if driver.bridge.browser == :firefox && driver.bridge.capabilities.version < "3.5"
          pending "needs Firefox >= 3.5"
        end

        driver.navigate.to url_for("xhtmlTest.html")
        driver.find_element(:css, "div.content")
      end
    end

    it "should find by tag name" do
      driver.navigate.to url_for("xhtmlTest.html")
      driver.find_element(:tag_name, 'div').attribute("class").should == "navigation"
    end

    it "should find child element" do
      driver.navigate.to url_for("nestedElements.html")

      element = driver.find_element(:name, "form2")
      child   = element.find_element(:name, "selectomatic")

      child.attribute("id").should == "2"
    end

    it "should find child element by tag name" do
      driver.navigate.to url_for("nestedElements.html")

      element = driver.find_element(:name, "form2")
      child   = element.find_element(:tag_name, "select")

      child.attribute("id").should == "2"
    end

    it "should raise on nonexistant element" do
      driver.navigate.to url_for("xhtmlTest.html")
      lambda { driver.find_element("nonexistant") }.should raise_error
    end

    it "should find via alternate syntax" do
      driver.navigate.to url_for("xhtmlTest.html")
      driver.find_element(:class => "header").text.should == "XHTML Might Be The Future"
    end
  end

  describe "many elements" do
    it "should find by class name" do
      driver.navigate.to url_for("xhtmlTest.html")
      driver.find_elements(:class, "nameC").should have(2).things
    end

    not_compliant_on :driver => [:ie, :remote] do
      it "should find by css selector" do
        if driver.bridge.browser == :firefox && driver.bridge.capabilities.version < "3.5"
          pending "needs Firefox >= 3.5"
        end

        driver.navigate.to url_for("xhtmlTest.html")
        driver.find_elements(:css, 'p')
      end
    end

    it "should find children by field name" do
      driver.navigate.to url_for("nestedElements.html")
      element = driver.find_element(:name, "form2")
      children = element.find_elements(:name, "selectomatic")
      children.should have(2).items
    end
  end

  describe "#execute_script" do
    it "should return strings" do
      driver.navigate.to url_for("xhtmlTest.html")
      driver.execute_script("return document.title;").should == "XHTML Test Page"
    end

    it "should return numbers" do
      driver.navigate.to url_for("xhtmlTest.html")
      driver.execute_script("return document.title.length;").should == "XHTML Test Page".length
    end

    it "should return elements" do
      driver.navigate.to url_for("xhtmlTest.html")
      element = driver.execute_script("return document.getElementById('id1');")
      element.should be_kind_of(WebDriver::Element)
      element.text.should == "Foo"
    end

    it "should return booleans" do
      driver.navigate.to url_for("xhtmlTest.html")
      driver.execute_script("return true;").should == true
    end

    it "should raise if the script is bad" do
      driver.navigate.to url_for("xhtmlTest.html")
      lambda { driver.execute_script("return squiggle();") }.should raise_error
    end

    it "should return arrays" do
      driver.navigate.to url_for("xhtmlTest.html")
      driver.execute_script('return ["zero", "one", "two"];').should == %w[zero one two]
    end

    it "should be able to call functions on the page" do
      driver.navigate.to url_for("javascriptPage.html")
      driver.execute_script("displayMessage('I like cheese');")
      driver.find_element(:id, "result").text.strip.should == "I like cheese"
    end

    it "should be able to pass string arguments" do
      driver.navigate.to url_for("javascriptPage.html")
      driver.execute_script("return arguments[0] == 'fish' ? 'fish' : 'not fish';", "fish").should == "fish"
    end

    it "should be able to pass boolean arguments" do
      driver.navigate.to url_for("javascriptPage.html")
      driver.execute_script("return arguments[0] == true;", true).should == true
    end

    it "should be able to pass numeric arguments" do
      driver.navigate.to url_for("javascriptPage.html")
      driver.execute_script("return arguments[0] == 1 ? 1 : 0;", 1).should == 1
    end

    it "should be able to pass element arguments" do
      driver.navigate.to url_for("javascriptPage.html")
      button = driver.find_element(:id, "plainButton")
      driver.execute_script("arguments[0]['flibble'] = arguments[0].getAttribute('id'); return arguments[0]['flibble'];", button).should == "plainButton"
    end

    it "should be able to pass in multiple arguments" do
      driver.navigate.to url_for("javascriptPage.html")
      driver.execute_script("return arguments[0] + arguments[1];", "one", "two").should == "onetwo"
    end
  end

end

