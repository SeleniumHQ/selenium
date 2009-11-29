module Spartan

  # Avoid polluting Object namespace with internal utility methods
  module Internals
    def self.definition_file_path(&block)
      if block.respond_to?(:source_location)    # Ruby 1.9
        block.source_location.first
      else
        eval "__FILE__", block.binding
      end
    end

    def self.camelize(underscored)
      underscored.gsub(/(^(.)|_+(.))/) {|c| ($2 || $3).upcase}
    end
    
    def self.define_test_class(suffix, &block)
      test_file_path = self.definition_file_path(&block)
      test_file_name = File.basename(test_file_path, "_tests.rb")
      test_class = Object.const_set "#{self.camelize(test_file_name)}#{suffix}",  
                   Class.new(Test::Unit::TestCase)
      test_class.class_eval(&block)
      test_class
    end

  end

end