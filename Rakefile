# -*- mode: ruby -*-

$LOAD_PATH.unshift File.expand_path(".")

require 'rake'
require 'rake-tasks/files'
require 'net/telnet'
require 'stringio'
require 'fileutils'

include Rake::DSL if defined?(Rake::DSL)

Rake.application.instance_variable_set "@name", "go"
orig_verbose = verbose
verbose(false)

# The CrazyFun build grammar. There's no magic here, just ruby
require 'rake-tasks/crazy_fun'
require 'rake-tasks/crazy_fun/mappings/export'
require 'rake-tasks/crazy_fun/mappings/folder'
require 'rake-tasks/crazy_fun/mappings/gcc'
require 'rake-tasks/crazy_fun/mappings/javascript'
require 'rake-tasks/crazy_fun/mappings/jruby'
require 'rake-tasks/crazy_fun/mappings/python'
require 'rake-tasks/crazy_fun/mappings/rake'
require 'rake-tasks/crazy_fun/mappings/rename'
require 'rake-tasks/crazy_fun/mappings/ruby'
require 'rake-tasks/crazy_fun/mappings/visualstudio'

# The original build rules
require 'rake-tasks/task-gen'
require 'rake-tasks/checks'
require 'rake-tasks/c'
require 'rake-tasks/selenium'
require 'rake-tasks/ie_code_generator'
require 'rake-tasks/ci'
require 'rake-tasks/copyright'

$DEBUG = orig_verbose != Rake::FileUtilsExt::DEFAULT ? true : false
if (ENV['debug'] == 'true')
  $DEBUG = true
end
verbose($DEBUG)

def release_version
  "4.0"
end

def version
  "#{release_version}.0-alpha-2"
end

# The build system used by webdriver is layered on top of rake, and we call it
# "crazy fun" for no readily apparent reason.

# First off, create a new CrazyFun object.
crazy_fun = CrazyFun.new

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
ExportMappings.new.add_all(crazy_fun)
FolderMappings.new.add_all(crazy_fun)
GccMappings.new.add_all(crazy_fun)
JavascriptMappings.new.add_all(crazy_fun)
JRubyMappings.new.add_all(crazy_fun)
PythonMappings.new.add_all(crazy_fun)
RakeMappings.new.add_all(crazy_fun)
RenameMappings.new.add_all(crazy_fun)
RubyMappings.new.add_all(crazy_fun)
VisualStudioMappings.new.add_all(crazy_fun)

# Allow old crazy fun targets to continue to exist

# Not every platform supports building every binary needed, so we sometimes
# need to fall back to prebuilt binaries. The prebuilt binaries are stored in
# a directory structure identical to that used in the "build" folder, but
# rooted at one of the following locations:
["cpp/prebuilt", "javascript/firefox-driver/prebuilt"].each do |pre|
  crazy_fun.prebuilt_roots << pre
end

# Finally, find every file named "build.desc" in the project, and generate
# rake tasks from them. These tasks are normal rake tasks, and can be invoked
# from rake.
crazy_fun.create_tasks(Dir["common/**/build.desc"])
crazy_fun.create_tasks(Dir["cpp/**/build.desc"])
crazy_fun.create_tasks(Dir["javascript/**/build.desc"])
crazy_fun.create_tasks(Dir["py/**/build.desc"])
crazy_fun.create_tasks(Dir["rake-tasks/**/build.desc"])
crazy_fun.create_tasks(Dir["rb/**/build.desc"])
crazy_fun.create_tasks(Dir["third_party/**/build.desc"])

# Buck integration. Loaded after CrazyFun has initialized all the tasks it'll handle.
# This is because the buck integration creates a rule for "//.*"
require 'rake-tasks/buck'

# Spoof tasks to get CI working with buck
task '//java/client/test/org/openqa/selenium/environment/webserver:webserver:uber' => [
  '//java/client/test/org/openqa/selenium/environment:webserver'
]

