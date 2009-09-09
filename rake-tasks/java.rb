# Used to map a name to a set of dependencies
$targets = {}

def build_deps_(srcs)
  deps = []

  if (srcs.nil?) then return deps end

  srcs.each do |src|
    if ($targets[src]) then
     deps += $targets[src][:deps]
    else
     deps += FileList[src]
    end
  end
  deps
end

def jar(args)
  if !jar? then
    puts "Unable to locate 'jar' command"
    exit -1
  end
  
  out = "build/#{args[:out]}"
  
  # Build list of dependencies
  deps = build_deps_(args[:deps])

  file out => build_deps_(args[:src]) + deps do
    puts "Building: #{args[:name]}"
    mkdir_p "build"

    javac :jar => "build/#{args[:out]}",
          :sources => FileList[args[:src]],
          :classpath => deps,
          :resources => args[:resources]
  end
  task "#{args[:name]}" => out

  deps.push out
  $targets[args[:name].to_sym] = { :deps => deps }
  
  if args[:zip]
    zip(:name => args[:name] + "_zip",
        :src  => deps + [out],
        :deps => deps,
        :out  => args[:out].sub(".jar", ".zip"))
  end
end

def test_java(args)
  jar(args)

  file "#{args[:name]}_never_there" => [ "build/#{args[:out]}" ] do
    if (args[:run].nil? || args[:run])    
      tests = `jar tvf build/#{args[:out]}` 
      tests = tests.split /\n/
      tests.map! do |clazz|
        clazz =~ /.*\s+(.*TestSuite\.class)/ ? $1.gsub("/", ".").gsub(/\.class\s*$/, "") : nil
      end
      tests.compact!
      
      junit :tests => tests, :classpath => $targets[args[:name].to_sym][:deps], :main => args[:main], :args => args[:args]
    else 
      puts "Skipping tests for #{args[:name]}"
    end
  end
 
  task "#{args[:name]}" => "#{args[:name]}_never_there"
end

def javac(args)
  if !javac? then
    puts "Unable to locate 'javac'"
    exit -1
  end

  if !jar? then
    puts "Unable to locate 'jar'"
    exit -1
  end

  # mandatory args
  out = (args[:jar] or raise 'javac: please specify the :jar parameter')
  source_patterns = (args[:sources] or raise 'javac: please specify the :sources parameter')
  sources = FileList.new(source_patterns)
  raise("No source files found at #{sources.join(', ')}") if sources.empty?

  # optional args
  unless args[:exclude].nil?
    args[:exclude].each { |pattern| sources.exclude(pattern) }
  end
  debug = (args[:debug] or true)
  temp_classpath = (args[:classpath]) || []

  classpath = FileList.new
  temp_classpath.each do |item|
    classpath.add item
  end

  target_dir = "#{out}.classes"
  unless File.directory?(target_dir) 
	mkdir_p target_dir, :verbose => false 
  end
  
  compile_string = "javac "
  compile_string += "-source 5 -target 5 "
  compile_string += "-g " if debug
  compile_string += "-d #{target_dir} "

  compile_string += "-cp \"" + classpath.join(classpath_separator?) + "\" " if classpath.length > 0

  sources.each do |source|
    compile_string += " #{source}"
  end

  sh compile_string, :verbose => false

  # Copy the resources to the target_dir
  if !args[:resources].nil? 
    # Do we need to do a mapping?
    args[:resources].each do |res|
      if (res.kind_of? Hash) 
        res.each do |from, to|
          dir = to.gsub(/\/.*?$/, "")
          mkdir_p "#{target_dir}/#{dir}"
          cp_r find_file(from), "#{target_dir}/#{to}"
        end
      else
        if (res.index('/'))
          dir = res.gsub(/\.*?/, "")
          mkdir_p dir
        end
        cp_r find_file(res), "#{target_dir}/#{res}"
      end
    end
  end

  jar_string = "jar cf #{out} -C #{target_dir} ."
  sh jar_string, :verbose => false

  rm_rf target_dir, :verbose => false
end

def junit(args)
  classpath = args[:classpath]

  main = args[:main] || "junit.textui.TestRunner"

  test_string = 'java -Xmx128m -Xms128m '
  test_string += '-cp "' + classpath.join(classpath_separator?) + '" ' if classpath.length > 1
  test_string += main
  test_string += ' ' + args[:args] if args[:args]

  if args[:tests].length == 0
    result = sh test_string, :verbose => false
  else
    args[:tests].each do |test|
      puts "Running: #{test}\n"
      test_string += " #{test} "
      result = sh test_string, :verbose => false
    end
  end
  
  result
end
