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
require 'rake-tasks/crazy_fun/mappings/mozilla'
require 'rake-tasks/crazy_fun/mappings/python'
require 'rake-tasks/crazy_fun/mappings/rake'
require 'rake-tasks/crazy_fun/mappings/rename'
require 'rake-tasks/crazy_fun/mappings/ruby'
require 'rake-tasks/crazy_fun/mappings/visualstudio'

# The original build rules
require 'rake-tasks/task-gen'
require 'rake-tasks/checks'
require 'rake-tasks/dotnet'
require 'rake-tasks/zip'
require 'rake-tasks/c'
require 'rake-tasks/selenium'
require 'rake-tasks/se-ide'
require 'rake-tasks/ie_code_generator'
require 'rake-tasks/ci'
require 'rake-tasks/copyright'

$DEBUG = orig_verbose != :default ? true : false
if (ENV['debug'] == 'true')
  $DEBUG = true
end
verbose($DEBUG)

def release_version
  "3.0"
end

def version
  "#{release_version}.0-beta2"
end

ide_version = "2.8.0"

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
MozillaMappings.new.add_all(crazy_fun)
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
["cpp/prebuilt", "ide/main/prebuilt", "javascript/firefox-driver/prebuilt"].each do |pre|
  crazy_fun.prebuilt_roots << pre
end

# Finally, find every file named "build.desc" in the project, and generate
# rake tasks from them. These tasks are normal rake tasks, and can be invoked
# from rake.
crazy_fun.create_tasks(Dir["**/build.desc"])

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
  '//java/client/src/org/openqa/selenium/edge:edge',
  '//java/client/src/org/openqa/selenium/firefox:firefox',
  '//java/client/src/org/openqa/selenium/ie:ie',
  '//java/client/src/org/openqa/selenium/opera:opera',
  '//java/client/src/org/openqa/selenium/remote:remote',
  '//java/client/src/org/openqa/selenium/safari:safari',
  '//java/client/src/org/openqa/selenium:client-combined',
  '//java/server/src/com/thoughtworks/selenium:leg-rc',
  '//java/server/src/org/openqa/grid/selenium:classes',
]


# Notice that because we're using rake, anything you can do in a normal rake
# build can also be done here. For example, here we set the default task
task :default => [:test]

task :all => [
  :"selenium-java",
  "//java/client/test/org/openqa/selenium/environment:webserver"
]
task :all_zip => [:'selenium-java_zip']
task :tests => [
  "//java/client/test/org/openqa/selenium/htmlunit:htmlunit",
  "//java/client/test/org/openqa/selenium/htmlunit:htmlunit-no-js",
  "//java/client/test/org/openqa/selenium/firefox:test-synthesized",
  "//java/client/test/org/openqa/selenium/ie:ie",
  "//java/client/test/org/openqa/selenium/chrome:chrome",
  "//java/client/test/org/openqa/selenium/opera:opera",
#  "//java/client/test/org/openqa/selenium/lift:test",
  "//java/client/test/org/openqa/selenium/support:small-tests",
  "//java/client/test/org/openqa/selenium/support:large-tests",
  "//java/client/test/org/openqa/selenium/remote:common-tests",
  "//java/client/test/org/openqa/selenium/remote:client-tests",
  "//java/server/test/org/openqa/selenium/remote/server/log:test",
  "//java/server/test/org/openqa/selenium/remote/server:small-tests",
]
task :chrome => [ "//java/client/src/org/openqa/selenium/chrome" ]
task :grid => [ "//java/server/src/org/openqa/grid/selenium" ]
task :ie => [ "//java/client/src/org/openqa/selenium/ie" ]
task :firefox => [
  "//cpp:noblur",
  "//cpp:noblur64",
  "//cpp:imehandler",
  "//cpp:imehandler64",
  "//java/client/src/org/openqa/selenium/firefox"
]
task :'debug-server' => "//java/client/test/org/openqa/selenium/environment:webserver:run"
task :remote => [:remote_server, :remote_client]
task :remote_client => ["//java/client/src/org/openqa/selenium/remote"]
task :remote_server => ["//java/server/src/org/openqa/selenium/remote/server"]
task :safari => [
  "//java/client/src/org/openqa/selenium/safari",
]
task :selenium => [ "//java/client/src/org/openqa/selenium" ]
task :support => [
  "//java/client/src/org/openqa/selenium/lift",
  "//java/client/src/org/openqa/selenium/support",
]

