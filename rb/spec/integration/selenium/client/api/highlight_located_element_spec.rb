require File.expand_path(__FILE__ + '/../../spec_helper')

describe "Highlight Located Element" do
  it "can be enabled and disabled on the fly" do
    page.open "http://localhost:4567/jquery.html"
    page.execution_delay = 1000
    page.highlight_located_element = true
    begin
      page.text("calculator-result").should be_empty

      page.type "calculator-expression", "2 + 2"
      page.click "calculator-button" , :wait_for => :ajax, :javascript_framework => :jquery

      page.value("calculator-result").should eql("4")
    ensure
      page.highlight_located_element = false
    end
  end
end
