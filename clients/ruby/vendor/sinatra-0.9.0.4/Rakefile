require 'rubygems'
require 'rake/clean'
require 'fileutils'

task :default => :test

# SPECS ===============================================================

desc 'Run specs with story style output'
task :spec do
  pattern = ENV['TEST'] || '.*'
  sh "specrb --testcase '#{pattern}' --specdox -Ilib:test test/*_test.rb"
end

desc 'Run specs with unit test style output'
task :test do |t|
  sh "specrb -Ilib:test test/*_test.rb"
end

desc 'Run compatibility specs'
task :compat do |t|
  pattern = ENV['TEST'] || '.*'
  sh "specrb --testcase '#{pattern}' -Ilib:test compat/*_test.rb"
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
  "dist/sinatra-#{spec.version}" + ext
end

desc 'Build packages'
task :package => %w[.gem .tar.gz].map {|e| package(e)}

desc 'Build and install as local gem'
task :install => package('.gem') do
  sh "gem install #{package('.gem')}"
end

directory 'dist/'

file package('.gem') => %w[dist/ sinatra.gemspec] + spec.files do |f|
  sh "gem build sinatra.gemspec"
  mv File.basename(f.name), f.name
end

file package('.tar.gz') => %w[dist/] + spec.files do |f|
  sh <<-SH
    git archive \
      --prefix=sinatra-#{source_version}/ \
      --format=tar \
      HEAD | gzip > #{f.name}
  SH
end

# Rubyforge Release / Publish Tasks ==================================

desc 'Publish website to rubyforge'
task 'publish:doc' => 'doc/api/index.html' do
  sh 'scp -rp doc/* rubyforge.org:/var/www/gforge-projects/sinatra/'
end

desc 'Publish gem and tarball to rubyforge'
task 'publish:gem' => [package('.gem'), package('.tar.gz')] do |t|
  sh <<-end
    rubyforge add_release sinatra sinatra #{spec.version} #{package('.gem')} &&
    rubyforge add_file    sinatra sinatra #{spec.version} #{package('.tar.gz')}
  end
end

# Website ============================================================
# Building docs requires HAML and the hanna gem:
#   gem install mislav-hanna --source=http://gems.github.com

task 'doc'     => ['doc:api','doc:site']

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

def rdoc_to_html(file_name)
  require 'rdoc/markup/to_html'
  rdoc = RDoc::Markup::ToHtml.new
  rdoc.convert(File.read(file_name))
end

def haml(locals={})
  require 'haml'
  template = File.read('doc/template.haml')
  haml = Haml::Engine.new(template, :format => :html4, :attr_wrapper => '"')
  haml.render(Object.new, locals)
end

desc 'Build website HTML and stuff'
task 'doc:site' => ['doc/index.html', 'doc/book.html']

file 'doc/index.html' => %w[README.rdoc doc/template.haml] do |file|
  File.open(file.name, 'w') do |file|
    file << haml(:title => 'Sinatra', :content => rdoc_to_html('README.rdoc'))
  end
end
CLEAN.include 'doc/index.html'

file 'doc/book.html' => ['book/output/sinatra-book.html'] do |file|
  File.open(file.name, 'w') do |file|
    book_content = File.read('book/output/sinatra-book.html')
    file << haml(:title => 'Sinatra Book', :content => book_content)
  end
end
CLEAN.include 'doc/book.html'

file 'book/output/sinatra-book.html' => FileList['book/**'] do |f|
  unless File.directory?('book')
    sh 'git clone git://github.com/cschneid/sinatra-book.git book'
  end
  sh((<<-SH).strip.gsub(/\s+/, ' '))
    cd book &&
    git fetch origin &&
    git rebase origin/master &&
    thor book:build
  SH
end
CLEAN.include 'book/output/sinatra-book.html'

desc 'Build the Sinatra book'
task 'doc:book' => ['book/output/sinatra-book.html']

# Gemspec Helpers ====================================================

def source_version
  line = File.read('lib/sinatra/base.rb')[/^\s*VERSION = .*/]
  line.match(/.*VERSION = '(.*)'/)[1]
end

project_files =
  FileList[
    '{lib,test,compat,images}/**',
    'Rakefile', 'CHANGES', 'README.rdoc'
  ]
file 'sinatra.gemspec' => project_files do |f|
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
