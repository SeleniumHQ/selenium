# Build file for WebDriver. I wonder if this could be run with JRuby?

require 'rake'
require 'rake/testtask'
require 'rake/rdoctask'

task :default => [:test]

task :build => [:common, :htmlunit]

task :clean do
  rm_rf 'common/build'
  rm_rf 'htmlunit/build'
  rm_rf 'jobbie/build'
end

task :test => [:test_htmlunit] do 
end

%w(common htmlunit jobbie).each do |driver|
  source = FileList["#{driver}/src/java/**/*.java"]
  libs = ["#{driver}/lib/runtime/*.jar", "#{driver}/lib/buildtime/*.jar", "common/build/webdriver-common.jar"]
  deps = Array.new
  deps = %w(common/build/webdriver-common.jar) unless driver == "common"
  deps |= source
  file "#{driver}/build/webdriver-#{driver}.jar" => deps do
    javac :jar => "#{driver}/build/webdriver-#{driver}.jar",
              :sources => source,
              :classpath => libs
  end
  tsk = task "#{driver}" => ["#{driver}/build/webdriver-#{driver}.jar"]
  tsk.enhance(%w(common/build/webdriver-common.jar)) unless driver == "common"
  
  libs << "#{driver}/build/webdriver-#{driver}.jar"
  libs << "common/lib/buildtime/*.jar"
  test_source = FileList["#{driver}/test/java/**/*.java"]
  deps << "#{driver}/build/webdriver-#{driver}.jar"
  if (driver != "common") then
    deps << "common/build/webdriver-common-test.jar"
    libs << "common/build/webdriver-common-test.jar"
  end
  file "#{driver}/build/webdriver-#{driver}-test.jar" => deps do
    javac :jar => "#{driver}/build/webdriver-#{driver}-test.jar",
              :sources => test_source,
              :classpath => libs
  end
  tsk = task "test_#{driver}" => ["#{driver}/build/webdriver-#{driver}-test.jar"] do
    libs << "#{driver}/build/webdriver-#{driver}-test.jar"
    junit :in => driver, :classpath => libs, :native_path => ["#{driver}/build", "#{driver}/lib/runtime"]
  end
end

# C:\WINDOWS\Microsoft.NET\Framework\v2.0.50727\Csc.exe /noconfig /nowarn:1701,1702 /errorreport:prompt /warn:4 /define:DEBUG;TRACE /reference:C:\WINDOWS\Microsoft.NET\Framework\v2.0.50727\System.Data.dll /reference:C:\WINDOWS\Microsoft.NET\Framework\v2.0.50727\System.dll /reference:C:\WINDOWS\Microsoft.NET\Framework\v2.0.50727\System.Windows.Forms.dll /reference:C:\WINDOWS\Microsoft.NET\Framework\v2.0.50727\System.Xml.dll /reference:C:\WINDOWS\assembly\GAC\Microsoft.mshtml\7.0.3300.0__b03f5f7f11d50a3a\Microsoft.mshtml.dll /reference:obj\Debug\Interop.SHDocVw.dll /debug+ /debug:full /optimize- /out:obj\Debug\WebDriver.dll /target:library IeWrapper.cs NavigableDocument.cs NoSuchElementException.cs Properties\AssemblyInfo.cs UnsupportedOperationException.cs WebDriver.cs WrappedWebElement.cs
# C:\WINDOWS\Microsoft.NET\Framework\v2.0.50727\Csc.exe /noconfig /nowarn:1701,1702 /errorreport:prompt /warn:4 /define:DEBUG;TRACE /reference:"C:\Program Files\Microsoft.NET\Primary Interop Assemblies\Microsoft.mshtml.dll" /reference:C:\WINDOWS\assembly\GAC\nunit.framework\2.2.0.0__96d09a1eb7f44a77\nunit.framework.dll /reference:C:\WINDOWS\Microsoft.NET\Framework\v2.0.50727\System.Data.dll /reference:C:\WINDOWS\Microsoft.NET\Framework\v2.0.50727\System.dll /reference:C:\WINDOWS\Microsoft.NET\Framework\v2.0.50727\System.Windows.Forms.dll /reference:C:\WINDOWS\Microsoft.NET\Framework\v2.0.50727\System.Xml.dll /reference:C:\work\webdriver-qs\build\jobbie\WebDriver.dll /reference:obj\Debug\Interop.SHDocVw.dll /debug+ /debug:full /optimize- /out:obj\Debug\Test.dll /target:library IeWrapperJavascriptTest.cs IeWrapperTest.cs Properties\AssemblyInfo.cs XPathTest.cs

