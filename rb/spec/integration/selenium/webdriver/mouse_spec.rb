require File.expand_path("../spec_helper", __FILE__)

module Selenium
  module WebDriver
    describe Mouse do
      compliant_on :browser => :ie do
        it "clicks an element" do
          driver.navigate.to url_for("formPage.html")
          driver.mouse.click driver.find_element(:id, "imageButton")
        end

        it "can drag and drop" do
          driver.navigate.to url_for("droppableItems.html")

          draggable = long_wait.until {
            driver.find_element(:id => "draggable")
          }

          droppable = driver.find_element(:id => "droppable")

          driver.mouse.down    draggable
          driver.mouse.move_to droppable
          driver.mouse.up      droppable

          text = droppable.find_element(:tag_name => "p").text
          text.should == "Dropped!"
        end
      end

      compliant_on :browser => nil do
        it "double clicks an element" do
          driver.navigate.to url_for("javascriptPage.html")
          element = driver.find_element(:id, 'doubleClickField')

          driver.mouse.double_click element
          element.value.should == 'DoubleClicked'
        end

        it "context clicks an element" do
          driver.navigate.to url_for("javascriptPage.html")
          element = driver.find_element(:id, 'doubleClickField')

          driver.mouse.context_click element
          element.value.should == 'ContextClicked'
        end
      end

    end
  end
end
