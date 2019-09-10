namespace :side do
  task :atoms => [
    "//javascript/atoms/fragments:find-element",
  ] do
    # TODO: move directly to IDE's directory once the repositories are merged
    baseDir = "build/javascript/atoms"
    mkdir_p baseDir

    [
      Rake::Task["//javascript/atoms/fragments:find-element"].out,
    ].each do |atom|
      name = File.basename(atom)

      puts "Generating #{atom} as #{name}"
      File.open(File.join(baseDir, name), "w") do |f|
        f << "// GENERATED CODE - DO NOT EDIT\n"
        f << "module.exports = "
        f << IO.read(atom).strip
        f << ";\n"
      end
    end
  end
end