desc 'Build the standalone server'
task 'selenium-server-standalone' => '//java/server/src/org/openqa/grid/selenium:selenium'

task :ide => [ "//ide:selenium-ide-multi" ]
task :ide_proxy_setup => [ "//javascript/selenium-atoms", "se_ide:setup_proxy" ]
task :ide_proxy_remove => [ "se_ide:remove_proxy" ]
task :ide_bamboo => ["se_ide:assemble_ide_in_bamboo"]

task :test_javascript => [
  '//javascript/atoms:test:run',
  '//javascript/webdriver:test:run',
  '//javascript/webdriver:es6_test:run',
  '//javascript/selenium-atoms:test:run',
  '//javascript/selenium-core:test:run']
task :test_chrome => [ "//java/client/test/org/openqa/selenium/chrome:chrome:run" ]
task :test_chrome_atoms => [
  '//javascript/atoms:test_chrome:run',
  '//javascript/chrome-driver:test:run',
  '//javascript/webdriver:test_chrome:run']
task :test_htmlunit => [
  "//java/client/test/org/openqa/selenium/htmlunit:htmlunit-no-js:run",
  "//java/client/test/org/openqa/selenium/htmlunit:htmlunit:run"
]
task :test_grid => [
  "//java/server/test/org/openqa/grid/common:common:run",
  "//java/server/test/org/openqa/grid:grid:run",
  "//java/server/test/org/openqa/grid/e2e:e2e:run"
]
task :test_ie => [ "//java/client/test/org/openqa/selenium/ie:ie:run" ]
task :test_jobbie => [ :test_ie ]
task :test_firefox => [ "//java/client/test/org/openqa/selenium/firefox:test-synthesized:run" ]
task :test_opera => [ "//java/client/test/org/openqa/selenium/opera:opera:run" ]
task :test_remote_server => [ '//java/server/test/org/openqa/selenium/remote/server:small-tests:run' ]
task :test_remote => [
  '//java/client/test/org/openqa/selenium/remote:common-tests:run',
  '//java/client/test/org/openqa/selenium/remote:client-tests:run',
  '//java/client/test/org/openqa/selenium/remote:remote-driver-tests:run',
  :test_remote_server
]
task :test_safari => [ "//java/client/test/org/openqa/selenium/safari:safari:run" ]
task :test_phantomjs => [ "//java/client/test/org/openqa/selenium/phantomjs:phantomjs:run" ]
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
if (opera?)
  task :test_java_webdriver => [:test_opera]
end

task :test_java => [
  "//java/client/test/org/openqa/selenium/atoms:test:run",
  "//java/client/test/org/openqa/selenium:small-tests:run",
  :test_support,
  :test_java_webdriver,
  :test_selenium,
  "test_grid",
]

task :test_rb => [
  "//rb:unit-test",
  "//rb:chrome-test",
  "//rb:firefox-test",
  "//rb:phantomjs-test",
  "//rb:remote-chrome-test",
  "//rb:remote-firefox-test",
  "//rb:remote-phantomjs-test",
  ("//rb:ff-legacy-test" if ENV['FF_LEGACY_BINARY']),
  ("//rb:remote-ff-legacy-test" if ENV['FF_LEGACY_BINARY']),
  ("//rb:safari-test" if mac?),
  ("//rb:remote-safari-test" if mac?),
  ("//rb:ie-test" if windows?),
  ("//rb:remote-ie-test" if windows?),
  ("//rb:edge-test" if windows?),
  ("//rb:remote-edge-test" if windows?)
].compact

task :test_py => [ :py_prep_for_install_release, "//py:firefox_test:run" ]

task :test_dotnet => [
  "//dotnet/test:firefox:run"
]

task :test => [ :test_javascript, :test_java, :test_rb ]
if (msbuild_installed?)
  task :test => [ :test_dotnet ]
end
if (python?)
  task :test => [ :test_py ]
end

task :build => [:all, :firefox, :remote, :selenium, :tests]

desc 'Clean build artifacts.'
task :clean do
  rm_rf 'build/'
  rm_rf 'java/client/build/'
  rm_rf 'dist/'
end

task :dotnet => [ "//dotnet", "//dotnet:support", "//dotnet:core", "//dotnet:webdriverbackedselenium" ]

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


