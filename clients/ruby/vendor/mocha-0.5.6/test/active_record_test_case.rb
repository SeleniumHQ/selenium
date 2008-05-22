module ActiveRecordTestCase

  def setup_with_fixtures
    methods_called << :setup_with_fixtures
  end

  alias_method :setup, :setup_with_fixtures

  def teardown_with_fixtures
    methods_called << :teardown_with_fixtures
  end

  alias_method :teardown, :teardown_with_fixtures

  def self.method_added(method)
    case method.to_s
    when 'setup'
      unless method_defined?(:setup_without_fixtures)
        alias_method :setup_without_fixtures, :setup
        define_method(:setup) do
          setup_with_fixtures
          setup_without_fixtures
        end
      end
    when 'teardown'
      unless method_defined?(:teardown_without_fixtures)
        alias_method :teardown_without_fixtures, :teardown
        define_method(:teardown) do
          teardown_without_fixtures
          teardown_with_fixtures
        end
      end
    end
  end

end