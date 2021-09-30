require "open-uri"
require "rake"

version = "9.2.8.0"
gems = {
  "inifile" => "3.0.0"
}

jar_name = ARGV.first
url = "https://repo1.maven.org/maven2/org/jruby/jruby-complete/#{version}/jruby-complete-#{version}.jar"

puts "Downloading #{jar_name} from #{url}..."
File.open(jar_name, "wb") do |write_file|
  open(url, "rb") do |read_file|
    write_file.write(read_file.read)
  end
end

puts "Installing gems..."
gems.each do |gem_name, gem_version|
  sh "java", "-jar", jar_name, "-S", "gem", "install", "-i", "./#{gem_name}", gem_name, "-v", gem_version
  sh "jar", "uf", jar_name, "-C", gem_name, "."
  rm_rf gem_name
end

puts "Bumping VERSION..."
jruby_version = `java -jar #{jar_name} -version`.split("\n").first
File.write("VERSION", "#{jruby_version}\n")

cp jar_name, File.realpath("third_party/jruby/jruby-complete.jar")
cp "VERSION", File.realpath("third_party/jruby/VERSION")

puts `ls -l third_party/jruby/`

puts "Done!"