task :javadocs => [:common, :firefox, :ie, :remote, :support, :chrome, :selenium] do
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
end

task :py_prep_for_install_release => [
  "//javascript/firefox-driver:webdriver",
  :chrome,
  "//javascript/firefox-driver:webdriver_prefs",
  "//py:prep"
]

task :py_docs => "//py:docs"

task :py_install =>  "//py:install"

task :py_release => :py_prep_for_install_release do
    sh "grep -v test setup.py > setup_release.py; mv setup_release.py setup.py"
    sh "python setup.py sdist upload"
    sh "python setup.py bdist_wheel upload"
    sh "git checkout setup.py"
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
task "repack-jetty" => "build/third_party/java/jetty/jetty-repacked.jar"

# Expose the repack task to CrazyFun.
task "//third_party/java/jetty:repacked" => "build/third_party/java/jetty/jetty-repacked.jar"

file "build/third_party/java/jetty/jetty-repacked.jar" => [
   "third_party/java/jetty/jetty-continuation-9.2.13.v20150730.jar",
   "third_party/java/jetty/jetty-http-9.2.13.v20150730.jar",
   "third_party/java/jetty/jetty-io-9.2.13.v20150730.jar",
   "third_party/java/jetty/jetty-jmx-9.2.13.v20150730.jar",
   "third_party/java/jetty/jetty-security-9.2.13.v20150730.jar",
   "third_party/java/jetty/jetty-server-9.2.13.v20150730.jar",
   "third_party/java/jetty/jetty-servlet-9.2.13.v20150730.jar",
   "third_party/java/jetty/jetty-servlets-9.2.13.v20150730.jar",
   "third_party/java/jetty/jetty-util-9.2.13.v20150730.jar"
 ] do |t|
   print "Repacking jetty\n"
   root = File.join("build", "third_party", "java", "jetty")
   jarjar = File.join("third_party", "java", "jarjar", "jarjar-1.4.jar")
   rules = File.join("third_party", "java", "jetty", "jetty-repack-rules")
   temp = File.join(root, "temp")

   # First, process the files
   mkdir_p root
   mkdir_p temp

   t.prerequisites.each do |pre|
     filename = File.basename(pre, ".jar")
     out = File.join(root, "#{filename}-repacked.jar")
     `java -jar #{jarjar} process #{rules} #{pre} #{out}`
     `cd #{temp} && jar xf #{File.join("..", File.basename(out))}`
   end

   # Now, merge them
   `cd #{temp} && jar cvf #{File.join("..", "jetty-repacked.jar")} *`

   # And copy the artifact to third_party so that eclipse users can be made happy
   cp "build/third_party/java/jetty/jetty-repacked.jar", "third_party/java/jetty/jetty-repacked.jar"
end

#task "release" => [
#    :clean,
#    :build,
#    '//java/server/src/org/openqa/selenium/remote/server:server:zip',
#    '//java/server/src/org/openqa/grid/selenium:selenium:zip',
#    '//java/client/src/org/openqa/selenium:client-combined-v3:zip',
#  ] do |t|
#  # Unzip each of the deps and rename the pieces that need renaming
#  renames = {
#    "client-combined-v3-nodeps-srcs.jar" => "selenium-java-#{version}-srcs.jar",
#    "client-combined-v3-nodeps.jar" => "selenium-java-#{version}.jar",
#    "selenium-nodeps-srcs.jar" => "selenium-server-#{version}-srcs.jar",
#    "selenium-nodeps.jar" => "selenium-server-#{version}.jar",
#    "selenium-standalone.jar" => "selenium-server-standalone-#{version}.jar",
#  }
#
#  t.prerequisites.each do |pre|
#    zip = Rake::Task[pre].out
#
#    next unless zip =~ /\.zip$/
#
#    temp =  zip + "rename"
#    rm_rf temp
#    deep = File.join(temp, "/selenium-#{version}")
#    mkdir_p deep
#    cp "java/CHANGELOG", deep
#    cp "NOTICE", deep
#    cp "LICENSE", deep
#
#    sh "cd #{deep} && jar xf ../../#{File.basename(zip)}"
#    renames.each do |from, to|
#      src = File.join(deep, from)
#      next unless File.exists?(src)
#
#      mv src, File.join(deep, to)
#    end
#    rm_f File.join(deep, "client-combined-v3-standalone.jar")
#    rm zip
#    sh "cd #{temp} && jar cMf ../#{File.basename(zip)} *"
#
#    rm_rf temp
#  end
#
#  mkdir_p "build/dist"
#  cp "build/java/server/src/org/openqa/grid/selenium/selenium-standalone.jar", "build/dist/selenium-server-standalone-#{version}.jar"
#  cp "build/java/server/src/org/openqa/grid/selenium/selenium.zip", "build/dist/selenium-server-#{version}.zip"
#  cp "build/java/client/src/org/openqa/selenium/client-combined-v3.zip", "build/dist/selenium-java-#{version}.zip"
#end


