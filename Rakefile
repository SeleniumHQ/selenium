# frozen_string_literal: true

require 'English'
$LOAD_PATH.unshift File.expand_path('.')

require 'rake'
require 'net/telnet'
require 'stringio'
require 'fileutils'
require 'open-uri'
require 'git'
require 'find'

Rake.application.instance_variable_set(:@name, 'go')
orig_verbose = verbose
verbose(false)

# The CrazyFun build grammar. There's no magic here, just ruby
require 'rake_tasks/crazy_fun/main'
require 'rake_tasks/selenium_rake/detonating_handler'
require 'rake_tasks/selenium_rake/crazy_fun'

# The CrazyFun builders - Most of these are either partially or fully obsolete
# Note the order here is important - The top 2 are used in inheritance chains
require 'rake_tasks/crazy_fun/mappings/file_copy_hack'
require 'rake_tasks/crazy_fun/mappings/tasks'
require 'rake_tasks/crazy_fun/mappings/rake_mappings'

# Location of all new (non-CrazyFun) methods
require 'rake_tasks/selenium_rake/browsers'
require 'rake_tasks/selenium_rake/checks'
require 'rake_tasks/selenium_rake/cpp_formatter'
require 'rake_tasks/selenium_rake/ie_generator'
require 'rake_tasks/selenium_rake/java_formatter'
require 'rake_tasks/selenium_rake/type_definitions_generator'

# Our modifications to the Rake / Bazel libraries
require 'rake/task'
require 'rake_tasks/rake/task'
require 'rake_tasks/rake/dsl'
require 'rake_tasks/bazel/task'

# These are the final items mixed into the global NS
# These need moving into correct namespaces, and not be globally included
require 'rake_tasks/bazel'
require 'rake_tasks/python'

$DEBUG = orig_verbose != Rake::FileUtilsExt::DEFAULT
$DEBUG = true if ENV['debug'] == 'true'

verbose($DEBUG)
@git = Git.open(__dir__)

def java_version
  File.foreach('java/version.bzl') do |line|
    return line.split('=').last.strip.tr('"', '') if line.include?('SE_VERSION')
  end
end

# The build system used by webdriver is layered on top of rake, and we call it
# "crazy fun" for no readily apparent reason.

# First off, create a new CrazyFun object.
crazy_fun = SeleniumRake::CrazyFun.new

# Secondly, we add the handlers, which are responsible for turning a build
# rule into a (series of) rake tasks. For example if we're looking at a file
# in subdirectory "subdir" contains the line:
#
# java_library(:name => "example", :srcs => ["foo.java"])
#
# we would generate a rake target of "//subdir:example" which would generate
# a Java JAR at "build/subdir/example.jar".
#
# If crazy fun doesn't know how to handle a particular output type ("java_library"
# in the example above) then it will throw an exception, stopping the build
CrazyFun::Mappings::RakeMappings.new.add_all(crazy_fun)

# Finally, find every file named "build.desc" in the project, and generate
# rake tasks from them. These tasks are normal rake tasks, and can be invoked
# from rake.
# FIXME: the rules for the targets were removed and build files won't load
# crazy_fun.create_tasks(Dir['**/build.desc'])

