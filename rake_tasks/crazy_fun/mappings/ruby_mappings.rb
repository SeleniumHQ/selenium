require_relative 'ruby_mappings/add_test_defaults'
require_relative 'ruby_mappings/add_test_dependencies'
require_relative 'ruby_mappings/check_test_args'
require_relative 'ruby_mappings/expand_source_files'
require_relative 'ruby_mappings/ruby_docs'
require_relative 'ruby_mappings/ruby_gem'
require_relative 'ruby_mappings/ruby_library'
require_relative 'ruby_mappings/ruby_linter'
require_relative 'ruby_mappings/ruby_test'
require_relative 'ruby_mappings/ruby_class_call'

module CrazyFun
  module Mappings
    class RubyMappings
      def add_all(fun)
        fun.add_mapping "ruby_library", RubyLibrary.new

        fun.add_mapping "ruby_test", CheckTestArgs.new
        fun.add_mapping "ruby_test", AddTestDefaults.new
        fun.add_mapping "ruby_test", ExpandSourceFiles.new
        fun.add_mapping "ruby_test", RubyTest.new
        fun.add_mapping "ruby_test", AddTestDependencies.new

        fun.add_mapping "ruby_lint", ExpandSourceFiles.new
        fun.add_mapping "ruby_lint", RubyLinter.new

        fun.add_mapping "rubydocs", RubyDocs.new
        fun.add_mapping "rubygem", RubyGem.new

        fun.add_mapping "ruby_class_call", RubyClassCall.new
      end
    end
  end
end
