$LOAD_PATH.unshift File.expand_path(".")

require 'rake'
require 'rake/testtask'
require 'rake/rdoctask'
require 'rake-tasks/files'
require 'yaml'
require 'net/telnet'

Rake.application.instance_variable_set "@name", "go"
verbose false

# The CrazyFun build grammar. There's no magic here, just ruby
require 'rake-tasks/crazy_fun'
require 'rake-tasks/crazy_fun/mappings/android'
require 'rake-tasks/crazy_fun/mappings/gcc'
require 'rake-tasks/crazy_fun/mappings/java'
require 'rake-tasks/crazy_fun/mappings/javascript'
require 'rake-tasks/crazy_fun/mappings/mozilla'
require 'rake-tasks/crazy_fun/mappings/rake'
require 'rake-tasks/crazy_fun/mappings/ruby'
require 'rake-tasks/crazy_fun/mappings/visualstudio'

# The original build rules
require 'rake-tasks/task-gen'
require 'rake-tasks/checks'
require 'rake-tasks/dotnet'
require 'rake-tasks/zip'
require 'rake-tasks/c'
require 'rake-tasks/java'
require 'rake-tasks/iphone'
require 'rake-tasks/selenium'
require 'rake-tasks/se-ide'
require 'rake-tasks/ie_code_generator'

version = "2.0b2"
ide_version = "1.0.11"

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
AndroidMappings.new.add_all(crazy_fun)
GccMappings.new.add_all(crazy_fun)
JavaMappings.new.add_all(crazy_fun)
JavascriptMappings.new.add_all(crazy_fun)
MozillaMappings.new.add_all(crazy_fun)
RakeMappings.new.add_all(crazy_fun)
RubyMappings.new.add_all(crazy_fun)
VisualStudioMappings.new.add_all(crazy_fun)

# Not every platform supports building every binary needed, so we sometimes
# need to fall back to prebuilt binaries. The prebuilt binaries are stored in
# a directory structure identical to that used in the "build" folder, but
# rooted at one of the following locations:
["android/prebuilt", "cpp/prebuilt", "ide/main/prebuilt", "javascript/firefox-driver/prebuilt"].each do |pre|
  crazy_fun.prebuilt_roots << pre
end

# Finally, find every file named "build.desc" in the project, and generate
# rake tasks from them. These tasks are normal rake tasks, and can be invoked
# from rake.
crazy_fun.create_tasks(Dir["**/build.desc"])

# Notice that because we're using rake, anything you can do in a normal rake
# build can also be done here. For example, here we set the default task
task :default => [:test]


task :all => [:'selenium-java', :'android']
task :all_zip => [:'selenium-java_zip']
task :chrome => [ "//java/client/src/org/openqa/selenium/chrome" ]
task :common_core => [ "//common:core" ]
task :htmlunit => [ "//java/client/src/org/openqa/selenium/htmlunit" ]
task :ie => [ "//java/client/src/org/openqa/selenium/ie" ]
task :firefox => [ "//java/client/src/org/openqa/selenium/firefox" ]
task :jsapi => "//jsapi:debug:run"
task :remote => [:remote_common, :remote_server, :remote_client]
task :remote_common => ["//java/client/src/org/openqa/selenium/remote:common"]
task :remote_client => ["//java/client/src/org/openqa/selenium/remote"]
task :remote_server => ["//java/server/src/org/openqa/selenium/remote/server"]
task :server_lite => ["//java/server/src/org/openqa/selenium/server:server_lite"]
task :selenium => [ "//java/client/src/org/openqa/selenium" ]
task :support => [
  "//java/client/src/org/openqa/selenium/lift",
  "//java/client/src/org/openqa/selenium/support",
]
task :iphone_client => ['//java/client/src/org/openqa/selenium/iphone']
task :iphone => [:iphone_server, :iphone_client]
task :'selenium-server-standalone' => ["//java/server/src/org/openqa/selenium/remote/server:server:uber"]

