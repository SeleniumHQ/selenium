# Build file for WebDriver. I wonder if this could be run with JRuby?

require 'rake'
require 'rake/testtask'
require 'rake/rdoctask'

def windows?
  RUBY_PLATFORM =~ /win32/i
end

def mac?
  RUBY_PLATFORM =~ /darwin/i
end

def all?
  true
end

task :default => [:test]

task :build => [:common, :htmlunit, :firefox, :jobbie, :safari, :support, :remote]

task :clean do
  rm_rf 'common/build'
  rm_rf 'htmlunit/build'
  rm_rf 'jobbie/build'
  rm_rf 'firefox/build'
  rm_rf 'safari/build'
  rm_rf 'support/build'
  rm_rf 'selenium/build'
  rm_rf 'build/'
end

task :test => [:test_htmlunit, :test_firefox, :test_jobbie, :test_safari, :test_support] do 
end

task :install_firefox => [:firefox] do  
  libs = %w(common/build/webdriver-common.jar firefox/build/webdriver-firefox.jar firefox/lib/runtime/json-20080703.jar)

  firefox = "firefox"
  if ENV['firefox'] then
      firefox = ENV['firefox']
  end
  
  extension_loc = File.dirname(__FILE__) + "/firefox/src/extension"
  extension_loc.tr!("/", "\\") if windows?
  
  cmd = 'java'
  cmd += ' -cp ' + libs.join(File::PATH_SEPARATOR)
  cmd += ' -Dwebdriver.firefox.development="' + extension_loc + '"'
  cmd += " -Dwebdriver.firefox.bin=\"#{ENV['firefox']}\" " unless ENV['firefox'].nil?
  cmd += ' org.openqa.selenium.firefox.FirefoxLauncher '
    
  sh cmd, :verbose => true
end

common_libs = ["common/lib/runtime/**/*.jar", "common/build/webdriver-common.jar"]
common_test_libs = ["common/lib/**/*.jar", "common/build/webdriver-common.jar", "common/build/webdriver-common-test.jar"]

simple_jars = {
  "common" =>   {
    'src'       => "common/src/java/**/*.java",
    'deps'      => [],
    'jar'       => "common/build/webdriver-common.jar",
    'resources' => nil,
    'classpath' => ["common/lib/runtime/**/*.jar"],
    'test_on'   => false,
  },
  "test_common" => {
    'src'       => "common/test/java/**/*.java",
    'deps'      => [:common],
    'jar'       => "common/build/webdriver-common-test.jar",
    'resources' => nil,
    'classpath' => ["common/lib/**/*.jar", "common/build/webdriver-common.jar"],
    'test_on'   => false,
  },
  "htmlunit" =>   {
    'src'       => "htmlunit/src/java/**/*.java",
    'deps'      => [:common],
    'jar'       => "htmlunit/build/webdriver-htmlunit.jar",
    'resources' => nil,
    'classpath' => ["htmlunit/lib/runtime/**/*.jar"] + common_libs,
    'test_on'   => false,
  },
  "test_htmlunit" => {
    'src'       => "htmlunit/test/java/**/*.java",
    'deps'      => [:htmlunit, :test_common],
    'jar'       => "htmlunit/build/webdriver-htmlunit-test.jar",
    'resources' => nil,
    'classpath' => ["htmlunit/lib/**/*.jar", "htmlunit/build/webdriver-htmlunit.jar"] + common_test_libs,
    'test_on'   => all?,
  },
  "firefox" =>   {
    'src'       => "firefox/src/java/**/*.java",
    'deps'      => [:common, 'firefox/build/webdriver-extension.zip'],
    'jar'       => "firefox/build/webdriver-firefox.jar",
    'resources' => 'firefox/build/webdriver-extension.zip',
    'classpath' => ["firefox/lib/runtime/**/*.jar"] + common_libs,
    'test_on'   => false,
  },
  "test_firefox" => {
    'src'       => "firefox/test/java/**/*.java",
    'deps'      => [:firefox, :test_common],
    'jar'       => "firefox/build/webdriver-firefox-test.jar",
    'resources' => nil,
    'classpath' => ["firefox/lib/**/*.jar", "firefox/build/webdriver-firefox.jar"] + common_test_libs,
    'test_on'   => all?,
  },
  "jobbie" =>   {
    'src'       => "jobbie/src/java/**/*.java",
    'deps'      => [:common, 'jobbie/build/InternetExplorerDriver.dll'],
    'jar'       => "jobbie/build/webdriver-jobbie.jar",
    'resources' => 'jobbie/build/InternetExplorerDriver.dll',
    'classpath' => ["jobbie/lib/runtime/**/*.jar"] + common_libs,
    'test_on'   => false,
  },
  "test_jobbie" => {
    'src'       => "jobbie/test/java/**/*.java",
    'deps'      => [:jobbie, :test_common],
    'jar'       => "jobbie/build/webdriver-jobbie-test.jar",
    'resources' => nil,
    'classpath' => ["jobbie/lib/**/*.jar", "jobbie/build/webdriver-jobbie.jar"] + common_test_libs,
    'test_on'   => windows?,
  },
  "remote_common" =>   {
    'src'       => "remote/common/src/java/**/*.java",
    'deps'      => [:common],
    'jar'       => "remote/build/webdriver-remote-common.jar",
    'resources' => nil,
    'classpath' => ["remote/common/lib/runtime/**/*.jar"] + common_libs,
    'test_on'   => false,
  },
  "remote_client" =>   {
    'src'       => "remote/client/src/java/**/*.java",
    'deps'      => [:remote_common],
    'jar'       => "remote/build/webdriver-remote-client.jar",
    'resources' => nil,
    'classpath' => ["remote/common/lib/runtime/**/*.jar", "remote/client/lib/runtime/**/*.jar", "remote/build/webdriver-remote-common.jar"] + common_libs,
    'test_on'   => false,
  },
  "remote_server" => {
    'src'       => "remote/server/src/java/**/*.java",
    'deps'      => [:remote_common],
    'jar'       => "remote/build/webdriver-remote-server.jar",
    'resources' => nil,
    'classpath' => ["remote/common/lib/runtime/**/*.jar", "remote/server/lib/runtime/**/*.jar", "remote/build/webdriver-remote-common.jar"] + common_libs,
    'test_on'   => false,
  },
  "safari" =>   {
    'src'       => "safari/src/java/**/*.java",
    'deps'      => [:common],
    'jar'       => "safari/build/webdriver-safari.jar",
    'resources' => nil,
    'classpath' => ["safari/lib/runtime/**/*.jar"] + common_libs,
    'test_on'   => false,
  },
  "test_safari" => {
    'src'       => "safari/test/java/**/*.java",
    'deps'      => [:safari, :test_common],
    'jar'       => "safari/build/webdriver-safari-test.jar",
    'resources' => nil,
    'classpath' => ["safari/lib/**/*.jar", "safari/build/webdriver-safari.jar"] + common_test_libs,
    'test_on'   => mac?,
  },                              
  "support" =>   {
    'src'       => "support/src/java/**/*.java",
    'deps'      => [:common],
    'jar'       => "support/build/webdriver-support.jar",
    'resources' => nil,
    'classpath' => ["support/lib/runtime/**/*.jar"] + common_libs,
    'test_on'   => false,
  },
  "test_support" => {
    'src'       => "support/test/java/**/*.java",
    'deps'      => [:support, :test_common],
    'jar'       => "support/build/webdriver-support-test.jar",
    'resources' => nil,
    'classpath' => ["support/lib/**/*.jar", "support/build/webdriver-support.jar"] + common_test_libs,
    'test_on'   => all?,
  },                              
}