file 'jobbie/build/webdriver-jobbie.dll' => FileList['jobbie/src/csharp/**/*.cs'] do
  csc :out => 'jobbie/build/webdriver-jobbie.dll', :sources => FileList['jobbie/src/csharp/**/*.cs'], 
      :references => ['C:\WINDOWS\Microsoft.NET\Framework\v2.0.50727\System.Data.dll', 'C:\WINDOWS\Microsoft.NET\Framework\v2.0.50727\System.dll', 'C:\WINDOWS\Microsoft.NET\Framework\v2.0.50727\System.Windows.Forms.dll', 'C:\WINDOWS\Microsoft.NET\Framework\v2.0.50727\System.Xml.dll', 'C:\WINDOWS\assembly\GAC\Microsoft.mshtml\7.0.3300.0__b03f5f7f11d50a3a\Microsoft.mshtml.dll', 'jobbie\lib\runtime\Interop.SHDocVw.dll']
  File.copy('jobbie/lib/runtime/Interop.SHDocVw.dll', 'jobbie/build')
end

def windows?
  return RUBY_PLATFORM =~ /win32/i
end

if windows? then
  Rake::Task[:build].enhance([:jobbie])
  Rake::Task[:test].enhance([:test_jobbie])
  Rake::Task[:test_jobbie].enhance([:jobbie])
  Rake::Task[:jobbie].enhance %w(jobbie/build/webdriver-jobbie.dll) do
    sh 'regasm jobbie/build/webdriver-jobbie.dll', :verbose => false
    sh 'regasm /regfile:jobbie/build/webdriver.reg jobbie/build/webdriver-jobbie.dll', :verbose => false    
  end
end

def javac(args)
  # mandatory args  
  out = (args[:jar] or raise 'javac: please specify the :jar parameter')
  source_patterns = (args[:sources] or raise 'javac: please specify the :sources parameter')
  sources = FileList.new(source_patterns)
  raise("No source files found at #{sources.join(', ')}") if sources.empty?
  
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
  compile_string += "-source 1.4 -target 1.4 "
  compile_string += "-g " if debug 
  compile_string += "-d #{target_dir} "

  compile_string += "-cp " + classpath.join(File::PATH_SEPARATOR) + " " if classpath.length > 1
  
  sources.each do |source| 
    compile_string += " #{source}"
  end
  
  sh compile_string, :verbose => false
  
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
  
  tests = FileList.new(source_dir + File::SEPARATOR + '**' + File::SEPARATOR + '*Test.java')
  tests.exclude '**/Abstract*'
  
  test_string = 'java '
  test_string += '-cp ' + classpath.join(File::PATH_SEPARATOR) + ' ' if classpath.length > 1
  test_string += '-Djava.library.path=' + args[:native_path].join(File::PATH_SEPARATOR) + ' ' unless args[:native_path].nil?
  test_string += 'junit.textui.TestRunner'
  tests.each do |test|
    name = test.sub("#{source_dir}/", '').gsub('/', '.')
    test_string += " #{name[0, name.size - 5]}"
  end
  
  result = sh test_string, :verbose => false
end

def csc(args)
  # mandatory args  
  out = (args[:out] or raise 'csc: please specify the :out parameter')
  source_patterns = (args[:sources] or raise 'csc: please specify the :sources parameter')
  sources = FileList.new(source_patterns)
  raise "No source files found at #{sources.join(', ')}" if sources.empty?

  # optional args
  unless args[:exclude].nil?
    args[:exclude].each { |pattern| sources.exclude(pattern) }
  end
  target = (args[:target] or 'library')
  debug = (args[:debug] or true)
  resources = args[:resources] ? FileList.new(args[:resources]) : []
  references = args[:references] ? FileList.new(args[:references]) : []
  extra_args = args[:extra_args]
  
  module_name = File.basename(out).sub(/\.dll$|\.exe$/, '')
  
  argfile = 'csc '
  argfile += "/out:#{out.gsub('/', '\\')} "
  argfile += "/target:#{target.gsub('/', '\\')} "
  argfile += '/nologo '
  argfile += "/debug#{debug ? '+' : '-'} "
  argfile += "/lib:jobbie\\build "
  resources.each do |res| 
    res_path = res.gsub('/', '\\')
    res_name = "#{module_name}.EmbeddedResources.#{File.basename(res_path)}"
    argfile += "/resource:#{res_path},#{res_name},public "
  end
  references.each { |ref| argfile += "/reference:#{ref.gsub('/', '\\')} " }
  sources.each { |src| argfile += "#{src.gsub('/', '\\')} " }
  argfile += extra_args unless extra_args.nil?
  
  puts "Compiling #{out}" if verbose
  sh "#{argfile}", :verbose => false
end
