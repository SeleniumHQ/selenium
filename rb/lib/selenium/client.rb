require 'net/http'
require 'uri'
require 'cgi'
require 'digest/md5'
require 'base64'
require 'fileutils'
require 'tmpdir'

require 'selenium/client/errors'
require 'selenium/client/protocol'
require 'selenium/client/legacy_driver'
require 'selenium/client/javascript_expression_builder'
require 'selenium/client/javascript_frameworks/prototype'
require 'selenium/client/javascript_frameworks/jquery'
require 'selenium/client/extensions'
require 'selenium/client/idiomatic'
require 'selenium/client/base'
require 'selenium/client/driver'
require 'selenium/client/selenium_helper'
require 'selenium/server'
require 'selenium/rake/server_task'

module Selenium
  DEPRECATED_CONSTANTS = {
    :SeleniumDriver => Selenium::Client::Driver,
    :CommandError   => Selenium::Client::CommandError
  }

  def self.const_missing(name)
    if replacement = DEPRECATED_CONSTANTS[name.to_sym]
      warn "the Selenium::#{name} constant has been deprecated, please use #{replacement} instead"
      replacement
    else
      super
    end
  end
end # Selenium
