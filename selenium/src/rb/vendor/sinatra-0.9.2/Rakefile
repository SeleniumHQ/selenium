require 'rake/clean'
require 'rake/testtask'
require 'fileutils'

task :default => [:test, :compat]
task :spec => :test

# SPECS ===============================================================

task(:test) { puts "==> Running main test suite" }

Rake::TestTask.new(:test) do |t|
  t.test_files = FileList['test/*_test.rb']
  t.ruby_opts = ['-rubygems'] if defined? Gem
end

desc "Run < 0.9.x compatibility specs"
task :compat do
  begin
    require 'mocha'
    require 'test/spec'
    at_exit { exit 0 } # disable test-spec at_exit runner

    puts "==> Running compat test suite"
    Rake::TestTask.new(:compat) do |t|
      t.test_files = FileList['compat/*_test.rb']
      t.ruby_opts = ['-rubygems'] if defined? Gem
    end
  rescue LoadError
    warn 'Skipping compat tests. mocha and/or test-spec gems not installed.'
  end
end

# PACKAGING ============================================================

# Load the gemspec using the same limitations as github
def spec
  @spec ||=
    begin
      require 'rubygems/specification'
      data = File.read('sinatra.gemspec')
      spec = nil
      Thread.new { spec = eval("$SAFE = 3\n#{data}") }.join
      spec
    end
end

def package(ext='')
  "pkg/sinatra-#{spec.version}" + ext
end

desc 'Build packages'
task :package => %w[.gem .tar.gz].map {|e| package(e)}

desc 'Build and install as local gem'
task :install => package('.gem') do
  sh "gem install #{package('.gem')}"
end

directory 'pkg/'
CLOBBER.include('pkg')

file package('.gem') => %w[pkg/ sinatra.gemspec] + spec.files do |f|
  sh "gem build sinatra.gemspec"
  mv File.basename(f.name), f.name
end

file package('.tar.gz') => %w[pkg/] + spec.files do |f|
  sh <<-SH
    git archive \
      --prefix=sinatra-#{source_version}/ \
      --format=tar \
      HEAD | gzip > #{f.name}
  SH
end

# Rubyforge Release / Publish Tasks ==================================

desc 'Publish gem and tarball to rubyforge'
task 'release' => [package('.gem'), package('.tar.gz')] do |t|
  sh <<-end
    rubyforge add_release sinatra sinatra #{spec.version} #{package('.gem')} &&
    rubyforge add_file    sinatra sinatra #{spec.version} #{package('.tar.gz')}
  end
end

# Website ============================================================
# Building docs requires HAML and the hanna gem:
#   gem install mislav-hanna --source=http://gems.github.com

task 'doc'     => ['doc:api']

desc 'Generate Hanna RDoc under doc/api'
task 'doc:api' => ['doc/api/index.html']

file 'doc/api/index.html' => FileList['lib/**/*.rb','README.rdoc'] do |f|
  rb_files = f.prerequisites
  sh((<<-end).gsub(/\s+/, ' '))
    hanna --charset utf8 \
          --fmt html \
          --inline-source \
          --line-numbers \
          --main README.rdoc \
          --op doc/api \
          --title 'Sinatra API Documentation' \
          #{rb_files.join(' ')}
  end
end
CLEAN.include 'doc/api'

# Gemspec Helpers ====================================================

def source_version
  line = File.read('lib/sinatra/base.rb')[/^\s*VERSION = .*/]
  line.match(/.*VERSION = '(.*)'/)[1]
end

task 'sinatra.gemspec' => FileList['{lib,test,compat}/**','Rakefile','CHANGES','*.rdoc'] do |f|
  # read spec file and split out manifest section
  spec = File.read(f.name)
  head, manifest, tail = spec.split("  # = MANIFEST =\n")
  # replace version and date
  head.sub!(/\.version = '.*'/, ".version = '#{source_version}'")
  head.sub!(/\.date = '.*'/, ".date = '#{Date.today.to_s}'")
  # determine file list from git ls-files
  files = `git ls-files`.
    split("\n").
    sort.
    reject{ |file| file =~ /^\./ }.
    reject { |file| file =~ /^doc/ }.
    map{ |file| "    #{file}" }.
    join("\n")
  # piece file back together and write...
  manifest = "  s.files = %w[\n#{files}\n  ]\n"
  spec = [head,manifest,tail].join("  # = MANIFEST =\n")
  File.open(f.name, 'w') { |io| io.write(spec) }
  puts "updated #{f.name}"
end
