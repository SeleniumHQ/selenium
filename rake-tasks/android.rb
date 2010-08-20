def android_rjava()  
  puts "Generate R.java at: #{$avdname}"
  mkdir_p $java_r, :verbose => false
  cmd = "#{$aapt} package -f -M #{$manifest} -S #{$resource} -I #{$androidjar} -J #{$java_r}"
  sh cmd, :verbose => false
end

def build_filelist_(dep_name, recursive)
  t = Rake::Task[dep_name.to_sym]
  if t.nil? 
    puts "No match for #{dep_name}"
    return []
  end

  files = []
  deps = t.deps || []
  deps += t.prerequisites

  deps.each do |dep|      
    if Rake::Task.task_defined?(dep.to_sym) then
      if recursive then
        files += build_filelist_(dep, recursive)
      else
        d = Rake::Task[dep.to_sym]
        files.push d.out.to_s unless d.out.nil?
      end
        
    else
      FileList[dep].each do |match|
        files.push match if match =~ /\.jar$/
      end
    end
  end
    
  FileList[dep_name].each do |match|
    files.push match if match =~ /\.jar$/
  end
  files.push t.out.to_s unless t.out.nil?
  return files.sort.uniq
end

def unpack_dependencies(args)
  puts "Unpacking dependencies..."
  mkdir_p $gen_classes, :verbose => false
  
  all = []
   args[:deps].each do |d|
     all += build_filelist_(d, false)
  end
  all = all.sort.uniq.collect
  FileList[File.join("third_party", "java", "jetty", "jetty-6.1.9.jar"),
           File.join("third_party", "java", "jetty", "jetty-util-6.1.9.jar"),
           File.join("third_party", "java", "servlet-api", "servlet-api-2.5-6.1.9.jar"),
           File.join("third_party", "java", "guava-libraries", "guava-r06.jar"),
           File.join("build", "remote", "*", "*.jar"),
           File.join("build", "remote", "server", "src", "java", "org", "openqa", "jetty.jar"),
           File.join("build", "common", "common.jar"),
           File.join("build", "support", "support.jar")].each do |match|
      all.push match
  end
  
  all.each do |dep|
    puts "Unpacking dependency #{dep}"
    next unless dep.to_s =~ /\.jar$/
    sh "cd #{$gen_classes} && jar xf ../../../../#{dep}", :verbose => true
  end
end


def android_java(args)
  puts "Building: #{args[:name]}"
  
  mkdir_p $classes, :verbose => true

  if args[:srcs].nil?
    puts "No srcs specified for #{args[:name]}"
  end
  
  # building classpath
  all = []
   args[:deps].each do |d|
     all += build_filelist_(d, true)
  end
  all = all.sort.uniq.collect
  FileList[File.join("third_party", "java", "jetty", "jetty-6.1.9.jar"),
           File.join("third_party", "java", "jetty", "jetty-util-6.1.9.jar"),
           File.join("third_party", "java", "servlet-api", "servlet-api-2.5-6.1.9.jar"),
           File.join("third_party", "java", "guava-libraries", "guava-r06.jar"),
           File.join("build", "remote", "*", "*.jar"),
           File.join("build", "remote", "server", "src", "java", "org", "openqa", "jetty.jar"),
           File.join("build", "common", "common.jar"),
           File.join("build", "support", "support.jar")].each do |match|
    all.push match
  end
  all.push $androidjar
  
  if args[:srcs]
    # avoid hitting Windows' command line argument limit by putting
    # the source list in a file
    src_file = "src.txt"
    File.open(src_file, "w") do |file|
      file << FileList[args[:srcs]].join(" ")
      file << " #{$java_r}/R.java"
    end

    begin
      # Compile
      cmd = "javac -cp #{all.join(classpath_separator?)} -g -source 5 -target 5 -d #{$classes} @#{src_file}"
      sh cmd, :verbose => true
    ensure
      # Delete the temporary file
      File.delete src_file
    end
  end
end

# Generated Android bytecode from .class files. Converts the targets to Dalvik
# executable format (.dex) so they can run on Android platform.
def run_dx(args)
  puts "Running DX utility"
    outfile = File.expand_path(File.join("android", "server", "build", "classes.dex"))
    cmd = "#{$dx} --dex --output=#{outfile} --core-library --positions=lines "
    cmd += File.expand_path(File.join("android", "server", "build", "classes"))+" " 
    cmd += File.expand_path(File.join("android", "server", "build", "generated-classes"))
    sh cmd, :verbose => true
end

def pack_resources(args)
  puts "Packaging Assets and Jars"
  cmd = "#{$aapt} package -f -M #{$manifest} -S #{$resource} -I #{$androidjar} -F #{$resname}"
  sh cmd, :verbose => true
  mkdir_p "build/android/server"
  sh "jar cMf build/android/server/server.jar -C android/server/build/classes .", :verbose => true

end

def build_apk(args)
  puts "Build debug self signed for device"
  cmd = "#{$apkbuilder} #{$apkfile} -f #{$dexfile} -rj #{$lib_jetty} -rj #{$lib_jetty_util} -rj #{$lib_servlet_api} -rj #{$lib_google_collect} -rj #{$lib_remote_server_jetty} -rj #{$lib_remote_server} -rj #{$lib_remote_common} -rj #{$lib_remote_client} -rj #{$lib_common} -rj #{$lib_support} -z #{$resname}"
  sh cmd, :verbose => true
end

def install_application()
  puts "Install APK file"
  sh "#{$adb} install -r #{$apkfile}", :verbose => true
