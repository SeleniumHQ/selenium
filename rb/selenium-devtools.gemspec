# frozen_string_literal: true

root = File.realpath(File.dirname(__FILE__))
$LOAD_PATH.push(File.expand_path('lib', root))
require 'selenium/devtools/version'

Gem::Specification.new do |s|
  s.name = 'selenium-devtools'
  s.version = Selenium::DevTools::VERSION

  s.authors = ['Alex Rodionov', 'Titus Fortner', 'Thomas Walpole']
  s.email = ['p0deje@gmail.com', 'titusfortner@gmail.com', 'twalpole@gmail.com']

  s.summary = 'DevTools Code for use with Selenium'
  s.description = <<-DESCRIPTION
    Selenium WebDriver now supports limited DevTools interactions.
    This project allows users to specify desired versioning.
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
    'LICENSE',
    'NOTICE',
    'Gemfile',
    'selenium-devtools.gemspec',
    'lib/selenium/devtools.rb'
  ] + Dir['lib/selenium/devtools/**/*']

  s.require_paths = ['lib']

  s.add_dependency 'selenium-webdriver', '~> 4.2'
end