# If it looks like a bazel target, build it with bazel
rule(%r{//.*}) do |task|
  task.out = Bazel.execute('build', %w[], task.name)
end

# Spoof tasks to get CI working with bazel
task '//java/test/org/openqa/selenium/environment/webserver:webserver:uber' => [
  '//java/test/org/openqa/selenium/environment:webserver'
]

# use #java_release_targets to access this list
JAVA_RELEASE_TARGETS = %w[
  //java/src/org/openqa/selenium/chrome:chrome.publish
  //java/src/org/openqa/selenium/chromium:chromium.publish
  //java/src/org/openqa/selenium/devtools/v137:v137.publish
  //java/src/org/openqa/selenium/devtools/v138:v138.publish
  //java/src/org/openqa/selenium/devtools/v136:v136.publish
  //java/src/org/openqa/selenium/edge:edge.publish
  //java/src/org/openqa/selenium/firefox:firefox.publish
  //java/src/org/openqa/selenium/grid/sessionmap/jdbc:jdbc.publish
  //java/src/org/openqa/selenium/grid/sessionmap/redis:redis.publish
  //java/src/org/openqa/selenium/grid:bom-dependencies.publish
  //java/src/org/openqa/selenium/grid:bom.publish
  //java/src/org/openqa/selenium/grid:grid.publish
  //java/src/org/openqa/selenium/ie:ie.publish
  //java/src/org/openqa/selenium/json:json.publish
  //java/src/org/openqa/selenium/manager:manager.publish
  //java/src/org/openqa/selenium/os:os.publish
  //java/src/org/openqa/selenium/remote/http:http.publish
  //java/src/org/openqa/selenium/remote:remote.publish
  //java/src/org/openqa/selenium/safari:safari.publish
  //java/src/org/openqa/selenium/support:support.publish
  //java/src/org/openqa/selenium:client-combined.publish
  //java/src/org/openqa/selenium:core.publish
].freeze

def java_release_targets
  @targets_verified ||= verify_java_release_targets

  JAVA_RELEASE_TARGETS
end

def verify_java_release_targets
  query = 'kind(maven_publish, set(//java/... //third_party/...))'
  current_targets = []

  Bazel.execute('query', [], query) do |output|
    current_targets = output.lines.map(&:strip).reject(&:empty?).select { |line| line.start_with?('//') }
  end

  missing_targets = current_targets - JAVA_RELEASE_TARGETS
  extra_targets = JAVA_RELEASE_TARGETS - current_targets

  return if missing_targets.empty? && extra_targets.empty?

  error_message = 'Java release targets are out of sync with Bazel query results.'

  error_message += "\nMissing targets: #{missing_targets.join(', ')}" unless missing_targets.empty?

  error_message += "\nObsolete targets: #{extra_targets.join(', ')}" unless extra_targets.empty?

  raise error_message
end

# Notice that because we're using rake, anything you can do in a normal rake
# build can also be done here. For example, here we set the default task
task default: [:grid]

# ./go update_browser stable
# ./go update_browser beta
desc 'Update pinned browser versions'
task :update_browsers, [:channel] do |_task, arguments|
  chrome_channel = arguments[:channel] || 'Stable'
  chrome_channel = 'beta' if chrome_channel == 'early-stable'
  args = Array(chrome_channel) ? ['--', "--chrome_channel=#{chrome_channel.capitalize}"] : []

  puts 'pinning updated browsers and drivers'
  Bazel.execute('run', args, '//scripts:pinned_browsers')
  @git.add('common/repositories.bzl')
end

desc 'Update Selenium Manager to latest release'
task :update_manager do |_task, _arguments|
  puts 'Updating Selenium Manager references'
  Bazel.execute('run', [], '//scripts:selenium_manager')

  @git.add('common/selenium_manager.bzl')
end

task all: [
  :'selenium-java',
  '//java/test/org/openqa/selenium/environment:webserver'
]

task tests: [
  '//java/test/org/openqa/selenium/htmlunit:htmlunit',
  '//java/test/org/openqa/selenium/firefox:test-synthesized',
  '//java/test/org/openqa/selenium/ie:ie',
  '//java/test/org/openqa/selenium/chrome:chrome',
  '//java/test/org/openqa/selenium/edge:edge',
  '//java/test/org/openqa/selenium/support:small-tests',
  '//java/test/org/openqa/selenium/support:large-tests',
  '//java/test/org/openqa/selenium/remote:small-tests',
  '//java/test/org/openqa/selenium/remote/server/log:test',
  '//java/test/org/openqa/selenium/remote/server:small-tests'
]
task chrome: ['//java/src/org/openqa/selenium/chrome']
task grid: [:'selenium-server-standalone']
task ie: ['//java/src/org/openqa/selenium/ie']
task firefox: ['//java/src/org/openqa/selenium/firefox']
task remote: %i[remote_server remote_client]
task remote_client: ['//java/src/org/openqa/selenium/remote']
task remote_server: ['//java/src/org/openqa/selenium/remote/server']
task safari: ['//java/src/org/openqa/selenium/safari']
task selenium: ['//java/src/org/openqa/selenium:core']
task support: ['//java/src/org/openqa/selenium/support']

desc 'Build the standalone server'
task 'selenium-server-standalone' => '//java/src/org/openqa/selenium/grid:executable-grid'

task test_javascript: [
  '//javascript/atoms:test-chrome:run',
  '//javascript/webdriver:test-chrome:run',
  '//javascript/selenium-atoms:test-chrome:run',
  '//javascript/selenium-core:test-chrome:run'
]
task test_chrome: ['//java/test/org/openqa/selenium/chrome:chrome:run']
task test_edge: ['//java/test/org/openqa/selenium/edge:edge:run']
task test_chrome_atoms: [
  '//javascript/atoms:test-chrome:run',
  '//javascript/chrome-driver:test-chrome:run',
  '//javascript/webdriver:test-chrome:run'
]
task test_htmlunit: [
  '//java/test/org/openqa/selenium/htmlunit:htmlunit:run'
]
task test_grid: [
  '//java/test/org/openqa/grid/common:common:run',
  '//java/test/org/openqa/grid:grid:run',
  '//java/test/org/openqa/grid/e2e:e2e:run',
  '//java/test/org/openqa/selenium/remote:remote-driver-grid-tests:run'
]
task test_ie: [
  '//cpp/iedriverserver:win32',
  '//cpp/iedriverserver:x64',
  '//java/test/org/openqa/selenium/ie:ie:run'
]
task test_jobbie: [:test_ie]
task test_firefox: ['//java/test/org/openqa/selenium/firefox:marionette:run']
task test_remote_server: [
  '//java/test/org/openqa/selenium/remote/server:small-tests:run',
  '//java/test/org/openqa/selenium/remote/server/log:test:run'
]
task test_remote: [
  '//java/test/org/openqa/selenium/json:small-tests:run',
  '//java/test/org/openqa/selenium/remote:common-tests:run',
  '//java/test/org/openqa/selenium/remote:client-tests:run',
  '//java/test/org/openqa/selenium/remote:remote-driver-tests:run',
  :test_remote_server
]
task test_safari: ['//java/test/org/openqa/selenium/safari:safari:run']
task test_support: [
  '//java/test/org/openqa/selenium/support:small-tests:run',
  '//java/test/org/openqa/selenium/support:large-tests:run'
]

task :test_java_webdriver do
  if SeleniumRake::Checks.windows?
    Rake::Task['test_ie'].invoke
  elsif SeleniumRake::Checks.chrome?
    Rake::Task['test_chrome'].invoke
  elsif SeleniumRake::Checks.edge?
    Rake::Task['test_edge'].invoke
  else
    Rake::Task['test_htmlunit'].invoke
    Rake::Task['test_firefox'].invoke
    Rake::Task['test_remote_server'].invoke
  end
end

task test_java: [
  '//java/test/org/openqa/selenium/atoms:test:run',
  :test_java_small_tests,
  :test_support,
  :test_java_webdriver,
  :test_selenium,
  'test_grid'
]

task test_java_small_tests: [
  '//java/test/org/openqa/selenium:small-tests:run',
  '//java/test/org/openqa/selenium/json:small-tests:run',
  '//java/test/org/openqa/selenium/support:small-tests:run',
  '//java/test/org/openqa/selenium/remote:common-tests:run',
  '//java/test/org/openqa/selenium/remote:client-tests:run',
  '//java/test/org/openqa/grid/selenium/node:node:run',
  '//java/test/org/openqa/grid/selenium/proxy:proxy:run',
  '//java/test/org/openqa/selenium/remote/server:small-tests:run',
  '//java/test/org/openqa/selenium/remote/server/log:test:run'
]

task :test do
  if SeleniumRake::Checks.python?
    Rake::Task['test_py'].invoke
  else
    Rake::Task['test_javascript'].invoke
    Rake::Task['test_java'].invoke
  end
end

task test_py: [:py_prep_for_install_release, 'py:marionette_test']
task build: %i[all firefox remote selenium tests]

desc 'Clean build artifacts.'
task :clean do
  rm_rf 'build/'
  rm_rf 'java/build/'
  rm_rf 'dist/'
end

# Create a new IEGenerator instance
ie_generator = SeleniumRake::IEGenerator.new

# Generate a C++ Header file for mapping between magic numbers and #defines
# in the C++ code.
ie_generator.generate_type_mapping(
  name: 'ie_result_type_cpp',
  src: 'cpp/iedriver/result_types.txt',
  type: 'cpp',
  out: 'cpp/iedriver/IEReturnTypes.h'
)

desc 'Generate Javadocs'
task javadocs: %i[//java/src/org/openqa/selenium/grid:all-javadocs] do
  FileUtils.rm_rf('build/docs/api/java')
  FileUtils.mkdir_p('build/docs/api/java')
  out = 'bazel-bin/java/src/org/openqa/selenium/grid/all-javadocs.jar'

  cmd = %(cd build/docs/api/java && jar xf "../../../../#{out}" 2>&1)
  cmd = cmd.tr('/', '\\').tr(':', ';') if SeleniumRake::Checks.windows?
  raise 'could not unpack javadocs' unless system(cmd)

  File.open('build/docs/api/java/stylesheet.css', 'a') do |file|
    file.write(<<~STYLE
      /* Custom selenium-specific styling */
      .blink {
        animation: 2s cubic-bezier(0.5, 0, 0.85, 0.85) infinite blink;
      }

      @keyframes blink {
        50% {
          opacity: 0;
        }
      }

    STYLE
              )
  end
end

file 'cpp/iedriver/sizzle.h' => ['//third_party/js/sizzle:sizzle:header'] do
  cp 'build/third_party/js/sizzle/sizzle.h', 'cpp/iedriver/sizzle.h'
end

task sizzle_header: ['cpp/iedriver/sizzle.h']

task ios_driver: [
  '//javascript/atoms/fragments:get_visible_text:ios',
  '//javascript/atoms/fragments:click:ios',
  '//javascript/atoms/fragments:back:ios',
  '//javascript/atoms/fragments:forward:ios',
  '//javascript/atoms/fragments:submit:ios',
  '//javascript/atoms/fragments:xpath:ios',
  '//javascript/atoms/fragments:xpaths:ios',
  '//javascript/atoms/fragments:type:ios',
  '//javascript/atoms/fragments:get_attribute:ios',
  '//javascript/atoms/fragments:clear:ios',
  '//javascript/atoms/fragments:is_selected:ios',
  '//javascript/atoms/fragments:is_enabled:ios',
  '//javascript/atoms/fragments:is_shown:ios',
  '//javascript/atoms/fragments:stringify:ios',
  '//javascript/atoms/fragments:link_text:ios',
  '//javascript/atoms/fragments:link_texts:ios',
  '//javascript/atoms/fragments:partial_link_text:ios',
  '//javascript/atoms/fragments:partial_link_texts:ios',
  '//javascript/atoms/fragments:get_interactable_size:ios',
  '//javascript/atoms/fragments:scroll_into_view:ios',
  '//javascript/atoms/fragments:get_effective_style:ios',
  '//javascript/atoms/fragments:get_element_size:ios',
  '//javascript/webdriver/atoms/fragments:get_location_in_view:ios'
]

# This task does not allow running RBE, to run stamped with RBE use
# ./go java:package['--config=release']
desc 'Create stamped zipped assets for Java for uploading to GitHub'
task :'java-release-zip' do
  Rake::Task['java:package'].invoke('--config=rbe_release')
end

task 'release-java': %i[java-release-zip publish-maven]

def read_m2_user_pass
  puts 'Maven environment variables not set, inspecting /.m2/settings.xml.'
  settings = File.read("#{Dir.home}/.m2/settings.xml")
  found_section = false
  settings.each_line do |line|
    if !found_section
      found_section = line.include? '<id>sonatype-nexus-staging</id>'
    elsif line.include?('<username>')
      ENV['MAVEN_USER'] = line[%r{<username>(.*?)</username>}, 1]
    elsif line.include?('<password>')
      ENV['MAVEN_PASSWORD'] = line[%r{<password>(.*?)</password>}, 1]
    end
    break if ENV['MAVEN_PASSWORD'] && ENV['MAVEN_USER']
  end
end

desc 'Publish all Java jars to Maven as stable release'
task 'publish-maven' do
  Rake::Task['java:release'].invoke
end

desc 'Publish all Java jars to Maven as nightly release'
task 'publish-maven-snapshot' do
  Rake::Task['java:release'].invoke('nightly')
end

desc 'Install jars to local m2 directory'
task :'maven-install' do
  java_release_targets.each do |p|
    Bazel.execute('run',
                  ['--stamp',
                   '--define',
                   "maven_repo=file://#{Dir.home}/.m2/repository",
                   '--define',
                   'gpg_sign=false'],
                  p)
  end
end

desc 'Build the selenium client jars'
task 'selenium-java' => '//java/src/org/openqa/selenium:client-combined'

desc 'Update AUTHORS file'
task :authors do
  puts 'Updating AUTHORS file'
  sh "(git log --use-mailmap --format='%aN <%aE>' ; cat .OLD_AUTHORS) | sort -uf > AUTHORS"
  @git.add('AUTHORS')
end

namespace :side do
  task atoms: [
    '//javascript/atoms/fragments:find-element'
  ] do
    # TODO: move directly to IDE's directory once the repositories are merged
    mkdir_p 'build/javascript/atoms'

    atom = 'bazel-bin/javascript/atoms/fragments/find-element.js'
    name = File.basename(atom)

    puts "Generating #{atom} as #{name}"
    File.open(File.join(baseDir, name), 'w') do |f|
      f << "// GENERATED CODE - DO NOT EDIT\n"
      f << 'module.exports = '
      f << File.read(atom).strip
      f << ";\n"
    end
  end
end

def node_version
  File.foreach('javascript/selenium-webdriver/package.json') do |line|
    return line.split(':').last.strip.tr('",', '') if line.include?('version')
  end
end
namespace :node do
  atom_list = %w[
    //javascript/atoms/fragments:find-elements
    //javascript/atoms/fragments:is-displayed
    //javascript/webdriver/atoms:get-attribute
  ]

  task atoms: atom_list do
    base_dir = 'javascript/selenium-webdriver/lib/atoms'
    mkdir_p base_dir

    ['bazel-bin/javascript/atoms/fragments/is-displayed.js',
     'bazel-bin/javascript/webdriver/atoms/get-attribute.js',
     'bazel-bin/javascript/atoms/fragments/find-elements.js'].each do |atom|
      name = File.basename(atom)
      puts "Generating #{atom} as #{name}"
      File.open(File.join(base_dir, name), 'w') do |f|
        f << "// GENERATED CODE - DO NOT EDIT\n"
        f << 'module.exports = '
        f << File.read(atom).strip
        f << ";\n"
      end
    end
  end

  desc 'Build Node npm package'
  task :build do |_task, arguments|
    args = arguments.to_a.compact
    Bazel.execute('build', args, '//javascript/selenium-webdriver')
  end

  task :'dry-run' do
    Bazel.execute('run', ['--stamp'],
                  '//javascript/selenium-webdriver:selenium-webdriver.publish  -- --dry-run=true')
  end

  desc 'Release Node npm package'
  task :release do |_task, arguments|
    nightly = arguments.to_a.include?('nightly')
    if nightly
      puts 'Updating Node version to nightly...'
      Rake::Task['node:version'].invoke('nightly') if nightly
    end

    puts 'Running Node package release...'
    Bazel.execute('run', ['--config=release'], '//javascript/selenium-webdriver:selenium-webdriver.publish')
  end

  desc 'Release Node npm package'
  task deploy: :release

  desc 'Generate Node documentation'
  task :docs do |_task, arguments|
    if node_version.include?('nightly') && !arguments.to_a.include?('force')
      abort('Aborting documentation update: nightly versions should not update docs.')
    end

    puts 'Generating Node documentation'
    FileUtils.rm_rf('build/docs/api/javascript/')
    begin
      Dir.chdir('javascript/selenium-webdriver') do
        sh 'pnpm install', verbose: true
        sh 'pnpm run generate-docs', verbose: true
      end
    rescue StandardError => e
      puts "Node documentation generation contains errors; continuing... #{e.message}"
    end

    update_gh_pages unless arguments.to_a.include?('skip_update')
  end

  desc 'Update JavaScript changelog'
  task :changelog do
    header = "## #{node_version}\n"
    update_changelog(node_version, 'javascript', 'javascript/selenium-webdriver/',
                     'javascript/selenium-webdriver/CHANGES.md', header)
  end

  desc 'Update Node version'
  task :version, [:version] do |_task, arguments|
    old_version = node_version
    nightly = "-nightly#{Time.now.strftime('%Y%m%d%H%M')}"
    new_version = updated_version(old_version, arguments[:version], nightly)

    %w[javascript/selenium-webdriver/package.json javascript/selenium-webdriver/BUILD.bazel].each do |file|
      text = File.read(file).gsub(old_version, new_version)
      File.open(file, 'w') { |f| f.puts text }
      @git.add(file)
    end
  end
end

def python_version
  File.foreach('py/BUILD.bazel') do |line|
    return line.split('=').last.strip.tr('"', '') if line.include?('SE_VERSION')
  end
end
namespace :py do
  desc 'Build Python wheel and sdist with optional arguments'
  task :build do |_task, arguments|
    args = arguments.to_a.compact
    Bazel.execute('build', args, '//py:selenium-wheel')
    Bazel.execute('build', args, '//py:selenium-sdist')
  end

  desc 'Release Python wheel and sdist to pypi'
  task :release do |_task, arguments|
    nightly = arguments.to_a.include?('nightly')
    if nightly
      puts 'Updating Python version to nightly...'
      Rake::Task['py:version'].invoke('nightly')
    end

    command = nightly ? '//py:selenium-release-nightly' : '//py:selenium-release'
    puts "Running Python release command: #{command}"
    Bazel.execute('run', ['--config=release'], command)
  end

  desc 'generate and copy files required for local development'
  task :local_dev do
    Bazel.execute('build', [], '//py:selenium')
    Rake::Task['grid'].invoke

    FileUtils.rm_rf('py/selenium/webdriver/common/devtools/')
    FileUtils.cp_r('bazel-bin/py/selenium/webdriver/.', 'py/selenium/webdriver', remove_destination: true)
  end

  desc 'Update generated Python files for local development'
  task :clean do
    Bazel.execute('build', [], '//py:selenium')
    bazel_bin_path = 'bazel-bin/py/selenium/webdriver'
    lib_path = 'py/selenium/webdriver'

    dirs = %w[devtools linux mac windows]
    dirs.each { |dir| FileUtils.rm_rf("#{lib_path}/common/#{dir}") }

    Find.find(bazel_bin_path) do |path|
      if File.directory?(path) && dirs.any? { |dir| path.include?("common/#{dir}") }
        Find.prune
        next
      end
      next if File.directory?(path)

      target_file = File.join(lib_path, path.sub(%r{^#{bazel_bin_path}/}, ''))
      if File.exist?(target_file)
        puts "Removing target file: #{target_file}"
        FileUtils.rm(target_file)
      end
    end
  end

  desc 'Generate Python documentation'
  task :docs do |_task, arguments|
    if python_version.match?(/^\d+\.\d+\.\d+\.\d+$/) && !arguments.to_a.include?('force')
      abort('Aborting documentation update: nightly versions should not update docs.')
    end
    puts 'Generating Python documentation'

    FileUtils.rm_rf('build/docs/api/py/')
    FileUtils.rm_rf('build/docs/doctrees/')
    begin
      sh 'tox -c py/tox.ini -e docs', verbose: true
    rescue StandardError
      puts 'Ensure that tox is installed on your system'
      raise
    end

    update_gh_pages unless arguments.to_a.include?('skip_update')
  end

  desc 'Install Python wheel locally'
  task :install do
    Bazel.execute('build', [], '//py:selenium-wheel')
    begin
      sh 'pip install bazel-bin/py/selenium-*.whl'
    rescue StandardError
      puts 'Ensure that Python and pip are installed on your system'
      raise
    end
  end

  desc 'Update Python changelog'
  task :changelog do
    header = "Selenium #{python_version}"
    update_changelog(python_version, 'py', 'py/selenium/webdriver', 'py/CHANGES', header)
  end

  desc 'Update Python version'
  task :version, [:version] do |_task, arguments|
    old_version = python_version
    nightly = ".#{Time.now.strftime('%Y%m%d%H%M')}"
    new_version = updated_version(old_version, arguments[:version], nightly)

    ['py/pyproject.toml',
     'py/BUILD.bazel',
     'py/selenium/__init__.py',
     'py/selenium/webdriver/__init__.py',
     'py/docs/source/conf.py'].each do |file|
      text = File.read(file).gsub(old_version, new_version)
      File.open(file, 'w') { |f| f.puts text }
      @git.add(file)
    end

    old_short_version = old_version.split('.')[0..1].join('.')
    new_short_version = new_version.split('.')[0..1].join('.')

    conf = 'py/docs/source/conf.py'
    text = File.read(conf).gsub(old_short_version, new_short_version)
    File.open(conf, 'w') { |f| f.puts text }
    @git.add(conf)
  end

  namespace :test do
    desc 'Python unit tests'
    task :unit do
      Rake::Task['py:clean'].invoke
      Bazel.execute('test', ['--test_size_filters=small'], '//py/...')
    end

    %i[chrome edge firefox safari].each do |browser|
      desc "Python #{browser} tests"
      task browser do
        Rake::Task['py:clean'].invoke
        Bazel.execute('test', [], "//py:common-#{browser}")
        Bazel.execute('test', [], "//py:test-#{browser}")
      end
    end

    desc 'Python Remote tests with Firefox'
    task :remote do
      Rake::Task['py:clean'].invoke
      Bazel.execute('test', [], '//py:test-remote')
    end
  end

  namespace :test do
    desc 'Python unit tests'
    task :unit do
      Rake::Task['py:clean'].invoke
      Bazel.execute('test', ['--test_size_filters=small'], '//py/...')
    end

    %i[chrome edge firefox safari].each do |browser|
      desc "Python #{browser} tests"
      task browser do
        Rake::Task['py:clean'].invoke
        Bazel.execute('test', %w[--test_output all], "//py:common-#{browser}")
        Bazel.execute('test', %w[--test_output all], "//py:test-#{browser}")
      end
    end
  end
end

def ruby_version
  File.foreach('rb/lib/selenium/webdriver/version.rb') do |line|
    return line.split('=').last.strip.tr("'", '') if line.include?('VERSION')
  end
end
namespace :rb do
  desc 'Generate Ruby gems'
  task :build do |_task, arguments|
    args = arguments.to_a.compact
    webdriver = args.delete('webdriver')
    devtools = args.delete('devtools')

    Bazel.execute('build', args, '//rb:selenium-webdriver') if webdriver || !devtools
    Bazel.execute('build', args, '//rb:selenium-devtools') if devtools || !webdriver
  end

  task :atoms do
    base_dir = 'rb/lib/selenium/webdriver/atoms'
    mkdir_p base_dir

    {
      '//javascript/atoms/fragments:find-elements': 'findElements.js',
      '//javascript/atoms/fragments:is-displayed': 'isDisplayed.js',
      '//javascript/webdriver/atoms:get-attribute': 'getAttribute.js'
    }.each do |target, name|
      puts "Generating #{target} as #{name}"

      atom = Bazel.execute('build', [], target.to_s)

      File.open(File.join(base_dir, name), 'w') do |f|
        f << File.read(atom).strip
      end
    end
  end

  desc 'Update generated Ruby files for local development'
  task :local_dev do
    Bazel.execute('build', [], '@bundle//:bundle')
    Rake::Task['rb:build'].invoke
    Rake::Task['grid'].invoke
  end

  desc 'Push Ruby gems to rubygems'
  task :release do |_task, arguments|
    nightly = arguments.to_a.include?('nightly')

    if nightly
      puts 'Bumping Ruby nightly version...'
      Bazel.execute('run', [], '//rb:selenium-webdriver-bump-nightly-version')

      puts 'Releasing nightly WebDriver gem...'
      Bazel.execute('run', ['--config=release'], '//rb:selenium-webdriver-release-nightly')
    else
      patch_release = ruby_version.split('.').fetch(2, '0').to_i.positive?

      puts 'Releasing Ruby gems...'
      Bazel.execute('run', ['--config=release'], '//rb:selenium-webdriver-release')
      Bazel.execute('run', ['--config=release'], '//rb:selenium-devtools-release') unless patch_release
    end
  end

  desc 'Generate Ruby documentation'
  task :docs do |_task, arguments|
    if ruby_version.include?('nightly') && !arguments.to_a.include?('force')
      abort('Aborting documentation update: nightly versions should not update docs.')
    end
    puts 'Generating Ruby documentation'

    FileUtils.rm_rf('build/docs/api/rb/')
    Bazel.execute('run', [], '//rb:docs')
    FileUtils.mkdir_p('build/docs/api')
    FileUtils.cp_r('bazel-bin/rb/docs.sh.runfiles/_main/docs/api/rb/.', 'build/docs/api/rb')

    update_gh_pages unless arguments.to_a.include?('skip_update')
  end

  desc 'Update Ruby changelog'
  task :changelog do
    header = "#{ruby_version} (#{Time.now.strftime('%Y-%m-%d')})\n========================="
    update_changelog(ruby_version, 'rb', 'rb/lib/', 'rb/CHANGES', header)
  end

  desc 'Update Ruby version'
  task :version, [:version] do |_task, arguments|
    old_version = ruby_version
    new_version = updated_version(old_version, arguments[:version], '.nightly')

    file = 'rb/lib/selenium/webdriver/version.rb'
    text = File.read(file).gsub(old_version, new_version)
    File.open(file, 'w') { |f| f.puts text }
    @git.add(file)

    sh 'cd rb && bundle --version && bundle update'
    @git.add('rb/Gemfile.lock')
  end

  desc 'Update Ruby Syntax'
  task :lint do |_task, arguments|
    args = arguments.to_a.compact
    Bazel.execute('run', args, '//rb:lint')
  end
end

def dotnet_version
  File.foreach('dotnet/selenium-dotnet-version.bzl') do |line|
    return line.split('=').last.strip.tr('"', '') if line.include?('SE_VERSION')
  end
end
namespace :dotnet do
  desc 'Build nupkg files'
  task :build do |_task, arguments|
    args = arguments.to_a.compact
    Bazel.execute('build', args, '//dotnet:all')
  end

  desc 'Package .NET bindings into zipped assets and stage for release'
  task :package do |_task, arguments|
    args = arguments.to_a.compact.empty? ? ['--stamp'] : arguments.to_a.compact
    Rake::Task['dotnet:build'].invoke(*args)
    mkdir_p 'build/dist'
    FileUtils.rm_f(Dir.glob('build/dist/*dotnet*'))

    FileUtils.copy('bazel-bin/dotnet/release.zip', "build/dist/selenium-dotnet-#{dotnet_version}.zip")
    FileUtils.chmod(0o666, "build/dist/selenium-dotnet-#{dotnet_version}.zip")
    FileUtils.copy('bazel-bin/dotnet/strongnamed.zip', "build/dist/selenium-dotnet-strongnamed-#{dotnet_version}.zip")
    FileUtils.chmod(0o666, "build/dist/selenium-dotnet-strongnamed-#{dotnet_version}.zip")
  end

  desc 'Upload nupkg files to Nuget'
  task :release do |_task, arguments|
    nightly = arguments.to_a.include?('nightly')
    if nightly
      puts 'Updating .NET version to nightly...'
      Rake::Task['dotnet:version'].invoke('nightly')
    end

    puts 'Packaging .NET release artifacts...'
    Rake::Task['dotnet:package'].invoke('--config=release')

    api_key = ENV.fetch('NUGET_API_KEY', nil)
    push_destination = 'https://api.nuget.org/v3/index.json'

    if nightly
      puts 'Setting up NuGet GitHub source for nightly release...'
      api_key = ENV.fetch('GITHUB_TOKEN', nil)
      github_push_url = 'https://nuget.pkg.github.com/seleniumhq/index.json'
      push_destination = 'github'
      flags = ['--username', 'seleniumhq', '--password', api_key, '--store-password-in-clear-text', '--name',
               push_destination, github_push_url]
      sh "dotnet nuget add source #{flags.join(' ')}"
    end

    puts 'Pushing packages to NuGet'
    ["./bazel-bin/dotnet/src/webdriver/Selenium.WebDriver.#{dotnet_version}.nupkg",
     "./bazel-bin/dotnet/src/support/Selenium.Support.#{dotnet_version}.nupkg"].each do |asset|
      sh "dotnet nuget push #{asset} --api-key #{api_key} --source #{push_destination}"
    end
  end

  desc 'Generate .NET documentation'
  task :docs do |_task, arguments|
    if dotnet_version.include?('nightly') && !arguments.to_a.include?('force')
      abort('Aborting documentation update: nightly versions should not update docs.')
    end

    puts 'Generating .NET documentation'
    FileUtils.rm_rf('build/docs/api/dotnet/')
    begin
      # Pinning to 2.78.2 to avoid breaking changes in newer versions
      sh 'dotnet tool uninstall --global docfx || true'
      sh 'dotnet tool install --global --version 2.78.2 docfx'
      # sh 'dotnet tool update -g docfx'
    rescue StandardError
      puts 'Please ensure that .NET SDK is installed.'
      raise
    end

    begin
      sh 'docfx dotnet/docs/docfx.json'
    rescue StandardError
      case $CHILD_STATUS.exitstatus
      when 133
        raise 'Ensure the dotnet/tools directory is added to your PATH environment variable (e.g., `~/.dotnet/tools`)'
      when 255
        puts '.NET documentation build failed, likely because of DevTools namespacing. This is ok; continuing'
      else
        raise
      end
    end

    update_gh_pages unless arguments.to_a.include?('skip_update')
  end

  desc 'Update .NET changelog'
  task :changelog do
    header = "v#{dotnet_version}\n======"
    update_changelog(dotnet_version, 'dotnet', 'dotnet/src/', 'dotnet/CHANGELOG', header)
  end

  desc 'Update .NET version'
  task :version, [:version] do |_task, arguments|
    old_version = dotnet_version
    nightly = "-nightly#{Time.now.strftime('%Y%m%d%H%M')}"
    new_version = updated_version(old_version, arguments[:version], nightly)

    file = 'dotnet/selenium-dotnet-version.bzl'
    text = File.read(file).gsub(old_version, new_version)
    File.open(file, 'w') { |f| f.puts text }
    @git.add(file)
  end
end

namespace :java do
  desc 'Build Java Client Jars'
  task :build do |_task, arguments|
    args = arguments.to_a.compact
    java_release_targets.each { |target| Bazel.execute('build', args, target) }
  end

  desc 'Build Grid Server'
  task :grid do |_task, arguments|
    args = arguments.to_a.compact
    Bazel.execute('build', args, '//java/src/org/openqa/selenium/grid:executable-grid')
  end

  desc 'Package Java bindings and grid into releasable packages and stage for release'
  task :package do |_task, arguments|
    args = arguments.to_a.compact.empty? ? ['--config=release'] : arguments.to_a.compact
    Bazel.execute('build', args, '//java/src/org/openqa/selenium:client-zip')
    Bazel.execute('build', args, '//java/src/org/openqa/selenium/grid:server-zip')
    Bazel.execute('build', args, '//java/src/org/openqa/selenium/grid:executable-grid')

    mkdir_p 'build/dist'
    Dir.glob('build/dist/*{java,server}*').each { |file| FileUtils.rm_f(file) }

    FileUtils.copy('bazel-bin/java/src/org/openqa/selenium/grid/server-zip.zip',
                   "build/dist/selenium-server-#{java_version}.zip")
    FileUtils.chmod(0o666, "build/dist/selenium-server-#{java_version}.zip")
    FileUtils.copy('bazel-bin/java/src/org/openqa/selenium/client-zip.zip',
                   "build/dist/selenium-java-#{java_version}.zip")
    FileUtils.chmod(0o666, "build/dist/selenium-java-#{java_version}.zip")
    FileUtils.copy('bazel-bin/java/src/org/openqa/selenium/grid/selenium',
                   "build/dist/selenium-server-#{java_version}.jar")
    FileUtils.chmod(0o777, "build/dist/selenium-server-#{java_version}.jar")
  end

  desc 'Deploy all jars to Maven'
  task :release do |_task, arguments|
    nightly = arguments.to_a.include?('nightly')

    ENV['MAVEN_USER'] ||= ENV.fetch('SEL_M2_USER', nil)
    ENV['MAVEN_PASSWORD'] ||= ENV.fetch('SEL_M2_PASS', nil)
    read_m2_user_pass unless ENV['MAVEN_PASSWORD'] && ENV['MAVEN_USER']
    repo_domain = 'central.sonatype.com'
    repo = nightly ? "#{repo_domain}/repository/maven-snapshots" : "ossrh-staging-api.#{repo_domain}/service/local/staging/deploy/maven2/"
    ENV['MAVEN_REPO'] = "https://#{repo}"
    ENV['GPG_SIGN'] = (!nightly).to_s

    if nightly
      puts 'Updating Java version to nightly...'
      Rake::Task['java:version'].invoke('nightly')
    end

    puts 'Packaging Java artifacts...'
    Rake::Task['java:package'].invoke('--config=release')
    Rake::Task['java:build'].invoke('--config=release')

    puts "Releasing Java artifacts to Maven repository at '#{ENV.fetch('MAVEN_REPO', nil)}'"
    java_release_targets.each { |target| Bazel.execute('run', ['--config=release'], target) }
  end

  desc 'Install jars to local m2 directory'
  task install: :'maven-install'

  desc 'Generate Java documentation'
  task :docs do |_task, arguments|
    if java_version.include?('SNAPSHOT') && !arguments.to_a.include?('force')
      abort('Aborting documentation update: snapshot versions should not update docs.')
    end

    puts 'Generating Java documentation'
    Rake::Task['javadocs'].invoke

    update_gh_pages unless arguments.to_a.include?('skip_update')
  end

  desc 'Update Maven dependencies'
  task :update do
    # Make sure things are in a good state to start with
    args = ['--action_env=RULES_JVM_EXTERNAL_REPIN=1']
    Bazel.execute('run', args, '@maven//:pin')

    file_path = 'MODULE.bazel'
    content = File.read(file_path)
    output = nil
    Bazel.execute('run', [], '@maven//:outdated') do |out|
      output = out
    end

    versions = output.scan(/(\S+) \[\S+ -> (\S+)\]/).to_h
    versions.each do |artifact, version|
      if artifact.match?('graphql')
        # https://github.com/graphql-java/graphql-java/discussions/3187
        puts 'WARNING — Cannot automatically update graphql'
        next
      end
      content.sub!(/#{Regexp.escape(artifact)}:([\d.-]+(?:[-.]?[A-Za-z0-9]+)*)/, "#{artifact}:#{version}")
    end
    File.write(file_path, content)

    args = ['--action_env=RULES_JVM_EXTERNAL_REPIN=1']
    Bazel.execute('run', args, '@maven//:pin')

    %w[MODULE.bazel java/maven_install.json].each { |file| @git.add(file) }
  end

  desc 'Update Java changelog'
  task :changelog do
    header = "v#{java_version}\n======"
    update_changelog(java_version, 'java', 'java/src/org/', 'java/CHANGELOG', header)
  end

  desc 'Update Java version'
  task :version, [:version] do |_task, arguments|
    old_version = java_version
    new_version = updated_version(old_version, arguments[:version], '-SNAPSHOT')

    file = 'java/version.bzl'
    text = File.read(file).gsub(old_version, new_version)
    File.open(file, 'w') { |f| f.puts text }
    @git.add(file)
  end
end

def rust_version
  File.foreach('rust/BUILD.bazel') do |line|
    return line.split('=').last.strip.tr('",', '') if line.include?('version =')
  end
end
namespace :rust do
  desc 'Build Selenium Manager'
  task :build do |_task, arguments|
    args = arguments.to_a.compact
    Bazel.execute('build', args, '//rust:selenium-manager')
  end

  desc 'Update the rust lock files'
  task :update do
    sh 'CARGO_BAZEL_REPIN=true bazel sync --only=crates'
  end

  desc 'Update Rust changelog'
  task :changelog do
    header = "#{rust_version}\n======"
    version = rust_version.split('.').tap(&:shift).join('.')
    update_changelog(version, 'rust', 'rust/src', 'rust/CHANGELOG.md', header)
  end

  # Rust versioning is currently difficult compared to the others because we are using the 0.4.x pattern
  # until Selenium Manager comes out of beta
  desc 'Update Rust version'
  task :version, [:version] do |_task, arguments|
    old_version = rust_version.dup
    equivalent_version = if old_version.include?('nightly')
                           "#{old_version.split(/\.|-/)[0...-1].tap(&:shift).join('.')}.0-nightly"
                         else
                           old_version.split('.').tap(&:shift).append('0').join('.')
                         end
    updated = updated_version(equivalent_version, arguments[:version], '-nightly')
    new_version = updated.split(/\.|-/).tap { |v| v.delete_at(2) }.unshift('0').join('.').gsub('.nightly', '-nightly')

    ['rust/Cargo.toml', 'rust/BUILD.bazel'].each do |file|
      text = File.read(file).gsub(old_version, new_version)
      File.open(file, 'w') { |f| f.puts text }
      @git.add(file)
    end

    Rake::Task['rust:update'].invoke
    @git.add('rust/Cargo.Bazel.lock')
    @git.add('rust/Cargo.lock')
  end
end

namespace :all do
  desc 'Update Chrome DevTools support'
  task :update_cdp, [:channel] do |_task, arguments|
    chrome_channel = arguments[:channel] || 'stable'
    chrome_channel = 'beta' if chrome_channel == 'early-stable'
    args = Array(chrome_channel) ? ['--', "--chrome_channel=#{chrome_channel.capitalize}"] : []

    puts "Updating Chrome DevTools references to include latest from #{chrome_channel} channel"
    Bazel.execute('run', args, '//scripts:update_cdp')

    ['common/devtools/',
     'dotnet/src/webdriver/DevTools/',
     'dotnet/src/webdriver/Selenium.WebDriver.csproj',
     'dotnet/test/common/DevTools/',
     'dotnet/test/common/CustomDriverConfigs/',
     'dotnet/selenium-dotnet-version.bzl',
     'java/src/org/openqa/selenium/devtools/',
     'javascript/selenium-webdriver/BUILD.bazel',
     'py/BUILD.bazel',
     'rb/lib/selenium/devtools/',
     'rb/Gemfile.lock',
     'Rakefile'].each { |file| @git.add(file) }
  end

  desc 'Update all API Documentation'
  task :docs do
    Rake::Task['java:docs'].invoke('skip_update')
    Rake::Task['py:docs'].invoke('skip_update')
    Rake::Task['rb:docs'].invoke('skip_update')
    Rake::Task['dotnet:docs'].invoke('skip_update')
    Rake::Task['node:docs'].invoke('skip_update')

    update_gh_pages
  end

  desc 'Build all artifacts for all language bindings'
  task :build do |_task, arguments|
    args = arguments.to_a.compact
    Rake::Task['java:build'].invoke(*args)
    Rake::Task['py:build'].invoke(*args)
    Rake::Task['rb:build'].invoke(*args)
    Rake::Task['dotnet:build'].invoke(*args)
    Rake::Task['node:build'].invoke(*args)
  end

  desc 'Package or build stamped artifacts for distribution in GitHub Release assets'
  task :package do |_task, arguments|
    args = arguments.to_a.compact
    Rake::Task['java:package'].invoke(*args)
    Rake::Task['dotnet:package'].invoke(*args)
  end

  desc 'Release all artifacts for all language bindings'
  task :release do |_task, arguments|
    Rake::Task['clean'].invoke

    args = arguments.to_a.include?('nightly') ? ['nightly'] : []
    Rake::Task['java:release'].invoke(*args)
    Rake::Task['py:release'].invoke(*args)
    Rake::Task['rb:release'].invoke(*args)
    Rake::Task['dotnet:release'].invoke(*args)
    Rake::Task['node:release'].invoke(*args)
  end

  task :lint do
    ext = /mswin|msys|mingw|cygwin|bccwin|wince|emc/.match?(RbConfig::CONFIG['host_os']) ? 'ps1' : 'sh'
    sh "./scripts/format.#{ext}", verbose: true
  end

  # Example: `./go all:prepare 4.31.0 early-stable`
  desc 'Update everything in preparation for a release'
  task :prepare, [:version, :channel] do |_task, arguments|
    version = arguments[:version]

    Rake::Task['update_browsers'].invoke(arguments[:channel])
    Rake::Task['all:update_cdp'].invoke(arguments[:channel])
    Rake::Task['update_manager'].invoke
    Rake::Task['java:update'].invoke
    Rake::Task['authors'].invoke
    Rake::Task['all:version'].invoke(version)
    Rake::Task['all:changelogs']
  end

  desc 'Update all versions'
  task :version, [:version] do |_task, arguments|
    version = arguments[:version] || 'nightly'

    Rake::Task['java:version'].invoke(version)
    Rake::Task['rb:version'].invoke(version)
    Rake::Task['node:version'].invoke(version)
    Rake::Task['py:version'].invoke(version)
    Rake::Task['dotnet:version'].invoke(version)
    Rake::Task['rust:version'].invoke(version)

    unless version == 'nightly'
      major_minor = arguments[:version][/^\d+\.\d+/]
      file = '.github/ISSUE_TEMPLATE/bug-report.yml'
      old_version_pattern = /The latest released version of Selenium is (\d+\.\d+)/

      text = File.read(file).gsub(old_version_pattern, "The latest released version of Selenium is #{major_minor}")
      File.write(file, text)
      @git.add(file)
    end
  end

  desc 'Update all changelogs'
  task :changelogs do |_task, _arguments|
    Rake::Task['java:changelog'].invoke
    Rake::Task['rb:changelog'].invoke
    Rake::Task['node:changelog'].invoke
    Rake::Task['py:changelog'].invoke
    Rake::Task['dotnet:changelog'].invoke
    Rake::Task['rust:changelog'].invoke
  end
end

at_exit do
  system 'sh', '.git-fixfiles' if File.exist?('.git') && SeleniumRake::Checks.linux?
rescue StandardError => e
  puts "Do not exit execution when this errors... #{e.inspect}"
end

def updated_version(current, desired = nil, nightly = nil)
  if !desired.nil? && desired != 'nightly'
    # If desired is present, return full 3 digit version
    desired.split('.').tap { |v| v << 0 while v.size < 3 }.join('.')
  elsif current.split(/\.|-/).size > 3
    # if current version is already nightly, just need to bump it; this will be noop for some languages
    pattern = /-?\.?(nightly|SNAPSHOT|dev|\d{12})\d*$/
    current.gsub(pattern, nightly)
  elsif current.split(/\.|-/).size == 3
    # if current version is not nightly, need to bump the version and make nightly
    "#{current.split(/\.|-/).tap { |i| (i[1] = i[1].to_i + 1) && (i[2] = 0) }.join('.')}#{nightly}"
  end
end

def update_gh_pages(force: true)
  puts 'Switching to gh-pages branch...'
  @git.fetch('https://github.com/seleniumhq/selenium.git', {ref: 'gh-pages'})

  unless force
    puts 'Stash changes that are not docs...'
    @git.lib.send(:command, 'stash', ['push', '-m', 'stash wip', '--', ':(exclude)build/docs/api/'])
  end

  @git.checkout('gh-pages', force: force)

  updated = false

  %w[java rb py dotnet javascript].each do |language|
    source = "build/docs/api/#{language}"
    destination = "docs/api/#{language}"

    next unless Dir.exist?(source) && !Dir.empty?(source)

    puts "Updating documentation for #{language}..."
    FileUtils.rm_rf(destination)
    FileUtils.mv(source, destination)

    @git.add(destination)
    updated = true
  end

  puts(updated ? 'Documentation staged. Ready for commit.' : 'No documentation changes found.')
end

def previous_tag(current_version, language = nil)
  version = current_version.split(/\.|-/)
  if version.size > 3
    puts 'WARNING - Changelogs not updated when set to prerelease'
  elsif version[2].to_i > 1
    # specified as patch release
    patch_version = (version[2].to_i - 1).to_s
    "selenium-#{[[version[0]], version[1], patch_version].join('.')}-#{language}"
  elsif version[2] == '1'
    # specified as patch release; special case
    "selenium-#{[[version[0]], version[1], '0'].join('.')}"
  else
    minor_version = (version[1].to_i - 1)
    tags = @git.tags.map(&:name)
    tag = language ? tags.reverse.find { |t| t.match?(/selenium-4\.#{minor_version}.*-#{language}/) } : nil
    tag || "selenium-#{[[version[0]], minor_version, '0'].join('.')}"
  end
end

def update_changelog(version, language, path, changelog, header)
  tag = previous_tag(version, language)
  bullet = language == 'javascript' ? '- ' : '* '
  commit_delimiter = '===DELIM==='
  tags_to_remove = /\[(dotnet|rb|py|java|js|rust)\]:?\s?/

  command = "git --no-pager log #{tag}...HEAD --pretty=format:\"%s%n%b#{commit_delimiter}\" --reverse #{path}"
  puts "Executing git command: #{command}"

  log = `#{command}`

  commits = log.split(commit_delimiter).map { |commit|
    lines = commit.gsub(tags_to_remove, '').strip.lines.map(&:chomp)
    subject = "#{bullet}#{lines[0]}"

    body = lines[1..]
           .reject { |line| line.match?(/^(----|Co-authored|Signed-off)/) || line.empty? }
           .map { |line| "    > #{line}" }
           .join("\n")
    body.empty? ? subject : "#{subject}\n#{body}"
  }.join("\n")

  content = File.read(changelog)
  File.write(changelog, "#{header}\n#{commits}\n\n#{content}")
  @git.add(changelog)
end
