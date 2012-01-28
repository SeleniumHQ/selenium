require File.expand_path("../spec_helper", __FILE__)

module Selenium::WebDriver::DriverExtensions
  describe HasTouchScreen do
    compliant_on :browser => :android do
      context "flick" do
        before {
          reset_driver!
          driver.get url_for("longContentPage.html")
          driver.rotation = :portrait
        }

        it "can flick horizontally from element" do
          link = driver.find_element(:id => "link1")
          link.location.x.should > 1500

          to_flick = driver.find_element(:id => "imagestart")
          driver.touch.flick(to_flick, -1000, 0, :normal).perform

          link.location.x.should < 1500
        end

        it "can flick horizontally fast from element" do
          link = driver.find_element(:id => "link2")
          link.location.x.should > 3500

          to_flick = driver.find_element(:id => "imagestart")
          driver.touch.flick(to_flick, -400, 0, :fast).perform

          link.location.x.should < 3500
        end

        not_compliant_on :browser => :android do
          it "can flick horizontally" do
            link = driver.find_element(:id => "link1")
            link.location.x.should > 1500

            driver.touch.flick(1000, 0).perform

            link.location.x.should < 1500
          end
        end

        not_compliant_on :browser => :android do
          # no compliant driver currently, see TouchFlickTest.java
          it "can flick horizontally fast"
        end

        it "can flick vertically from element" do
          link = driver.find_element(:id => "link3")
          link.location.y.should > 4200

          to_flick = driver.find_element(:id => "imagestart")
          driver.touch.flick(to_flick, 0, -600, :normal).perform

          link.location.y.should < 4000
        end

        it "can flick vertically fast from element" do
          link = driver.find_element(:id => "link4")
          link.location.y.should > 8700

          to_flick = driver.find_element(:id => "imagestart")
          driver.touch.flick(to_flick, 0, -600, :fast).perform

          link.location.y.should < 8700
        end

        it "can flick vertically" do
          link = driver.find_element(:id => "link3")
          link.location.y.should > 4200

          to_flick = driver.find_element(:id => "imagestart")
          driver.touch.flick(0, 750).perform

          link.location.y.should < 4200
        end

        it "can flick vertically fast" do
          link = driver.find_element(:id => "link4")
          link.location.y.should > 8700

          driver.touch.flick(0, 1500).perform

          link.location.y.should < 4000
        end
      end

      context "scroll" do
        before {
          reset_driver!
          driver.get url_for("longContentPage.html")
        }

        compliant_on :browser => nil do
          it "can scroll vertically from element" do
            link = driver.find_element(:id => "link3")
            link.location.y > 4200

            to_scroll = driver.find_element(:id => "imagestart")
            driver.touch.scroll(to_scroll, 0, -800).perform

            link.location.y.should < 3500
          end
        end

        it "can scroll vertically" do
          link = driver.find_element(:id => "link3")
          link.location.y > 4200

          driver.touch.scroll(0, 800).perform

          link.location.y.should < 3500
        end

        it "can scroll horizontally from element" do
          link = driver.find_element(:id => "link1")
          link.location.x.should > 1500

          to_scroll = driver.find_element(:id => "imagestart")
          driver.touch.scroll(to_scroll, -1000, 0).perform

          link.location.x < 1500
        end

        it "can scroll horizontally" do
          link = driver.find_element(:id => "link1")
          link.location.x.should > 1500

          driver.touch.scroll(400, 0).perform

          link.location.x < 1500
        end
      end

      context "single tap" do
        before { driver.get url_for("clicks.html") }

        it "can single tap on a link and follow it" do
          e = driver.find_element(:id => "normal")

          driver.touch.single_tap(e).perform
          wait.until { driver.title == "XHTML Test Page" }
        end

        it "can single tap on an anchor and not reload" do
          driver.execute_script "document.latch = true"

          e = driver.find_element(:id => "anchor")
          driver.touch.single_tap(e).perform

          same_page = driver.execute_script "return document.latch"
          same_page.should be_true
        end
      end

      context "double tap" do
        before { driver.get url_for("longContentPage.html") }

        it "can double tap an element" do
          image = driver.find_element(:id => "imagestart")
          image.location.y.should > 100

          driver.touch.double_tap(image).perform
          image.location.y.should < 50
        end
      end

      context "long press" do
        it "can long press on an element"
      end

    end
  end
end