task :ide => [ "//ide:selenium-ide-multi" ]
task :ide_proxy_setup => [ "//common/src/js/selenium:core", "se_ide:setup_proxy" ]
task :ide_proxy_remove => [ "se_ide:remove_proxy" ]

task :test_atoms => ['//jsapi:atoms:run', '//jsapi:selenium_core_emulation:run', '//jsapi:selenium_core:run']
task :test_android => ["//java/client/test/org/openqa/selenium/android:android-test:run"]
task :test_chrome => [ "//java/client/test/org/openqa/selenium/chrome:test:run" ]
task :test_htmlunit => [ "//java/client/test/org/openqa/selenium/htmlunit:test:run" ]
task :test_ie => [ "//java/client/test/org/openqa/selenium/ie:test:run" ]
task :test_jobbie => [ :test_ie ]
task :test_jsapi => [ "//jsapi:atoms:run",
                      "//jsapi:selenium_core:run",
                      "//jsapi:selenium_core_emulation:run" ]
task :test_firefox => [ "//java/client/test/org/openqa/selenium/firefox:test:run" ]
task :test_remote => [ "//java/server/test/org/openqa/selenium/remote/server:test:run" ]
task :test_support => [
  "//java/client/test/org/openqa/selenium/lift:test:run",
  "//java/client/test/org/openqa/selenium/support:test:run"
]
task :test_iphone_client => [:'webdriver-iphone-client-test']
task :test_iphone => [:test_iphone_server, :test_iphone_client]
task :android => [:android_client, :android_server]
task :android_client => ['//java/client/src/org/openqa/selenium/android']
task :android_server => ['//android:android-server']

# TODO(simon): test-core should go first, but it's changing the least for now.
task :test_selenium => [ :'test-rc', :'test-v1-emulation', :'test-selenium-backed-webdriver', :'test-core']

task :'test-selenium-backed-webdriver' => ['//java/client/test/org/openqa/selenium/v1:selenium-backed-webdriver-test:run']
task :'test-v1-emulation' => [ '//java/client/test/com/thoughtworks/selenium:firefox-emulation-test:run' ]
task :'test-rc' => [ '//java/client/test/com/thoughtworks/selenium:firefox-rc-test:run' ]
task :'test-core' => [:'test-core-firefox']

if (windows?)
  task :'test-v1-emulation' => ['//java/client/test/com/thoughtworks/selenium:ie-emulation-test:run']
  task :'test-rc' => ['//java/client/test/com/thoughtworks/selenium:ie-rc-test:run']
  task :'test-core' => [:'test-core-ie']
#elsif (mac?)
#  task :'test-rc' => ['//java/client/test/com/thoughtworks/selenium:safari-rc-test:run']
#  task :'test-core' => [:'test-core-safari']
end

task :test_java => [
  "//java/client/test/org/openqa/selenium/support:test:run",
  "//java/client/test/org/openqa/selenium/htmlunit:test:run",
  "test_atoms",
  "//java/client/test/org/openqa/selenium/firefox:test:run",
  "//java/client/test/org/openqa/selenium/ie:test:run",
  "//java/server/test/org/openqa/selenium/remote/server:test:run",
  :test_selenium,
# Can't be sure that android is installed.
#  :test_android,
# Chrome isn't stable enough to include here.
#  "//chrome:test:run"
]

task :test_rb => [
  "//rb:unit-test",
  "//rb:rc-client-unit-test",
  "//rb:firefox-test",
  "//rb:remote-test",
 ("//rb:ie-test" if windows?),
#  "//rb:chrome-test"  # Just not stable enough
].compact

task :test_py => [
  "test_firefox_py"
]

task :test_dotnet => [
  "//dotnet:firefox-test"
]

task :test => [ :test_java, :test_rb ]
if (msbuild_installed?)
  task :test => [ :test_dotnet ]
end
if (python?)
  task :test => [ :test_py ]
end


task :build => [:all, :iphone, :remote, :selenium]

