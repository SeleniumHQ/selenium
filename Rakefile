require 'rake'
require 'rake/testtask'
require 'rake/rdoctask'
require 'rake-tasks/files.rb'
require 'yaml'
require 'net/telnet.rb'

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

version = "2.0b1"
ide_version = "1.0.10"

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
["android/server/prebuilt", "chrome/prebuilt", "common/prebuilt", "firefox/prebuilt", "jobbie/prebuilt", "ide/main/prebuilt"].each do |pre|
  crazy_fun.prebuilt_roots << pre
end

# Finally, find every file named "build.desc" in the project, and generate
# rake tasks from them. These tasks are normal rake tasks, and can be invoked
# from rake.
crazy_fun.create_tasks(Dir["**/build.desc"])

# Notice that because we're using rake, anything you can do in a normal rake
# build can also be done here. For example, here we set the default task
task :default => [:test]


# TODO(simon): Shatter the build file into subdirectories, then remove these
task :all => [:'selenium-java', :'android']
task :all_zip => [:'selenium-java_zip']
task :chrome => [ "//chrome" ]
task :common => [ "//common" ]
task :common_core => [ "//common:core" ]
task :htmlunit => [ "//htmlunit" ]
task :ie => [ "//jobbie" ]
task :firefox => [ "//firefox" ]
task :jobbie => [:ie]
task :jsapi => "//jsapi:debug:run"
task :remote => [:remote_common, :remote_server, :remote_client]
task :remote_common => ["//remote/common"]
task :remote_client => ["//remote/client"]
task :remote_server => ["//remote/server"]
task :selenium => [ "//selenium" ]
task :support => [ "//support" ]
task :iphone_client => ['//iphone']
task :iphone => [:iphone_server, :iphone_client]
task :'selenium-server-standalone' => ["//remote/server:server:uber"]

task :ide => [ "//ide:selenium-ide" ]
task :ide_proxy_setup => [ "//common/src/js/selenium:core", "se_ide:setup_proxy" ]
task :ide_proxy_remove => [ "se_ide:remove_proxy" ]

task :test_android => ["//android/client:android_test:run"]
task :test_common => [ "//common:test" ]
task :test_chrome => [ "//chrome:test:run" ]
task :test_htmlunit => [ "//htmlunit:test:run" ]
task :test_ie => [ "//jobbie:test:run" ]
task :test_jobbie => [ "//jobbie:test:run" ]
task :test_jsapi => [ "//jsapi:atoms:run",
                      "//jsapi:selenium_core:run",
                      "//jsapi:selenium_core_emulation:run" ]
task :test_firefox => [ "//firefox:test:run" ]
task :test_remote => [ "//remote/server:test:run" ]
task :test_selenium => [ "//selenium:selenium_test:run", "//selenium:test-selenese:run", :'test_core']
task :test_support => [ "//support:test:run" ]
task :test_iphone_client => [:'webdriver-iphone-client-test']
task :test_iphone => [:test_iphone_server, :test_iphone_client]
task :android => [:android_client, :android_server]
task :android_client => ['//android/client']
task :android_server => ['//android/server:android-server']

if (windows?)
  task :test_core => [:'test_core_ie']
end
task :test_core => [:'test_core_firefox']

task :test_java => [
  "//support:test:run",
  "//htmlunit:test:run",
  "//jsapi:atoms:run",
  "//firefox:test:run",
  "//jobbie:test:run",
  "//remote/server:test:run",
  :test_selenium,
# Can't be sure that android is installed.
#  :test_android,
# Chrome isn't stable enough to include here.
#  "//chrome:test:run"
]

task :test_rb => [
  "//rb:unit-test:jruby",
  "//rb:rc-client-unit-test:jruby",
  "//rb:firefox-test:jruby",
  "//rb:remote-test:jruby",
 ("//rb:ie-test:jruby" if windows?),
#  "//rb:chrome-test:jruby"  # Just not stable enough
].compact

task :test_py => [
  "test_firefox_py"
]

