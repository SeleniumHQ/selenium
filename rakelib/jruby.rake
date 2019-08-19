require 'open-uri'

jruby_version = "9.2.8.0"
jruby_gems = {
  "inifile" => "3.0.0"
}

namespace :jruby do
  desc "Update jruby version"
  task :update do
    jar_name = "jruby-complete-#{jruby_version}.jar"
    url = "https://repo1.maven.org/maven2/org/jruby/jruby-complete/#{jruby_version}/#{jar_name}"

    Dir.chdir('third_party/jruby') do
      puts "Downloading #{jar_name} from #{url}..."
      File.open(jar_name, "wb") do |write_file|
        open(url, "rb") do |read_file|
          write_file.write(read_file.read)
        end
      end

      puts "Installing gems..."
      jruby_gems.each do |gem_name, gem_version|
        sh "java", "-jar", jar_name, "-S", "gem", "install", "-i", "./#{gem_name}", gem_name, "-v", gem_version
        sh "jar", "uf", jar_name, "-C", gem_name, "."
        rm_rf gem_name
      end

      puts "Bumping VERSION..."
      version = `java -jar #{jar_name} -v`.split("\n").first
      File.write('VERSION', "#{version}\n")

      mv jar_name, "jruby-complete.jar"
      puts "Done!"
    end
  end
end
