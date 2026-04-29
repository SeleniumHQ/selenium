# frozen_string_literal: true

require 'json'
require 'set'

# Dirs that affect all bindings - changes here trigger "run all tests"
HIGH_IMPACT_DIRS = %w[common rust/src javascript/atoms javascript/webdriver/atoms].freeze
HIGH_IMPACT_PATTERN = %r{\A(?:#{HIGH_IMPACT_DIRS.map { |d| Regexp.escape(d) }.join('|')})(?:/|$)}

# ./go bazel:affected_targets                              --> HEAD^..HEAD with default index
# ./go bazel:affected_targets abc123..def456               --> explicit range
# ./go bazel:affected_targets abc123..def456 my-index      --> explicit range with custom index
# ./go bazel:affected_targets my-index                     --> HEAD^..HEAD with custom index
desc 'Find test targets affected by changes between revisions'
task :affected_targets do |_task, args|
  values = args.to_a
  index_file = values.find { |value| File.exist?(value) }
  range = (values - [index_file]).first || 'HEAD'
  index_file ||= 'build/bazel-test-file-index'

  base_rev, head_rev = if range.include?('..')
                         range.split('..', 2)
                       else
                         ["#{range}^", range]
                       end

  puts "Commit range: #{base_rev}..#{head_rev}"

  changed_files = `git diff --name-only #{base_rev} #{head_rev}`.split("\n").map(&:strip).reject(&:empty?)
  raise "git diff failed for range #{base_rev}..#{head_rev}" unless $CHILD_STATUS.success?

  puts "Changed files: #{changed_files.size}"

  targets = if changed_files.any? { |f| f.match?(HIGH_IMPACT_PATTERN) }
              BINDING_TARGETS.values
            elsif File.exist?(index_file)
              affected_targets_with_index(changed_files, index_file)
            else
              puts 'No index found, using directory-based fallback'
              affected_targets_by_directory(changed_files)
            end

  if targets.empty?
    puts 'No test targets affected'
    File.write('bazel-targets.txt', '')
  else
    puts "Found #{targets.size} affected test targets"
    File.write('bazel-targets.txt', targets.sort.join(' '))
    targets.sort.each { |t| puts t }
  end
end

# ./go bazel:build_test_index                    --> 'build/bazel-test-file-index'
# ./go bazel:build_test_index my-index           --> 'my-index'
desc 'Build test target index for faster affected target lookup'
task :build_test_index, [:index_file] do |_task, args|
  output = args[:index_file] || 'build/bazel-test-file-index'

  # Flat index: file path → [test targets]
  index = Hash.new { |h, k| h[k] = [] }
  tests = []

  exclude_tags = %w[manual spotbugs ie]
  all_bindings = BINDING_TARGETS.values.join(' + ')
  tag_exclusions = exclude_tags.map { |tag| "except attr('tags', '#{tag}', #{all_bindings})" }.join(' ')
  kind = '_test' # do not match test_suite or pytest_runner

  puts "Finding all test targets for #{all_bindings}, excluding: #{exclude_tags}"
  Bazel.execute('query', ['--output=label'], "kind(#{kind}, #{all_bindings}) #{tag_exclusions}") do |out|
    tests = out.lines.map(&:strip).select { |l| l.start_with?('//') }
  end
  puts "Found #{tests.size} test targets"

  puts 'Building file → tests mapping...'
  srcs_cache = {}
  tests.each_with_index do |test, i|
    puts "Processing #{i + 1}/#{tests.size}: #{test}" if (i % 100).zero?

    query_test_deps(test).each do |dep|
      srcs_cache[dep] ||= query_dep_srcs(dep)
      add_test_to_index(index, test, srcs_cache[dep])
    end
  end
  puts "Cached #{srcs_cache.size} dep → srcs lookups"

  sorted_index = index.keys.sort.to_h do |filepath|
    [filepath, index[filepath].uniq.sort]
  end

  FileUtils.mkdir_p(File.dirname(output))
  File.write(output, JSON.pretty_generate(sorted_index))
  puts "Wrote index with #{sorted_index.size} files to #{output}"
end

def query_test_deps(test)
  deps = []
  Bazel.execute('query', ['--output=label'], "deps(#{test}) intersect //... except attr(testonly, 1, //...)") do |out|
    deps = out.lines.map(&:strip).select { |l| l.start_with?('//') }
  end
  deps.reject do |d|
    # Skip high-impact dirs and root package targets (generated files, LICENSE, etc)
    HIGH_IMPACT_DIRS.any? { |dir| d.start_with?("//#{dir}") } || d.start_with?('//:')
  end
rescue StandardError => e
  puts "  Warning: Failed to query deps for #{test}: #{e.message}"
  []
end

def add_test_to_index(index, test, srcs)
  srcs.each do |src|
    # Convert //pkg:file to pkg/file
    filepath = src.sub(%r{^//}, '').tr(':', '/')
    # Skip dotnet tests for java sources (dotnet depends on java server but has no remote tests)
    next if filepath.start_with?('java/') && test.start_with?('//dotnet/')

    index[filepath] << test
  end
end

def query_dep_srcs(dep)
  srcs = []
  Bazel.execute('query', ['--output=label'], "labels(srcs, #{dep})") do |out|
    srcs = out.lines.map(&:strip).select { |l| l.start_with?('//') && !l.start_with?('//:') }
  end
  srcs
rescue StandardError => e
  puts "  Warning: Failed to query srcs for #{dep}: #{e.message}"
  []
end

def find_bazel_package(filepath)
  path = File.dirname(filepath)
  until path.empty?
    return path if File.exist?(File.join(path, 'BUILD.bazel')) || File.exist?(File.join(path, 'BUILD'))
    return nil if path == '.'

    path = File.dirname(path)
  end
  nil
end

def affected_targets_with_index(changed_files, index_file)
  puts "Using index: #{index_file}"

  begin
    index = JSON.parse(File.read(index_file))
  rescue JSON::ParserError => e
    puts "Invalid JSON in index file: #{e.message}"
    puts 'Using directory-based fallback'
    return affected_targets_by_directory(changed_files)
  end

  test_files, lib_files = changed_files.partition { |f| f.match?(%r{[_-]test\.rb$|_tests?\.py$|Test\.java$|\.test\.[jt]s$|_spec\.rb$|^dotnet/test/}) }

  affected = Set.new
  # Just test the tests
  affected.merge(targets_from_tests(test_files))

  lib_files.each do |filepath|
    tests = index[filepath]
    if tests
      puts "  #{filepath} → #{tests.size} tests"
      affected.merge(tests)
    else
      puts "  #{filepath} not in index, querying for affected tests"
      affected.merge(query_unindexed_file(filepath))
    end
  end

  affected.to_a
end

def query_unindexed_file(filepath)
  pkg = find_bazel_package(filepath)
  return [] unless pkg

  rel = pkg == '.' ? filepath : filepath.sub(%r{^#{Regexp.escape(pkg)}/}, '')
  pkg = '' if pkg == '.'

  # Find targets that contain this file in their srcs
  containing = []
  Bazel.execute('query', ['--output=label'], "attr(srcs, '#{rel}', //#{pkg}:*)") do |out|
    containing = out.lines.map(&:strip).select { |l| l.start_with?('//') }
  end
  return [] if containing.empty?

  # Find tests that depend on those targets
  targets = []
  Bazel.execute('query', ['--output=label'], "kind(_test, rdeps(//..., #{containing.join(' + ')}))") do |out|
    targets = out.lines.map(&:strip).select { |l| l.start_with?('//') }
  end

  # dotnet tests depend on java server, but there are no remote tests, so safe to ignore
  filepath.start_with?('java/') ? targets.reject { |t| t.start_with?('//dotnet/') } : targets
rescue StandardError => e
  puts "  Warning: Failed to query unindexed file #{filepath}: #{e.message}"
  []
end

def targets_from_tests(test_files)
  test_files.select! { |f| File.exist?(f) }
  return [] if test_files.empty?

  query = test_files.filter_map { |f|
    pkg = find_bazel_package(f)
    next unless pkg

    # Bazel srcs often use paths relative to the package, not basenames.
    rel = f.sub(%r{^#{Regexp.escape(pkg)}/}, '')
    "attr(srcs, '#{rel}', //#{pkg}:*)"
  }.join(' + ')

  return [] if query.empty?

  targets = []
  Bazel.execute('query', ['--output=label'], "kind(_test, #{query})") do |out|
    targets = out.lines.map(&:strip).select { |l| l.start_with?('//') }
  end
  targets
end

def affected_targets_by_directory(changed_files)
  targets = Set.new
  top_level_dirs = changed_files.map { |f| f.split('/').first }.uniq

  return BINDING_TARGETS.values if top_level_dirs.intersect?(%w[common rust])

  top_level_dirs.each do |dir|
    targets << BINDING_TARGETS[dir] if BINDING_TARGETS[dir]
  end

  targets.to_a
end
