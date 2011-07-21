module Selenium
  module WebDriver
    module Support

      class AbstractEventListener
        def before_navigate_to(url) end
        def after_navigate_to(url) end
        def before_navigate_back() end
        def after_navigate_back() end
        def before_navigate_forward() end
        def after_navigate_forward() end
        def before_find(by, what) end
        def after_find(by, what) end
        def before_change_value_of(element) end
        def after_change_value_of(element) end
        def before_execute_script(script) end
        def after_execute_script(script) end
        def before_quit() end
        def after_quit() end
        def before_close() end
        def after_close() end
      end

    end
  end
end
