require File.expand_path(__FILE__ + '/../../spec_helper')

describe "#wait_for_text" do
  it "wait_for_text does not block when text is present" do
    page.open "http://localhost:4567/jquery.html"
    page.wait_for_text "jQuery - Selenium Ruby Client Sample App"
    page.wait_for_text "jQuery - Selenium Ruby Client Sample App", :element => "title"
  end

  it "wait_for_text timeouts when text is not present" do
    page.open "http://localhost:4567/jquery.html"

    should_timeout do
      page.wait_for_text "We All Need Some Mojo", :timeout_in_seconds => 2
    end

    should_timeout do
      page.wait_for_text "We All Need Some Mojo",
                         :element => "new-element", :timeout_in_seconds => 2
    end
  end

  it "wait_for_text detects dynamics changes in the DOM" do
    page.open "http://localhost:4567/jquery.html"
    page.click "create-element-button", :wait_for => :text,
                                        :text     => "We All Need Some Mojo"
    page.click "delete-element-button", :wait_for => :no_text,
                                        :text     => "We All Need Some Mojo"
    page.click "create-element-button", :wait_for => :text,
                                        :text     => "We All Need Some Mojo",
                                        :element  => "new-element"
    page.click "delete-element-button", :wait_for => :no_text,
                                        :text     => "We All Need Some Mojo",
                                        :element  => "new-element"
    should_timeout do
      page.wait_for_text "We All Need Some Mojo", :element => "new-element",
                                                  :timeout_in_seconds => 2
    end

    should_timeout do
      page.wait_for_text "We All Need Some Mojo", :timeout_in_seconds => 2
    end
  end

  it "wait_for_text can handle quotes and double quotes in its locator definition" do
    page.open "http://localhost:4567/jquery.html"

    page.wait_for_text "jQuery - Selenium Ruby Client Sample App", :element => "//h1[@id='title']"
    page.wait_for_no_text "Some With A ' Single Quote"

    page.click "create-element-button", :wait_for => :text,
                                        :text     => "We All Need Some Mojo",
                                        :element  => "//div[@id='new-element']"
  end

  it "wait_for_text support incremental searches anywhere in the page" do
    page.open "http://localhost:4567/jquery.html"

    page.wait_for_text "Sample App"
    page.wait_for_text "Ruby Client"
  end

  it "wait_for_text support matching text using regular expressions" do
    page.open "http://localhost:4567/jquery.html"

    page.wait_for_text(/Sample App/)
    page.wait_for_text(/Sample.*App/)
    page.wait_for_text(/Selenium.*Client/,      :element => "//h1[@id='title']")
    page.wait_for_no_text(/^Selenium.*Client$/, :element => "//h1[@id='title']")
    page.wait_for_text(/here/,                  :element => "dangerous-characters")
    page.wait_for_text(/' \/ \\/,               :element => "dangerous-characters")
  end
end

describe "#wait_for_no_text" do
  it "does not block when element is not present" do
    page.open "http://localhost:4567/jquery.html"
    page.wait_for_no_text "Does Not Exists"
    page.wait_for_no_text "We All Need Some Mojo"
    page.wait_for_no_text "No The Actual Title", :element => "title"
    page.wait_for_no_text "We All Need Some Mojo", :element => "new-element"
    page.wait_for_no_text "We All Need Some Mojo", :element => "does-not-exists"
  end

  it "times out when element is present" do
    page.open "http://localhost:4567/jquery.html"

    should_timeout do
      page.wait_for_no_text "jQuery - Selenium Ruby Client Sample App",
                            :timeout_in_seconds => 2
    end

    should_timeout do
      page.wait_for_no_text "jQuery - Selenium Ruby Client Sample App",
                            :element => "title", :timeout_in_seconds => 2
    end
  end
end
