require 'rake'
require 'rake/testtask'
require 'rake/rdoctask'
require 'yaml'
require 'net/telnet.rb'

verbose false

# The CrazyFun build grammar. There's no magic here, just ruby
require 'rake-tasks/crazy_fun'
require 'rake-tasks/crazy_fun/mappings/gcc'
require 'rake-tasks/crazy_fun/mappings/java'
require 'rake-tasks/crazy_fun/mappings/javascript'
require 'rake-tasks/crazy_fun/mappings/mozilla'
require 'rake-tasks/crazy_fun/mappings/rake'
require 'rake-tasks/crazy_fun/mappings/ruby'

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
require 'rake-tasks/android'

version = "2.0a5"
ide_version = "1.0.8-SNAPSHOT"

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
GccMappings.new.add_all(crazy_fun)
JavaMappings.new.add_all(crazy_fun)
JavascriptMappings.new.add_all(crazy_fun)
MozillaMappings.new.add_all(crazy_fun)
RakeMappings.new.add_all(crazy_fun)
RubyMappings.new.add_all(crazy_fun)

# Not every platform supports building every binary needed, so we sometimes
# need to fall back to prebuilt binaries. The prebuilt binaries are stored in
# a directory structure identical to that used in the "build" folder, but
# rooted at one of the following locations:
["chrome/prebuilt", "common/prebuilt", "firefox/prebuilt", "jobbie/prebuilt", "ide/prebuilt"].each do |pre|
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
task :all => [:'selenium-java']
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

task :test_common => [ "//common:test" ]
task :test_chrome => [ "//chrome:test:run" ]
task :test_htmlunit => [ "//htmlunit:test:run" ]
task :test_ie => [ "//jobbie:test:run" ]
task :test_jobbie => [ "//jobbie:test:run" ]
task :test_jsapi => ["//jsapi:atoms:run", "//jsapi:core:run", "//jsapi:test:run"]
task :test_firefox => [ "//firefox:test:run" ]
task :test_remote => [ "//remote/server:test:run" ]
task :test_selenium => [ "//selenium:selenium_test:run", "//selenium:test-selenese:run", :'test_core']
task :test_support => [ "//support:test:run" ]
task :test_iphone_client => [:'webdriver-iphone-client-test']
task :test_iphone => [:test_iphone_server, :test_iphone_client]
task :android => [:android_client, :android_server]
task :android_client => ['//android/client']

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
  "//firefox:ruby-test:jruby",
  "//remote/client:ruby-test:jruby",
 ("//jobbie:ruby-test:jruby" if windows?),
  "//chrome:ruby-test:jruby"
].compact

task :test_py => [
  "//firefox"
]

task :test_dotnet => [
  "//firefox"
]

task :test => [ :test_java, :test_rb ]
if (msbuild?)
  task :test => [ :test_dotnet ]
end
if (python?)
  task :test => [ :test_py ]
end


task :build => [:all, :iphone, :remote, :selenium]

task :clean do
  rm_rf 'build/'
  rm_rf 'iphone/build/'
  rm_rf 'android/server/bin/', :verbose => false
  rm_rf 'android/server/gen/', :verbose => false
  rm_rf 'android/server/build/', :verbose => false
  rm_rf 'android/client/build/', :verbose => false
end

dll(:name => "ie_win32_dll",
    :src  => [ "common/src/cpp/webdriver-interactions/**/*", "jobbie/src/cpp/InternetExplorerDriver/**/*" ],
    :solution => "WebDriver.sln",
    :out  => "Win32/Release/InternetExplorerDriver.dll",
    :prebuilt => "jobbie/prebuilt")

dll(:name => "ie_x64_dll",
    :src  => [ "common/src/cpp/webdriver-interactions/**/*", "jobbie/src/cpp/InternetExplorerDriver/**/*" ],
    :solution => "WebDriver.sln",
    :out  => "x64/Release/InternetExplorerDriver.dll",
    :prebuilt => "jobbie/prebuilt")


dotnet_library(:name => "dotnet_assemblies",
               :project => "rake-tasks/msbuild/webdriver.msbuild.proj",
               :target => "BuildManagedCode")

task :dotnet => [ :ie_win32_dll, :ie_x64_dll, :firefox, :chrome, :'dotnet_assemblies' ]

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
    :src  => FileList.new('common/src/cpp/webdriver-interactions/*_linux.cpp') +
             FileList.new('firefox/src/cpp/webdriver-firefox/*.cpp'),
    :arch => "i386",
    :args => " -DXPCOM_GLUE  -DXPCOM_GLUE_USE_NSPR -I common/src/cpp/webdriver-interactions -I #{gecko_sdk}include -I /usr/include/nspr " + "`pkg-config gtk+-2.0 --cflags`",
    :link_args => "-fno-rtti -fno-exceptions -shared  -fPIC -L#{gecko_sdk}lib -L#{gecko_sdk}bin -Wl,-rpath-link,#{gecko_sdk}bin -lxpcomglue_s -lxpcom -lnspr4 -lrt ",
    :prebuilt => "firefox/prebuilt",
    :out  => "linux/Release/libwebdriver-firefox.so")

# There is no official 64 bit gecko SDK. Fall back to trying to use the one on
# system, but be ready for this to fail. I have a Ubuntu machine, so that's
# what I'm basing this on. I understand that's a Bad Idea

gecko_devels = FileList.new("/usr/lib/xulrunner-devel-1.9.*/sdk")
local_gecko = gecko_devels.empty? ? "" : gecko_devels.to_a[0] + "/"

