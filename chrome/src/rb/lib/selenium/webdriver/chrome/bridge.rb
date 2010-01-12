module Selenium
  module WebDriver
    module Chrome
      class Bridge
        include BridgeHelper

        def initialize
          @executor = CommandExecutor.new

          @launcher = Launcher.launcher
          @launcher.launch(@executor.uri)
        end

        def browser
          :chrome
        end

        def driver_extensions
          [DriverExtensions::TakesScreenshot]
        end

        def get(url)
          execute :request => 'get',
                  :url     => url
        end

        def goBack
          execute :request => 'goBack'
        end

        def goForward
          execute :request => 'goForward'
        end

        def getCurrentUrl
          execute :request => 'getCurrentUrl'
        end

        def getTitle
          execute :request => 'getTitle'
        end

        def getPageSource
          execute :request => 'getPageSource'
        end

        def switchToWindow(name)
          execute :request    => 'switchToWindow',
                  :windowName => name
        end

        def switchToFrame(id)
          execute :request => 'switchToFrameByName',
                  :name    => id
        end

        def switchToDefaultContent
          execute :request => "switchToDefaultContent"
        end

        def quit
          begin
            execute :request => 'quit'
          rescue IOError
          end

          @launcher.kill
          @executor.close
        end

        def close
          execute :request => 'close'
        end

        def refresh
          execute :request => 'refresh'
        end

        def getWindowHandles
          execute :request => 'getWindowHandles'
        end

        def getCurrentWindowHandle
          execute :request => 'getCurrentWindowHandle'
        end

        def getScreenshotAsBase64
          execute :request => "screenshot"
        end

        def setSpeed(value)
          @speed = value
        end

        def getSpeed
          @speed
        end

        def executeScript(script, *args)
          typed_args = args.map { |e| wrap_script_argument(e) }

          resp = execute :request => 'executeScript',
                         :script  => script,
                         :args    => typed_args

          return if resp.nil?
          unwrap_script_argument resp
        end

        def addCookie(cookie)
          execute :request => 'addCookie',
                  :cookie  => cookie
        end

        def deleteCookie(name)
          execute :request => 'deleteCookie',
                  :name    => name
        end

        def getAllCookies
          execute :request => 'getCookies'
        end

        def deleteAllCookies
          execute :request => 'deleteAllCookies'
        end

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
          execute :request   => 'clickElement',
                  :elementId => element
        end

        def getElementTagName(element)
          execute :request   => 'getElementTagName',
                  :elementId => element
        end

        def getElementAttribute(element, name)
          execute :request   => 'getElementAttribute',
                  :elementId => element,
                  :attribute => name
        end

        def getElementValue(element)
          execute :request   => 'getElementValue',
                  :elementId => element
        end

        def getElementText(element)
          execute :request   => 'getElementText',
                  :elementId => element
        end

        def getElementLocation(element)
          data = execute :request   => 'getElementLocation',
                         :elementId => element

          Point.new data['x'], data['y']
        end

        def getElementSize(element)
          data = execute :request   => 'getElementSize',
                         :elementId => element

          Dimension.new data['width'], data['height']
        end

        def sendKeysToElement(element, string)
          execute :request   => 'sendKeysToElement',
                  :elementId => element,
                  :keys      => string.split(//u)
        end

        def clearElement(element)
          execute :request   => 'clearElement',
                  :elementId => element
        end

        def isElementEnabled(element)
          execute :request   => 'isElementEnabled',
                  :elementId => element
        end

        def isElementSelected(element)
          execute :request   => 'isElementSelected',
                  :elementId => element
        end

        def isElementDisplayed(element)
          execute :request   => 'isElementDisplayed',
                  :elementId => element
        end

        def submitElement(element)
          execute :request   => 'submitElement',
                  :elementId => element
        end

        def toggleElement(element)
          execute :request   => 'toggleElement',
                  :elementId => element
        end

        def setElementSelected(element)
          execute :request   => 'setElementSelected',
                  :elementId => element
        end

        def getElementValueOfCssProperty(element, prop)
          execute :request   => 'getElementValueOfCssProperty',
                  :elementId => element,
                  :css       => prop
        end

        def getActiveElement
          Element.new self, element_id_from(execute(:request => 'getActiveElement'))
        end
        alias_method :switchToActiveElement, :getActiveElement

        def hoverOverElement(element)
          execute :request   => 'hoverOverElement',
                  :elementId => element
        end

        def dragElement(element, rigth_by, down_by)
          raise UnsupportedOperationError, "drag and drop unsupported in Chrome"
          execute :drag_element, {:id => element}, element, rigth_by, down_by
        end

        private

        def find_element_by(how, what, parent = nil)
          if parent
            id = execute :request => 'findChildElement',
                         :id      => parent,
                         :using   => how,
                         :value   => what
          else
            id = execute :request => 'findElement',
                         :using   => how,
                         :value   => what
          end

          Element.new self, element_id_from(id)
        end

        def find_elements_by(how, what, parent = nil)
          if parent
            ids = execute :request => 'findChildElements',
                          :id      => parent,
                          :using   => how,
                          :value   => what
          else
            ids = execute :request => 'findElements',
                          :using   => how,
                          :value   => what
          end

          ids.map { |id| Element.new self, element_id_from(id) }
        end


        private

        def execute(command)
          puts "--> #{command.inspect}" if $DEBUG
          resp = raw_execute command
          puts "<-- #{resp.inspect}" if $DEBUG

          code = resp['statusCode']
          if e = Error.for_code(code)
            msg = resp['value']['message'] if resp['value']
            msg ||= "unknown exception for #{command.inspect}"
            msg << " (#{code})"

            raise e, msg
          end

          resp['value']
        end

        def raw_execute(command)
          @executor.execute command
        end

      end # Bridge
    end # Chrome
  end # WebDriver
end # Selenium