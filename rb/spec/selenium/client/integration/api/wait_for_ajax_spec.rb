require File.expand_path(__FILE__ + '/../../spec_helper')

describe "Wait For Ajax" do
  describe "Prototype" do
    it "blocks until AJAX request is complete" do
      page.open "http://localhost:4567/prototype.html"
      page.text("calculator-result").should be_empty
      page.type "calculator-expression", "2 + 2"
      page.click "calculator-button", :wait_for => :ajax

      page.value("calculator-result").should eql("4")
    end
  end

  describe "jQuery" do
    it "blocks until AJAX request is complete" do
      page.open "http://localhost:4567/jquery.html"

      page.text("calculator-result").should be_empty

      page.type "calculator-expression", "2 + 2"
      page.click "calculator-button" , :wait_for => :ajax, :javascript_framework => :jquery

      page.value("calculator-result").should eql("4")
    end
  end
end
