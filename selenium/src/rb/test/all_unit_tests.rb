Dir["#{File.dirname __FILE__}/unit/**/*_tests.rb"].each do |test_case|
  require test_case
end
