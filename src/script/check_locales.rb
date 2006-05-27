#!/usr/bin/env ruby
#
# A script that checks if there are any missing properties in any locale.
#

require 'pathname'

def parse_key(filename, line)
  if line =~ %r{^<!ENTITY ([a-z0-9_\.-]+) ".*?">\s*}i
    $1
  elsif line =~ %r{^([a-z0-9_\.-]+)=}i
    $1
  elsif line =~ /^\s*$/
    nil
  else
    raise "parse error: file=#{filename}, line=#{line}"
  end
end

['selenium-ide.dtd', 'options.dtd', 'selenium-ide.properties'].each do |filename|
  orig_keys = []
  File.open("locale/en-US/#{filename}") do |f|
    f.each_line { |line| orig_keys << parse_key(filename, line) }
  end
  orig_keys.delete nil
  Pathname.glob("locale/*/#{filename}") do |pathname|
    keys = []
    pathname.each_line { |line| keys << parse_key(pathname, line) }
    raise "missing property in #{pathname}: #{orig_keys - keys}" unless (orig_keys - keys).empty?
  end
end
