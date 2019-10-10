# frozen_string_literal: true

require 'rake_tasks/selenium_rake/checks'

module SeleniumRake
  class Browsers
    BROWSERS = {
      'ff' => {
        python: {
          driver: 'Marionette'
        },
        java: {
          class: 'org.openqa.selenium.firefox.SynthesizedFirefoxDriver',
          deps: ['//java/client/test/org/openqa/selenium/testing/drivers']
        },
        browser_name: 'firefox'
      },
      'marionette' => {
        python: {
          driver: 'Marionette'
        },
        java: {
          class: 'org.openqa.selenium.firefox.SynthesizedFirefoxDriver',
          deps: ['//java/client/test/org/openqa/selenium/testing/drivers']
        },
        browser_name: 'firefox'
      },
      'ie' => {
        python: {
          driver: 'Ie'
        },
        java: {
          class: 'org.openqa.selenium.ie.InternetExplorerDriver',
          deps: ['//java/client/src/org/openqa/selenium/ie:ie', '//cpp/iedriverserver:win32']
        },
        browser_name: 'internet explorer',
        available: SeleniumRake::Checks.windows?
      },
      'edge' => {
        python: {
          driver: 'Edge'
        },
        browser_name: 'MicrosoftEdge',
        available: SeleniumRake::Checks.windows?
      },
      'chrome' => {
        python: {
          driver: 'Chrome'
        },
        java: {
          class: 'org.openqa.selenium.chrome.ChromeDriver',
          deps: ['//java/client/src/org/openqa/selenium/chrome:chrome']
        },
        browser_name: 'chrome',
        available: SeleniumRake::Checks.chrome?
      },
      'chromiumedge' => {
        python: {
          driver: 'ChromiumEdge'
        },
        java: {
          class: 'org.openqa.selenium.edge.EdgeDriver',
          deps: ['//java/client/src/org/openqa/selenium/edge:edge']
        },
        browser_name: 'MicrosoftEdge',
        available: SeleniumRake::Checks.edge?
      },
      'blackberry' => {
        python: {
          driver: 'BlackBerry'
        },
        browser_name: 'blackberry'
      },
      'remote_firefox' => {
        python: {
          driver: 'Remote',
          deps: [
            :remote_client,
            :'selenium-server-standalone',
            '//java/server/test/org/openqa/selenium/remote/server/auth:server'
          ]
        }
      },
      'safari' => {
        python: {
          driver: 'Safari'
        },
        java: {
          class: 'org.openqa.selenium.safari.SafariDriver',
          deps: ['//java/client/src/org/openqa/selenium/safari:safari']
        },
        browser_name: 'safari',
        available: SeleniumRake::Checks.mac?
      }
    }.freeze
  end
end
