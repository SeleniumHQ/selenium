module Selenium
  module WebDriver
    module Error

      class WebDriverError < StandardError; end
      class IndexOutOfBoundsError < WebDriverError; end          # 1
      class NoCollectionError < WebDriverError; end              # 2
      class NoStringError < WebDriverError; end                  # 3
      class NoStringLengthError < WebDriverError; end            # 4
      class NoStringWrapperError < WebDriverError; end           # 5
      class NoSuchDriverError < WebDriverError; end              # 6
      class NoSuchElementError < WebDriverError; end             # 7
      class NoSuchFrameError < WebDriverError; end               # 8
      class UnknownCommandError < WebDriverError; end            # 9
      class ObsoleteElementError < WebDriverError; end           # 10
      class ElementNotDisplayedError < WebDriverError; end       # 11
      class InvalidElementStateError < WebDriverError; end       # 12
      class UnhandledError < WebDriverError; end                 # 13
      class ExpectedError < WebDriverError; end                  # 14
      class ElementNotSelectableError < WebDriverError; end      # 15
      class NoSuchDocumentError < WebDriverError; end            # 16
      class UnexpectedJavascriptError < WebDriverError; end      # 17
      class NoScriptResultError < WebDriverError; end            # 18
      class XPathLookupError < WebDriverError; end               # 19
      class NoSuchCollectionError < WebDriverError; end          # 20
      class TimeOutError < WebDriverError; end                   # 21
      class NullPointerError < WebDriverError; end               # 22
      class NoSuchWindowError < WebDriverError; end              # 23
      class InvalidCookieDomainError < WebDriverError; end       # 24
      class UnableToSetCookieError < WebDriverError; end         # 25
      class UnexpectedAlertError < WebDriverError; end           # 26
      class NoAlertOpenError < WebDriverError; end               # 27
      class ScriptTimeOutError < WebDriverError; end             # 28
      class InvalidElementCoordinatesError < WebDriverError; end # 29
                                                                 # 30
                                                                 # 31
      class InvalidSelectorError < WebDriverError; end           # 32
      class UnsupportedOperationError < WebDriverError; end

      Errors = [
        IndexOutOfBoundsError,          # 1
        NoCollectionError,              # 2
        NoStringError,                  # 3
        NoStringLengthError,            # 4
        NoStringWrapperError,           # 5
        NoSuchDriverError,              # 6
        NoSuchElementError,             # 7
        NoSuchFrameError,               # 8
        UnknownCommandError,            # 9
        ObsoleteElementError,           # 10
        ElementNotDisplayedError,       # 11
        InvalidElementStateError,       # 12
        UnhandledError,                 # 13
        ExpectedError,                  # 14
        ElementNotSelectableError,      # 15
        NoSuchDocumentError,            # 16
        UnexpectedJavascriptError,      # 17
        NoScriptResultError,            # 18
        XPathLookupError,               # 19
        NoSuchCollectionError,          # 20
        TimeOutError,                   # 21
        NullPointerError,               # 22
        NoSuchWindowError,              # 23
        InvalidCookieDomainError,       # 24
        UnableToSetCookieError,         # 25
        UnexpectedAlertError,           # 26
        NoAlertOpenError,               # 27
        ScriptTimeOutError,             # 28
        InvalidElementCoordinatesError, # 29
        nil,                            # 30
        nil,                            # 31
        InvalidSelectorError            # 32
      ]

      class << self
        def for_code(code)
          return if code == 0
          return WebDriverError if code.nil?

          Errors[code - 1] || WebDriverError
        end
      end

    end # Error
  end # WebDriver
end # Selenium
