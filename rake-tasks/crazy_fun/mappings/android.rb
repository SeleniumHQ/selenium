
require 'rake-tasks/crazy_fun/mappings/common'
require 'rake-tasks/crazy_fun/mappings/java'

class AndroidMappings
  def add_all(fun)
    fun.add_mapping("android_binary", Android::CheckPreconditions.new)
    fun.add_mapping("android_binary", Android::CreateTask.new)
    fun.add_mapping("android_binary", Android::CreateShortNameTask.new)
    fun.add_mapping("android_binary", Android::AddDependencies.new)
    fun.add_mapping("android_binary", Android::RunDx.new)
    fun.add_mapping("android_binary", Android::PackageAssets.new)
    fun.add_mapping("android_binary", Android::BuildApk.new)
    
    fun.add_mapping("android_test", Android::CheckTestPreconditions.new)
    fun.add_mapping("android_test", CrazyFunJava::CreateTask.new)
    fun.add_mapping("android_test", CrazyFunJava::CreateShortNameTask.new)
    fun.add_mapping("android_test", CrazyFunJava::AddDepedencies.new)
    fun.add_mapping("android_test", CrazyFunJava::TidyTempDir.new)
    fun.add_mapping("android_test", CrazyFunJava::Javac.new)
    fun.add_mapping("android_test", CrazyFunJava::CopyResources.new)
    fun.add_mapping("android_test", CrazyFunJava::Jar.new)
    fun.add_mapping("android_test", CrazyFunJava::TidyTempDir.new)
    fun.add_mapping("android_test", Android::RunEmulator.new)
    fun.add_mapping("android_test", CrazyFunJava::RunTests.new)    
  end
end

