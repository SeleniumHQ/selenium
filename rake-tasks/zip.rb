def uber_jar(args)
  if !jar?
    puts "Unable to run uber_jar task"
    exit -1
  end
  
  out = "build/#{args[:out]}"
  
  file out => args[:src] + args[:deps] do
    puts "Building: #{args[:out]}"
    
    dir = "build/#{args[:name]}_temp"
    mkdir_p dir
    args[:src].each do |src|
      sh "cd #{dir} && jar xf ../../#{src}"
    end
    sh "cd #{dir} && jar cMf ../#{args[:out]} *"
    rm_rf dir
  end
  task args[:name] => out
end

def zip(args)
  if !jar?
    puts "Unable to run zip task: no jar find"
    exit -1
  end
  
  out = "build/#{args[:out]}"
  
  file out => args[:src] + args[:deps] do
    puts "Building #{args[:out]}"
    
    short_name = args[:out].sub(".zip", "")
    dir = "build/#{args[:name]}_temp/#{short_name}"
    mkdir_p dir
    args[:src].each do |src|
      if src =~ /\.jar$/
        cp src, dir
      end
    end
    sh "cd #{dir}/.. && jar cMf ../#{args[:out]} *"
    
    rm_rf "build/#{args[:name]}_temp"
  end
  task args[:name] => out
end