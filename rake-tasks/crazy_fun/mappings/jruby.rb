require 'rake-tasks/crazy_fun/mappings/common'

class JRubyMappings
  def add_all(fun)
    fun.add_mapping("jruby_package", Package.new)
  end

  class Package < Tasks
    def handle(_fun, dir, args)
      task_name = task_name(dir, "jruby_package")

      jar_name = "jruby-complete-#{args[:version]}.jar"
      url = "https://repo1.maven.org/maven2/org/jruby/jruby-complete/#{args[:version]}/#{jar_name}"

      desc "Package JRuby #{args[:version]}"
      task task_name do
        require 'open-uri'

        Dir.chdir(dir) do
          puts "Downloading #{jar_name} from #{url}..."
          File.open(jar_name, "wb") do |write_file|
            open(url, "rb") do |read_file|
              write_file.write(read_file.read)
            end
          end

          puts "Installing gems..."
          args[:gems].map(&:first).each do |gem_name, gem_version|
            sh "java", "-jar", jar_name, "-S", "gem", "install", "-i", "./#{gem_name}", gem_name, "-v", gem_version
            sh "jar", "uf", jar_name, "-C", gem_name, "."
            rm_rf gem_name
          end

          puts "Bumping VERSION..."
          jruby_version = `java -jar #{jar_name} -version`.split("\n").first
          File.write('VERSION', "#{jruby_version}\n")

          mv jar_name, "jruby-complete.jar"
          puts "Done!"
        end
      end
    end
  end
end
