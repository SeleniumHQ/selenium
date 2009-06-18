module Spartan
  module TestCaseExtensions

    def test(description, &block)
      define_method test_method_name_for(description) do
        instance_eval(&block)
      end
    end

    def test_method_name_for(description)
      test_name = "test_#{description.gsub(/[ \.,;:\(\)-]+/, "_")}"
      if duplicated_test_method?(test_name)
        raise "'#{description}' is already defined in this test case (cut-and-paste?)"
      end
      test_name
    end

    def duplicated_test_method?(test_name)
      instance_methods.include?(test_name) ||
      instance_methods.include?(test_name.to_sym) # Ruby 1.9
    end
  end
end