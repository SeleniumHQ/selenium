module WebDriver
  module Error
    class IndexOutOfBoundsError < StandardError; end        # 1
    class NoCollectionError < StandardError; end            # 2
    class NoStringError < StandardError; end                # 3
    class NoStringLengthError < StandardError; end          # 4
    class NoStringWrapperError < StandardError; end         # 5
    class NoSuchDriverError < StandardError; end            # 6
    class NoSuchElementError < StandardError; end           # 7
    class NoSuchFrameError < StandardError; end             # 8
    # NotImplementedError                                   # 9 - just use Ruby's
    class ObsoleteElementError < StandardError; end         # 10
    class ElementNotDisplayedError < StandardError; end     # 11
    class ElementNotEnabledError < StandardError; end       # 12
    class UnhandledError < StandardError; end               # 13
    class ExpectedError < StandardError; end                # 14
    class ElementNotSelectedError < StandardError; end      # 15
    class NoSuchDocumentError < StandardError; end          # 16
    class UnexpectedJavascriptError < StandardError; end    # 17
    class NoScriptResultError < StandardError; end          # 18
    class UnknownScriptResultError < StandardError; end     # 19
    class NoSuchCollectionError < StandardError; end        # 20
    class TimeOutError < StandardError; end                 # 21
    class NullPointerError < StandardError; end             # 22
    class NoSuchWindowError < StandardError; end            # 23

    class UnsupportedOperationError < StandardError; end
    class WebDriverError < StandardError; end

    Errors = [
      IndexOutOfBoundsError,
      NoCollectionError,
      NoStringError,
      NoStringLengthError,
      NoStringWrapperError,
      NoSuchDriverError,
      NoSuchElementError,
      NoSuchFrameError,
      NotImplementedError,
      ObsoleteElementError,
      ElementNotDisplayedError,
      ElementNotEnabledError,
      UnhandledError,
      ExpectedError,
      ElementNotSelectedError,
      NoSuchDocumentError,
      UnexpectedJavascriptError,
      NoScriptResultError,
      UnknownScriptResultError,
      NoSuchCollectionError,
      TimeOutError,
      NullPointerError,
      NoSuchWindowError
    ]

    class << self
      def for_code(code)
        return if code == 0

        Errors[code - 1] || WebDriverError
      end
    end

  end # Error
end # WebDriver
