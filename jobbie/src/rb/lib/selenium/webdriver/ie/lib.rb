module Selenium
  module WebDriver
    module IE

      #
      # @private
      #

      module Lib
        extend FFI::Library

        if Platform.bitsize == 64
          ffi_lib WebDriver::IE::DLLS[:x64]
        else
          ffi_lib WebDriver::IE::DLLS[:win32]
        end

        attach_function :wdAddBooleanScriptArg,               [:pointer, :int                                             ], :int
        attach_function :wdAddCookie,                         [:pointer, :pointer                                         ], :int
        attach_function :wdAddDoubleScriptArg,                [:pointer, :double                                          ], :int
        attach_function :wdAddElementScriptArg,               [:pointer, :pointer                                         ], :int
        attach_function :wdAddNumberScriptArg,                [:pointer, :long                                            ], :int
        attach_function :wdAddStringScriptArg,                [:pointer, :pointer                                         ], :int
        attach_function :wdcGetElementAtIndex,                [:pointer, :int, :pointer                                   ], :int
        attach_function :wdcGetElementCollectionLength,       [:pointer, :pointer                                         ], :int
        attach_function :wdcGetStringAtIndex,                 [:pointer, :int, :pointer                                   ], :int
        attach_function :wdcGetStringCollectionLength,        [:pointer, :pointer                                         ], :int
        attach_function :wdClose,                             [:pointer                                                   ], :int
        attach_function :wdCopyString,                        [:pointer, :int, :pointer                                   ], :int
        attach_function :wdeClear,                            [:pointer                                                   ], :int
        attach_function :wdeClick,                            [:pointer                                                   ], :int
        attach_function :wdeGetAttribute,                     [:pointer, :pointer, :pointer, :pointer                     ], :int
        attach_function :wdeGetDetailsOnceScrolledOnToScreen, [:pointer, :pointer, :pointer, :pointer, :pointer, :pointer ], :int
        attach_function :wdeGetLocation,                      [:pointer, :pointer, :pointer                               ], :int
        attach_function :wdeGetSize,                          [:pointer, :pointer, :pointer                               ], :int
        attach_function :wdeGetTagName,                       [:pointer, :pointer                                         ], :int
        attach_function :wdeGetText,                          [:pointer, :pointer                                         ], :int
        attach_function :wdeGetValueOfCssProperty,            [:pointer, :pointer, :pointer                               ], :int
        attach_function :wdeIsDisplayed,                      [:pointer, :pointer                                         ], :int
        attach_function :wdeIsEnabled,                        [:pointer, :pointer                                         ], :int
        attach_function :wdeIsSelected,                       [:pointer, :pointer                                         ], :int
        attach_function :wdeMouseDownAt,                      [:pointer, :long, :long                                     ], :int #hwnd, nativelong
        attach_function :wdeMouseMoveTo,                      [:pointer, :long, :long, :long, :long, :long                ], :int # hwnd, 5x nativelong
        attach_function :wdeMouseUpAt,                        [:pointer, :long, :long                                     ], :int # hwnd
        attach_function :wdeSendKeys,                         [:pointer, :pointer                                         ], :int
        attach_function :wdeSetSelected,                      [:pointer                                                   ], :int
        attach_function :wdeSubmit,                           [:pointer                                                   ], :int
        attach_function :wdeToggle,                           [:pointer, :pointer                                         ], :int
        attach_function :wdExecuteScript,                     [:pointer, :pointer, :pointer, :pointer                     ], :int
        attach_function :wdeFreeElement,                      [:pointer                                                   ], :int
        attach_function :wdFindElementByClassName,            [:pointer, :pointer, :pointer, :pointer                     ], :int
        attach_function :wdFindElementById,                   [:pointer, :pointer, :pointer, :pointer                     ], :int
        attach_function :wdFindElementByLinkText,             [:pointer, :pointer, :pointer, :pointer                     ], :int
        attach_function :wdFindElementByName,                 [:pointer, :pointer, :pointer, :pointer                     ], :int
        attach_function :wdFindElementByPartialLinkText,      [:pointer, :pointer, :pointer, :pointer                     ], :int
        attach_function :wdFindElementByTagName,              [:pointer, :pointer, :pointer, :pointer                     ], :int
        attach_function :wdFindElementByXPath,                [:pointer, :pointer, :pointer, :pointer                     ], :int
        attach_function :wdFindElementsByClassName,           [:pointer, :pointer, :pointer, :pointer                     ], :int
        attach_function :wdFindElementsById,                  [:pointer, :pointer, :pointer, :pointer                     ], :int
        attach_function :wdFindElementsByLinkText,            [:pointer, :pointer, :pointer, :pointer                     ], :int
        attach_function :wdFindElementsByName,                [:pointer, :pointer, :pointer, :pointer                     ], :int
        attach_function :wdFindElementsByPartialLinkText,     [:pointer, :pointer, :pointer, :pointer                     ], :int
        attach_function :wdFindElementsByTagName,             [:pointer, :pointer, :pointer, :pointer                     ], :int
        attach_function :wdFindElementsByXPath,               [:pointer, :pointer, :pointer, :pointer                     ], :int
        attach_function :wdFreeDriver,                        [:pointer                                                   ], :int
        attach_function :wdFreeElementCollection,             [:pointer, :int                                             ], :int
        attach_function :wdFreeScriptArgs,                    [:pointer                                                   ], :int
        attach_function :wdFreeScriptResult,                  [:pointer                                                   ], :int
        attach_function :wdFreeString,                        [:pointer                                                   ], :int
        attach_function :wdFreeStringCollection,              [:pointer                                                   ], :int
        attach_function :wdGet,                               [:pointer, :pointer                                         ], :int
        attach_function :wdGetArrayLengthScriptResult,        [:pointer, :pointer, :pointer                               ], :int
        attach_function :wdGetArrayItemFromScriptResult,      [:pointer, :pointer, :int, :pointer                         ], :int
        attach_function :wdGetAllWindowHandles,               [:pointer, :pointer                                         ], :int
        attach_function :wdGetBooleanScriptResult,            [:pointer, :pointer                                         ], :int
        attach_function :wdGetCookies,                        [:pointer, :pointer                                         ], :int
        attach_function :wdGetCurrentUrl,                     [:pointer, :pointer                                         ], :int
        attach_function :wdGetCurrentWindowHandle,            [:pointer, :pointer                                         ], :int
        attach_function :wdGetDoubleScriptResult,             [:pointer, :pointer                                         ], :int
        attach_function :wdGetElementScriptResult,            [:pointer, :pointer, :pointer                               ], :int
        attach_function :wdGetNumberScriptResult,             [:pointer, :pointer                                         ], :int
        attach_function :wdGetPageSource,                     [:pointer, :pointer                                         ], :int
        attach_function :wdGetScriptResultType,               [:pointer, :pointer, :pointer                               ], :int
        attach_function :wdGetStringScriptResult,             [:pointer, :pointer                                         ], :int
        attach_function :wdGetTitle,                          [:pointer, :pointer                                         ], :int
        attach_function :wdGetVisible,                        [:pointer, :pointer                                         ], :int
        attach_function :wdGoBack,                            [:pointer                                                   ], :int
        attach_function :wdGoForward,                         [:pointer                                                   ], :int
        attach_function :wdNewDriverInstance,                 [:pointer                                                   ], :int
        attach_function :wdNewScriptArgs,                     [:pointer, :int                                             ], :int
        attach_function :wdRefresh,                           [:pointer,                                                  ], :int
        attach_function :wdSetImplicitWaitTimeout,            [:pointer, :long                                            ], :int
        attach_function :wdSetVisible,                        [:pointer, :int                                             ], :int
        attach_function :wdStringLength,                      [:pointer, :pointer                                         ], :int
        attach_function :wdSwitchToActiveElement,             [:pointer, :pointer                                         ], :int
        attach_function :wdSwitchToFrame,                     [:pointer, :pointer                                         ], :int
        attach_function :wdSwitchToWindow,                    [:pointer, :pointer                                         ], :int
        attach_function :wdWaitForLoadToComplete,             [:pointer                                                   ], :int
      end

      module Kernel32
        extend FFI::Library

        ffi_lib "kernel32.dll"

        attach_function :MultiByteToWideChar, [:int, :long, :pointer, :int, :pointer, :int                    ], :int
        attach_function :WideCharToMultiByte, [:int, :long, :pointer, :int, :pointer, :int, :pointer, :pointer], :int
      end
    end # IE
  end # WebDriver
end # Selenium