module Android
  class CheckPreconditions
    def handle(fun, dir, args)
      raise StandardError, ":name must be set" if args[:name].nil?
      raise StandardError, ":deps must be set" if args[:deps].nil?
    end
  end  

  class CheckTestPreconditions
    def handle(fun, dir, args)
      raise StandardError, ":name must be set" if args[:name].nil?
      raise StandardError, ":deps must be set" if args[:deps].nil?
      raise StandardError, ":srcs must be set" if args[:srcs].nil?
      raise StandardError, ":binary must be set" if args[:binary].nil?
    end
  end  

  class CreateTask < Tasks
    def handle(fun, dir, args)
      artifact_name = output_name(dir, args[:name], "apk")
      t_name = task_name(dir, args[:name])
      
      file artifact_name => [args[:binary]]
      
      desc "Compile an adroid apk"
      task t_name => [artifact_name]
      
      Rake::Task[t_name].out = artifact_name
    end
  end
  
  class CreateShortNameTask < Tasks
    def handle(fun, dir, args)
      name = task_name(dir, args[:name])

      if (name.end_with? "#{args[:name]}:#{args[:name]}")
        name = name.sub(/:.*$/, "")
        task name => task_name(dir, args[:name])

        if (!args[:srcs].nil?)
          Rake::Task[name].out = output_name(dir, args[:name], "apk")
        end
      end
    end
  end
  
  class AddDependencies < Tasks
    def handle(fun, dir, args)
      task = Rake::Task[output_name(dir, args[:name], "apk")]
      add_dependencies(task, dir, args[:deps])
    end
  end
  
  class BaseAndroid < Tasks
    def read_properties()
      prop = YAML.load_file( './properties.yml' )
      properties = prop["default"]["android"]
      if (prop[ENV["USER"]])
        properties = prop[ENV["USER"]]["android"];
      end
      properties
    end
    
    def android_installed?()
      properties = read_properties()
      
      sdk_path = properties["androidsdkpath"]
      platform =  properties["androidplatform"]
      
      dx = File.join(sdk_path, "platforms", platform, "tools", "dx")
      
      File.exists?(dx)
    end
    
    def dex_file(dir, name)
      t = task_name(dir, name);
      result = "build/" + (t.slice(2 ... t.length))
      File.join(result.gsub(":", "/"), "classes.dex")
    end
  end

  class RunDx < BaseAndroid
    def handle(fun, dir, args)
      apk = output_name(dir, args[:name], "apk")      
      dex_file = dex_file(dir, args[:name])
      
      task apk => [dex_file]
      
      file dex_file do
        properties = read_properties()
        
        sdk_path = properties["androidsdkpath"]
        platform =  properties["androidplatform"]
        dx = File.join(sdk_path, "platforms", platform, "tools", "dx")

        mkdir_p File.dirname(dex_file)

        if (!android_installed?) 
          File.open(dex_file, 'w') {|f| f.write('')}
        else
          dx += " -JXmx512M"
        
          if windows?
            dx = "java -Xmx512M -Djava.ext.dirs=#{File.join(sdk_path, "platforms", platform, "tools", "lib")} -jar #{File.join(sdk_path, "platforms", platform, "tools", "lib","dx.jar")} "
          end
        
          puts "Converting: #{task_name(dir, args[:name])} as #{dex_file}"
        
          cmd = "#{dx} --dex --output=#{dex_file} --core-library --positions=lines "
          Rake::Task[apk].prerequisites.each do |dep|
            if (Rake::Task.task_defined?(dep))
              dep = Rake::Task[dep].out
            end
            if (dep.to_s =~ /\.jar$/)
              cmd << " #{dep}"
            end
          end
          sh cmd
        end
      end
    end
  end
  
  class PackageAssets < BaseAndroid
    def handle(fun, dir, args)
      res_name = output_name(dir, args[:name], "ap_")
      
      file res_name do
        properties = read_properties()
        sdk_path = properties["androidsdkpath"]
        platform =  properties["androidplatform"]

        if (android_installed?)
          aapt = File.join(sdk_path, "platforms", platform, "tools", "aapt")
          android_jar = File.expand_path(File.join(sdk_path, "platforms", platform, "android.jar"))
          res = File.join(dir, args[:resource_dir])
          manifest = File.join(dir, args[:manifest])
      
          cmd = "#{aapt} package -f -M #{manifest} -S #{res} -I #{android_jar} -F #{res_name}"
          sh cmd
        else
          File.open(res_name, 'w') {|f| f.write('')}
        end
      end
      
      task output_name(dir, args[:name], "apk") => [res_name]
    end
  end
  
  class BuildApk < BaseAndroid
    def handle(fun, dir, args)
      res = output_name(dir, args[:name], "ap_")      
      apk = output_name(dir, args[:name], "apk")
      dex = dex_file(dir, args[:name])

      file apk do
        properties = read_properties()
        sdk_path = properties["androidsdkpath"]
        platform =  properties["androidplatform"]
        
        builder = File.join(sdk_path, "tools", "apkbuilder")
        
        puts "Building #{task_name(dir, args[:name])} as #{apk}"
        
        cmd = "#{builder} #{apk} -f #{dex} -z #{res} "
        Rake::Task[apk].prerequisites.each do |dep|
          if (Rake::Task.task_defined?(dep))
            dep = Rake::Task[dep].out
          end
          if (dep.to_s =~ /\.jar$/)
            cmd << "-rj #{dep} "
          end
        end
        
        if (android_installed?)
          sh cmd
        else
          puts apk
          copy_prebuilt(fun, apk)
        end
      end
    end
  end
  
  class RunEmulator < BaseAndroid
    def handle(fun, dir, args)
      
      name = task_name(dir, args[:name]) + ":run"
      
      task name do
        puts "Running emulator"
        
        properties = read_properties()
        sdk_path = properties["androidsdkpath"]
        platform =  properties["androidplatform"]
        
        adb = File.join(sdk_path, "tools", "adb")
        
        jar_name = Rake::Task[task_name(dir, args[:name])].out
        
        apk = Rake::Task[args[:binary]].out
        
        puts "Starting adb server: #{adb}"
        sh "#{adb} start-server"
        sleep 5

        android = File.expand_path(File.join(sdk_path, "tools", "android"))
        android_target =  "android-" << properties["androidtarget"].to_s
        avdname = "debug_rake_#{android_target}"
        sh "echo no | #{android} create avd --name #{avdname} --target #{android_target} -c 100M --force"

        emulator = File.expand_path(File.join(sdk_path, "tools", "emulator"))
        emulator_image = "#{platform}-userdata-qemu.img"
        
        puts "Starting emulator: #{emulator}"
        
        # We create the emulator with a pre-generated emulator image.
        Thread.new{ sh "#{emulator} -avd #{avdname} -data build/android/#{emulator_image} -no-audio -no-boot-anim"}

        puts "Waiting for emulator to get started"
        adb = File.join(sdk_path, "tools", "adb")
        sh "#{adb} -e wait-for-device"
        sleep 10

        puts "Loading package into emulator: #{apk}"
        
        theoutput = `#{adb} -e install -r #{apk}`
        count = 0
        while (not theoutput.to_s.match(/Success/)) and count < 20 do
          puts "Failed to load (emulator not ready?), retrying..."
          sleep 5
          count += 1
          theoutput = `#{adb} -e install -r "#{apk}"`
        end
        puts "Loading complete."
        
        sh "#{adb} shell am start -a android.intent.action.MAIN -n org.openqa.selenium.android.app/.MainActivity"
        sleep 5
        
        sh "#{adb} forward tcp:8080 tcp:8080"
      end
    end
  end  
end