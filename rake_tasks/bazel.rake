# frozen_string_literal: true

require 'json'
require 'set'

# ./go bazel:affected_targets                              --> HEAD^..HEAD with default index
# ./go bazel:affected_targets abc123..def456               --> explicit range
# ./go bazel:affected_targets abc123..def456 my-index      --> explicit range with custom index
# ./go bazel:affected_targets my-index                     --> HEAD^..HEAD with custom index
desc 'Find test targets affected by changes between revisions'
task :affected_targets do |_task, args|
  values = args.to_a
  index_file = values.find { |value| File.exist?(value) }
  range = (values - [index_file]).first || 'HEAD'
  index_file ||= 'build/bazel-test-target-index'

  base_rev, head_rev = if range.include?('..')
                         range.split('..', 2)
                       else
                         ["#{range}^", range]
                       end

  puts "Commit range: #{base_rev}..#{head_rev}"

  changed_files = `git diff --name-only #{base_rev} #{head_rev}`.split("\n").map(&:strip).reject(&:empty?)
  puts "Changed files: #{changed_files.size}"

  targets = if File.exist?(index_file)
              affected_targets_with_index(changed_files, index_file)
            else
              puts 'No index found, using directory-based fallback'
              affected_targets_fallback(changed_files)
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

# ./go bazel:build_test_index                    --> 'build/bazel-test-target-index'
# ./go bazel:build_test_index my-index           --> 'my-index'
desc 'Build test target index for faster affected target lookup'
task :build_test_index, [:index_file] do |_task, args|
  output = args[:index_file] || 'build/bazel-test-target-index'

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
    return affected_targets_fallback(changed_files)
  end

  test_files, lib_files = changed_files.partition { |f| f.match?(/[_-]test\.rb$|_test\.py$|Test\.java$|Tests?\.cs$|\.test\.[jt]s$|_spec\.rb$/) }

  affected = Set.new
  affected.merge(targets_from_tests(test_files))

  lib_files.each do |filepath|
    pkg = find_bazel_package(filepath)
    affected.merge(targets_from_lookup(pkg, index, filepath))
  end

  affected.to_a
end

def targets_from_lookup(pkg, index, filepath)
  # ignore files not associated with bazel package
  return [] if pkg.nil?

  # Root package is empty string, not '.'
  pkg = '' if pkg == '.'

  # generate targets if package not in the index
  test_targets = index[pkg] || query_package_dep(pkg)

  # dotnet tests depend on java server, but there are no remote tests, so safe to ignore
  filepath.start_with?('java/') ? test_targets.reject { |t| t.start_with?('//dotnet/') } : test_targets
end

def query_package_dep(pkg)
  # Root package is empty string, not '.'
  pkg = '' if pkg == '.'
  puts "Package not in index, querying deps: //#{pkg}"
  targets = []
  Bazel.execute('query', ['--output=label'], "kind('.*_test', deps(//#{pkg}:all))") do |out|
    targets = out.lines.map(&:strip).select { |l| l.start_with?('//') }
  end
  targets
end

def targets_from_tests(test_files)
  test_files.select! { |f| File.exist?(f) }
  return [] if test_files.empty?

  query = test_files.filter_map { |f|
    pkg = find_bazel_package(f)
    next if pkg.nil?

    # Bazel srcs often use paths relative to the package, not basenames.
    rel = f.sub(%r{^#{Regexp.escape(pkg)}/}, '')
    "attr(srcs, '#{rel}', //#{pkg}:*)"
  }.join(' + ')

  return [] if query.empty?

  targets = []
  Bazel.execute('query', ['--output=label'], "kind('.*_test', #{query})") do |out|
    targets = out.lines.map(&:strip).select { |l| l.start_with?('//') }
  end
  targets
end

def affected_targets_fallback(changed_files)
  targets = Set.new
  top_level_dirs = changed_files.map { |f| f.split('/').first }.uniq

  return BINDING_TARGETS.values if top_level_dirs.intersect?(%w[common rust])

  top_level_dirs.each do |dir|
    targets << BINDING_TARGETS[dir] if BINDING_TARGETS[dir]
  end

  targets.to_a
end
