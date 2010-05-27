# Used to map a name to a set of dependencies

class JavaGen < BaseGenerator
  def build_classpath_(dep_name)
    t = Rake::Task[dep_name.to_sym]
    if t.nil? 
      puts "No match for #{dep_name}"
      return []
    end

    classpath = []
    deps = t.deps || []
    deps += t.prerequisites

    deps.each do |dep|      
      if Rake::Task.task_defined?(dep.to_sym) then
        classpath += build_classpath_(dep)
      else
        classpath += FileList[dep]
      end
    end
    
    FileList[dep_name].each do |match|
      classpath.push match if match =~ /\.jar/
    end
    classpath.push t.out.to_s unless t.out.nil?
    classpath.sort.uniq
  end
  
  def out_path_(args)
    "build/#{args[:name]}.jar".to_sym
  end
  
  def jar(args)
    if !jar?
      puts "Unable to locate 'jar' command"
      exit -1
    end
    
    if args[:srcs].nil?
      puts "No srcs specified for #{args[:name]}"
    end

    out = out_path_(args)

    create_deps_(out_path_(args), args)

    t = Rake::Task[args[:name].to_sym]
    t.deps = args[:deps]
    t.out = out

    file out do
      # Build the classpath from the list of dependencies
      classpath = build_classpath_(args[:name].to_sym)

      temp = "#{out}_classes"
      mkdir_p temp

      puts "Building: #{args[:name]} as #{out}"

      if args[:srcs]
        # Remove anything that's not a JAR from the classpath
        classpath = classpath.collect do |path|
          path if path.to_s =~ /.jar$/
        end

        # avoid hitting Windows' command line argument limit by putting
        # the source list in a file
        src_file = "src.txt"
        File.open(src_file, "w") do |file|
          file << FileList[args[:srcs]].join(" ")
        end

        begin
          # Compile
          cmd = "javac -cp #{classpath.join(classpath_separator?)} -g -source 5 -target 5 -d #{temp} @#{src_file}"
          sh cmd
        ensure
          # Delete the temporary file
          File.delete src_file
        end
      end
      
      # TODO(simon): make copy_resource_ handle this for us
      # Copy resources over
      resources = args[:resources] || []
      resources.each do |res|
        if (res.kind_of? Symbol)
          res = Rake::Task[res].out
        end
        
        if (res.kind_of? Hash) 
          res.each do |from, to|
            Dir["#{temp}/#{to}/**.svn"].each { |file| rm_rf file }
            dir = to.gsub(/\/.*?$/, "")
            mkdir_p "#{temp}/#{dir}"
            
            begin
              if File.directory? from
                mkdir_p "#{temp}/#{to}"
              end
              cp_r find_file(from), "#{temp}/#{to}"
            rescue
              Dir["#{temp}/**/.svn"].each { |file| rm_rf file }
              cp_r find_file(from), "#{temp}/#{to}"
            end
          end
        else
          target = res.gsub(/build\//, '')
          copy_resource_(target, temp)
        end
      end

      Dir["#{temp}/**/.svn"].each { |file| rm_rf file }
      cmd = "cd #{temp} && jar cMf ../../#{out} *"
      sh cmd

      rm_rf temp
    end
    
    add_zip_task_(args)
  end
  
  def add_zip_task_(args)
    # Now to add the implicit targets
    out = out_path_(args)
    zip_out = out.to_s.sub(".jar", ".zip")
    task :"#{args[:name]}_zip" => FileList[zip_out]
    
    file zip_out => out do
      puts "Building: #{args[:name]}_zip as #{zip_out}"
      classpath = build_classpath_(args[:name].to_sym)
      temp = "#{zip_out}_temp"
      
      mkdir_p temp
      
      classpath.each do |f|
        copy_resource_(f, temp) if f =~ /\.jar/
      end
      
      sh "cd #{temp} && jar cMf ../../#{zip_out} *"
      
      rm_rf temp
    end
  end
  
  def run_test_(args)
    classpath = build_classpath_(args[:name])
    
    main = args[:main] || "junit.textui.TestRunner"
    
    test_string = 'java -Xmx128m -Xms128m '
    test_string += '-cp "' + classpath.join(classpath_separator?) + '" ' if classpath.length > 1

    if args[:system_properties] then
      args[:system_properties].each do |prop|
        test_string += "-D#{prop} "
      end
    end

    if ENV['REMOTE_JAVA_DEBUG_PORT'] then
      test_string += "-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=y,address=#{ENV['REMOTE_JAVA_DEBUG_PORT']} "
    end

    test_string += main
    test_string += ' ' + args[:args] if args[:args]

    if args[:tests].length == 0
      result = sh test_string
    else
      args[:tests].each do |test|
        puts "Running: #{test}\n"
        test_string += " #{test} "
        result = sh test_string
      end
    end

    result
  end
  
  def test(args)
    jar(args)
    
    out = out_path_(args)
    
    file "#{args[:name]}_never_there" => [ "#{out}" ] do
      if (args[:run].nil? || args[:run])    
        tests = `jar tvf #{out}` 
        tests = tests.split /\n/
        tests.map! do |clazz|
          clazz =~ /.*\s+(.*TestSuite\.class)/ ? $1.gsub("/", ".").gsub(/\.class\s*$/, "") : nil
        end
        tests.compact!

        if (!args[:test_suite].nil?)
          tests.reject! {|clazz| clazz !~ /#{args[:test_suite]}/}
        end

        args[:tests] = tests
        run_test_ args
      else 
        puts "Skipping tests for #{args[:name]}"
      end
    end

    task "#{args[:name]}" => "#{args[:name]}_never_there"
  end
  
  def uberjar(args)
    out = out_path_(args)
    
    create_deps_(out_path_(args), args)
    
    file out do
      puts "Building uber-jar: #{args[:name]} as #{out}"
      
      # Take each dependency, extract and then rezip
      temp = "#{out}_temp"
      mkdir_p temp
      
      all = []
      args[:deps].each do |d|
        all += build_classpath_(d)
      end
      all = all.sort.uniq.collect
      
      all.each do |dep|
        next unless dep.to_s =~ /\.jar$/
        next if (dep.to_s =~ /\lib\// or dep.to_s =~ /^third_party\//) and args[:no_libs] == true
        sh "cd #{temp} && jar xf ../../#{dep}"
      end      

      excludes = args[:exclude] || []
      excludes.each do |to_exclude|
        rm_rf FileList["#{temp}/#{to_exclude}"]
      end

      Dir["#{temp}/**/.svn"].each { |file| rm_rf file }

      if args[:main]
        # Read any MANIFEST.MF file into memory, ignoring the main class line
        manifest = []
        manifest.push "Main-Class: #{args[:main]}\n"
        manifest_file = "#{temp}/META-INF/MANIFEST.MF"
        if (!File.exists? manifest_file)
          mkdir_p "#{temp}/META-INF"
          touch(manifest_file)
        end
        File.open(manifest_file, "r") do |f|
          while (line = f.gets)
            manifest.push line unless line =~ /^Main-Class:/
          end
        end
        
        File.open(manifest_file, "w") do |f| f.write(manifest.join("")) end
      end
            
      sh "cd #{temp} && jar cMf ../../#{out} *"
      rm_rf temp
    end
    
    add_zip_task_(args)
    t = Rake::Task[args[:name].to_sym]
    t.deps = args[:deps]
    t.out = out    
  end
  
  def build_uberlist_(task_names, standalone)
    all = []
    tasks = task_names || []
    tasks.each do |dep|
      if Rake::Task.task_defined? dep.to_sym then
        t = Rake::Task[dep.to_sym]
      
        all.push t.out if t.out.to_s =~ /\.jar$/
      
        all += build_uberlist_(t.deps, standalone)
        all += build_uberlist_(t.prerequisites, standalone)
      elsif standalone
        all += FileList[dep]
      end
    end
    
    all.uniq
  end
  
  def war(args)
    out = "build/#{args[:name]}.war"
    
    deps = args[:deps] || []
    deps += args[:resources] || []
    deps.each do |dep|
      if (dep.is_a? Symbol)
        task args[:name] => [dep]
      elsif (dep.is_a? String)
        task args[:name] => FileList[dep]
      end
    end
    
    file out do
      temp = "#{out}_temp"
      mkdir_p "#{temp}/WEB-INF/lib"
      
      # Copy the resources. They're easy
      copy_resource_(args[:resources], temp) unless args[:resources].nil?
      
      # Now the JARs we depend on
      jars = build_classpath_(args[:name].to_sym).collect do |jar|
        jar.to_s =~ /\.jar/ ? jar : nil
      end
      copy_resource_(jars, "#{temp}/WEB-INF/lib")
      
      Dir["#{temp}/**/.svn"].each { |file| rm_rf file }
            
      sh "cd #{temp} && jar cMf ../../#{out} *"
      rm_rf temp
    end
        
    task args[:name] => out
    t = Rake::Task[args[:name]]
    t.out = out
    t.deps = args[:deps]
  end
end

def walk_war_deps_(dep, dest)
  puts "Dep: #{dep} is a #{dep.class}"
  if (dep.is_a? Symbol)
    t = Rake::Task[dep]
    copy_resource_(t.out, dest) if dep.to_s =~ /\.jar/
    walk_war_deps_(t.deps, dest)
    walk_war_deps_(t.prerequisites, dest)
  elsif dep.is_a? String
    copy_resource_(dep, dest) if dep.to_s =~ /\.jar/
  elsif dep.is_a? Array
    dep.each do |child|
      walk_war_deps_(child, dest)
    end
  end
end

def java_jar(args)
  JavaGen.new().jar(args)
end

def java_test(args)
  JavaGen.new().test(args)
end

def java_uberjar(args)
  JavaGen.new().uberjar(args)
end

def java_war(args)
  JavaGen.new().war(args)
end
