# C related tasks

def spoof_outs

end

def dll(args)
  deps = build_deps_(args[:deps])
  
  args[:out].each do |result|
    out = "build/#{result}"
  
    file out => build_deps_(args[:src]) + deps do
      msbuild(args[:solution], out, args[:spoof])
    end
    task "#{args[:name]}" => out
  end
end

def msbuild(solution, out, spoof)
  if msbuild?
    if (!File.exists? out) then
      sh "MSBuild.exe #{solution} /verbosity:q /target:Rebuild /property:Configuration=Release /property:Platform=x64", :verbose => false
      sh "MSBuild.exe #{solution} /verbosity:q /target:Rebuild /property:Configuration=Release /property:Platform=Win32", :verbose => false
    end
  elsif !windows?
    dir = out.sub(/(.*)\/.*?$/, '\1')
    mkdir_p dir
    File.open("#{out}", 'w') {|f| f.write("")}
  else
    puts "Unable to build without msbuild.exe"
    exit -1
  end
end