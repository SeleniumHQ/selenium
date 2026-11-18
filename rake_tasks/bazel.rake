# frozen_string_literal: true

HIGH_IMPACT_PATHS = %w[common rust/src BUILD.bazel MODULE.bazel .bazelrc .bazelversion].freeze

# Files outside a target's own directory that only its jobs use
TARGET_OVERRIDES = {
  '.github/workflows/ci-dotnet.yml' => 'dotnet',
  '.github/workflows/ci-java.yml' => 'java',
  '.github/workflows/ci-javascript.yml' => 'javascript',
  '.github/workflows/ci-python.yml' => 'py',
  '.github/workflows/ci-ruby.yml' => 'rb',
  '.github/workflows/ci-rust.yml' => 'rust',
  'package.json' => 'javascript',
  'pnpm-lock.yaml' => 'javascript',
  'pnpm-workspace.yaml' => 'javascript',
  'third_party/dotnet' => 'dotnet'
}.freeze

# ./go bazel:affected_targets                  --> HEAD^..HEAD
# ./go bazel:affected_targets abc123..def456   --> explicit range
desc 'Find test targets affected by changes between revisions'
task :affected_targets do |_task, args|
  range = args.to_a.first || 'HEAD'
  base_rev, head_rev = if range.include?('..')
                         range.split('..', 2)
                       else
                         ["#{range}~1", range]
                       end

  puts "Commit range: #{base_rev}..#{head_rev}"

  changed_files = `git diff --name-only #{base_rev} #{head_rev}`.split("\n").map(&:strip).reject(&:empty?)
  raise "git diff failed for range #{base_rev}..#{head_rev}" unless $CHILD_STATUS.success?

  puts "Changed files: #{changed_files.size}"

  targets = affected_targets_for(changed_files).sort

  FileUtils.mkdir_p('build')
  if targets.empty?
    puts 'No test targets affected'
  else
    puts "Affected: #{targets.join(' ')}"
  end
  File.write('build/bazel-targets.txt', targets.join(' '))

  manager_changed = changed_files.any? { |f| f.start_with?('rust/') }
  puts 'Selenium Manager sources changed' if manager_changed
  File.write('build/selenium-manager-changed.txt', manager_changed.to_s)
end

def affected_targets_for(changed_files)
  high_impact = changed_files.find { |f| HIGH_IMPACT_PATHS.any? { |path| path_under?(f, path) } }
  if high_impact
    puts "#{high_impact} affects every target"
    return TEST_TARGETS.values
  end

  keys = changed_files.flat_map do |f|
    overrides = TARGET_OVERRIDES.select { |path, _| path_under?(f, path) }.values
    top_level_dir = f.split('/').first
    TEST_TARGETS.key?(top_level_dir) ? overrides + [top_level_dir] : overrides
  end
  TEST_TARGETS.values_at(*keys.uniq)
end

def path_under?(file, path)
  file == path || file.start_with?("#{path}/")
end