task :'maven-dry-run' => JAVA_RELEASE_TARGETS do |t|
  t.prerequisites.each do |p|
    if JAVA_RELEASE_TARGETS.include?(p)
      Buck::buck_cmd.call('publish', ['--dry-run', '--remote-repo', 'https://oss.sonatype.org/service/local/staging/deploy/maven2', p])
    end
  end
end


task :release => JAVA_RELEASE_TARGETS + [
  # Until we mananage to migrate to Buck entirely.
  '//java/server/src/org/openqa/grid/selenium:selenium',
  '//java/server/src/org/openqa/grid/selenium:selenium:zip',
  '//java/client/src/org/openqa/selenium:client-combined:zip',
 ] do |t|
  puts t.prerequisites.join(', ')

 t.prerequisites.each do |p|
   if JAVA_RELEASE_TARGETS.include?(p)
     Buck::buck_cmd.call('publish', ['--dry-run', '--remote-repo', 'https://oss.sonatype.org/service/local/staging/deploy/maven2', p])
   end
 end

  mkdir_p "build/dist"
  cp Rake::Task['//java/server/src/org/openqa/grid/selenium:selenium'].out, "build/dist/selenium-server-standalone-#{version}.jar"
  cp Rake::Task['//java/server/src/org/openqa/grid/selenium:selenium:zip'].out, "build/dist/selenium-server-#{version}.zip"
  `jar uf build/dist/selenium-server-#{version}.zip NOTICE LICENSE`
  `cd java && jar uf ../build/dist/selenium-server-#{version}.zip CHANGELOG`
  cp Rake::Task['//java/client/src/org/openqa/selenium:client-combined:zip'].out, "build/dist/selenium-java-#{version}.zip"
  `jar uf build/dist/selenium-java-#{version}.zip NOTICE LICENSE`
  `cd java && jar uf ../build/dist/selenium-server-#{version}.zip CHANGELOG`
end

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

task :'publish-maven' do
  puts "\n Enter Passphrase:"
  passphrase = STDIN.gets.chomp

  creds = read_user_pass_from_m2_settings()
  JAVA_RELEASE_TARGETS.each do |p|
    if JAVA_RELEASE_TARGETS.include?(p)
      Buck::buck_cmd.call('build', [p])
      Buck::buck_cmd.call('publish', ['--remote-repo', 'https://oss.sonatype.org/service/local/staging/deploy/maven2', '--include-source', '--include-javadoc', '-u', creds[0], '-p', creds[1], '--signing-passphrase', passphrase, p])
    end
  end
end

task :'maven-install' do
  JAVA_RELEASE_TARGETS.each do |p|
    if JAVA_RELEASE_TARGETS.include?(p)
      Buck::buck_cmd.call('build', [p])
      Buck::buck_cmd.call('publish', ['--remote-repo', "file://#{ENV['HOME']}/.m2/repository", '--include-source', '--include-javadoc', p])
    end
  end
end

task :push_release => [:release] do
  py = "java -jar third_party/py/jython.jar"
  if (python?)
    py = "python"
  end

  sh "#{py} third_party/py/googlestorage/publish_release.py --project_id google.com:webdriver --bucket selenium-release --acl public-read --publish_version #{release_version} --publish build/dist/selenium-server-standalone-#{version}.jar --publish build/dist/selenium-server-#{version}.zip --publish build/dist/selenium-java-#{version}.zip"
end

desc 'Build the selenium client jars'
task 'selenium-java' => '//java/client/src/org/openqa/selenium:selenium'

desc 'Build and package Selenium IDE'
task :release_ide  => [:ide] do
  cp 'build/ide/selenium-ide.xpi', "build/ide/selenium-ide-#{ide_version}.xpi"