# Java targets required for release. These should all have the correct maven_coords set.
JAVA_RELEASE_TARGETS = [
  '//java/client/src/org/openqa/selenium:core',
  '//java/client/src/org/openqa/selenium/support:support',
  '//java/client/src/org/openqa/selenium/chrome:chrome',
  '//java/client/src/org/openqa/selenium/chromium:chromium',
  '//java/client/src/org/openqa/selenium/edge:edge',
  '//java/client/src/org/openqa/selenium/edge/edgehtml:edgehtml',
  '//java/client/src/org/openqa/selenium/firefox:firefox',
  '//java/client/src/org/openqa/selenium/firefox/xpi:firefox-xpi',
  '//java/client/src/org/openqa/selenium/ie:ie',
  '//java/client/src/org/openqa/selenium/lift:lift',
  '//java/client/src/org/openqa/selenium/opera:opera',
  '//java/client/src/org/openqa/selenium/remote:remote',
  '//java/client/src/org/openqa/selenium/safari:safari',
  '//java/client/src/org/openqa/selenium:client-combined',
  '//java/server/src/com/thoughtworks/selenium:leg-rc',
  '//java/server/src/org/openqa/grid/selenium:classes',
  '//java/server/src/org/openqa/selenium/grid:grid',
  '//third_party/java/jetty:jetty'
]




# Notice that because we're using rake, anything you can do in a normal rake
# build can also be done here. For example, here we set the default task
task :default => [:test]

task :all => [
  :"selenium-java",
  "//java/client/test/org/openqa/selenium/environment:webserver"
]
task :all_zip => [:'prep-release-zip']
task :tests => [
  "//java/client/test/org/openqa/selenium/htmlunit:htmlunit",
  "//java/client/test/org/openqa/selenium/firefox:test-synthesized",
  "//java/client/test/org/openqa/selenium/ie:ie",
  "//java/client/test/org/openqa/selenium/chrome:chrome",
  "//java/client/test/org/openqa/selenium/edge:edge",
  "//java/client/test/org/openqa/selenium/opera:opera",
  "//java/client/test/org/openqa/selenium/support:small-tests",
  "//java/client/test/org/openqa/selenium/support:large-tests",
  "//java/client/test/org/openqa/selenium/remote:small-tests",
  "//java/server/test/org/openqa/selenium/remote/server/log:test",
  "//java/server/test/org/openqa/selenium/remote/server:small-tests",
]
task :chrome => [ "//java/client/src/org/openqa/selenium/chrome" ]
task :grid => [ "//java/server/src/org/openqa/grid/selenium" ]
task :ie => [ "//java/client/src/org/openqa/selenium/ie" ]
task :firefox => [ "//java/client/src/org/openqa/selenium/firefox" ]
task :'debug-server' => "//java/client/test/org/openqa/selenium/environment:webserver:run"
task :remote => [:remote_server, :remote_client]
task :remote_client => ["//java/client/src/org/openqa/selenium/remote"]
task :remote_server => ["//java/server/src/org/openqa/selenium/remote/server"]
task :safari => [ "//java/client/src/org/openqa/selenium/safari" ]
task :selenium => [ "//java/client/src/org/openqa/selenium" ]
task :support => [
  "//java/client/src/org/openqa/selenium/lift",
  "//java/client/src/org/openqa/selenium/support",
]

desc 'Build the standalone server'
task 'selenium-server-standalone' => '//java/server/src/org/openqa/grid/selenium:selenium'

task :test_javascript => [
  'calcdeps',
  '//javascript/atoms:atoms-chrome:run',
  '//javascript/webdriver:webdriver-chrome:run',
  '//javascript/selenium-atoms:selenium-atoms-chrome:run',
  '//javascript/selenium-core:selenium-core-chrome:run']
task :test_chrome => [ "//java/client/test/org/openqa/selenium/chrome:chrome:run" ]
task :test_edge => [ "//java/client/test/org/openqa/selenium/edge:edge:run" ]
task :test_chrome_atoms => [
  '//javascript/atoms:test_chrome:run',
  '//javascript/chrome-driver:test:run',
  '//javascript/webdriver:test_chrome:run']
