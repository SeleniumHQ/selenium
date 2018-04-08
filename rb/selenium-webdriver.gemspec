root = File.expand_path(File.dirname(__FILE__))
raise "cwd must be #{root} when reading gemspec" if root != Dir.pwd

$LOAD_PATH.push(File.expand_path('lib', root))
require 'selenium/webdriver/version'

Gem::Specification.new do |s|
  s.name = 'selenium-webdriver'
  s.version = Selenium::WebDriver::VERSION

  s.authors = ['Alex Rodionov', 'Titus Fortner']
  s.email = ['p0deje@gmail.com', 'titusfortner@gmail.com']

  s.summary = 'The next generation developer focused tool for automated testing of webapps'
  s.description = 'WebDriver is a tool for writing automated tests of websites. ' \
                  'It aims to mimic the behaviour of a real user, ' \
                  'and as such interacts with the HTML of the application.'

  s.license = 'Apache-2.0'
  s.homepage = 'https://github.com/SeleniumHQ/selenium'
  s.metadata = {
    'changelog_uri' => 'https://github.com/SeleniumHQ/selenium/blob/master/rb/CHANGES',
    'source_code_uri' => 'https://github.com/SeleniumHQ/selenium/tree/master/rb'
  }

  s.required_rubygems_version = Gem::Requirement.new('> 1.3.1') if s.respond_to? :required_rubygems_version=
  s.required_ruby_version = Gem::Requirement.new('>= 2.0')

  s.files = Dir[root + '/**/*'].reject { |e| e =~ /ruby\.iml|build\.desc/ }.map { |e| e.sub(root + '/', '') }
  s.require_paths = ['lib']

  s.add_runtime_dependency 'rubyzip', ['~> 1.2']
  s.add_runtime_dependency 'childprocess', ['~> 0.5']

  s.add_development_dependency 'rspec', ['~> 3.0']
  s.add_development_dependency 'rack', ['~> 1.0']
  s.add_development_dependency 'webmock', ['~> 2.0']
  s.add_development_dependency 'yard', ['~> 0.9.11']
  s.add_development_dependency 'rubocop', ['~> 0.50.0']
end
