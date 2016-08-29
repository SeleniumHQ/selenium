require 'rake-tasks/checks'

#:available => whether this browser is available on this computer. Defaults to true.

BROWSERS = {
  "ff" => {
    :python => {
      :ignore => "firefox", # py.test string used for ignoring
      :dir => "firefox", # Directory to put tests in/read tests from
      :file_string => "ff", # Browser-string to use in test filenames
      :class => "Firefox", # As per py/selenium/webdriver/__init__.py
      :constructor_args => "capabilities={'marionette': False}",
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
  "marionette" => {
    :python => {
      :ignore => "marionette", # py.test string used for ignoring
      :dir => "firefox", # Directory to put tests in/read tests from
      :file_string => "marionette", # Browser-string to use in test filenames
      :class => "Firefox", # As per py/selenium/webdriver/__init__.py
      :constructor_args => "capabilities={'marionette': True}"
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
      :class => "Ie"
    },
    :java => {
      :class => "org.openqa.selenium.ie.InternetExplorerDriver",
      :deps => [ "//java/client/src/org/openqa/selenium/ie:ie", "//cpp/iedriverserver:win32" ]
    },
    :browser_name => "internet explorer",
    :available => windows?
  },
  "edge" => {
    :python => {
      :ignore => "edge",
      :dir => "edge",
      :file_string => "edge",
      :class => "Edge"
    },
    :browser_name => "MicrosoftEdge",
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
  "blackberry" => {
    :python => {
      :ignore => "blackberry",
      :dir => "blackberry",
      :file_string => "blackberry",
      :class => "BlackBerry",
      :constructor_args => "device_password='password'"
    },
    :browser_name => "blackberry"
  },
  "phantomjs" => {
    :python => {
      :ignore => "phantomjs",
      :dir => "phantomjs",
      :file_string => "phantomjs",
      :class => "PhantomJS",
    },
    :browser_name => "phantomjs"
  },
  "remote_firefox" => {
    :python => {
      :dir => "remote",
      :file_string => "remote",
      :deps => [:remote_client, :'selenium-server-standalone', '//java/server/test/org/openqa/selenium/remote/server/auth:server'],
      :custom_test_import => "from selenium.test.selenium.common import utils",
      :custom_test_setup => "utils.start_server(module)",
      :custom_test_teardown => "utils.stop_server(module)",
      :class => "Remote",
      :constructor_args => "desired_capabilities=webdriver.DesiredCapabilities.FIREFOX"
    }
  },
  "safari" => {
    :python => {
      :ignore => "safari",
      :dir => "safari",
      :file_string => "safari",
      :class => "Safari"
    },
    :java => {
      :class => "org.openqa.selenium.safari.SafariDriver",
      :deps => [ "//java/client/src/org/openqa/selenium/safari:safari" ]
    },
    :browser_name => "safari",
    :available => mac?
  }
}
