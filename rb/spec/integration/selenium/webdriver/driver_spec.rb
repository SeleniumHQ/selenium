require File.expand_path("../spec_helper", __FILE__)

describe "Driver" do
  it "should get the page title" do
    driver.navigate.to url_for("xhtmlTest.html")
    driver.title.should == "XHTML Test Page"
  end

  it "should get the page source" do
    driver.navigate.to url_for("xhtmlTest.html")
    driver.page_source.should match(%r[<title>XHTML Test Page</title>]i)
  end


  not_compliant_on :browser => :safari do
    it "should refresh the page" do
      driver.navigate.to url_for("javascriptPage.html")
      driver.find_element(:link_text, 'Update a div').click
      driver.find_element(:id, 'dynamo').text.should == "Fish and chips!"
      driver.navigate.refresh
      driver.find_element(:id, 'dynamo').text.should == "What's for dinner?"
    end
  end

  not_compliant_on :browser => [:opera, :iphone, :safari] do
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
      driver.find_element(:name, "x").attribute('value').should == "name"
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

    it "should find by css selector" do
      driver.navigate.to url_for("xhtmlTest.html")
      driver.find_element(:css, "div.content").attribute("class").should == "content"
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

    it "should find elements with a hash selector" do
      driver.navigate.to url_for("xhtmlTest.html")
      driver.find_element(:class => "header").text.should == "XHTML Might Be The Future"
    end

    it "should find elements with the shortcut syntax" do
      driver.navigate.to url_for("xhtmlTest.html")

      driver[:id1].should be_kind_of(WebDriver::Element)
      driver[:xpath => "//h1"].should be_kind_of(WebDriver::Element)
    end
  end

  describe "many elements" do
    it "should find by class name" do
      driver.navigate.to url_for("xhtmlTest.html")
      driver.find_elements(:class, "nameC").should have(2).things
    end

    it "should find by css selector" do
      driver.navigate.to url_for("xhtmlTest.html")
      driver.find_elements(:css, 'p')
    end

    it "should find children by field name" do
      driver.navigate.to url_for("nestedElements.html")
      element = driver.find_element(:name, "form2")
      children = element.find_elements(:name, "selectomatic")
      children.should have(2).items
    end
  end

  describe "execute script" do
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

    not_compliant_on :browser => [:opera, :android] do
      it "should unwrap elements in deep objects" do
        driver.navigate.to url_for("xhtmlTest.html")
        result = driver.execute_script(<<-SCRIPT)
          var e1 = document.getElementById('id1');
          var body = document.body;

          return {
            elements: {'body' : body, other: [e1] }
          };
        SCRIPT

        result.should be_kind_of(Hash)
        result['elements']['body'].should be_kind_of(WebDriver::Element)
        result['elements']['other'].first.should be_kind_of(WebDriver::Element)
      end
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

  not_compliant_on :browser => [:opera, :iphone, :android] do
    describe "execute async script" do
      before {
        driver.manage.timeouts.script_timeout = 0
        driver.navigate.to url_for("ajaxy_page.html")
      }

      it "should be able to return arrays of primitives from async scripts" do
        result = driver.execute_async_script "arguments[arguments.length - 1]([null, 123, 'abc', true, false]);"
        result.should == [nil, 123, 'abc', true, false]
      end

      it "should be able to pass multiple arguments to async scripts" do
        result = driver.execute_async_script "arguments[arguments.length - 1](arguments[0] + arguments[1]);", 1, 2
        result.should == 3
      end

      it "times out if the callback is not invoked" do
        lambda {
          # Script is expected to be async and explicitly callback, so this should timeout.
          driver.execute_async_script "return 1 + 2;"
        }.should raise_error(Selenium::WebDriver::Error::ScriptTimeOutError)
      end
    end
  end

end