task :test_dotnet => [
  "//firefox"
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
  rm_rf 'android/server/bin/'
  rm_rf 'android/server/build/'
  rm_rf 'android/client/bin/'
  Android::Clean.new()
end

#task "ie_win32_dll" => [ "atomic_header", "sizzle_header" ]
#dll(:name => "ie_win32_dll",
#    :src  => [ "common/src/cpp/webdriver-interactions/**/*", "jobbie/src/cpp/InternetExplorerDriver/**/*" ],
#    :solution => "WebDriver.sln",
#    :out  => "Win32/Release/InternetExplorerDriver.dll",
#    :prebuilt => "jobbie/prebuilt")

#task "ie_x64_dll" => [ "atomic_header", "sizzle_header" ]
#dll(:name => "ie_x64_dll",
#    :src  => [ "common/src/cpp/webdriver-interactions/**/*", "jobbie/src/cpp/InternetExplorerDriver/**/*" ],
#    :solution => "WebDriver.sln",
#    :out  => "x64/Release/InternetExplorerDriver.dll",
#    :prebuilt => "jobbie/prebuilt")


#dotnet_library(:name => "dotnet_assemblies",
#               :project => "rake-tasks/msbuild/webdriver.msbuild.proj",
#               :target => "BuildManagedCode")

#task :dotnet => [ :ie_win32_dll, :ie_x64_dll, :firefox, :chrome, :'dotnet_assemblies' ]
task :dotnet => [ "//jobbie:dotnet", "//remote/client:dotnet", "//firefox:dotnet", "//chrome:dotnet" ]

# Generate a C++ Header file for mapping between magic numbers and #defines
# in the C++ code.
ie_generate_type_mapping(:name => "ie_result_type_cpp",
                         :src => "jobbie/src/common/result_types.txt",
                         :type => "cpp",
                         :out => "cpp/InternetExplorerDriver/IEReturnTypes.h")

# Generate a Java class for mapping between magic numbers and Java static
# class members describing them.
ie_generate_type_mapping(:name => "ie_result_type_java",
                         :src => "jobbie/src/common/result_types.txt",
                         :type => "java",
                         :out => "java/org/openqa/selenium/ie/IeReturnTypes.java")

dll(:name => "firefox_dll",
    :src  => [ "common/src/cpp/webdriver-interactions/**/*", "jobbie/src/cpp/webdriver-firefox/**/*" ],
    :solution => "WebDriver.sln",
    :out  => "Win32/Release/webdriver-firefox.dll",
    :deps  => [
                "//firefox:native_events_xpt",
              ],
    :prebuilt => "firefox/prebuilt")

gecko_sdk = "third_party/gecko-1.9.0.11/linux/"

dll(:name => "libwebdriver_firefox_so",
    :src  => FileList.new('common/src/cpp/webdriver-interactions/*_linux*.cpp') +
             FileList.new('firefox/src/cpp/webdriver-firefox/*.cpp'),
    :arch => "i386",
    :args => " -DXPCOM_GLUE  -DXPCOM_GLUE_USE_NSPR -I common/src/cpp/webdriver-interactions -I #{gecko_sdk}include -I /usr/include/nspr " + "`pkg-config gtk+-2.0 --cflags`",
    :link_args => "-fno-rtti -fno-exceptions -shared  -fPIC -L#{gecko_sdk}lib -L#{gecko_sdk}bin -Wl,-rpath-link,#{gecko_sdk}bin -lxpcomglue_s -lxpcom -lnspr4 -lrt ",
    :prebuilt => "firefox/prebuilt",
    :out  => "linux/Release/libwebdriver-firefox.so")

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
  print 'No Gecko sdk detected. Install xulrunner-dev to compile 64-bit Firefox extension.'
  local_gecko_include = ""
  local_gecko_libs = ""
end

dll(:name => "libwebdriver_firefox_so64",
    :src  => FileList.new('common/src/cpp/webdriver-interactions/*_linux*.cpp') + FileList.new('firefox/src/cpp/webdriver-firefox/native_events.cpp'),
    :arch => "amd64",
    :args => " -DXPCOM_GLUE  -DXPCOM_GLUE_USE_NSPR -fPIC -fshort-wchar -I common/src/cpp/webdriver-interactions #{local_gecko_include} `pkg-config gtk+-2.0 --cflags` ",
    :link_args => "-Wall -Os #{local_gecko_libs} -lrt `pkg-config gtk+-2.0 --libs` -fno-rtti -fno-exceptions -shared  -fPIC",
    :prebuilt => "firefox/prebuilt",
    :out  => "linux64/Release/libwebdriver-firefox.so")

task :'selenium-server_zip' do
  temp = "build/selenium-server_zip"
  mkdir_p temp
  sh "cd #{temp} && jar xf ../selenium-server.zip"
  rm_f "build/selenium-server.zip"
  Dir["#{temp}/webdriver-*.jar"].each { |file| rm_rf file }
  mv "#{temp}/selenium-server.jar", "#{temp}/selenium-server-#{version}.jar"
  sh "cd #{temp} && jar cMf ../selenium-server.zip *"
end

dll(:name => "chrome_dll",
    :src  => [ "common/src/cpp/webdriver-interactions/**/*", "chome/src/cpp/**/*" ],
    :solution => "WebDriver.sln",
    :out  => 'Win32/Release/npchromedriver.dll',
    :prebuilt => "chrome/prebuilt")

java_jar(:name => "selenium-core",
         :resources => [
           {"selenium/test/js/**" => "tests"},
           "common/src/js/core"
         ])

{"firefox" => "*chrome",
 "ie" => "*iexploreproxy",
 "opera" => "*opera",
 "safari" => "*safari"}.each_pair do |k,v|
  selenium_test(:name => "test_core_#{k}",
                :srcs => [ "common/test/js/core/*.js" ],
                :deps => [
                  "//remote/server",
                  :"selenium-core"
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

task :javadocs => [:common, :firefox, "//htmlunit", :jobbie, :remote, :support, :chrome, :selenium] do
  mkdir_p "build/javadoc"
   sourcepath = ""
   classpath = "third_party/java/hamcrest/hamcrest-all-1.1.jar"
   %w(common firefox jobbie htmlunit support remote/common remote/client chrome selenium).each do |m|
     sourcepath += ":#{m}/src/java"
   end
   cmd = "javadoc -d build/javadoc -sourcepath #{sourcepath} -classpath #{classpath} -subpackages org.openqa.selenium -subpackages com.thoughtworks"
   if (windows?)
     cmd = cmd.gsub(/\//, "\\").gsub(/:/, ";")
   end
   sh cmd
end

# Installs the webdriver python bindings using virtualenv for testing.
task :webdriver_py do
  if python? then
    virtualenv = "virtualenv build/python"
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
      cp 'jobbie\\prebuilt\\Win32\\Release\\InternetExplorerDriver.dll', "py\\selenium\\webdriver\\ie", :verbose => true
      sh "build\\python\\Scripts\\python setup.py build", :verbose => true
    
      if File.exists?('build\\python\\Scripts\\py.test.exe')
          py_test = 'build\\python\\Scripts\\py.test.exe'
      else
          py_test = 'py.test.exe'
      end
    
      test_dir = Dir.glob('build/lib**/selenium/test/selenium/webdriver/ie').first
      sh py_test, test_dir, :verbose => true
      rm "py\\selenium\\webdriver\\ie\\InternetExplorerDriver.dll"
    end
  end
end

task :test_chrome_py => [:webdriver_py, :chrome] do
  if python? then
    chrome_zip_build = 'build/chrome/chrome-extension.zip'
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

task :test_firefox_py => [:webdriver_py, :firefox, "//firefox:webdriver"] do
  if python? then
    xpi_zip_build = 'build/firefox/webdriver.xpi'
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

file "jobbie/src/cpp/InternetExplorerDriver/atoms.h" => [
  "//common/src/js/webdriver:get_attribute:header",
] do |task|
  puts "Writing: #{task}"
  File.open('jobbie/src/cpp/InternetExplorerDriver/atoms.h', 'w') do |f|
    task.prerequisites.each do |req|
      puts "Reading: " + req if verbose
      source = Rake::Task[req].out
      f << IO.read(source) + "\n"
    end
  end
end
task :atomic_header => [ "jobbie/src/cpp/InternetExplorerDriver/atoms.h" ]

file "jobbie/src/cpp/InternetExplorerDriver/sizzle.h" => [ "//third_party/js/sizzle:sizzle:header" ] do
  cp "build/third_party/js/sizzle/sizzle.h", "jobbie/src/cpp/InternetExplorerDriver/sizzle.h"
end
task :sizzle_header => [ "jobbie/src/cpp/InternetExplorerDriver/sizzle.h" ]

file "common/test/js/deps.js" => FileList["third_party/closure/goog/**/*.js", "common/src/js/**/*.js"] do
  our_cmd = "java -jar third_party/py/jython.jar third_party/closure/bin/calcdeps.py "
  our_cmd << "--output_mode=deps --path=common/src/js --path=common/test/js "
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
  File.open("common/test/js/deps.js", "w") do |f| f.write(output); end
end

desc "Calculate dependencies required for testing the automation atoms"
task :calcdeps => "common/test/js/deps.js"

def version
  `svn info | grep Revision | awk -F: '{print $2}' | tr -d '[:space:]' | tr -d '\n'`
end

task :release => ['//remote/server:server:zip', '//remote/client:combined:zip'] do |t|
  # Unzip each of the deps and rename the pieces that need renaming
  renames = {
    "combined-nodeps-srcs.jar" => "selenium-java-#{version}-srcs.jar",
    "combined-nodeps.jar" => "selenium-java-#{version}.jar",
    "server-nodeps-srcs.jar" => "selenium-server-#{version}-srcs.jar",
    "server-nodeps.jar" => "selenium-server-#{version}.jar",
    "server-standalone.jar" => "selenium-server-standalone-#{version}.jar",
  }

  t.prerequisites.each do |pre|
    zip = Rake::Task[pre].out
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
    rm_f File.join(deep, "combined-standalone.jar")
    rm zip
    sh "cd #{temp} && jar cMf ../#{zip.split('/')[-1]} *"

    rm_rf temp
  end

  mkdir_p "build/dist"
  cp "build/remote/server/server-standalone.jar", "build/dist/selenium-server-standalone-#{version}.jar"
  cp "build/remote/client/combined.zip", "build/dist/selenium-java-#{version}.zip"
  cp "build/remote/server/server.zip", "build/dist/selenium-server-#{version}.zip"
end

desc 'Build the selenium client jars'
task 'selenium-java' => 'build/selenium-java.jar'
file 'build/selenium-java.jar' => '//remote/client:combined:project' do
  cp 'build/remote/client/combined-nodeps.jar', 'build/selenium-java.jar'
end

desc 'Build the standalone server'
task 'selenium-server-standalone' => 'build/selenium-server-standalone.jar'
file 'build/selenium-server-standalone.jar' => '//remote/server:server:uber' do
  cp 'build/remote/server/server-standalone.jar', 'build/selenium-server-standalone.jar'
end

desc 'Build and package Selenium IDE'
task :release_ide  => [:ide] do
  cp 'build/ide/selenium-ide.xpi', "build/ide/selenium-ide-#{ide_version}.xpi"
end