end 

def start_application()
  sh "#{$adb} shell am start -a android.intent.action.MAIN -n org.openqa.selenium.android.app/.MainActivity"
  sleep 5
end 

def run_emulator()
  puts "Starting adb server... #{$adb}"
  sh "#{$adb} start-server", :verbose => true
  sleep 5

  # Copy the userdate-qemu image to the output folder
  #sh "cp android/emulator/pregenerated/#{$androidplatform}/userdata-qemu.img build/#{$emulator_image}"

  # puts "Creating Android Virtual Device... #{$android}"
  sh "echo no | #{$android} create avd --name #{$avdname} --target #{$androidtarget} -c 100M --force", :verbose => true

  puts "Starting emulator... #{$emulator}"
  # We create the emulator with a pre-generated emulator image.
  Thread.new{ sh "#{$emulator} -avd #{$avdname} -data build/android/#{$emulator_image} -no-audio -no-boot-anim", :verbose => true }

  puts "Waiting for emulator to get started..."
  $stdout.flush
  sh "#{$adb} -e wait-for-device", :verbose => true
  sleep 10

  puts "Loading package into emulator..."
  theoutput = `#{$adb} -e install -r #{$apkfile}`
  count = 0
  while (not theoutput.to_s.match(/Success/)) and count < 20 do
    puts "Failed to load (emulator not ready?), retrying..."
    $stdout.flush
    sleep 5
    count += 1
    theoutput = `#{$adb} -e install -r "#{$apkfile}"`
  end
  puts "Loading complete."
end

def clean_android_env()
  sh "#{$android} delete avd -n #{$avdname}"
end

def android_sdk_init() 
  prop = YAML.load_file( './properties.yml' )
  properties = prop["default"]["android"]
  if (prop[ENV["USER"]])
    properties = prop[ENV["USER"]]["android"];
  end

  # Basic Android confiration
  $androidsdkpath = properties["androidsdkpath"]
  $androidtarget =  "android-" << properties["androidtarget"].to_s
  $androidplatform =  properties["androidplatform"]

  # Targets
  $apkfile = File.expand_path(File.join("build", "android-server.apk"))
  $resname = File.expand_path(File.join("android", "server", "build", "WebDriver.ap_"))
  $avdname = "debug_rake_#{$androidtarget}"

  # Tools
  $apkbuilder = File.join($androidsdkpath, "tools", "apkbuilder")
  $adb = File.join($androidsdkpath, "tools", "adb")
  $aapt = File.join($androidsdkpath, "platforms", $androidplatform, "tools", "aapt")
  $dx = File.join($androidsdkpath, "platforms", $androidplatform, "tools", "dx")

  $android = File.expand_path(File.join($androidsdkpath, "tools", "android"))
  $emulator = File.expand_path(File.join($androidsdkpath, "tools", "emulator"))
  $emulator_image = "#{$androidplatform}-userdata-qemu.img"

  $resource = File.expand_path(File.join("android", "server", "res"))
  $lib_jetty = File.expand_path(File.join("third_party", "java", "jetty", "jetty-6.1.9.jar"))
  $lib_jetty_util = File.expand_path(File.join("third_party", "java", "jetty", "jetty-util-6.1.9.jar"))
  $lib_servlet_api = File.expand_path(File.join("third_party", "java", "servlet-api", "servlet-api-2.5-6.1.9.jar"))
  $lib_google_collect = File.expand_path(File.join("third_party", "java", "guava-libraries", "guava-r06.jar"))
  $lib_remote_server_jetty = File.expand_path(File.join("build", "remote", "server", "src", "java", "org", "openqa", "jetty.jar"))
  $lib_remote_server = File.expand_path(File.join("build", "remote", "server", "server.jar"))
  $lib_remote_common = File.expand_path(File.join("build", "remote", "common", "common.jar"))
  $lib_remote_client = File.expand_path(File.join("build", "remote", "client", "client.jar"))
  $lib_common = File.expand_path(File.join("build", "common", "common.jar"))
  $lib_support = File.expand_path(File.join("build", "support", "support.jar"))
  $src_folder = File.expand_path(File.join("android", "server", "src"))
  $manifest = File.expand_path(File.join("android", "server", "AndroidManifest.xml"))
  $java_r = File.expand_path(File.join("android", "server", "gen", "org", "openqa", "selenium", "android", "app"))
  $dexfile = File.expand_path(File.join("android", "server", "build", "classes.dex"))
  $androidjar = File.expand_path(File.join($androidsdkpath, "platforms", $androidplatform, "android.jar"))
  $classes = File.expand_path(File.join("android", "server", "build", "classes"))
  $gen_classes = File.expand_path(File.join("android", "server", "build", "generated-classes"))

  if windows?
    $apkbuilder=$apkbuilder.gsub(/\//,"\\")
    #Set Xmx 
    $dx="java -Xmx256M -Djava.ext.dirs=#{File.join($androidsdkpath, "platforms", $androidplatform, "tools", "lib")} -jar #{File.join($androidsdkpath, "platforms", $androidplatform, "tools", "lib","dx.jar")} "
    $android=$android.gsub(/\//,"\\")
    $adb=$adb.gsub(/\//,"\\")
  end
end

def android_build(args)
  android_sdk_init()
  android_rjava()
  unpack_dependencies(args)
  android_java(args)
  run_dx(args)
  pack_resources(args)
  build_apk(args)
end


def add_port_redir()
  sh "#{$adb} forward tcp:8080 tcp:8080", :verbose => true
end

