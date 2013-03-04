puts 'Starting build.'
require File.expand_path("../../third_party/jruby/gems/albacore.jar", __FILE__)
require File.expand_path("../../third_party/jruby/gems/childprocess.jar", __FILE__)
require 'rake'

Rake.application.run
