# frozen_string_literal: true

module SeleniumRake
  class CrazyFun
    def initialize
      @mappings = {}
      add_mapping('java_binary')
      add_mapping('java_library')
      add_mapping('java_test')
    end

    def add_mapping(type_name, handler = detonating_handler)
      @mappings[type_name] = [] unless @mappings.key?(type_name)

      @mappings[type_name].push handler
    end

    def prebuilt_roots
      @prebuilt_roots ||= []
    end

    def find_prebuilt(of)
      prebuilt_roots.each do |root|
        root_parts = root.split('/')
        src = generate_src(of, root_parts)

        return src if File.exist? src
      end

      nil
    end

    def create_tasks(files)
      files.each do |f|
        puts "Parsing #{f}" if $DEBUG
        outputs = BuildFile.new.parse_file(f)
        outputs.each do |type|
          crash_if_no_mapping_key(type)

          mappings = @mappings[type.name]
          mappings.each do |mapping|
            mapping.handle(self, File.dirname(f), type.args)
          end
        end
      end
    end

    private

    def detonating_handler
      SeleniumRake::DetonatingHandler.new
    end

    def generate_src(of, root_parts)
      if root_parts.first == of_parts(of).first
        of_parts(of)[0] = root
        of_parts(of).join('/')
      else
        "#{root}/#{of}"
      end
    end

    def of_parts(of)
      @of_parts ||=
        if of =~ %r{build([/\\])}
          of.split(Regexp.last_match(1))[1..-1]
        else
          of.split(Platform.dir_separator)
        end
    end

    def crash_if_no_mapping_key(type)
      raise "No mapping for type #{type.name}" unless @mappings.key?(type.name)
    end
  end
end