dll(:name => "libwebdriver_firefox_so64",
    :src  => FileList.new('common/src/cpp/webdriver-interactions/*_linux.cpp') + FileList.new('firefox/src/cpp/webdriver-firefox/native_events.cpp'),
    :arch => "amd64",
    :args => " -DXPCOM_GLUE  -DXPCOM_GLUE_USE_NSPR -fPIC -fshort-wchar -I common/src/cpp/webdriver-interactions -I #{local_gecko}include -I /usr/include/nspr `pkg-config gtk+-2.0 --cflags` ",
    :link_args => "-Wall -Os -L#{local_gecko}lib -L#{local_gecko}bin -Wl,-rpath-link,#{local_gecko}bin -lxpcomglue_s -lxpcom -lnspr4 -lrt `pkg-config gtk+-2.0 --libs` -fno-rtti -fno-exceptions -shared  -fPIC",
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

selenium_test(:name => "test_core_firefox",
              :srcs => [ "common/test/js/core/*.js" ],
              :deps => [
                "//remote/server",
                :"selenium-core"
              ],
              :browser => "*chrome" )

selenium_test(:name => "test_core_ie",
              :srcs => [ "common/test/js/core/*.js" ],
              :deps => [
                "//remote/server",
                :"selenium-core"
              ],
              :browser => "*iexploreproxy")

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
task :webdriver_py => [:chrome, :firefox, "//firefox:webdriver", :remote_client] do
  if python? then
    sh "virtualenv build/python", :verbose => true do |ok, res|
        if ! ok
            puts ""
            puts "PYTHON DEPENDENCY ERROR: Virtualenv not found."
            puts "Please run '[sudo] pip install virtualenv'"
            puts ""
        end
    end

    sh "build/python/bin/pip install simplejson py", :verbose => true

    # Copy browser extensions over to src so setup.py will pick them up. This is such a hack.
    cp 'build/chrome/chrome-extension.zip', "chrome/src/py/", :verbose => true
    cp 'build/firefox/webdriver.xpi', "firefox/src/py/", :verbose => true

    sh "build/python/bin/python setup.py build", :verbose => true

    # Remove the extensions we copied to src.
    rm "chrome/src/py/chrome-extension.zip", :verbose => true
    rm "firefox/src/py/webdriver.xpi", :verbose => true
  end
end

task :test_chrome_py => :webdriver_py do
  if python? then
    sh "virtualenv build/python", :verbose => true do |ok, res|
        if ! ok
            puts ""
            puts "PYTHON DEPENDENCY ERROR: Virtualenv not found."
            puts "Please run '[sudo] pip install virtualenv'"
            puts ""
        end
    end
    if File.exists?('build/python/bin/py.test')
        py_test = 'build/python/bin/py.test'
    else
        py_test = 'py.test'
    end
    test_dir = Dir.glob('build/lib**/selenium/chrome_tests').first
    sh py_test, test_dir, :verbose => true
  end
end

task :test_firefox_py => :webdriver_py do
  if python? then
    sh "virtualenv build/python", :verbose => true do |ok, res|
        if ! ok
            puts ""
            puts "PYTHON DEPENDENCY ERROR: Virtualenv not found."
            puts "Please run '[sudo] pip install virtualenv'"
            puts ""
        end
    end
    if File.exists?('build/python/bin/py.test')
        py_test = 'build/python/bin/py.test'
    else
        py_test = 'py.test'
    end
    test_dir = Dir.glob('build/lib**/selenium/firefox_tests').first
    sh py_test, test_dir, :verbose => true
  end
end

task :test_remote_py => [:webdriver_py, :'selenium-server-standalone'] do
  if python? then
    sh "virtualenv build/python", :verbose => true do |ok, res|
        if ! ok
            puts ""
            puts "PYTHON DEPENDENCY ERROR: Virtualenv not found."
            puts "Please run '[sudo] pip install virtualenv'"
            puts ""
        end
    end
    if File.exists?('build/python/bin/py.test')
        py_test = 'build/python/bin/py.test'
    else
        py_test = 'py.test'
    end
    test_dir = Dir.glob('build/lib**/selenium/remote_tests').first
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
    puts "Building iWebDriver iphone app"
    sh "cd iphone && xcodebuild -sdk #{sdk} ARCHS=i386 -target iWebDriver >/dev/null"
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

### Android ###
file 'build/android/server/server.jar' => FileList["android/server/src/java/**/*.java"] + [:remote, :support] do
  if AndroidSDK?
    android_build(:name => "android-server",
                  :srcs  => [ "android/server/src/java/**/*.java" ],
                  :deps => [ :common,
                             :remote,
                             :support,
                             :remote_common,
                           ],
                  :zip  => true
                 )
  else
    puts "Android SDK could not be found. Set the SDK location in properties.yml"
 end
end
task :android_server => 'build/android/server/server.jar'

java_test(:name => "webdriver-android-client-test",
          :srcs => ["android/client/test/java/**/*.java"],
          :deps => [
                     :test_common,
                     :remote_client,
                     :android_client
                   ])

task :test_android_init => [:android_server, :remote_server] do
  if AndroidSDK?
    #puts "Starting"
    android_init()
    run_emulator()
    install_application()
    start_application()
    add_port_redir()
  else
    puts "Android SDK could not be found. Set the SDK location in properties.yml"
  end
end

# This runs the tests on Android emulator
task :test_android => [:test_android_init, :'webdriver-android-client-test'] do
  if AndroidSDK?
  else
    puts "Android SDK could not be found. Set the SDK location in properties.yml"
  end
end

file "jobbie/src/cpp/InternetExplorerDriver/atoms.h" => [
  "//common:wd_get_attribute:header",
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
