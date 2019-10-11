# frozen_string_literal: true

require 'rake_tasks/selenium_rake/checks'

module SeleniumRake
  class Browsers
    BROWSERS = {
      'ff' => {
        python: { driver: 'Marionette' },
      },
      'marionette' => {
        python: { driver: 'Marionette' },
      },
      'ie' => {
        python: { driver: 'Ie' },
      },
      'edge' => {
        python: { driver: 'Edge' },
      },
      'chrome' => {
        python: { driver: 'Chrome' },
      },
      'chromiumedge' => {
        python: { driver: 'ChromiumEdge' },
      },
      'blackberry' => {
        python: { driver: 'BlackBerry' },
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
        python: { driver: 'Safari' },
      }
    }.freeze
  end
end
