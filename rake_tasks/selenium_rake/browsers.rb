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
        available: SeleniumRake::Checks.windows?
      },
      'edge' => {
        python: { driver: 'Edge' },
        available: SeleniumRake::Checks.windows?
      },
      'chrome' => {
        python: { driver: 'Chrome' },
        available: SeleniumRake::Checks.chrome?
      },
      'chromiumedge' => {
        python: { driver: 'ChromiumEdge' },
        available: SeleniumRake::Checks.edge?
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
        available: SeleniumRake::Checks.mac?
      }
    }.freeze
  end
end
