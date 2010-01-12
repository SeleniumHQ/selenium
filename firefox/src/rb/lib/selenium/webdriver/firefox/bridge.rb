module Selenium
  module WebDriver
    module Firefox
      class Bridge
        include BridgeHelper

        def initialize(opts = {})
          @binary     = Binary.new
          @launcher   = Launcher.new(
            @binary,
            opts.delete(:port)    || DEFAULT_PORT,
            opts.delete(:profile) || DEFAULT_PROFILE_NAME
          )

          unless opts.empty?
            raise ArgumentError, "unknown option#{'s' if opts.size != 1}: #{opts.inspect}"
          end

          @launcher.launch
          @connection = @launcher.connection
          @context    = newSession
        end

        def browser
          :firefox
        end

        def driver_extensions
          [DriverExtensions::TakesScreenshot]
        end

        def quit
          @connection.quit
          @binary.wait rescue nil # might raise on windows

          nil
        end

        def getPageSource
          execute :getPageSource
        end

        def refresh
          execute :refresh
        end

        def getWindowHandles
          execute :getWindowHandles
        end

        def getCurrentWindowHandle
          execute :getCurrentWindowHandle
        end

        def getScreenshotAsBase64
          execute :getScreenshotAsBase64
        end

        def get(url)
          execute :get,
                  :parameters => [url]
        end

        def close
          execute :close
        # TODO: rescue ?
        end

        def goBack
          execute :goBack
        end

        def goForward
          execute :goForward
        end

        def getCurrentUrl
          execute :getCurrentUrl
        end

        def getTitle
          execute :title
        end

        def executeScript(string, *args)
          typed_args = args.map { |e| wrap_script_argument(e) }

          resp = raw_execute :executeScript, :parameters => [string, typed_args]
          raise TypeError, "expected Hash" unless resp.kind_of? Hash

          unwrap_script_argument resp["response"]
        end

        #
        # Finders - TODO: should be shared with Chrome::Bridge
        #

        def findElementByClassName(parent, class_name)
          find_element_by 'class name', class_name, parent
        end

        def findElementsByClassName(parent, class_name)
          find_elements_by 'class name', class_name, parent
        end

        def findElementById(parent, id)
          find_element_by 'id', id, parent
        end

        def findElementsById(parent, id)
          find_elements_by 'id', id, parent
        end

        def findElementByLinkText(parent, link_text)
          find_element_by 'link text', link_text, parent
        end

        def findElementsByLinkText(parent, link_text)
          find_elements_by 'link text', link_text, parent
        end

        def findElementByPartialLinkText(parent, link_text)
          find_element_by 'partial link text', link_text, parent
        end

        def findElementsByPartialLinkText(parent, link_text)
          find_elements_by 'partial link text', link_text, parent
        end

        def findElementByName(parent, name)
          find_element_by 'name', name, parent
        end

        def findElementsByName(parent, name)
          find_elements_by 'name', name, parent
        end

        def findElementByTagName(parent, tag_name)
          find_element_by 'tag name', tag_name, parent
        end

        def findElementsByTagName(parent, tag_name)
          find_elements_by 'tag name', tag_name, parent
        end

        def findElementByXpath(parent, xpath)
          find_element_by 'xpath', xpath, parent
        end

        def findElementsByXpath(parent, xpath)
          find_elements_by 'xpath', xpath, parent
        end

        def findElementByCssSelector(parent, selector)
          find_element_by 'css selector', selector, parent
        end

        def findElementsByCssSelector(parent, selector)
          find_elements_by 'css selector', selector, parent
        end

        #
        # Element functions
        #

        def clickElement(element)
          # execute :clickElement, :element_id => element
          execute :click,
                  :element_id => element
        end

        def getElementTagName(element)
          # execute :getElementTagName, :element_id => element
          execute :getTagName,
                  :element_id => element
        end

        def getElementAttribute(element, name)
          # execute :getElementAttribute, :element_id => element, :parameters => [name]
          execute :getAttribute,
                  :element_id => element,
                  :parameters => [name]
        end

        def getElementValue(element)
          # execute :getElementValue, :element_id => element
          execute :getValue,
                  :element_id => element
        end

        def getElementText(element)
          # execute :getElementText, :element_id => element
          execute :getText,
                  :element_id => element
        end

        def getElementLocation(element)
          # data = execute :getElementLocation, :element_id => element
          data = execute :getLocation,
                         :element_id => element

          Point.new data["x"], data["y"]
        end

        def getElementSize(element)
          # execute :getElementSize, :element_id => element
          data = execute :getSize,
                         :element_id => element

          Dimension.new data['width'], data['height']
        end

        def sendKeysToElement(element, string)
          # execute :sendKeysToElement, :element_id => element, :parameters => [string.split(//u)]
          execute :sendKeys,
                  :element_id => element,
                  :parameters => [string.to_s]
        end

        def clearElement(element)
          # execute :clearElement, :element_id => element
          execute :clear,
                  :element_id => element
        end

        def isElementEnabled(element)
          # execute :isElementEnabled, :element_id => element
          !getElementAttribute(element, "disabled")
        end

        def isElementSelected(element)
          # execute :isElementSelected, :element_id => element
          execute :isSelected,
                  :element_id => element
        end

        def isElementDisplayed(element)
          # execute :isElementDisplayed, :element_id => element
          execute :isDisplayed,
                  :element_id => element
        end

        def submitElement(element)
          # execute :submitElement, :element_id => element
          execute :submit,
                  :element_id => element
        end

        def toggleElement(element)
          # execute :toggleElement, :element_id => element
          execute :toggle,
                  :element_id => element
        end

        def setElementSelected(element)
          # execute :setElementSelected, :element_id => element
          execute :setSelected,
                  :element_id => element
        end

        def getElementValueOfCssProperty(element, prop)
          # execute :getElementValueOfCssProperty, :element_id => element, :parameters => [prop]
          execute :getValueOfCssProperty,
                  :element_id => element,
                  :parameters => [prop]
        end

        def hoverOverElement(element)
          execute :hover,
                  :element_id => element
          # execute :hoverOverElement, :element_id => element
        end

        def dragElement(element, rigth_by, down_by)
          execute :dragElement,
                  :element_id => element,
                  :parameters => [rigth_by, down_by]
        end


        def setSpeed(speed)
          pixel_speed = case speed
                        when "SLOW"   then '1'
                        when "MEDIUM" then '10'
                        when "FAST"   then '100'
                        else
                          raise ArgumentError, "unknown speed: #{speed.inspect}"
                        end

          execute :setMouseSpeed,
                  :parameters => [pixel_speed]
        end

        def getSpeed
          case execute(:getMouseSpeed)
          when '1'    then  "SLOW"
          when '10'   then  "MEDIUM"
          when '100'  then  "FAST"
          else
            "FAST"
          end
        end

        def addCookie(cookie)
          execute :addCookie,
                  :parameters => [cookie.to_json] # uhm, sending text instead of data
        end

        def deleteCookie(name)
          execute :deleteCookie,
                  :parameters => [{:name => name}.to_json] # ditto
        end

        def getAllCookies
          data = execute :getCookie
          data.map do |c|
            parse_cookie_string(c) unless c.strip.empty?
          end.compact
        end

        #
        #  FF-specific?
        #

        def deleteAllCookies
          execute :deleteAllCookies
        end

        def getCookieNamed(name)
          getCookies.find { |c| c['name'] == name }
        end

        def switchToFrame(name)
          execute :switchToFrame,
                  :parameters => [name.to_s]
        end

        def switchToDefaultContent
          execute :switchToDefaultContent
        end

        def switchToWindow(name)
          @context = execute  :switchToWindow,
                              :parameters => [name.to_s]
        end

        def switchToActiveElement
          Element.new self, element_id_from(execute(:switchToActiveElement))
        end
        alias_method :getActiveElement, :switchToActiveElement

        private

        def find_element_by(how, what, parent = nil)
          if parent
            id = execute :findChildElement,
                         :parameters => [{:id => parent, :using => how, :value => what}]
          else
            id = execute :findElement,
                         :parameters => [how, what]
          end

          Element.new self, element_id_from(id)
        end

        def find_elements_by(how, what, parent = nil)
          if parent
            id_string = execute :findChildElements,
                                :parameters => [{:id => parent, :using => how, :value => what}]
          else
            id_string = execute :findElements,
                                :parameters => [how, what]
          end

          id_string.map { |id| Element.new self, element_id_from(id) }
        end

        def newSession
          execute :newSession
        end

        def execute(*args)
          raw_execute(*args)['response']
        end

        def raw_execute(command, opts = {})
          request = {:commandName => command, :context => @context.to_s}

          if eid = opts[:element_id]
            request[:elementId] = eid
          end

          if params = opts[:parameters]
            request[:parameters] = params
          end

          puts "--> #{request.inspect}" if $DEBUG

          @connection.send_string request.to_json
          resp = @connection.read_response

          puts "<-- #{resp.inspect}" if $DEBUG

          if resp['isError']
            case resp['response']
            when String
              msg = resp['response']
            when Hash
              msg = resp['response']['message']
            end

            msg ||= resp.inspect
            raise Error::WebDriverError, msg
          end

          if ctx = resp['context']
            @context = ctx
          end

          resp
        end

        #
        # wrap/unwrap will be shared with Chrome (overrides BridgeHelper for now)
        #

        def wrap_script_argument(arg)
          case arg
          when Integer, Float
            { :type => "NUMBER", :value => arg }
          when TrueClass, FalseClass, NilClass
            { :type => "BOOLEAN", :value => !!arg }
          when Element
            { :type => "ELEMENT", :value => arg.ref }
          when String
            { :type => "STRING", :value => arg.to_s }
          when Array # Enumerable?
            arg.map { |e| wrap_script_argument(e) }
          else
            raise TypeError, "Parameter is not of recognized type: #{arg.inspect}:#{arg.class}"
          end
        end

        def unwrap_script_argument(arg)
          raise TypeError, "expected Hash" unless arg.kind_of? Hash
          case arg["type"]
          when "NULL"
            nil
          when "ELEMENT"
            Element.new self, element_id_from(arg["value"])
          when "ARRAY"
            arg['value'].map { |e| unwrap_script_argument(e) }
          # when "POINT"
          #   Point.new arg['x'], arg['y']
          # when "DIMENSION"
          #   Dimension.new arg['width'], arg['height']
          # when "COOKIE"
          #   {:name => arg['name'], :value => arg['value']}
          else
            arg["value"]
          end
        end


      end # Bridge
    end # Firefox
  end # WebDriver
end # Selenium
