module Selenium
  module WebDriver
    module Error

      class WebDriverError < StandardError; end
      class IndexOutOfBoundsError < WebDriverError; end        # 1
      class NoCollectionError < WebDriverError; end            # 2
      class NoStringError < WebDriverError; end                # 3
      class NoStringLengthError < WebDriverError; end          # 4
      class NoStringWrapperError < WebDriverError; end         # 5
      class NoSuchDriverError < WebDriverError; end            # 6
      class NoSuchElementError < WebDriverError; end           # 7
      class NoSuchFrameError < WebDriverError; end             # 8
      class UnknownCommandError < WebDriverError; end          # 9
      class ObsoleteElementError < WebDriverError; end         # 10
      class ElementNotDisplayedError < WebDriverError; end     # 11
      class ElementNotEnabledError < WebDriverError; end       # 12
      class UnhandledError < WebDriverError; end               # 13
      class ExpectedError < WebDriverError; end                # 14
      class ElementNotSelectableError < WebDriverError; end    # 15
      class NoSuchDocumentError < WebDriverError; end          # 16
      class UnexpectedJavascriptError < WebDriverError; end    # 17
      class NoScriptResultError < WebDriverError; end          # 18
      class UnknownScriptResultError < WebDriverError; end     # 19
      class NoSuchCollectionError < WebDriverError; end        # 20
      class TimeOutError < WebDriverError; end                 # 21
      class NullPointerError < WebDriverError; end             # 22
      class NoSuchWindowError < WebDriverError; end            # 23
      class InvalidCookieDomainError < WebDriverError; end     # 24
      class UnableToSetCookieError < WebDriverError; end       # 25
      class UnsupportedOperationError < WebDriverError; end

      Errors = [
        IndexOutOfBoundsError,
        NoCollectionError,
        NoStringError,
        NoStringLengthError,
        NoStringWrapperError,
        NoSuchDriverError,
        NoSuchElementError,
        NoSuchFrameError,
        UnknownCommandError,
        ObsoleteElementError,
        ElementNotDisplayedError,
        ElementNotEnabledError,
        UnhandledError,
        ExpectedError,
        ElementNotSelectableError,
        NoSuchDocumentError,
        UnexpectedJavascriptError,
        NoScriptResultError,
        UnknownScriptResultError,
        NoSuchCollectionError,
        TimeOutError,
        NullPointerError,
        NoSuchWindowError,
        InvalidCookieDomainError,
        UnableToSetCookieError
      ]

      class << self
        def for_code(code)
          return if code == 0

          Errors[code - 1] || WebDriverError
        end
      end

    end # Error
  end # WebDriver
end # Selenium