simple_jars.each do |name, details|
  file "#{details['jar']}" => FileList[details['src']] + details['deps'] do
   classpath = []
   details['classpath'].each do |path|
     classpath += FileList[path]
   end

    javac :jar => details['jar'],
          :sources => FileList[details['src']],
          :classpath => classpath

    if details['test_on'] then
      root = details['src'].split("/")[0]
      junit :in => root, :classpath =>  classpath + [details['jar']]
    end
  end
  task "#{name}" => [details['jar']]
end

task :remote => [:remote_client, :remote_server]



#### Internet Explorer ####
file 'jobbie/build/InternetExplorerDriver.dll' => FileList['jobbie/src/csharp/**/*.cs'] do
  if windows? then
    sh "MSBuild.exeif WebDriver.sln /verbosity:q /target:Rebuild /property:Configuration=Debug", :verbose => false
  else
    puts "Not compiling DLL. Do not try and run the IE tests!"
    begin
      mkdir_p 'jobbie/build', :verbose => false
    rescue
    end
    File.open('jobbie/build/InternetExplorerDriver.dll', 'w') {|f| f.write("")}
  end
end

#### Firefox ####
file 'firefox/build/webdriver-extension.zip' => FileList['firefox/src/extension/**'] do
  begin
    mkdir_p 'firefox/build'
  rescue
  end

  if windows? then
    puts "This Firefox JAR is not suitable for uploading to Google Code"
    sh "cd firefox/src/extension && jar cMvf ../../build/webdriver-extension.zip *"
  else
    sh "cd firefox/src/extension && zip -0r ../../build/webdriver-extension.zip * -x \*.svn\*"
  end
end

task :generate_headers => [:jobbie] do
  cmd = "javah -jni -classpath common\\build\\webdriver-common.jar;jobbie\\build\\webdriver-jobbie.jar -d jobbie\\src\\cpp\\InternetExplorerDriver "
  tests = FileList.new("jobbie/src/java/**/*.java")
  tests.each {|f|
    f = f.to_s
    f =~ /jobbie\/src\/java\/(.*)\.java/
    f = $1
    f.tr! '/', '.'
    cmd += f + " "
  }
  sh cmd, :verbose => true
