# -*- encoding: utf-8 -*-

root = File.expand_path(File.dirname(__FILE__))
if root != Dir.pwd
  raise "cwd must be #{root} when reading gemspec"
end

Gem::Specification.new do |s|
  s.name    = "selenium-webdriver"
  s.version = "2.53.0"

  s.authors     = ["Jari Bakken"]
  s.email       = "jari.bakken@gmail.com"
  s.description = "WebDriver is a tool for writing automated tests of websites. It aims to mimic the behaviour of a real user, and as such interacts with the HTML of the application."
  s.summary     = "The next generation developer focused tool for automated testing of webapps"
  s.homepage    = "https://github.com/seleniumhq/selenium"
  s.licenses    = ["Apache"]

  s.required_rubygems_version = Gem::Requirement.new("> 1.3.1") if s.respond_to? :required_rubygems_version=
  s.required_ruby_version     = Gem::Requirement.new(">= 1.9.2")

  s.files         = Dir[root + '/**/*'].reject { |e| e =~ /ruby\.iml|build\.desc/ }.map { |e| e.sub(root + '/', '') }
  s.require_paths = ["lib"]

  s.add_runtime_dependency "rubyzip", ["~> 1.0"]
  s.add_runtime_dependency "childprocess", ["~> 0.5"]
  s.add_runtime_dependency "websocket", ["~> 1.0"]

  s.add_development_dependency "rspec", ["~> 2.99.0"]
  s.add_development_dependency "rack", ["~> 1.0"]
  s.add_development_dependency "ci_reporter", ["~> 1.6", ">= 1.6.2"]
  s.add_development_dependency "webmock", ["~> 1.7", ">= 1.7.5"]
  s.add_development_dependency "yard", ["~> 0.8.7"]
end