task :test_htmlunit => [
  "//java/client/test/org/openqa/selenium/htmlunit:htmlunit:run"
]
task :test_grid => [
  "//java/server/test/org/openqa/grid/common:common:run",
  "//java/server/test/org/openqa/grid:grid:run",
  "//java/server/test/org/openqa/grid/e2e:e2e:run",
  "//java/client/test/org/openqa/selenium/remote:remote-driver-grid-tests:run",
]
task :test_ie => [
  "//cpp/iedriverserver:win32",
  "//cpp/iedriverserver:x64",
  "//java/client/test/org/openqa/selenium/ie:ie:run"
]
task :test_jobbie => [ :test_ie ]
task :test_firefox => [ "//java/client/test/org/openqa/selenium/firefox:marionette:run" ]
task :test_opera => [ "//java/client/test/org/openqa/selenium/opera:opera:run" ]
task :test_remote_server => [
   '//java/server/test/org/openqa/selenium/remote/server:small-tests:run',
   '//java/server/test/org/openqa/selenium/remote/server/log:test:run',
]
task :test_remote => [
  '//java/client/test/org/openqa/selenium/json:small-tests:run',
  '//java/client/test/org/openqa/selenium/remote:common-tests:run',
  '//java/client/test/org/openqa/selenium/remote:client-tests:run',
  '//java/client/test/org/openqa/selenium/remote:remote-driver-tests:run',
  :test_remote_server
]
task :test_safari => [ "//java/client/test/org/openqa/selenium/safari:safari:run" ]
task :test_support => [
  "//java/client/test/org/openqa/selenium/lift:lift:run",
  "//java/client/test/org/openqa/selenium/support:small-tests:run",
  "//java/client/test/org/openqa/selenium/support:large-tests:run"
]

# TODO(simon): test-core should go first, but it's changing the least for now.
task :test_selenium => [ :'test-rc']

task :'test-rc' => ['//java/client/test/com/thoughtworks/selenium:firefox-rc-test:run']

if (windows?)
  task :'test-rc' => ['//java/client/test/com/thoughtworks/selenium:ie-rc-test:run']
end

task :test_java_webdriver => [
  :test_htmlunit,
  :test_firefox,
  :test_remote_server,
]
if (windows?)
  task :test_java_webdriver => [:test_ie]
end
if (present?("chromedriver"))
  task :test_java_webdriver => [:test_chrome]
end
if (present?("msedgedriver"))
  task :test_java_webdriver => [:test_edge]
end
if (opera?)
  task :test_java_webdriver => [:test_opera]
end

task :test_java => [
  "//java/client/test/org/openqa/selenium/atoms:test:run",
  :test_java_small_tests,
  :test_support,
  :test_java_webdriver,
  :test_selenium,
  "test_grid",
]

task :test_java_small_tests => [
  "//java/client/test/org/openqa/selenium:small-tests:run",
  "//java/client/test/org/openqa/selenium/json:small-tests:run",
  "//java/client/test/org/openqa/selenium/support:small-tests:run",
  "//java/client/test/org/openqa/selenium/remote:common-tests:run",
  "//java/client/test/org/openqa/selenium/remote:client-tests:run",
  "//java/server/test/org/openqa/grid/selenium/node:node:run",
  "//java/server/test/org/openqa/grid/selenium/proxy:proxy:run",
  "//java/server/test/org/openqa/selenium/remote/server:small-tests:run",
  "//java/server/test/org/openqa/selenium/remote/server/log:test:run",
]

task :test_rb => ["//rb:unit-test", :test_rb_local, :test_rb_remote]

task :test_rb_local => [
  "//rb:chrome-test",
  "//rb:firefox-test",
  ("//rb:safari-preview-test" if mac?),
  ("//rb:safari-test" if mac?),
  ("//rb:ie-test" if windows?),
  ("//rb:edge-test" if windows?)
].compact

task :test_rb_remote => [
  "//rb:remote-chrome-test",
  "//rb:remote-firefox-test",
  ("//rb:remote-safari-test" if mac?),
  ("//rb:remote-ie-test" if windows?),
  ("//rb:remote-edge-test" if windows?)
].compact

task :test_py => [ :py_prep_for_install_release, "//py:marionette_test:run" ]

task :test => [ :test_javascript, :test_java, :test_rb ]
if (python?)
  task :test => [ :test_py ]
end

task :build => [:all, :firefox, :remote, :selenium, :tests]

desc 'Clean build artifacts.'
task :clean do
  rm_rf 'buck-out/'
  rm_rf 'build/'
  rm_rf 'java/client/build/'
  rm_rf 'dist/'
end

# Generate a C++ Header file for mapping between magic numbers and #defines
# in the C++ code.
ie_generate_type_mapping(:name => "ie_result_type_cpp",
                         :src => "cpp/iedriver/result_types.txt",
                         :type => "cpp",
                         :out => "cpp/iedriver/IEReturnTypes.h")