desc 'Clean build artifacts.'
task :clean do
  rm_rf 'build/'
  rm_rf 'iphone/build/'
  rm_rf 'android/bin/'
  rm_rf 'android/build/'
  rm_rf 'android/libs/'
  rm_rf 'android/client/bin/'
  Android::Clean.new()
end

task :dotnet => [ "//dotnet:ie", "//dotnet:firefox", "//dotnet:chrome", "//dotnet:support", "//dotnet:core", "//dotnet:webdriverbackedselenium" ]

# Generate a C++ Header file for mapping between magic numbers and #defines
# in the C++ code.
ie_generate_type_mapping(:name => "ie_result_type_cpp",
                         :src => "cpp/IEDriver/result_types.txt",
                         :type => "cpp",
                         :out => "cpp/IEDriver/IEReturnTypes.h")

# Generate a Java class for mapping between magic numbers and Java static
# class members describing them.
ie_generate_type_mapping(:name => "ie_result_type_java",
                         :src => "cpp/IEDriver/result_types.txt",
                         :type => "java",
                         :out => "java/client/src/org/openqa/selenium/ie/IeReturnTypes.java")

gecko_sdk = "third_party/gecko-1.9.0.11/linux/"

dll(:name => "libwebdriver_firefox_so",
    :src  => FileList.new('cpp/webdriver-interactions/*_linux*.cpp') +
             FileList.new('cpp/webdriver-firefox/*.cpp'),
    :arch => "i386",
    :args => " -DXPCOM_GLUE  -DXPCOM_GLUE_USE_NSPR -I cpp/webdriver-interactions -I #{gecko_sdk}include -I /usr/include/nspr " + "`pkg-config gtk+-2.0 --cflags`",
    :link_args => "-fno-rtti -fno-exceptions -shared  -fPIC -L#{gecko_sdk}lib -L#{gecko_sdk}bin -Wl,-rpath-link,#{gecko_sdk}bin -lxpcomglue_s -lxpcom -lnspr4 -lrt ",
    :prebuilt => "cpp/prebuilt/i386/libwebdriver-firefox.so",
    :out  => "cpp/i386/libwebdriver-firefox.so")

# There is no official 64 bit gecko SDK. Fall back to trying to use the one on
# system, but be ready for this to fail. I have a Ubuntu machine, so that's
# what I'm basing this on. I understand that's a Bad Idea
begin
  pkg_config_gecko = sh "pkg-config --exists libxul"
rescue
  pkg_config_gecko = false
end

if pkg_config_gecko
  libs_cmd = open("| pkg-config --libs libxul")
  local_gecko_libs = libs_cmd.readline.gsub "\n", ""
  cflags_cmd = open("| pkg-config --cflags libxul")
  local_gecko_include = cflags_cmd.readline.gsub "\n", ""
else
  puts 'No Gecko SDK detected. Install xulrunner-dev (xulrunner-devel for macports) to compile 64-bit Firefox extension.'
  local_gecko_include = ""
  local_gecko_libs = ""
end

dll(:name => "libwebdriver_firefox_so64",
    :src  => FileList.new('cpp/webdriver-interactions/*_linux*.cpp') +
             FileList.new('cpp/webdriver-firefox/native_events.cpp'),
    :arch => "amd64",
    :args => " -DXPCOM_GLUE  -DXPCOM_GLUE_USE_NSPR -fPIC -fshort-wchar -I cpp/webdriver-interactions #{local_gecko_include} `pkg-config gtk+-2.0 --cflags` ",
    :link_args => "-Wall -Os #{local_gecko_libs} -lrt `pkg-config gtk+-2.0 --libs` -fno-rtti -fno-exceptions -shared  -fPIC",
    :prebuilt => "cpp/prebuilt/amd64/libwebdriver-firefox.so",
    :out  => "cpp/amd64/libwebdriver-firefox.so")

