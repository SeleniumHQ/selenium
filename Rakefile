# -*- mode: ruby -*-

$LOAD_PATH.unshift File.expand_path('.')

require 'rake'
require 'net/telnet'
require 'stringio'
require 'fileutils'
require 'open-uri'

include Rake::DSL

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
require 'rake_tasks/copyright'
require 'rake_tasks/python'

$DEBUG = orig_verbose != Rake::FileUtilsExt::DEFAULT ? true : false
$DEBUG = true if ENV['debug'] == 'true'

verbose($DEBUG)

def release_version
  '4.4'
end

def version
  "#{release_version}.0"
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
rule /\/\/.*/ do |task|
  task.out = Bazel.execute('build', %w[--workspace_status_command scripts/build-info.py], task.name)
end

# Spoof tasks to get CI working with bazel
task '//java/test/org/openqa/selenium/environment/webserver:webserver:uber' => [
  '//java/test/org/openqa/selenium/environment:webserver'
]

# Java targets required for release. These should all be java_export targets.
# Generated from: bazel query 'kind(maven_publish, set(//java/... //third_party/...))' | sort
JAVA_RELEASE_TARGETS = %w[
  //java/src/org/openqa/selenium/chrome:chrome.publish
  //java/src/org/openqa/selenium/chromium:chromium.publish
  //java/src/org/openqa/selenium/devtools/v85:v85.publish
  //java/src/org/openqa/selenium/devtools/v102:v102.publish
  //java/src/org/openqa/selenium/devtools/v103:v103.publish
  //java/src/org/openqa/selenium/devtools/v104:v104.publish
  //java/src/org/openqa/selenium/edge:edge.publish
  //java/src/org/openqa/selenium/firefox:firefox.publish
  //java/src/org/openqa/selenium/grid/sessionmap/jdbc:jdbc.publish
  //java/src/org/openqa/selenium/grid/sessionmap/redis:redis.publish
  //java/src/org/openqa/selenium/grid:grid.publish
  //java/src/org/openqa/selenium/ie:ie.publish
  //java/src/org/openqa/selenium/json:json.publish
  //java/src/org/openqa/selenium/lift:lift.publish
  //java/src/org/openqa/selenium/opera:opera.publish
  //java/src/org/openqa/selenium/remote/http:http.publish
  //java/src/org/openqa/selenium/remote:remote.publish
  //java/src/org/openqa/selenium/safari:safari.publish
  //java/src/org/openqa/selenium/support:support.publish
  //java/src/org/openqa/selenium:client-combined.publish
  //java/src/org/openqa/selenium:core.publish
]

# Notice that because we're using rake, anything you can do in a normal rake
# build can also be done here. For example, here we set the default task
task default: [:grid]

task all: [
  :"selenium-java",
  '//java/test/org/openqa/selenium/environment:webserver'
]
task all_zip: [:'prep-release-zip']
task tests: [
  '//java/test/org/openqa/selenium/htmlunit:htmlunit',
  '//java/test/org/openqa/selenium/firefox:test-synthesized',
  '//java/test/org/openqa/selenium/ie:ie',
  '//java/test/org/openqa/selenium/chrome:chrome',
  '//java/test/org/openqa/selenium/edge:edge',
  '//java/test/org/openqa/selenium/opera:opera',
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
task support: [
  '//java/src/org/openqa/selenium/lift',
  '//java/src/org/openqa/selenium/support'
]

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
task test_opera: ['//java/test/org/openqa/selenium/opera:opera:run']
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
  '//java/test/org/openqa/selenium/lift:lift:run',
  '//java/test/org/openqa/selenium/support:small-tests:run',
  '//java/test/org/openqa/selenium/support:large-tests:run'
]

# TODO(simon): test-core should go first, but it's changing the least for now.
task test_selenium: [:'test-rc']
task 'test-rc': ['//java/test/com/thoughtworks/selenium:firefox-rc-test:run']
task 'test-rc': ['//java/test/com/thoughtworks/selenium:ie-rc-test:run'] if SeleniumRake::Checks.windows?

task test_java_webdriver: %i[
  test_htmlunit
  test_firefox
  test_remote_server
]

task test_java_webdriver: [:test_ie] if SeleniumRake::Checks.windows?
task test_java_webdriver: [:test_chrome] if SeleniumRake::Checks.chrome?
task test_java_webdriver: [:test_edge] if SeleniumRake::Checks.edge?
task test_java_webdriver: [:test_opera] if SeleniumRake::Checks.opera?

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

task test_rb: ['//rb:unit-test', :test_rb_local, :test_rb_remote]

task test_rb_local: [
  '//rb:chrome-test',
  '//rb:firefox-test',
  ('//rb:firefox-nightly-test' if ENV['FIREFOX_NIGHTLY_BINARY']),
  ('//rb:safari-preview-test' if SeleniumRake::Checks.mac?),
  ('//rb:safari-test' if SeleniumRake::Checks.mac?),
  ('//rb:ie-test' if SeleniumRake::Checks.windows?),
  ('//rb:edge-test' unless SeleniumRake::Checks.linux?)
].compact

