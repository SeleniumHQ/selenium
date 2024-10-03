# frozen_string_literal: true

root = File.expand_path(File.dirname(__FILE__))
$LOAD_PATH.push(File.expand_path('lib', root))
require 'selenium/webdriver/version'

Gem::Specification.new do |s|
  s.name = 'selenium-webdriver'
  s.version = Selenium::WebDriver::VERSION

  s.authors = ['Alex Rodionov', 'Titus Fortner', 'Thomas Walpole']
  s.email = %w[p0deje@gmail.com titusfortner@gmail.com twalpole@gmail.com]

  s.summary = 'Selenium is a browser automation tool for automated testing of webapps and more'
  s.description = <<-DESCRIPTION
    Selenium implements the W3C WebDriver protocol to automate popular browsers.
    It aims to mimic the behaviour of a real user as it interacts with the application's HTML.
    It's primarily intended for web application testing, but any web-based task can automated.
  DESCRIPTION

  s.license = 'Apache-2.0'
  s.homepage = 'https://selenium.dev'
  s.metadata = {
    'changelog_uri' => 'https://github.com/SeleniumHQ/selenium/blob/trunk/rb/CHANGES',
    'github_repo' => 'ssh://github.com/SeleniumHQ/selenium',
    'source_code_uri' => 'https://github.com/SeleniumHQ/selenium/tree/trunk/rb',
    'rubygems_mfa_required' => 'true'
  }

  s.required_rubygems_version = Gem::Requirement.new('> 1.3.1') if s.respond_to? :required_rubygems_version=
  s.required_ruby_version = Gem::Requirement.new('>= 3.0')

  s.files = [
    'CHANGES',
    'LICENSE',
    'NOTICE',
    'Gemfile',
    'README.md',
    'selenium-webdriver.gemspec',
    'lib/selenium-webdriver.rb',
    'lib/selenium/server.rb',
    'lib/selenium/webdriver.rb'
  ]
  s.files += Dir['bin/**/*']
  s.files += Dir['lib/selenium/webdriver/**/*']

  s.bindir = 'bin'
  s.require_paths = ['lib']

  s.add_dependency 'base64', ['~> 0.2']
  s.add_dependency 'logger', ['~> 1.4']
  s.add_dependency 'rexml', ['~> 3.2', '>= 3.2.5']
  s.add_dependency 'rubyzip', ['>= 1.2.2', '< 3.0']
  s.add_dependency 'websocket', ['~> 1.0']

  s.add_development_dependency 'git', ['~> 1.19']
  s.add_development_dependency 'rack', ['~> 2.0']
  s.add_development_dependency 'rake', ['~> 13.0']
  s.add_development_dependency 'rspec', ['~> 3.0']
  s.add_development_dependency 'rubocop', ['~> 1.60', '>=1.60.2']
  s.add_development_dependency 'rubocop-performance', ['~> 1.15']
  s.add_development_dependency 'rubocop-rake', ['~> 0.6.0']
  s.add_development_dependency 'rubocop-rspec', ['~> 2.16']
  s.add_development_dependency 'webmock', ['~> 3.5']
  s.add_development_dependency 'webrick', ['~> 1.7']
  s.add_development_dependency 'yard', ['~> 0.9.11', '>= 0.9.36']
end
