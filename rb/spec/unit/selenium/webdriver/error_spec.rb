require File.expand_path("../spec_helper", __FILE__)

module Selenium
  module WebDriver
    describe Error do

      context "backwards compatibility" do
        it "aliases StaleElementReferenceError as ObsoleteElementError" do
          lambda {
            raise Error::StaleElementReferenceError
          }.should raise_error(Error::ObsoleteElementError)
        end

        it "aliases UnknownError as UnhandledError" do
          lambda {
            raise Error::UnknownError
          }.should raise_error(Error::UnhandledError)
        end

        it "aliases JavascriptError as UnexpectedJavascriptError" do
          lambda {
            raise Error::JavascriptError
          }.should raise_error(Error::UnexpectedJavascriptError)
        end

        it "aliases NoAlertPresentError as NoAlertOpenError" do
          lambda {
            raise Error::NoAlertPresentError
          }.should raise_error(Error::NoAlertOpenError)
        end

        it "aliases ElementNotVisibleError as ElementNotDisplayedError" do
          lambda {
            raise Error::ElementNotVisibleError
          }.should raise_error(Error::ElementNotDisplayedError)
        end
      end

    end
  end
end