task test_rb_remote: [
  '//rb:remote-chrome-test',
  '//rb:remote-firefox-test',
  ('//rb:remote-firefox-nightly-test' if ENV['FIREFOX_NIGHTLY_BINARY']),
  ('//rb:remote-safari-test' if SeleniumRake::Checks.mac?),
  ('//rb:remote-safari-preview-test' if SeleniumRake::Checks.mac?),
  ('//rb:remote-ie-test' if SeleniumRake::Checks.windows?),
  ('//rb:remote-edge-test' unless SeleniumRake::Checks.linux?)
].compact

task test_py: [:py_prep_for_install_release, 'py:marionette_test']
task test: %i[test_javascript test_java test_rb]
task test: [:test_py] if SeleniumRake::Checks.python?
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

task javadocs: %i[//java/src/org/openqa/selenium/grid:all-javadocs] do
  rm_rf 'build/javadoc'
  mkdir_p 'build/javadoc'

  # Temporary hack, bazel is not outputting where things are so we need to do it manually.
  # This will only work on Posix based OSes
  Rake::Task['//java/src/org/openqa/selenium/grid:all-javadocs']
  out = 'bazel-bin/java/src/org/openqa/selenium/grid/all-javadocs.jar'

  cmd = %{cd build/javadoc && jar xf "../../#{out}" 2>&1}
  if SeleniumRake::Checks.windows?
    cmd = cmd.gsub(/\//, '\\').gsub(/:/, ';')
  end

  ok = system(cmd)
  ok or raise "could not unpack javadocs"

  File.open('build/javadoc/stylesheet.css', 'a') { |file|
    file.write(<<~EOF
      /* Custom selenium-specific styling */
      .blink {
        animation: 2s cubic-bezier(0.5, 0, 0.85, 0.85) infinite blink;
      }

      @keyframes blink {
        50% {
          opacity: 0;
        }
      }

    EOF
    )
  }
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

task 'prep-release-zip': [
  '//java/src/org/openqa/selenium:client-zip',
  '//java/src/org/openqa/selenium/grid:server-zip',
  '//java/src/org/openqa/selenium/grid:executable-grid',
] do
  [
    "build/dist/selenium-server-#{version}.zip",
    "build/dist/selenium-java-#{version}.zip",
    "build/dist/selenium-server-#{version}.jar"
  ].each do |f|
    rm_f(f) if File.exists?(f)
  end

  mkdir_p 'build/dist'
  File.delete
  cp Rake::Task['//java/src/org/openqa/selenium/grid:server-zip'].out, "build/dist/selenium-server-#{version}.zip", preserve: false
  chmod 0666, "build/dist/selenium-server-#{version}.zip"
  cp Rake::Task['//java/src/org/openqa/selenium:client-zip'].out, "build/dist/selenium-java-#{version}.zip", preserve: false
  chmod 0666, "build/dist/selenium-java-#{version}.zip"
  cp Rake::Task['//java/src/org/openqa/selenium/grid:executable-grid'].out, "build/dist/selenium-server-#{version}.jar", preserve: false
  chmod 0666, "build/dist/selenium-server-#{version}.jar"
end

task 'release-java': %i[prep-release-zip publish-maven]

def read_user_pass_from_m2_settings
  settings = File.read(ENV['HOME'] + '/.m2/settings.xml')
  found_section = false
  user = nil
  pass = nil
  settings.each_line do |line|
    if !found_section
      found_section = line.include? '<id>sonatype-nexus-staging</id>'
    else
      if (user.nil?) && line.include?('<username>')
        user = line.split('<username>')[1].split('</')[0]
      elsif (pass.nil?) && line.include?('<password>')
        pass = line.split('<password>')[1].split('</')[0]
        end
    end
  end

  return [user, pass]
end

task 'publish-maven': JAVA_RELEASE_TARGETS do
 creds = read_user_pass_from_m2_settings
  JAVA_RELEASE_TARGETS.each do |p|
    Bazel::execute('run', ['--stamp', '--define', 'maven_repo=https://oss.sonatype.org/service/local/staging/deploy/maven2', '--define', "maven_user=#{creds[0]}", '--define', "maven_password=#{creds[1]}", '--define', 'gpg_sign=true'], p)
  end
end

task :'maven-install' do
  JAVA_RELEASE_TARGETS.each do |p|
    Bazel::execute('run', ['--stamp', '--define', "maven_repo=file://#{ENV['HOME']}/.m2/repository", '--define', 'gpg_sign=false'], p)
  end
end

desc 'Build the selenium client jars'
task 'selenium-java' => '//java/src/org/openqa/selenium:client-combined'

namespace :safari do
  desc 'Build the SafariDriver java client'
  task build: [
    '//java/src/org/openqa/selenium/safari'
  ]
end

task :authors do
  puts 'Generating AUTHORS file'
  sh "(git log --use-mailmap --format='%aN <%aE>' ; cat .OLD_AUTHORS) | sort -uf > AUTHORS"
end

namespace :copyright do
  task :update do
    Copyright.new.update(
      FileList['javascript/**/*.js'].exclude(
        'javascript/atoms/test/jquery.min.js',
        'javascript/jsunit/**/*.js',
        'javascript/node/selenium-webdriver/node_modules/**/*.js',
        'javascript/selenium-core/lib/**/*.js',
        'javascript/selenium-core/scripts/ui-element.js',
        'javascript/selenium-core/scripts/ui-map-sample.js',
        'javascript/selenium-core/scripts/user-extensions.js',
        'javascript/selenium-core/scripts/xmlextras.js',
        'javascript/selenium-core/xpath/**/*.js'
      )
    )
    Copyright.new(comment_characters: '#').update(FileList['py/**/*.py'])
    Copyright.new(comment_characters: '#', prefix: ["# frozen_string_literal: true\n", "\n"])
      .update(FileList['rb/**/*.rb'])
    Copyright.new.update(FileList['java/**/*.java'])
  end
end

namespace :side do
  task atoms: [
    '//javascript/atoms/fragments:find-element'
  ] do
    # TODO: move directly to IDE's directory once the repositories are merged
    baseDir = 'build/javascript/atoms'
    mkdir_p baseDir

    [
      Rake::Task['//javascript/atoms/fragments:find-element'].out
    ].each do |atom|
      name = File.basename(atom)

      puts "Generating #{atom} as #{name}"
      File.open(File.join(baseDir, name), 'w') do |f|
        f << "// GENERATED CODE - DO NOT EDIT\n"
        f << 'module.exports = '
        f << IO.read(atom).strip
        f << ";\n"
      end
    end
  end
end

namespace :node do
  atom_list = %w[
    //javascript/atoms/fragments:find-elements
    //javascript/atoms/fragments:is-displayed
    //javascript/webdriver/atoms:get-attribute
  ]

  task atoms: atom_list do
    baseDir = 'javascript/node/selenium-webdriver/lib/atoms'
    mkdir_p baseDir

    puts 'rake outs are below'
    p rake_outs = [
      Rake::Task['//javascript/atoms/fragments:is-displayed'].out,
      Rake::Task['//javascript/webdriver/atoms:get-attribute'].out,
      Rake::Task['//javascript/atoms/fragments:find-elements'].out
    ]

    rake_outs.each do |atom|
      puts "atom is #{atom}\n"
      name = File.basename(atom)

      puts "Generating #{atom} as #{name}"
      File.open(File.join(baseDir, name), 'w') do |f|
        f << "// GENERATED CODE - DO NOT EDIT\n"
        f << 'module.exports = '
        f << IO.read(atom).strip
        f << ";\n"
      end
    end
  end

  task :build do
    sh 'bazel build //javascript/node/selenium-webdriver'
  end

  task 'dry-run': [
    'node:build'
  ] do
    sh 'bazel run javascript/node/selenium-webdriver:selenium-webdriver.pack'
  end

  task deploy: [
    'node:build'
  ] do
    sh 'bazel run javascript/node/selenium-webdriver:selenium-webdriver.publish'
  end

  task :docs do
    sh 'node javascript/node/gendocs.js'
  end
end

namespace :py do
  task prep: [
    '//javascript/atoms/fragments:is-displayed',
    '//javascript/webdriver/atoms:get-attribute',
    '//third_party/js/selenium:webdriver_xpi'
  ] do
    py_home = 'py/'
    remote_py_home = py_home + 'selenium/webdriver/remote/'
    firefox_py_home = py_home + 'selenium/webdriver/firefox/'

    if SeleniumRake::Checks.windows?
      remote_py_home = remote_py_home.gsub(/\//, '\\')
      firefox_py_home = firefox_py_home .gsub(/\//, '\\')
    end

    cp Rake::Task['//javascript/atoms/fragments:is-displayed'].out, remote_py_home + 'isDisplayed.js', verbose: true
    cp Rake::Task['//javascript/webdriver/atoms:get-attribute'].out, remote_py_home + 'getAttribute.js', verbose: true

    cp Rake::Task['//third_party/js/selenium:webdriver_xpi'].out, firefox_py_home, verbose: true
    cp 'third_party/js/selenium/webdriver.json', firefox_py_home + 'webdriver_prefs.json', verbose: true
    cp 'LICENSE', py_home + 'LICENSE', verbose: true
  end

  bazel :unit do
    Bazel.execute('test', [], '//py:unit')
  end

  task docs: :prep do
    sh 'tox -c py/tox.ini -e docs', verbose: true
  end

  task install: :prep do
    Dir.chdir('py') do
      sh py_exe + ' setup.py install', verbose: true
    end
  end

  %w[chrome ff marionette ie edge remote_firefox safari].each do |browser|
    browser_data = SeleniumRake::Browsers::BROWSERS[browser]
    deps = browser_data[:deps] || []
    deps += [:prep]
    driver = browser_data[:driver]

    task "#{browser}_test" => deps do
      tox_test driver
    end
  end
end

at_exit do
  if File.exist?('.git') && !SeleniumRake::Checks.windows?
    system 'sh', '.git-fixfiles'
  end
end