task :'selenium-server_zip' do
  temp = "build/selenium-server_zip"
  mkdir_p temp
  sh "cd #{temp} && jar xf ../selenium-server.zip"
  rm_f "build/selenium-server.zip"
  Dir["#{temp}/webdriver-*.jar"].each { |file| rm_rf file }
  mv "#{temp}/selenium-server.jar", "#{temp}/selenium-server-#{version}.jar"
  sh "cd #{temp} && jar cMf ../selenium-server.zip *"
end

{"firefox" => "*chrome",
 "ie" => "*iexploreproxy",
 "opera" => "*opera",
 "safari" => "*safari"}.each_pair do |k,v|
  selenium_test(:name => "test-core-#{k}",
                :srcs => [ "common/test/js/core/*.js" ],
                :deps => [
                  "//java/server/test/org/openqa/selenium:server-with-tests:uber",
                ],
                :browser => v )
end

# Copy things around to make life easier when packaging IDE
file "build/ide/selenium" => "//common:js_core" do
  rm_rf "build/ide/selenium"
  mkdir_p "build/ide"
  puts Rake::Task["//common:js_core"].out
  cp_r Rake::Task["//common:js_core"].out + "/", "build/ide/selenium/"
  Dir["build/ide/selenium/**/.svn"].each { |file| rm_rf file }
end
task "rename_core" => "build/ide/selenium"

