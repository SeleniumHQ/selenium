require 'rake-tasks/crazy_fun/main.rb'

module Rake
  class Task
    attr_accessor :out
  end
end

class DetonatingHandler
  def handle(fun, dir, args)
#    raise "No longer handling: //#{dir}:#{args[:name]}"
  end
end

class CrazyFun
  def initialize
    @mappings = {}
    add_mapping('java_binary', DetonatingHandler.new)
    add_mapping('java_library', DetonatingHandler.new)
    add_mapping('java_test', DetonatingHandler.new)
  end

  def add_mapping(type_name, handler)
    if !@mappings.has_key? type_name
      @mappings[type_name] = []
    end

    @mappings[type_name].push handler
  end

  def prebuilt_roots
    @roots ||= []
  end

  def find_prebuilt(of)
    if of =~ %r"build([/\\])"
      of_parts = of.split($1)[1..-1]
    else
      of_parts = of.split(Platform.dir_separator)
    end

    prebuilt_roots.each do |root|
      root_parts = root.split("/")

      if root_parts.first == of_parts.first
        of_parts[0] = root
        src = of_parts.join("/")
      else
        src = "#{root}/#{of}"
      end

      if File.exists? src
        return src
      end
    end

    nil
  end

  def create_tasks(files)
    files.each do |f|
      puts "Parsing #{f}" if $DEBUG
      outputs = BuildFile.new().parse_file(f)
      outputs.each do |type|
        if !@mappings.has_key? type.name
          raise RuntimeError, "No mapping for type: " + type.name
        end

        mappings = @mappings[type.name]
        mappings.each do |mapping|
          mapping.handle(self, File.dirname(f), type.args)
        end
      end
    end
  end
end
