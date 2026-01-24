# frozen_string_literal: true

require 'json'

# ./go bazel:build_test_index            --> 'build/bazel-test-target-index.json'
# ./go bazel:build_test_index index.json --> 'index.json'
desc 'Build test target index for faster affected target lookup'
task :build_test_index, [:index_file] do |_task, args|
  output = args[:index_file] || 'build/bazel-test-target-index.json'

  index = {}
  tests = []

  exclude_tags = %w[manual spotbugs ie]
  all_bindings = BINDING_TARGETS.values.join(' + ')
  tag_exclusions = exclude_tags.map { |tag| "except attr('tags', '#{tag}', #{all_bindings})" }.join(' ')
  kind = '_test' # do not match test_suite or pytest_runner

  puts "Finding all test targets for #{all_bindings}, excluding: #{exclude_tags}"
  Bazel.execute('query', ['--output=label'], "kind(#{kind}, #{all_bindings}) #{tag_exclusions}") do |out|
    tests = out.lines.map(&:strip).select { |l| l.start_with?('//') }
  end
  puts "Found #{tests.size} tests"

  tests.each_with_index do |test, i|
    puts "Processing #{i + 1}/#{tests.size}: #{test}" if (i % 100).zero?

    deps = []
    Bazel.execute('query', ['--output=label'], "deps(#{test})") do |out|
      deps = out.lines.map(&:strip).select { |l| l.start_with?('//', '@selenium//') }
    end

    deps.each do |dep|
      pkg = bazel_label_to_package(dep)
      next if pkg.nil? || pkg.empty?

      index[pkg] ||= []
      index[pkg] << test unless index[pkg].include?(test)
    end
  end

  sorted_index = index.keys.sort.each_with_object({}) { |k, h| h[k] = index[k].sort }
  FileUtils.mkdir_p(File.dirname(output))
  File.write(output, JSON.pretty_generate(sorted_index))
  puts "Wrote #{sorted_index.size} packages to #{output}"
end

def bazel_label_to_package(label)
  # Skip external deps (but allow @selenium// which is internal)
  return nil if label.start_with?('@') && !label.start_with?('@selenium//')

  # Normalize @selenium//foo to foo, //foo to foo
  label = label.sub(%r{^@selenium//}, '').sub(%r{^//}, '')
  label.split(':').first
end