end

def version
  `svn info | grep Revision | awk -F: '{print $2}' | tr -d '[:space:]' | tr -d '\n'`
end

task :remote_release => [:remote] do
  mkdir_p "build/dist/remote_client"

  cp 'remote/build/webdriver-remote-common.jar', 'build/dist/remote_client'
  cp 'common/build/webdriver-common.jar', 'build/dist/remote_client'
 
  cp Dir.glob('remote/common/lib/runtime/*.jar'), 'build/dist/remote_client'
  cp Dir.glob('remote/client/lib/runtime/*.jar'), 'build/dist/remote_client'

  sh "cd build/dist && zip -r webdriver-remote-client-#{version}.zip remote_client/*"
  rm_rf "build/dist/remote_client"

  mkdir_p "build/dist/remote_server"

  cp 'remote/build/webdriver-remote-common.jar', 'build/dist/remote_server'
  cp 'common/build/webdriver-common.jar', 'build/dist/remote_server'

  cp Dir.glob('remote/common/lib/runtime/*.jar'), 'build/dist/remote_server'
  cp Dir.glob('remote/server/lib/runtime/*.jar'), 'build/dist/remote_server'

  rm Dir.glob('build/dist/remote_server/servlet*.jar')

  sh "cd build/dist && zip -r webdriver-remote-server-#{version}.zip remote_server/*"
  rm_rf "build/dist/remote_server"
end

task :release => [:common, :firefox, :htmlunit, :jobbie, :remote_release, :support] do
  %w(common firefox jobbie htmlunit support).each do |driver|
    mkdir_p "build/dist/#{driver}"
    cp 'common/build/webdriver-common.jar', "build/dist/#{driver}"
    cp "#{driver}/build/webdriver-#{driver}.jar", "build/dist/#{driver}"
    cp Dir.glob("#{driver}/lib/runtime/*"), "build/dist/#{driver}" if File.exists?("#{driver}/lib/runtime")

    sh "cd build/dist && zip -r webdriver-#{driver}-#{version}.zip #{driver}/*"
    rm_rf "build/dist/#{driver}"
  end
end


def javac(args)
  # mandatory args  
  out = (args[:jar] or raise 'javac: please specify the :jar parameter')
  source_patterns = (args[:sources] or raise 'javac: please specify the :sources parameter')
  sources = FileList.new(source_patterns)
  raise("No source files found at #{sources.join(', ')}") if sources.empty?
  
  # We'll start with just one thing now
  extra_resources = args[:resources]
  
  puts "Building: #{out}"
  
  # optional args
  unless args[:exclude].nil?
    args[:exclude].each { |pattern| sources.exclude(pattern) }
  end
  debug = (args[:debug] or true)
  temp_classpath = (args[:classpath]) || []
  
  classpath = FileList.new
  temp_classpath.each do |item|
    classpath.add item
  end
  
  target_dir = "#{out}.classes"
  mkdir_p target_dir, :verbose => false
  
  compile_string = "javac "
  compile_string += "-source 5 -target 5 "
  compile_string += "-g " if debug 
  compile_string += "-d #{target_dir} "

  compile_string += "-cp " + classpath.join(File::PATH_SEPARATOR) + " " if classpath.length > 0
  
  sources.each do |source| 
    compile_string += " #{source}"
  end
  
  sh compile_string, :verbose => false
  
  # Copy the resource to the target_dir
  if extra_resources then
    cp_r extra_resources, target_dir, :verbose => false
  end
  
  jar_string = "jar cf #{out} -C #{target_dir} ."
  sh jar_string, :verbose => false
  
  rm_rf target_dir, :verbose => false
end

def junit(args)
  using = args[:in]
  
  source_dir = "#{using}/test/java"
  source_glob = source_dir + File::SEPARATOR + '**' + File::SEPARATOR + '*.java'
  
  temp_classpath = (args[:classpath]) || []    
  classpath = FileList.new
  temp_classpath.each do |item|
      classpath.add item
  end
  
  tests = FileList.new(source_dir + File::SEPARATOR + '**' + File::SEPARATOR + '*Suite.java')
  tests.exclude '**/Abstract*'
  
  test_string = 'java '
  test_string += '-cp ' + classpath.join(File::PATH_SEPARATOR) + ' ' if classpath.length > 1
  test_string += '-Djava.library.path=' + args[:native_path].join(File::PATH_SEPARATOR) + ' ' unless args[:native_path].nil?
  test_string += "-Dwebdriver.firefox.bin=\"#{ENV['firefox']}\" " unless ENV['firefox'].nil?
  test_string += 'junit.textui.TestRunner'
  
  tests.each do |test|
    puts "Looking at #{test}\n"
    name = test.sub("#{source_dir}/", '').gsub('/', '.')
    test_string += " #{name[0, name.size - 5]}"
    result = sh test_string, :verbose => false
  end
end
