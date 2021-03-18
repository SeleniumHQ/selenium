# frozen_string_literal: true

root = __dir__
raise "cwd must be #{root} when reading gemspec" if root != Dir.pwd

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
    'source_code_uri' => 'https://github.com/SeleniumHQ/selenium/tree/trunk/rb'
  }

  s.required_rubygems_version = Gem::Requirement.new('> 1.3.1') if s.respond_to? :required_rubygems_version=
  s.required_ruby_version = Gem::Requirement.new('>= 2.5')

  s.files = Dir.glob('{lib/selenium/devtools}/**/*')
  s.require_paths = ["lib"]
end
