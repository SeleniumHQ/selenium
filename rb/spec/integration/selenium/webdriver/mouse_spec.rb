require File.expand_path("../spec_helper", __FILE__)

module Selenium
  module WebDriver
    describe Mouse do

      not_compliant_on :browser => [:android, :iphone, :safari] do
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

        it "double clicks an element" do
          driver.navigate.to url_for("javascriptPage.html")
          element = driver.find_element(:id, 'doubleClickField')

          driver.mouse.double_click element

          wait(5).until {
            element.attribute(:value) == 'DoubleClicked'
          }
        end

        it "context clicks an element" do
          driver.navigate.to url_for("javascriptPage.html")
          element = driver.find_element(:id, 'doubleClickField')

          driver.mouse.context_click element

          wait(5).until {
            element.attribute(:value) == 'ContextClicked'
          }
        end
      end

    end
  end
end
