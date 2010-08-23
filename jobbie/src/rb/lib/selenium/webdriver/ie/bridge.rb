module Selenium
  module WebDriver
    module IE

      #
      # @private
      #

      class Bridge
        include Util

        def initialize
          ptr_ref = FFI::MemoryPointer.new :pointer

          check_error_code Lib.wdNewDriverInstance(ptr_ref),
                           "could not create driver instance"

          @driver_pointer = ptr_ref.get_pointer(0)
          @speed          = :fast
        end

        def browser
          :internet_explorer
        end

        def driver_extensions
          []
        end

        def get(url)
          check_error_code Lib.wdGet(@driver_pointer, wstring_ptr(url)),
                           "Cannot get url #{url.inspect}"
        end

        def getCurrentUrl
          create_string do |wrapper|
            check_error_code Lib.wdGetCurrentUrl(@driver_pointer, wrapper),
                             "unable to get current URL"
          end
        end

        def goBack
          check_error_code Lib.wdGoBack(@driver_pointer),
                           "Cannot navigate back"
        end

        def goForward
          check_error_code Lib.wdGoForward(@driver_pointer),
                           "Cannot navigate back"
        end

        def getTitle
          create_string do |wrapper|
            check_error_code Lib.wdGetTitle(@driver_pointer, wrapper),
                             "unable to get title"
          end
        end

        def getPageSource
          create_string do |wrapper|
            check_error_code Lib.wdGetPageSource(@driver_pointer, wrapper),
                             "unable to get page source"
          end
        end

        def getBrowserVisible
          int_ptr = FFI::MemoryPointer.new :int
          check_error_code Lib.wdGetVisible(@driver_pointer, int_ptr), "unable to determine if browser is visible"

          int_ptr.get_int(0) == 1
        ensure
          int_ptr.free
        end

        def setBrowserVisible(bool)
          check_error_code Lib.wdSetVisible(@driver_pointer, bool ? 1 : 0),
                           "unable to change the visibility of the browser"
        end

        def setImplicitWaitTimeout(milliseconds)
          check_error_code Lib.wdSetImplicitWaitTimeout(@driver_pointer, milliseconds),
                           "unable to set implicit wait timeout"
        end

        def switchToWindow(id)
          check_error_code Lib.wdSwitchToWindow(@driver_pointer, wstring_ptr(id)),
                           "unable to locate window #{id.inspect}"
        end

        def switchToFrame(id)
          check_error_code Lib.wdSwitchToFrame(@driver_pointer, wstring_ptr(id)),
                           "unable to locate frame #{id.inspect}"
        end

        def switchToActiveElement
          create_element do |ptr|
            check_error_code Lib.wdSwitchToActiveElement(@driver_pointer, ptr),
                             "unable to switch to active element"
          end
        end

        def switchToDefaultContent
          switchToFrame ""
        end

        def quit
          getWindowHandles.each do |handle|
            begin
              switchToWindow handle
              close
            rescue Error::NoSuchWindowError
            end
          end

          # hack
          ObjectSpace.each_object(WebDriver::Element) { |e| finalize e.ref if e.bridge == self }
        ensure
          Lib.wdFreeDriver(@driver_pointer)
          @driver_pointer = nil
        end

        def close
          check_error_code Lib.wdClose(@driver_pointer), "unable to close driver"
        end

        def refresh
          check_error_code Lib.wdRefresh(@driver_pointer), "unable to refresh current page"
        end

        def getWindowHandles
          raw_handles = FFI::MemoryPointer.new :pointer
          check_error_code Lib.wdGetAllWindowHandles(@driver_pointer, raw_handles),
                           "unable to obtain all window handles"

          string_array_from(raw_handles).uniq
          # TODO: who calls raw_handles.free if exception is raised?
        end

        def getCurrentWindowHandle
          create_string do |string_pointer|
            check_error_code Lib.wdGetCurrentWindowHandle(@driver_pointer, string_pointer),
                             "unable to obtain current window handle"
          end
        end

        def executeScript(script, *args)
          script_args_ref = FFI::MemoryPointer.new :pointer
          result          = Lib.wdNewScriptArgs(script_args_ref, args.size)

          check_error_code result, "unable to create new script arguments array"

          args_pointer = script_args_ref.get_pointer(0)
          populate_arguments(result, args_pointer, args)

          script            = "(function() { return function(){" + script + "};})();"
          script_result_ref = FFI::MemoryPointer.new :pointer

          check_error_code Lib.wdExecuteScript(@driver_pointer, wstring_ptr(script), args_pointer, script_result_ref),
                           "Cannot execute script"

          extract_return_value script_result_ref
        ensure
          script_args_ref.free
          script_result_ref.free if script_result_ref
          Lib.wdFreeScriptArgs(args_pointer) if args_pointer
        end

        def waitForLoadToComplete
          Lib.wdWaitForLoadToComplete(@driver_pointer)
        end

        #
        # Configuration
        #

        def addCookie(opts)
          cookie_string  = "#{opts[:name]}=#{opts[:value]}; "
          cookie_string << "path=#{opts[:path]}; "                  if opts[:path] && !opts[:path].empty?
          cookie_string << "domain=#{opts[:domain][/^(.+?):/, 1]};" if opts[:domain] && !opts[:domain].empty?

          check_error_code Lib.wdAddCookie(@driver_pointer, wstring_ptr(cookie_string)),
                           "unable to add cookie"
        end

        def getAllCookies
          str = create_string do |wrapper|
            check_error_code Lib.wdGetCookies(@driver_pointer, wrapper), "unable to get cookies"
          end

          str.split("; ").map do |cookie_string|
            parts = cookie_string.split("=")
            next unless parts.size == 2

            {
              'name'    => parts[0],
              'value'   => parts[1],
              'domain'  => getCurrentUrl,
              'path'    => "",
              'expires' => nil,
              'secure'  => false
            }
          end.compact
        end

        def deleteCookie(name)
          raise NotImplementedError, "missing from IE driver"
        end

        def deleteAllCookies
          raise NotImplementedError, "missing from IE driver"
        end

        def setSpeed(speed)
          @speed = speed
        end

        def getSpeed
          @speed
        end

        #
        # Finders
        #

        def findElementByClassName(parent, class_name)
          # TODO: argument checks

          create_element do |raw_element|
            check_error_code Lib.wdFindElementByClassName(@driver_pointer, parent, wstring_ptr(class_name), raw_element),
                             "unable to find element by class name using #{class_name.inspect}"
          end
        end

        def findElementsByClassName(parent, class_name)
          # TODO: argument checks

          create_element_collection do |raw_elements|
            check_error_code Lib.wdFindElementsByClassName(@driver_pointer, parent, wstring_ptr(class_name), raw_elements),
                             "unable to find elements by class name using #{class_name.inspect}"
          end
        end

        def findElementById(parent, id)
          create_element do |raw_element|
            check_error_code Lib.wdFindElementById(@driver_pointer, parent, wstring_ptr(id), raw_element),
                             "unable to find element by id using #{id.inspect}"
          end
        end

        def findElementsById(parent, id)
          create_element_collection do |raw_elements|
            check_error_code Lib.wdFindElementsById(@driver_pointer, parent, wstring_ptr(id), raw_elements),
                             "unable to find elements by id using #{id.inspect}"
          end
        end

        def findElementByLinkText(parent, link_text)
          create_element do |raw_element|
            check_error_code Lib.wdFindElementByLinkText(@driver_pointer, parent, wstring_ptr(link_text), raw_element),
                             "unable to find element by link text using #{link_text.inspect}"
          end
        end

        def findElementsByLinkText(parent, link_text)
          create_element_collection do |raw_elements|
            check_error_code Lib.wdFindElementsByLinkText(@driver_pointer, parent, wstring_ptr(link_text), raw_elements),
                             "unable to find elements by link text using #{link_text.inspect}"
          end
        end

        def findElementByPartialLinkText(parent, link_text)
          create_element do |raw_element|
            check_error_code Lib.wdFindElementByPartialLinkText(@driver_pointer, parent, wstring_ptr(link_text), raw_element),
                             "unable to find element by partial link text using #{link_text.inspect}"
          end
        end

        def findElementsByPartialLinkText(parent, link_text)
          create_element_collection do |raw_elements|
            check_error_code Lib.wdFindElementsByPartialLinkText(@driver_pointer, parent, wstring_ptr(link_text), raw_elements),
                             "unable to find elements by partial link text using #{link_text.inspect}"
          end
        end

        def findElementByName(parent, name)
          create_element do |raw_element|
            check_error_code Lib.wdFindElementByName(@driver_pointer, parent, wstring_ptr(name), raw_element),
                             "unable to find element by name using #{name.inspect}"
          end
        end

        def findElementsByName(parent, name)
          create_element_collection do |raw_elements|
            check_error_code Lib.wdFindElementsByName(@driver_pointer, parent, wstring_ptr(name), raw_elements),
                             "unable to find elements by name using #{name.inspect}"
          end
        end

        def findElementByTagName(parent, tag_name)
          create_element do |raw_element|
            check_error_code Lib.wdFindElementByTagName(@driver_pointer, parent, wstring_ptr(tag_name), raw_element),
                             "unable to find element by tag name using #{tag_name.inspect}"
          end
        end

        def findElementsByTagName(parent, tag_name)
          create_element_collection do |raw_elements|
            check_error_code Lib.wdFindElementsByTagName(@driver_pointer, parent, wstring_ptr(tag_name), raw_elements),
                             "unable to find elements by tag name using #{tag_name.inspect}"
          end
        end

        def findElementByXpath(parent, xpath)
          create_element do |raw_element|
            check_error_code Lib.wdFindElementByXPath(@driver_pointer, parent, wstring_ptr(xpath), raw_element),
                             "unable to find element by xpath using #{xpath.inspect}"
            # TODO: Additional error handling
          end
        end

        def findElementsByXpath(parent, xpath)
          create_element_collection do |raw_elements|
            check_error_code Lib.wdFindElementsByXPath(@driver_pointer, parent, wstring_ptr(xpath), raw_elements),
                             "unable to find elements by xpath using #{xpath.inspect}"
            # TODO: Additional error handling
          end
        end


        #
        # Element functions
        #

        def clickElement(element_pointer)
          check_error_code Lib.wdeClick(element_pointer), "unable to click element"
        end

        def getElementTagName(element_pointer)
          create_string do |string_pointer|
            check_error_code Lib.wdeGetTagName(element_pointer, string_pointer),
                             "unable to get tag name"
          end
        end

        def getElementAttribute(element_pointer, name)
          create_string do |string_pointer|
            check_error_code Lib.wdeGetAttribute(@driver_pointer, element_pointer, wstring_ptr(name), string_pointer),
                             "unable to get attribute #{name.inspect}"
          end
        end

        def getElementValue(element_pointer)
          val = getElementAttribute(element_pointer, 'value')
          val.gsub("\r\n", "\n") if val
        end

        def getElementText(element_pointer)
          val = create_string do |string_pointer|
            check_error_code Lib.wdeGetText(element_pointer, string_pointer),
                             "unable to get text"
          end

          val.gsub("\r\n", "\n") if val
        end

        def sendKeysToElement(element_pointer, string)
          check_error_code Lib.wdeSendKeys(element_pointer, wstring_ptr(string)),
                           "unable to send keys to #{self}"
          waitForLoadToComplete
        end

        def clearElement(element_pointer)
          check_error_code Lib.wdeClear(element_pointer), "unable to clear element"
        end

        def isElementEnabled(element_pointer)
          int_ptr = FFI::MemoryPointer.new(:int)
          check_error_code Lib.wdeIsEnabled(element_pointer, int_ptr),
                           "unable to get enabled state"

          int_ptr.get_int(0) == 1
        ensure
          int_ptr.free
        end

        def isElementSelected(element_pointer)
          int_ptr = FFI::MemoryPointer.new(:int)
          check_error_code Lib.wdeIsSelected(element_pointer, int_ptr),
                           "unable to get selected state"

          int_ptr.get_int(0) == 1
        ensure
          int_ptr.free
        end

        def isElementDisplayed(element_pointer)
          int_ptr = FFI::MemoryPointer.new :int
          check_error_code Lib.wdeIsDisplayed(element_pointer, int_ptr), "unable to check visibilty"

          int_ptr.get_int(0) == 1;
        ensure
          int_ptr.free
        end

        def submitElement(element_pointer)
          check_error_code Lib.wdeSubmit(element_pointer), "unable to submit element"
        end

        def toggleElement(element_pointer)
          int_ptr = FFI::MemoryPointer.new :int
          result = Lib.wdeToggle(element_pointer, int_ptr)

          if result == 9
            raise WebDriver::UnsupportedOperationError,
              "You may not toggle this element: #{get_element_tag_name(element_pointer)}"
          end

          check_error_code result, "unable to toggle element"

          int_ptr.get_int(0) == 1
        ensure
          int_ptr.free
        end

        def setElementSelected(element_pointer)
          check_error_code Lib.wdeSetSelected(element_pointer), "unable to select element"
        end

        def getElementValueOfCssProperty(element_pointer, prop)
          create_string do |string_pointer|
            check_error_code Lib.wdeGetValueOfCssProperty(element_pointer, wstring_ptr(prop), string_pointer),
                             "unable to get value of css property: #{prop.inspect}"
          end
        end

        def hoverOverElement(element_pointer)
          raise NotImplementedError
        end

        def elementEquals(element, other)
          executeScript "return arguments[0] === arguments[1]", element, other
        end

        def dragElement(element_pointer, right_by, down_by)
          # TODO: check return values?
          hwnd                = FFI::MemoryPointer.new :pointer
          x, y, width, height = Array.new(4) { FFI::MemoryPointer.new :long }

          check_error_code Lib.wdeGetDetailsOnceScrolledOnToScreen(element_pointer, hwnd, x, y, width, height),
                           "unable to determine location once scrolled on to screen"

          Lib.wdeMouseDownAt(hwnd.get_pointer(0), x.get_long(0), y.get_long(0))

          destination_x = x.get_long(0) + right_by
          destination_y = y.get_long(0) + down_by
          duration      = 500 # TODO: parent.manage().getSpeed().getTimeOut();

          Lib.wdeMouseMoveTo(hwnd.get_pointer(0), duration, x.get_long(0), y.get_long(0), destination_x, destination_y)
          Lib.wdeMouseUpAt(hwnd.get_pointer(0), destination_x, destination_y)
        ensure
          [hwnd, x, y, width, height].each { |pointer| pointer.free }
        end

        def getElementLocation(element_pointer)
          x = FFI::MemoryPointer.new :long
          y = FFI::MemoryPointer.new :long

          check_error_code Lib.wdeGetLocation(element_pointer, x, y), "unable to get location of element"

          Point.new x.get_int(0), y.get_int(0)
        ensure
          x.free
          y.free
        end

        def getElementSize(element_pointer)
          width  = FFI::MemoryPointer.new :long
          height = FFI::MemoryPointer.new :long

          check_error_code Lib.wdeGetSize(element_pointer, width, height), "unable to get size of element"

          Dimension.new width.get_int(0), height.get_int(0)
        ensure
          width.free
          height.free
        end

        def finalize(element_pointer)
          check_error_code Lib.wdeFreeElement(element_pointer),
                           "unable to finalize #{element_pointer} for #{self}"
        end

        private

        def populate_arguments(result, args_pointer, args)
          args.each do |arg|
            case arg
            when String
              result = Lib.wdAddStringScriptArg(args_pointer, wstring_ptr(arg))
            when TrueClass, FalseClass, NilClass
              result = Lib.wdAddBooleanScriptArg(args_pointer, arg == true ? 1 : 0)
            when Float
              result = Lib.wdAddDoubleScriptArg(args_pointer, arg)
            when Integer
              result = Lib.wdAddNumberScriptArg(args_pointer, arg)
            when WebDriver::Element
              result = Lib.wdAddElementScriptArg(args_pointer, arg.ref)
            else
              raise TypeError, "Parameter is not of recognized type: #{arg.inspect}:#{arg.class}"
            end

            check_error_code result, "unable to add argument: #{arg.inspect}"
          end


          result
        end

        def extract_return_value(pointer_ref)
          result, returned = nil
          pointers_to_free = []
          script_result    = pointer_ref.get_pointer(0)

          pointers_to_free << type_pointer = FFI::MemoryPointer.new(:int)
          result       = Lib.wdGetScriptResultType(@driver_pointer, script_result, type_pointer)

          check_error_code result, "Cannot determine result type"
          result_type = type_pointer.get_int(0)

          case result_type
          when 1 # String
            create_string do |wrapper|
              check_error_code Lib.wdGetStringScriptResult(script_result, wrapper), "Cannot extract string result"
            end
          when 2 # Long
            pointers_to_free << long_pointer = FFI::MemoryPointer.new(:long)
            check_error_code Lib.wdGetNumberScriptResult(script_result, long_pointer),
                             "Cannot extract number result"

            long_pointer.get_long(0)
          when 3 # Boolean
            pointers_to_free << int_pointer = FFI::MemoryPointer.new(:int)
            check_error_code Lib.wdGetBooleanScriptResult(script_result, int_pointer),
                             "Cannot extract boolean result"

            int_pointer.get_int(0) == 1
          when 4 # WebElement
            pointers_to_free << element_pointer = FFI::MemoryPointer.new(:pointer)
            check_error_code Lib.wdGetElementScriptResult(script_result, @driver_pointer, element_pointer),
                             "Cannot extract element result"

            Element.new(self, element_pointer.get_pointer(0))
          when 5 # Nothing
            nil
          when 6 # Exception
            message = create_string do |string_pointer|
              check_error_code Lib.wdGetStringScriptResult(script_result, string_pointer), "Cannot extract string result"
            end

            raise Error::WebDriverError, message
          when 7 # Double
            pointers_to_free << double_pointer = FFI::MemoryPointer.new(:double)
            check_error_code Lib.wdGetDoubleScriptResult(script_result, double_pointer), "Cannot extract double result"

            double_pointer.get_double(0)
          when 8 # Array
            pointers_to_free << array_length_pointer = FFI::MemoryPointer.new(:int)
            check_error_code Lib.wdGetArrayLengthScriptResult(@driver_pointer, script_result, array_length_pointer),
                             "Cannot extract array length"

            arr = []
            array_length_pointer.get_int(0).times do |idx|
              current_item_pointer = FFI::MemoryPointer.new(:pointer)
              result_code = Lib.wdGetArrayItemFromScriptResult(@driver_pointer, script_result, idx, current_item_pointer)

              # free the pointer if the call failed
              if Error.for_code(result_code)
                Lib.wdFreeScriptResult(current_item_pointer.get_pointer(0))
                check_error_code result_code
              end

              arr << extract_return_value(current_item_pointer)
            end

            arr
          else
            raise Error::WebDriverError, "Cannot determine result type (#{result_type.inspect})"
          end
        ensure
          Lib.wdFreeScriptResult(script_result) if script_result
          pointers_to_free.each { |p| p.free }
        end

        def check_error_code(code, message)
          return unless ex = WebDriver::Error.for_code(code)

          if ex == Error::TimeOutError
            raise ex, "#{message} (#{code}): The driver reported that the command timed out. There may be several reasons for this. Check that the destination site is in IE's 'Trusted Sites' (accessed from Tools->Internet Options in the 'Security' tab). If it is a trusted site, then the request may have taken more than a minute to finish."
          else
            raise ex, "#{message} (#{code})"
          end
        end

      end # Bridge
    end # IE
  end # WebDriver
end # Selenium