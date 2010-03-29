require "#{File.dirname(__FILE__)}/spec_helper"

describe "Element" do

  it "should click" do
    driver.navigate.to url_for("formPage.html")
    driver.find_element(:id, "imageButton").click
  end

  it "should submit" do
    driver.navigate.to url_for("formPage.html")
    driver.find_element(:id, "submitButton").submit
  end

  it "should get value" do
    driver.navigate.to url_for("formPage.html")
    driver.find_element(:id, "cheese").value.should == "cheese"
  end

  it "should send string keys" do
    driver.navigate.to url_for("formPage.html")
    driver.find_element(:id, "working").send_keys("foo", "bar")
  end

  not_compliant_on :browser => :chrome do
    it "should send key presses" do
      driver.navigate.to url_for("javascriptPage.html")
      key_reporter = driver.find_element(:id, 'keyReporter')

      key_reporter.send_keys("Tet", :arrow_left, "s")
      key_reporter.value.should == "Test"
    end
  end

  it "should get attribute value" do
    driver.navigate.to url_for("formPage.html")
    driver.find_element(:id, "withText").attribute("rows").should == "5"
  end

  it "should return nil for non-existent attributes" do
    driver.navigate.to url_for("formPage.html")
    driver.find_element(:id, "withText").attribute("nonexistent").should be_nil
  end

  it "should toggle" do
    driver.navigate.to url_for("formPage.html")
    driver.find_element(:id, "checky").toggle
  end

  it "should clear" do
    driver.navigate.to url_for("formPage.html")
    driver.find_element(:id, "withText").clear
  end

  it "should get and set selected" do
    driver.navigate.to url_for("formPage.html")
    cheese = driver.find_element(:id, "cheese")
    peas   = driver.find_element(:id, "peas")

    cheese.select

    cheese.should be_selected
    peas.should_not be_selected

    peas.select

    peas.should be_selected
    cheese.should_not be_selected
  end

  it "should get enabled" do
    driver.navigate.to url_for("formPage.html")
    driver.find_element(:id, "notWorking").should_not be_enabled
  end

  it "should get text" do
    driver.navigate.to url_for("xhtmlTest.html")
    driver.find_element(:class, "header").text.should == "XHTML Might Be The Future"
  end

  it "should get displayed" do
    driver.navigate.to url_for("xhtmlTest.html")
    driver.find_element(:class, "header").should be_displayed
  end

  it "should get location" do
    driver.navigate.to url_for("xhtmlTest.html")
    loc = driver.find_element(:class, "header").location

    loc.x.should >= 0
    loc.y.should >= 0
  end

  it "should get size" do
    driver.navigate.to url_for("xhtmlTest.html")
    size = driver.find_element(:class, "header").size

    size.width.should > 0
    size.height.should > 0
  end

  not_compliant_on :browser => :chrome do
    it "should drag and drop" do
      driver.navigate.to url_for("dragAndDropTest.html")

      img1 = driver.find_element(:id, "test1")
      img2 = driver.find_element(:id, "test2")

      img1.drag_and_drop_by 100, 100
      img2.drag_and_drop_on(img1)

      img1.location.should == img2.location
    end
  end

  compliant_on :platform => :windows, :browser => :firefox do
    it "should hover over elements" do
      driver.navigate.to url_for("javascriptPage.html")

      element = driver.find_element(:id, 'menu1')
      item    = driver.find_element(:id, 'item1')

      item.text.should == ""

      # driver.execute_script("arguments[0].style.background = 'green'", element)
      element.hover

      item.text.should == "Item 1"
    end
  end

  it "should get css property" do
    driver.navigate.to url_for("javascriptPage.html")
    driver.find_element(:id, "green-parent").style("background-color").should == "#008000"
  end
end
