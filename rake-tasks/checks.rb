# Platform checks

def windows?
  RUBY_PLATFORM.downcase.include?("win32")
end

def mac?
  RUBY_PLATFORM.downcase.include?("darwin")
end

def linux?
  RUBY_PLATFORM.downcase.include?("linux")
end

def cygwin?
  RUBY_PLATFORM.downcase.include?("cygwin")
end

def classpath_separator?
  if cygwin? then
    ";"
  else
    File::PATH_SEPARATOR
  end
end

def all?
  true
end

# Checking for particular applications 

def present?(arg)
  prefixes = ENV['PATH'].split(File::PATH_SEPARATOR)

  matches = prefixes.select do |prefix|
    File.exists?(prefix + File::SEPARATOR + arg)
  end

  matches.length > 0
end

def java?
  present?("java") || present?("java.exe")
end

def javac?
  present?("javac") || present?("javac.exe")
end

def jar?
  present?("jar") || present?("jar.exe")
end

# Think of the confusion if we called this "g++"
def gcc?
  linux? && present?("g++") 
end

def python?
  present?("python") || present?("python.exe")
end

def msbuild?
  windows? && present?("msbuild.exe")
end

def iPhoneSDKPresent?
  return false # For now
  
  return false unless mac? && present?('xcodebuild')
  begin
    sdks = sh "xcodebuild -showsdks 2>/dev/null", :verbose => false
    !!(sdks =~ /simulator2.2/)
    true
  rescue
    puts "Ouch"
    false
  end
end