end

namespace :node do
  task :deploy => [
    "//cpp:noblur",
    "//cpp:noblur64",
    "//javascript/firefox-driver:webdriver",
    "//javascript/safari-driver:client",
  ] do
    cmd =  "node javascript/node/deploy.js" <<
        " --output=build/javascript/node/selenium-webdriver" <<
        " --resource=LICENSE:/LICENSE" <<
        " --resource=NOTICE:/NOTICE" <<
        " --resource=javascript/firefox-driver/webdriver.json:firefox/webdriver.json" <<
        " --resource=build/cpp/amd64/libnoblur64.so:firefox/amd64/libnoblur64.so" <<
        " --resource=build/cpp/i386/libnoblur.so:firefox/i386/libnoblur.so" <<
        " --resource=build/javascript/firefox-driver/webdriver.xpi:firefox/webdriver.xpi" <<
        " --resource=buck-out/gen/javascript/safari-driver/client.js:safari/client.js" <<
        " --resource=common/src/web/:test/data/" <<
        " --exclude_resource=common/src/web/Bin" <<
        " --exclude_resource=.gitignore" <<
        " --src=javascript/node/selenium-webdriver"

    sh cmd
  end

  task :docs do
    sh "node javascript/node/gendocs.js"
  end
end

namespace :safari do
  desc "Build the SafariDriver java client"
  task :build => [
    "//java/client/src/org/openqa/selenium/safari"
  ]
end

namespace :marionette do
  atoms_file = "build/javascript/marionette/atoms.js"
  func_lookup = {"//javascript/atoms/fragments:clear:firefox" => "clearElement",
                 "//javascript/webdriver/atoms/fragments:get_attribute:firefox" => "getElementAttribute",
                 "//javascript/webdriver/atoms/fragments:get_text:firefox" => "getElementText",
                 "//javascript/atoms/fragments:is_enabled:firefox" => "isElementEnabled",
                 "//javascript/webdriver/atoms/fragments:is_selected:firefox" => "isElementSelected",
                 "//javascript/atoms/fragments:is_displayed:firefox" => "isElementDisplayed"}

  # This task takes all the relevant Marionette atom dependencies
  # (listed in func_lookup) and concatenates them to a single atoms.js
  # file.
  #
  # The function names are defined in the func_lookup dictionary of
  # target to name.
  #
  # Instead of having this custom behaviour in Selenium, Marionette
  # should use the individually generated .js atom files directly in
  # the future.
  #
  # (See Mozilla bug 936204.)

  desc "Generate Marionette atoms"
  task :atoms => func_lookup.keys do |task|
    b = StringIO.new
    b << File.read("javascript/marionette/COPYING") << "\n"
    b << "\n"
    b << "const EXPORTED_SYMBOLS = [\"atoms\"];" << "\n"
    b << "\n"
    b << "function atoms() {};" << "\n"
    b << "\n"

    task.prerequisites.each do |target|
      out = Rake::Task[target].out
      atom = File.read(out).chop

      b << "// target #{target}" << "\n"
      b << "atoms.#{func_lookup[target]} = #{atom};" << "\n"
      b << "\n"
    end

    puts "Generating uberatoms file: #{atoms_file}"
    FileUtils.mkpath("build/javascript/marionette")
    File.open("build/javascript/marionette/atoms.js", "w+") do |h|
      h.write(b.string)
    end
  end
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
            "javascript/firefox-driver/extension/components/httpd.js",
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
      FileList["rb/**/*.rb"].exclude(
          "rb/spec/integration/selenium/client/api/screenshot_spec.rb"),
      :style => "#",
      :prefix => "# encoding: utf-8\n#\n")
    Copyright.Update(
        FileList["java/**/*.java"].exclude(
            "java/client/src/org/openqa/selenium/internal/Base64Encoder.java",
            "java/client/test/org/openqa/selenium/internal/Base64EncoderTest.java",
            "java/server/src/cybervillains/**/*.java",
            "java/server/src/org/openqa/selenium/server/FrameGroupCommandQueueSet.java",
            "java/server/src/org/openqa/selenium/server/FutureFileResource.java",
            "java/server/src/org/openqa/selenium/server/ProxyHandler.java"
            ))
  end
end

at_exit do
  if File.exist?(".git") && !Platform.windows?
    sh "sh .git-fixfiles"
  end
end
