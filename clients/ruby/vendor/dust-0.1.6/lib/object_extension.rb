class Object
  # call-seq: unit_tests(options={}, &block)
  # 
  # Used to define a block of unit tests.
  # 
  #    unit_tests do
  #      test "verify something" do                                   
  #        ...
  #      end                                                     
  #    end                 
  # 
  # Configuration Options:
  #   * allow - Allows you to specify the methods that are allowed despite being disallowed.  
  #     See Test::Unit::TestCase.disallow_helpers! or Test::Unit::TestCase.disallow_setup! for more info
  def unit_tests(options={}, &block)
    do_tests("Units", options, &block)
  end

  # call-seq: functional_tests(options={}, &block)
  # 
  # Used to define a block of functional tests.
  # 
  #    functional_tests do
  #      test "verify something" do                                   
  #        ...
  #      end                                                     
  #    end                                                       
  # 
  # Configuration Options:
  #   * allow - Allows you to specify the methods that are allowed despite being disallowed.  
  #     See Test::Unit::TestCase.disallow_helpers! or Test::Unit::TestCase.disallow_setup! for more info
  def functional_tests(options={}, &block)
    do_tests("Functionals", options, &block)
  end
  
  protected
  def do_tests(type, options, &block) #:nodoc:
    options[:allow] = options[:allow].arrayize
    full_path_file_name = eval "__FILE__", block.binding
    test_name = File.basename(full_path_file_name, ".rb")
    test_class = eval "module #{type}; class #{test_name.to_class_name} < Test::Unit::TestCase; self; end; end"
    test_class.class_eval &block
    check_for_setup(test_class, options)
    check_for_helpers(test_class, options)
  end
  
  def check_for_setup(test_class, options) #:nodoc:
    if test_class.instance_methods(false).include?("setup") && Test::Unit::TestCase.disallow_setup? && 
       !options[:allow].include?(:setup)
      raise Dust::DefinitionError.new("setup is not allowed on class #{test_class.name}")
    end
  end
  
  def check_for_helpers(test_class, options) #:nodoc:
    test_class.instance_methods(false).each do |method_name|
      if method_name !~ /^test_/ && Test::Unit::TestCase.disallow_helpers? && !options[:allow].include?(method_name.to_sym)
        p method_name.to_sym
        raise Dust::DefinitionError.new("helper methods are not allowed on class #{test_class.name}")
      end
    end
  end
end