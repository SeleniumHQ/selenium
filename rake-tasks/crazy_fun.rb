require 'rake-tasks/crazy_fun/main.rb'
require 'rake-tasks/crazy_fun/main.rb'

module Rake
  class Task
    attr_accessor :out
  end
end

Rake.application.instance_variable_set("@name", "go")

class CrazyFun
  def initialize
    @mappings = {}
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
    if of.start_with? "build/"
      of = of[ 6 ... of.length ]
    end

    prebuilt_roots.each do |root|
      if root.split("/")[0] == of.split("/")[0]
        src = "#{root}/#{of.split('/')[1 .. -1].join('/')}".gsub("/", Platform.dir_separator)
      else
        src = "#{root}/#{of}".gsub("/", Platform.dir_separator)
      end
      
      if (File.exists? src)
        return src
      end
    end

    nil
  end

  def create_tasks(files)
    files.each do |f|
      puts "Parsing #{f}" if verbose
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
