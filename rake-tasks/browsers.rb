require 'rake-tasks/checks'

#:available => whether this browser is available on this computer. Defaults to true.

BROWSERS = {
  "ff" => {
    :python => {
      :ignore => "firefox", # py.test string used for ignoring
      :dir => "firefox", # Directory to put tests in/read tests from
      :file_string => "ff", # Browser-string to use in test filenames
      :class => "Firefox", # As per py/selenium/webdriver/__init__.py
      :resources => [
        { "//javascript/firefox-driver:webdriver" => "selenium/webdriver/firefox/" },
        { "//cpp:noblur" => "selenium/webdriver/firefox/x86/x_ignore_nofocus.so" },
        { "//cpp:noblur64" => "selenium/webdriver/firefox/amd64/x_ignore_nofocus.so" }
      ]
    },
    :java => {
      :class => "org.openqa.selenium.firefox.SynthesizedFirefoxDriver",
      :deps => [ "//java/client/test/org/openqa/selenium/testing/drivers" ]
    },
    :browser_name => "firefox",
  },
  "ie" => {
    :python => {
      :ignore => "ie",
      :dir => "ie",
      :file_string => "ie",
      :class => "Ie",
      :resources => [
        {"//cpp:ie_win32_dll" => "selenium\\webdriver\\ie\\win32\\IEDriver.dll"},
        {"//cpp:ie_x64_dll" => "selenium\\webdriver\\ie\\x64\\IEDriver.dll"}
      ]
    },
    :java => {
      :class => "org.openqa.selenium.ie.InternetExplorerDriver",
      :deps => [ "//java/client/src/org/openqa/selenium/ie:ie", "//cpp:ie_win32_exe" ]
    },
    :browser_name => "internet explorer",
    :available => windows?
  },
  "chrome" => {
    :python => {
      :ignore => "chrome",
      :dir => "chrome",
      :file_string => "chrome",
      :class => "Chrome"
    },
    :java => {
      :class => "org.openqa.selenium.chrome.ChromeDriver",
      :deps => [ "//java/client/src/org/openqa/selenium/chrome:chrome" ]
    },
    :browser_name => "chrome",
    :available => chrome?
  },
  "opera" => {
    :python => {
      :ignore => "opera",
      :dir => "opera",
      :file_string => "opera",
      :class => "Opera"
    },
    :java => {
      :class => "com.opera.core.systems.OperaDriver",
      :deps => [ "//third_party/java/opera-driver" ]
    },
    :browser_name => "opera",
    :available => opera?
  },
  "gd" => {
    :python => {
      :ignore => "ghostdriver",
      :dir => "ghostdriver",
      :file_string => "gd",
      :class => "Remote",
      :constructor_args => "'http://localhost:8080/wd/hub', {}"
    },
    :browser_name => "ghostdriver",
  },
  "remote_firefox" => {
    :python => {
      :dir => "remote",
      :file_string => "remote",
      :deps => [:remote_client, :'selenium-server-standalone', '//java/server/test/org/openqa/selenium/remote/server/auth:server:uber'],
      :custom_test_import => "from selenium.test.selenium.common import utils",
      :custom_test_setup => "utils.start_server(module)",
      :custom_test_teardown => "utils.stop_server(module)",
      :class => "Remote",
      :constructor_args => "desired_capabilities=webdriver.DesiredCapabilities.FIREFOX"
    }
  }
}
