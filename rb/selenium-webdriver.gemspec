# -*- encoding: utf-8 -*-

root = File.expand_path(File.dirname(__FILE__))
raise "cwd must be #{root} when reading gemspec" if root != Dir.pwd

Gem::Specification.new do |s|
  s.name = 'selenium-webdriver'
  s.version = '3.5.1'

  s.authors = ['Alex Rodionov', 'Titus Fortner']
  s.email = ['p0deje@gmail.com', 'titusfortner@gmail.com']
  s.description = 'WebDriver is a tool for writing automated tests of websites.
It aims to mimic the behaviour of a real user, and as such interacts with the
HTML of the application.'
  s.summary = 'The next generation developer focused tool for automated testing of webapps'
  s.homepage = 'https://github.com/seleniumhq/selenium'
  s.licenses = ['Apache']

  s.required_rubygems_version = Gem::Requirement.new('> 1.3.1') if s.respond_to? :required_rubygems_version=
  s.required_ruby_version = Gem::Requirement.new('>= 2.0')

  s.files = Dir[root + '/**/*'].reject { |e| e =~ /ruby\.iml|build\.desc/ }.map { |e| e.sub(root + '/', '') }
  s.require_paths = ['lib']

  s.add_runtime_dependency 'rubyzip', ['~> 1.0']
  s.add_runtime_dependency 'childprocess', ['~> 0.5']

  s.add_development_dependency 'rspec', ['~> 3.0']
  s.add_development_dependency 'rack', ['~> 1.0']
  s.add_development_dependency 'webmock', ['~> 2.0']
  s.add_development_dependency 'yard', ['~> 0.9.9']
end
