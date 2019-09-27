require 'rbconfig'

# Platform checks

def windows?
  (/mswin|msys|mingw32/ =~ RbConfig::CONFIG['host_os']) != nil
end

def mac?
  (/darwin|mac os/ =~ RbConfig::CONFIG['host_os']) != nil
end

def linux?
  (/linux/ =~ RbConfig::CONFIG['host_os']) != nil
end

def cygwin?
  RUBY_PLATFORM.downcase.include?("cygwin")
end

def unix?
  linux? or mac?
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

PRESENT_CACHE = {}

# Checking for particular applications
def present?(arg)
  if PRESENT_CACHE.has_key?(arg)
    return PRESENT_CACHE[arg]
  end

  prefixes = ENV['PATH'].split(File::PATH_SEPARATOR)

  bool = prefixes.any? do |prefix|
    File.exists?(prefix + File::SEPARATOR + arg)
  end

  if !bool && mac?
    bool = File.exists?("/Applications/#{arg}.app")
  end

  PRESENT_CACHE[arg] = bool

  bool
end

def chrome?
  present?("chromedriver") || present?("chromedriver.exe")
end

def edge?
  present?("msedgedriver") || present?("msedgedriver.exe")
end

def opera?
  present?("opera") || present?("Opera")
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

def msbuild_installed?
  windows? && present?("msbuild.exe")
end

def vcs_revision
  @vcs_revision ||= `git rev-parse --short HEAD`
end
