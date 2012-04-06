require File.expand_path("../spec_helper", __FILE__)

module Selenium
  module WebDriver
    describe Window do
      let(:window) { driver.manage.window }

      compliant_on :browser => [:firefox, :chrome] do
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

      compliant_on({:browser => :ie},
                   {:browser => :firefox, :platform => [:windows, :macosx]},
                   {:browser => :firefox, :platform => :linux, :window_manager => true}) do
        it "can maximize the current window" do
          window.size = old_size = Dimension.new(200, 200)

          window.maximize

          new_size = window.size
          new_size.width.should > old_size.width
          new_size.height.should > old_size.height
        end
      end

    end
  end
end
