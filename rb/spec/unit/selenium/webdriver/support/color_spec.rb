require File.expand_path("../../spec_helper", __FILE__)

module Selenium
  module WebDriver
    module Support
      describe Color do
        it "converts rgb to rgb" do
          str = "rgb(1, 2, 3)"
          Color.from_string(str).rgb.should == str
        end

        it "converts rgb to rgba" do
          str = "rgb(1, 2, 3)"
          Color.from_string(str).rgba.should == "rgba(1, 2, 3, 1)"
        end

        it "converts rgb percent to rgba" do
          str = "rgb(10%, 20%, 30%)"
          Color.from_string(str).rgba.should == "rgba(25, 51, 76, 1)"
        end

        it "allows whitespace in rgb string" do
          str = "rgb(\t1,   2    , 3)"
          Color.from_string(str).rgb.should == "rgb(1, 2, 3)"
        end

        it "converts rgba to rgba" do
          str = "rgba(1, 2, 3, 0.5)"
          Color.from_string(str).rgba.should == str
        end

        it "converts rgba percent to rgba" do
          str = "rgba(10%, 20%, 30%, 0.5)"
          Color.from_string(str).rgba.should == "rgba(25, 51, 76, 0.5)"
        end

        it "converts hex to hex" do
          str = "#ff00a0"
          Color.from_string(str).hex.should == str
        end

        it "converts hex to rgb" do
          hex = "#01Ff03"
          rgb = "rgb(1, 255, 3)"

          Color.from_string(hex).rgb.should == rgb
        end

        it "converts hex to rgba" do
          hex = "#01Ff03"
          rgba = "rgba(1, 255, 3, 1)"

          Color.from_string(hex).rgba.should == rgba

          hex = "#00ff33";
          rgba = "rgba(0, 255, 51, 1)"

          Color.from_string(hex).rgba.should == rgba
        end

        it "converts rgb to hex" do
          Color.from_string("rgb(1, 255, 3)").hex.should == "#01ff03"
        end

        it "converts hex3 to rgba" do
          Color.from_string("#0f3").rgba.should == "rgba(0, 255, 51, 1)"
        end

        it "converts hsl to rgba" do
          hsl = "hsl(120, 100%, 25%)"
          rgba = "rgba(0, 128, 0, 1)"

          Color.from_string(hsl).rgba.should == rgba

          hsl = "hsl(100, 0%, 50%)"
          rgba = "rgba(128, 128, 128, 1)"

          Color.from_string(hsl).rgba.should == "rgba(128, 128, 128, 1)"
        end

        it "converts hsla to rgba" do
          hsla = "hsla(120, 100%, 25%, 1)"
          rgba = "rgba(0, 128, 0, 1)"

          Color.from_string(hsla).rgba.should == rgba

          hsla = "hsla(100, 0%, 50%, 0.5)"
          rgba = "rgba(128, 128, 128, 0.5)"

          Color.from_string(hsla).rgba.should == rgba
        end

        it "is equal to a color with the same values" do
          rgba  = "rgba(30, 30, 30, 0.2)"
          other = "rgba(30, 30, 30, 1)"

          Color.from_string(rgba).should == Color.from_string(rgba)
          Color.from_string(rgba).should_not == Color.from_string(other)
        end

        it "implements #hash correctly" do
          a = Color.from_string("#000")
          b = Color.from_string("#001")
          c = Color.from_string("#000")

          h = {}
          h[a] = 1
          h[b] = 2
          h[c] = 3

          h.values.sort.should == [2, 3]
        end

      end
    end
  end
end