task :javadocs => [:common, :firefox, :htmlunit, :jobbie, :remote, :support, :chrome, :selenium] do
  mkdir_p "build/javadoc"
   sourcepath = ""
   classpath = '.'
   Dir["third_party/java/*/*.jar"].each do |jar|
     classpath << ":" + jar
   end
   [File.join(%w(java client src))].each do |m|
     sourcepath += File::PATH_SEPARATOR + m
   end
   p sourcepath
   cmd = "javadoc -d build/javadoc -sourcepath #{sourcepath} -classpath #{classpath} -subpackages org.openqa.selenium -subpackages com.thoughtworks"
   if (windows?)
     cmd = cmd.gsub(/\//, "\\").gsub(/:/, ";")
   end
   sh cmd
end

# Installs the webdriver python bindings using virtualenv for testing.
task :webdriver_py do
  if python? then
    virtualenv = "virtualenv --no-site-packages build/python"
    pip_install = 'build/python/bin/' + "pip install simplejson py pytest"
    if (windows?) then
       virtualenv = "virtualenv build\\python"
       pip_install = "build\\python\\Scripts\\" + "pip install simplejson py pytest"
    end

    sh virtualenv, :verbose => true do |ok, res|
        if ! ok
            puts ""
            puts "PYTHON DEPENDENCY ERROR: Virtualenv not found."
            puts "Please run '[sudo] pip install virtualenv'"
            puts ""
        end
    end

    sh pip_install, :verbose => true
  end
end

task :test_ie_py => :webdriver_py do
  win = windows?
  if win != nil then
    if python? then
      cp 'cpp\\prebuilt\\Win32\\Release\\IEDriver.dll', "py\\selenium\\webdriver\\ie", :verbose => true
      sh "build\\python\\Scripts\\python setup.py build", :verbose => true
    
      if File.exists?('build\\python\\Scripts\\py.test.exe')
          py_test = 'build\\python\\Scripts\\py.test.exe'
      else
          py_test = 'py.test.exe'
      end
    
      test_dir = Dir.glob('build/lib**/selenium/test/selenium/webdriver/ie').first
      sh py_test, test_dir, :verbose => true
      rm "py\\selenium\\webdriver\\ie\\IEDriver.dll"
    end
  end
end

task :test_chrome_py => [:webdriver_py, :chrome] do
  if python? then
    chrome_zip_build = 'build/javascript/chrome-driver/chrome-extension.zip'
    chrome_py_home = "py/selenium/webdriver/chrome/"
    py_test_path = 'build/python/bin/py.test'
    py_setup = "build/python/bin/python " + 'setup.py build'
    if (windows?) then
      chrome_zip_build = chrome_zip_build.gsub(/\//, "\\")
      chrome_py_home = chrome_py_home.gsub(/\//, "\\")
      py_test_path = 'build\\python\\Scripts\\py.test.exe'
      py_setup = 'build\\python\\Scripts\\python ' + 'setup.py build'
    end
    cp chrome_zip_build , chrome_py_home , :verbose => true

    sh py_setup , :verbose => true

    if File.exists?(py_test_path)
        py_test = py_test_path 
    else
        py_test = 'py.test'
    end
    test_dir = Dir.glob('build/lib**/selenium/test/selenium/webdriver/chrome').first
    sh py_test, test_dir, :verbose => true
    chrome_zip = chrome_py_home + "chrome-extension.zip"
    rm chrome_zip , :verbose => true
  end
end

task :test_firefox_py => [:webdriver_py, :firefox, "//javascript/firefox-driver:webdriver"] do
  if python? then
    xpi_zip_build = 'build/javascript/firefox-driver/webdriver.xpi'
    firefox_py_home = "py/selenium/webdriver/firefox/"
    py_test_path = 'build/python/bin/py.test'
    py_setup = "build/python/bin/python " + 'setup.py build'
    if (windows?) then
      xpi_zip_build = xpi_zip_build.gsub(/\//, "\\")
      firefox_py_home = firefox_py_home .gsub(/\//, "\\")
      py_test_path = 'build\\python\\Scripts\\py.test.exe'
      py_setup = 'build\\python\\Scripts\\python ' + 'setup.py build'
    end

    cp xpi_zip_build , firefox_py_home, :verbose => true

    sh py_setup , :verbose => true


    if File.exists?(py_test_path)
        py_test = py_test_path 
    else
        py_test = 'py.test'
    end
    test_dir = Dir.glob('build/lib**/selenium/test/selenium/webdriver/firefox').first
    sh py_test, test_dir, :verbose => true
    webdriver_zip = firefox_py_home + 'webdriver.xpi'
    rm webdriver_zip , :verbose => true
  end
end

task :test_remote_py => [:webdriver_py, :remote_client, :'selenium-server-standalone'] do
  if python? then
    py_setup = "build/python/bin/python " + 'setup.py build'
    py_test_path = 'build/python/bin/py.test'

    if (windows?) then
      py_test_path = 'build\\python\\Scripts\\py.test.exe'
      py_setup = 'build\\python\\Scripts\\python ' + 'setup.py build'
    end

    sh py_setup , :verbose => true
    
    if File.exists?(py_test_path)
        py_test = py_test_path 
    else
        py_test = 'py.test'
    end
    test_dir = Dir.glob('build/lib**/selenium/test/selenium/webdriver/remote').first
    sh py_test, test_dir, :verbose => true
  end
end

task :test_selenium_py => [:'selenium-core', :'selenium-server-standalone'] do
    if python? then
        sh "python2.6 selenium/test/py/runtests.py", :verbose => true
    end
end


iphone_test(:name => "webdriver-iphone-client-test",
            :srcs => [ "iphone/test/java/**/*.java" ],
            :deps => [
                       :test_common,
                       :iphone_server,
                       :iphone_client
                     ])


#### iPhone ####
task :iphone_server do
  sdk = iPhoneSDK?
  if sdk != nil then
    puts "Building iWebDriver iphone app."
    sh "cd iphone && xcodebuild -sdk #{sdk} ARCHS=i386 -target iWebDriver", :verbose => false
  else
    puts "XCode not found. Not building the iphone driver."
  end
end

# This does not depend on :iphone_server because the dependancy is specified in xcode
task :test_iphone_server do
  sdk = iPhoneSDK?
  if sdk != nil then
    sh "cd iphone && xcodebuild -sdk #{sdk} ARCHS=i386 -target Tests"
  else
    puts "XCode and/or iPhoneSDK not found. Not testing iphone_server."
  end
end

file "iphone/src/objc/atoms.h" => ["//iphone:atoms"] do |task|
  puts "Writing: #{task}"
  cp "build/iphone/atoms.h", "iphone/src/objc/atoms.h"
end
task :iphone_atoms => ["iphone/src/objc/atoms.h"]

file "cpp/IEDriver/sizzle.h" => [ "//third_party/js/sizzle:sizzle:header" ] do
  cp "build/third_party/js/sizzle/sizzle.h", "cpp/IEDriver/sizzle.h"
end
task :sizzle_header => [ "cpp/IEDriver/sizzle.h" ]

file "javascript/deps.js" => FileList["third_party/closure/goog/**/*.js", "javascript/*-atom*/*.js"] do
  our_cmd = "java -jar third_party/py/jython.jar third_party/closure/bin/calcdeps.py "
  our_cmd << "--output_mode=deps --path=javascript "
  our_cmd << "--dep=third_party/closure/goog"

  # Generate the deps. The file paths will be as they appear on the filesystem,
  # but for our tests, the WebDriverJS source files are served from /js/src and
  # the Closure Library source is under /third_party/closure/goog, so we need
  # to modify the generated paths to match that scheme.
  output = ""
  io = IO.popen(our_cmd)
    io.each do |line|
      line = line.gsub("\\\\", "/")
      output << line.gsub(/common\/(.*)\/js/, 'js/\1')
    end
  File.open("javascript/deps.js", "w") do |f| f.write(output); end
end

desc "Calculate dependencies required for testing the automation atoms"
task :calcdeps => "javascript/deps.js"

def version
  `svn info | grep Revision | awk -F: '{print $2}' | tr -d '[:space:]' | tr -d '\n'`
end

task :release => [
    '//java/server/src/org/openqa/selenium/server:server:zip',
    '//java/server/src/org/openqa/selenium/server:server:uber',
    '//java/client/src/org/openqa/selenium:client-combined:zip'
  ] do |t|
  # Unzip each of the deps and rename the pieces that need renaming
  renames = {
    "client-combined-nodeps-srcs.jar" => "selenium-java-#{version}-srcs.jar",
    "client-combined-nodeps.jar" => "selenium-java-#{version}.jar",
    "server-nodeps-srcs.jar" => "selenium-server-#{version}-srcs.jar",
    "server-nodeps.jar" => "selenium-server-#{version}.jar",
    "server-standalone.jar" => "selenium-server-standalone-#{version}.jar",
  }

  t.prerequisites.each do |pre|
    zip = Rake::Task[pre].out
    
    next unless zip =~ /\.zip$/
    
    temp =  zip + "rename"
    rm_rf temp
    deep = File.join(temp, "/selenium-#{version}")
    mkdir_p deep

    sh "cd #{deep} && jar xf ../../#{zip.split('/')[-1]}"
    renames.each do |from, to|
      src = File.join(deep, from)
            next unless File.exists?(src)

      mv src, File.join(deep, to)
    end
    rm_f File.join(deep, "client-combined-standalone.jar")
    rm zip
    sh "cd #{temp} && jar cMf ../#{zip.split('/')[-1]} *"

    rm_rf temp
  end

  mkdir_p "build/dist"
  cp "build/java/server/src/org/openqa/selenium/server/server-standalone.jar", "build/dist/selenium-server-standalone-#{version}.jar"
  cp "build/java/server/src/org/openqa/selenium/server/server.zip", "build/dist/selenium-server-#{version}.zip"
  cp "build/java/client/src/org/openqa/selenium/client-combined.zip", "build/dist/selenium-java-#{version}.zip"
end

desc 'Build the selenium client jars'
task 'selenium-java' => '//java/client/src/org/openqa/selenium:client-combined:project'

desc 'Build the standalone server'
task 'selenium-server-standalone' => '//java/server/src/org/openqa/selenium/server:server:uber'

desc 'Build and package Selenium IDE'
task :release_ide  => [:ide] do
  cp 'build/ide/selenium-ide.xpi', "build/ide/selenium-ide-#{ide_version}.xpi"
end