# Generate a Java class for mapping between magic numbers and Java static
# class members describing them.
ie_generate_type_mapping(:name => "ie_result_type_java",
                         :src => "cpp/iedriver/result_types.txt",
                         :type => "java",
                         :out => "java/client/src/org/openqa/selenium/ie/IeReturnTypes.java")


task :javadocs => [:'repack-jetty', :common, :firefox, :ie, :remote, :support, :chrome, :selenium] do
  rm_rf "build/javadoc"
  mkdir_p "build/javadoc"
   sourcepath = ""
   classpath = '.'
   Dir["third_party/java/*/*.jar"].each do |jar|
     classpath << ":" + jar unless jar.to_s =~ /.*-src.*\.jar/
   end
   [File.join(%w(java client src))].each do |m|
     sourcepath += File::PATH_SEPARATOR + m
   end
   [File.join(%w(java server src))].each do |m|
     sourcepath += File::PATH_SEPARATOR + m
   end

   p sourcepath
   cmd = "javadoc -notimestamp -d build/javadoc -sourcepath #{sourcepath} -classpath #{classpath} -subpackages org.openqa.selenium -subpackages com.thoughtworks "
   cmd << " -exclude org.openqa.selenium.internal.selenesedriver:org.openqa.selenium.internal.seleniumemulation:org.openqa.selenium.remote.internal"

   if (windows?)
     cmd = cmd.gsub(/\//, "\\").gsub(/:/, ";")
   end
   sh cmd

   File.open("build/javadoc/stylesheet.css", "a") { |file| file.write(<<EOF

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

task :py_prep_for_install_release => [
  :chrome,
  "//py:prep"
]

task :py_docs => ["//py:init", "//py:docs"]

task :py_install =>  "//py:install"

task :py_release => :py_prep_for_install_release do
    sh "python setup.py sdist bdist_wheel upload"
end

file "cpp/iedriver/sizzle.h" => [ "//third_party/js/sizzle:sizzle:header" ] do
  cp "build/third_party/js/sizzle/sizzle.h", "cpp/iedriver/sizzle.h"
end

task :sizzle_header => [ "cpp/iedriver/sizzle.h" ]

task :ios_driver => [
  "//javascript/atoms/fragments:get_visible_text:ios",
  "//javascript/atoms/fragments:click:ios",
  "//javascript/atoms/fragments:back:ios",
  "//javascript/atoms/fragments:forward:ios",
  "//javascript/atoms/fragments:submit:ios",
  "//javascript/atoms/fragments:xpath:ios",
  "//javascript/atoms/fragments:xpaths:ios",
  "//javascript/atoms/fragments:type:ios",
  "//javascript/atoms/fragments:get_attribute:ios",
  "//javascript/atoms/fragments:clear:ios",
  "//javascript/atoms/fragments:is_selected:ios",
  "//javascript/atoms/fragments:is_enabled:ios",
  "//javascript/atoms/fragments:is_shown:ios",
  "//javascript/atoms/fragments:stringify:ios",
  "//javascript/atoms/fragments:link_text:ios",
  "//javascript/atoms/fragments:link_texts:ios",
  "//javascript/atoms/fragments:partial_link_text:ios",
  "//javascript/atoms/fragments:partial_link_texts:ios",
  "//javascript/atoms/fragments:get_interactable_size:ios",
  "//javascript/atoms/fragments:scroll_into_view:ios",
  "//javascript/atoms/fragments:get_effective_style:ios",
  "//javascript/atoms/fragments:get_element_size:ios",
  "//javascript/webdriver/atoms/fragments:get_location_in_view:ios"
]

file "build/javascript/deps.js" => FileList[
  "third_party/closure/goog/**/*.js",
  "third_party/js/wgxpath/**/*.js",
  "javascript/*/**/*.js",  # Don't depend on js files directly in javascript/
  ] do

  puts "Scanning deps"
  deps = Javascript::ClosureDeps.new
  Dir["javascript/*/**/*.js"].
      reject {|f| f[/javascript\/node/]}.
      each {|f| deps.parse_file(f)}
  Dir["third_party/js/wgxpath/**/*.js"].each {|f| deps.parse_file(f)}

  built_deps = "build/javascript/deps.js"
  puts "Writing #{built_deps}"
  mkdir_p File.dirname(built_deps)
  deps.write_deps(built_deps)
  cp built_deps, "javascript/deps.js"
end

desc "Calculate dependencies required for testing the automation atoms"
task :calcdeps => "build/javascript/deps.js"

desc "Repack jetty"
task "repack-jetty" => ["//third_party/java/jetty:bundle-jars"] do

  # For IntelliJ
  root = File.join("build", "third_party", "java", "jetty")
  mkdir_p root
  cp Rake::Task['//third_party/java/jetty:bundle-jars'].out, File.join(root, "jetty-repacked.jar")

  # And copy the artifact to third_party so that eclipse users can be made happy
  cp Rake::Task['//third_party/java/jetty:bundle-jars'].out, "third_party/java/jetty/jetty-repacked.jar"
end


task :'maven-dry-run' => JAVA_RELEASE_TARGETS do |t|
  t.prerequisites.each do |p|
    if JAVA_RELEASE_TARGETS.include?(p)
      Buck::buck_cmd('publish', ['--dry-run', '--include-source', '--include-docs', '--remote-repo', 'https://oss.sonatype.org/service/local/staging/deploy/maven2', p])
    end
  end
end


task :'prep-release-zip' => [
  '//java/client/src/org/openqa/selenium:client-combined-zip',
  '//java/server/src/org/openqa/grid/selenium:selenium',
  '//java/server/src/org/openqa/grid/selenium:selenium-zip',
  '//java/server/src/org/openqa/selenium/grid:selenium',
  '//java/server/src/org/openqa/selenium/grid:selenium-zip',
  '//java/server/src/org/openqa/selenium/server/htmlrunner:selenium-runner'] do

  mkdir_p "build/dist"
  cp Rake::Task['//java/server/src/org/openqa/grid/selenium:selenium'].out, "build/dist/selenium-server-standalone-#{version}.jar"
  cp Rake::Task['//java/server/src/org/openqa/grid/selenium:selenium-zip'].out, "build/dist/selenium-server-standalone-#{version}.zip"
  cp Rake::Task['//java/client/src/org/openqa/selenium:client-combined-zip'].out, "build/dist/selenium-java-#{version}.zip"
  cp Rake::Task['//java/server/src/org/openqa/selenium/grid:selenium'].out, "build/dist/selenium-server-#{version}.jar"
  cp Rake::Task['//java/server/src/org/openqa/selenium/grid:selenium-zip'].out, "build/dist/selenium-server-#{version}.zip"
  cp Rake::Task['//java/server/src/org/openqa/selenium/server/htmlrunner:selenium-runner'].out, "build/dist/selenium-html-runner-#{version}.jar"
end


task :'release-java' => [:'publish-maven', :'push-release']

def read_user_pass_from_m2_settings
    settings = File.read(ENV['HOME'] + "/.m2/settings.xml")
    found_section = false
    user = nil
    pass = nil
    settings.each_line do |line|
        if !found_section
            found_section = line.include? "<id>sonatype-nexus-staging</id>"
        else
            if user == nil and line.include? "<username>"
              user = line.split("<username>")[1].split("</")[0]
            elsif pass == nil and line.include? "<password>"
              pass = line.split("<password>")[1].split("</")[0]
            end
        end
    end

    return [user, pass]
end

task :'publish-maven' => JAVA_RELEASE_TARGETS do
  puts "\n Enter Passphrase:"
  passphrase = STDIN.gets.chomp

  creds = read_user_pass_from_m2_settings()
  JAVA_RELEASE_TARGETS.each do |p|
    if JAVA_RELEASE_TARGETS.include?(p)
      Buck::buck_cmd('publish', ['--stamp-build=detect', '--remote-repo', 'https://oss.sonatype.org/service/local/staging/deploy/maven2', '--include-source', '--include-docs', '-u', creds[0], '-p', creds[1], '--signing-passphrase', passphrase, p])
    end
  end
end

task :'maven-install' do
  JAVA_RELEASE_TARGETS.each do |p|
    if JAVA_RELEASE_TARGETS.include?(p)
      Buck::buck_cmd('publish', ['--stamp-build=detect', '--remote-repo', "file://#{ENV['HOME']}/.m2/repository", '--include-source', '--include-docs', p])
    end
  end
end

task :'push-release' => [:'prep-release-zip'] do
  py = "java -jar third_party/py/jython.jar"
  if (python?)
    py = "python"
  end

  sh "#{py} third_party/py/googlestorage/publish_release.py --project_id google.com:webdriver --bucket selenium-release --acl public-read --publish_version #{release_version} --publish build/dist/selenium-server-#{version}.jar --publish build/dist/selenium-server-#{version}.zip  --publish build/dist/selenium-server-standalone-#{version}.jar --publish build/dist/selenium-server-standalone-#{version}.zip --publish build/dist/selenium-java-#{version}.zip --publish build/dist/selenium-html-runner-#{version}.jar"
end

desc 'Build the selenium client jars'
task 'selenium-java' => '//java/client/src/org/openqa/selenium:selenium'

namespace :node do
  task :atoms => [
    "//javascript/atoms/fragments:is-displayed",
    "//javascript/webdriver/atoms:get-attribute",
  ] do
    baseDir = "javascript/node/selenium-webdriver/lib/atoms"
    mkdir_p baseDir

    [
      Rake::Task["//javascript/atoms/fragments:is-displayed"].out,
      Rake::Task["//javascript/webdriver/atoms:get-attribute"].out,
    ].each do |atom|
      name = File.basename(atom)

      puts "Generating #{atom} as #{name}"
      File.open(File.join(baseDir, name), "w") do |f|
        f << "// GENERATED CODE - DO NOT EDIT\n"
        f << "module.exports = "
        f << IO.read(atom).strip
        f << ";\n"
      end
    end
  end

  task :build do
    sh "bazel build //javascript/node/selenium-webdriver"
  end
  
  task :'dry-run' => [
    "node:build",
  ] do
    cmd = "bazel run javascript/node/selenium-webdriver:selenium-webdriver.pack"
    sh cmd
  end

  task :deploy => [
    "node:build",
  ] do
    cmd = "bazel run javascript/node/selenium-webdriver:selenium-webdriver.publish"
    sh cmd
  end

  task :docs do
    sh "node javascript/node/gendocs.js"
  end
end

namespace :side do
  task :atoms => [
    "//javascript/atoms/fragments:find-element",
  ] do
    # TODO: move directly to IDE's directory once the repositories are merged
    baseDir = "build/javascript/atoms"
    mkdir_p baseDir

    [
      Rake::Task["//javascript/atoms/fragments:find-element"].out,
    ].each do |atom|
      name = File.basename(atom)

      puts "Generating #{atom} as #{name}"
      File.open(File.join(baseDir, name), "w") do |f|
        f << "// GENERATED CODE - DO NOT EDIT\n"
        f << "module.exports = "
        f << IO.read(atom).strip
        f << ";\n"
      end
    end
  end
end

namespace :safari do
  desc "Build the SafariDriver java client"
  task :build => [
    "//java/client/src/org/openqa/selenium/safari"
  ]
end

task :authors do
  puts "Generating AUTHORS file"
  sh "(git log --use-mailmap --format='%aN <%aE>' ; cat .OLD_AUTHORS) | sort -uf > AUTHORS"
end

namespace :copyright do
  task :update do
    Copyright.Update(
        FileList["javascript/**/*.js"].exclude(
            "javascript/atoms/test/jquery.min.js",
            "javascript/jsunit/**/*.js",
            "javascript/node/selenium-webdriver/node_modules/**/*.js",
            "javascript/selenium-core/lib/**/*.js",
            "javascript/selenium-core/scripts/ui-element.js",
            "javascript/selenium-core/scripts/ui-map-sample.js",
            "javascript/selenium-core/scripts/user-extensions.js",
            "javascript/selenium-core/scripts/xmlextras.js",
            "javascript/selenium-core/xpath/**/*.js"))
    Copyright.Update(
        FileList["py/**/*.py"],
        :style => "#")
    Copyright.Update(
      FileList["rb/**/*.rb"],
      :style => "#",
      :prefix => ["# frozen_string_literal: true\n", "\n"])
    Copyright.Update(
        FileList["java/**/*.java"])
  end
end

at_exit do
  if File.exist?(".git") && !Platform.windows?
    system "sh", ".git-fixfiles"
  end
end
