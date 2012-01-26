require File.expand_path("../spec_helper", __FILE__)

describe "Driver" do
  compliant_on :browser => :android do
    context "flick" do
      it "can flick horizontally from element"
      it "can flick horizontally fast from element"
      it "can flick horizontally"
      it "can flick horizontally fast"
      it "can flick vertically from element"
      it "can flick vertically fast from element"
      it "can flick vertically"
      it "can flick vertically fast"
    end

    context "scroll" do
      it "can scroll horizontally from element"
      it "can scroll vertically from element"
      it "can scroll vertically"
      it "can scroll horizontally"
    end

    context "single tap" do
      it "can single tap on a link and follow it"
      it "can single tap on an anchor and not reload"
    end

    context "double tap" do
      it "can double tap an element"
    end

    context "long press" do
      it "can long press on an element"
    end
  end
end

