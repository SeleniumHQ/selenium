require File.expand_path("../spec_helper", __FILE__)

module Selenium
  module WebDriver
    describe Window do
      let(:window) { driver.manage.window }

      compliant_on :browser => :firefox do
        it "gets the size of the current window" do
          size = window.size

          size.should be_kind_of(Dimension)

          size.width.should > 0
          size.height.should > 0
        end

        it "sets the size of the current window" do
          size = window.size

          target_width = size.width - 20
          target_height = size.height - 20

          window.size = Dimension.new(target_width, target_height)

          new_size = window.size
          new_size.width.should == target_width
          new_size.height.should == target_height
        end

        it "gets the position of the current window" do
          pos = driver.manage.window.position

          pos.should be_kind_of(Point)

          pos.x.should >= 0
          pos.y.should >= 0
        end

        it "sets the position of the current window" do
          pos = window.position

          target_x = pos.x + 10
          target_y = pos.y + 10

          window.position = Point.new(target_x, target_y)

          new_pos = window.position
          new_pos.x.should == target_x
          new_pos.y.should == target_y
        end
      end

    end
  end
end
