module Selenium
  module WebDriver
    module IE

      #
      # @private
      #

      module Util
        CP_ACP         = 0
        CP_OEMCP       = 1
        CP_MACCP       = 2
        CP_THREAD_ACP  = 3
        CP_SYMBOL      = 42
        CP_UTF7        = 65000
        CP_UTF8        = 65001

        def string_array_from(raw_strings)
          strings_ptr = raw_strings.get_pointer(0)
          length_ptr  = FFI::MemoryPointer.new :int
          result      = Lib.wdcGetStringCollectionLength(strings_ptr, length_ptr)

          if result != 0
            raise Error::WebDriverError, "cannot extract strings from collection, error code: #{result.inspect}"
          end

          arr    = []

          length_ptr.get_int(0).times do |idx|
            str_ptr_ref = FFI::MemoryPointer.new :pointer
            result = Lib.wdcGetStringAtIndex(strings_ptr, idx, str_ptr_ref)

            if result != 0
              raise Error::WebDriverError, "unable to get string at index: #{idx}, error: #{result}"
            end

            arr << extract_string_from(str_ptr_ref)
          end

          arr
        ensure
          Lib.wdFreeStringCollection(strings_ptr)
          raw_strings.free
        end

        def create_element(&blk)
          element_ptr_ref = FFI::MemoryPointer.new :pointer
          yield element_ptr_ref
          Element.new(self, element_ptr_ref.get_pointer(0))
        ensure
          element_ptr_ref.free
        end

        def create_element_collection(&blk)
          elements_ptr_ref = FFI::MemoryPointer.new :pointer
          yield elements_ptr_ref

          extract_elements_from elements_ptr_ref
        end

        def create_string(&blk)
          wrapper = FFI::MemoryPointer.new :pointer
          yield wrapper

          extract_string_from wrapper
        end

        def extract_string_from(string_ptr_ref)
          string_ptr = string_ptr_ref.get_pointer(0)
          return if string_ptr.null? # getElementAttribute()

          length_ptr = FFI::MemoryPointer.new :int

          if Lib.wdStringLength(string_ptr, length_ptr) != 0
            raise Error::WebDriverError, "cannot determine length of string"
          end

          length     = length_ptr.get_int(0)
          raw_string = wstring_ptr(" "*length)

          if Lib.wdCopyString(string_ptr, length, raw_string) != 0
            raise Error::WebDriverError, "cannot copy string from native data to Ruby string"
          end

          wstring_to_bytestring raw_string
        ensure
          Lib.wdFreeString(string_ptr) unless string_ptr.null?
          string_ptr_ref.free
        end

        def extract_elements_from(elements_ptr_ref)
          elements_ptr = elements_ptr_ref.get_pointer(0)
          length_ptr   = FFI::MemoryPointer.new :int

          check_error_code Lib.wdcGetElementCollectionLength(elements_ptr, length_ptr),
                           "Cannot extract elements from collection"

          arr = []

          length_ptr.get_int(0).times do |idx|
            arr << create_element do |ptr|
              result = Lib.wdcGetElementAtIndex(elements_ptr, idx, ptr)

              if e = WebDriver::Error.for_code(result)
                Lib.wdFreeElementCollection(elements_ptr, 1)
                raise e, "unable to create element from collection at index #{idx} (#{result})"
              end
            end
          end

          Lib.wdFreeElementCollection(elements_ptr, 0)

          arr
        ensure
          elements_ptr_ref.free
          length_ptr.free
        end


        def wstring_ptr(str)
          str  = str.to_s
          size = Kernel32.MultiByteToWideChar(CP_UTF8, 0, str, -1, nil, 0)

          unless size > 0
            raise Error::WebDriverError, "unable to convert #{str.inspect} to wchar ptr"
          end

          buf = FFI::MemoryPointer.new :pointer, size
          Kernel32.MultiByteToWideChar(CP_UTF8, 0, str, -1, buf, size)

          buf
        end

        def wstring_to_bytestring(wstring)
          size = Kernel32.WideCharToMultiByte(CP_UTF8, 0, wstring, -1, nil, 0, nil, nil)

          unless size > 0
            raise Error::WebDriverError, "could not convert wstring pointer to bytestring"
          end

          buf = FFI::MemoryPointer.new :pointer, size
          Kernel32.WideCharToMultiByte(CP_UTF8, 0, wstring, -1, buf, size, nil, nil )

          buf.get_bytes(0, size - 1)
        ensure
          buf.free if buf
        end

      end # Util
    end # IE
  end # WebDriver
end # Selenium
