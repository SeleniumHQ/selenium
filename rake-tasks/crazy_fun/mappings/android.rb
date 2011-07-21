require 'rake-tasks/crazy_fun/mappings/common'
require 'rake-tasks/crazy_fun/mappings/java'

if Platform.jruby?
  require 'third_party/jruby/childprocess.jar' 
  require 'childprocess'
end

begin
  require 'psych'
rescue LoadError
  # only needed for Ruby 1.9.2
end

require 'yaml'


class AndroidMappings
  def add_all(fun)
    fun.add_mapping("android_r", Android::CheckResourcePreconditions.new)
    fun.add_mapping("android_r", Android::CreateResourceTask.new)

    fun.add_mapping("android_binary", Android::CheckPreconditions.new)
    fun.add_mapping("android_binary", Android::CreateTask.new)
    fun.add_mapping("android_binary", Android::CreateShortNameTask.new)
    fun.add_mapping("android_binary", Android::AddDependencies.new)
    fun.add_mapping("android_binary", Android::BuildApk.new)

    fun.add_mapping("android_test", Android::CheckTestPreconditions.new)
    fun.add_mapping("android_test", Android::CreateTask.new)
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

module SysProperties
  class AndroidSdk
    def read_properties()
      prop = YAML.load_file('./properties.yml')
      properties = prop["default"]["android"]
      if (prop[ENV["USER"]])
        properties = prop[ENV["USER"]]["android"]
      end
      properties
    end
  end
end

module Android
  $sys_properties = SysProperties::AndroidSdk.new
  $properties = $sys_properties.read_properties()
  $sdk_path = $properties["androidsdkpath"]
  $platform =  $properties["androidplatform"]
  $dx = File.join($sdk_path, "platforms", $platform, "tools", "dx")
  $adb = Platform.path_for(File.join($sdk_path, "platform-tools", "adb"))
  $aapt = Platform.path_for(File.join($sdk_path, "platforms", $platform, "tools", "aapt"))
  $builder = Platform.path_for(File.join($sdk_path, "tools", "apkbuilder"))
  $android = Platform.path_for(File.expand_path(File.join($sdk_path, "tools", "android")))
  $emulator = Platform.path_for(File.expand_path(File.join($sdk_path, "tools", "emulator")))

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

  class CheckResourcePreconditions
    def handle(fun, dir, args)
      raise StandardError, ":name must be set" if args[:name].nil?
      raise StandardError, ":manifest must be set" if args[:manifest].nil?
      raise StandardError, ":resource must be set" if args[:resource].nil?
      raise StandardError, ":out must be set" if args[:out].nil?
    end
  end

  class CreateTask < Tasks
    def handle(fun, dir, args)
      artifact_name = output_name(dir, args[:name], "apk")
      t_name = task_name(dir, args[:name])
      file artifact_name
      if (args[:binary])
        task t_name => [args[:binary]]
      end
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

  class BaseAndroid < Tasks
    def android_installed?()
      android = File.expand_path($android)
      File.exists?(android)
    end
  end

  class CreateResourceTask < BaseAndroid
    def handle(fun, dir, args)
      task_name = task_name(dir, args[:name])
      out = File.join(dir, args[:out], "R.java")
      file out => FileList[File.join(dir, args[:resource], "**", "*")] do
        if (android_installed?)
          android_jar = File.expand_path(File.join($sdk_path, "platforms", $platform, "android.jar"))
          manifest = File.join(dir, args[:manifest])
          resource = File.join(dir, args[:resource])
          java_r = File.join(dir, args[:out])
          cmd = "#{$aapt} package -f -M #{manifest} -S #{resource} -I #{android_jar} -J #{java_r}"
          puts "Building #{task_name} as #{out}"
          sh cmd
        end
      end
      task task_name => [out]
      Rake::Task[out].out = out
      Rake::Task[task_name].out = out
    end
  end

  class AddDependencies < Tasks
    def handle(fun, dir, args)
      task = Rake::Task[output_name(dir, args[:name], "apk")]
      add_dependencies(task, dir, args[:deps])
      add_dependencies(task, dir, args[:manifest])
    end
  end

  class BuildApk < BaseAndroid
    def handle(fun, dir, args)
      apk = output_name(dir, args[:name], "apk")
      file apk do
        if (android_installed?)
          sh "#{$android} update project -p android/"
          sh "cd android; ant debug; cd ../;"
          apk = File.join('build', 'android', 'android-server.apk')
          sh "cp android/bin/MainActivity-debug.apk #{apk}"
          copy_to_prebuilt(apk, fun)
        else
          puts apk
          puts "Android SDK not installed, copying from prebuilt."
          copy_prebuilt(fun, apk)
        end
      end
    end
  end

  class RunEmulator < BaseAndroid
    def handle(fun, dir, args)
      name = task_name(dir, args[:name]) + ":run"
      task name do
        STDOUT.sync = true
        jar_name = Rake::Task[task_name(dir, args[:name])].out
        apk = Rake::Task[args[:binary]].out
        puts apk

        cmd = "#{$adb} kill-server"  
        puts cmd
        sh cmd
       
        if windows? 
          # sh() wouldn't return on JRuby + Windows, work around by using childprocess
          proc = ChildProcess.build(Platform.path_for($adb), "start-server")
          proc.io.inherit!
          proc.start
          proc.poll_for_exit(10)
        else
          sh "#{$adb} start-server"
        end

        android_target = $properties["androidtarget"].to_s
        puts "Using Android target: " + android_target
        avdname = "debug_rake_#{android_target}"
        sh "echo no | #{$android} create avd --name #{avdname} --target #{android_target} -c 100M --force"

        emulator_image = "#{$platform}-userdata-qemu.img"

        puts "Starting emulator: #{$emulator}"

        # We create the emulator with a pre-generated emulator image.
        emulator_options = ""
        if !linux?
          emulator_options += "-no-boot-anim"
        end
        command = "#{$emulator} -avd #{avdname} -data build/android/#{emulator_image} -no-audio #{emulator_options}"
        puts "COMMAND: #{command}"
        Thread.new{ sh "#{$emulator} -avd #{avdname} -data build/android/#{emulator_image} -no-audio #{emulator_options}"}

        puts "Waiting for emulator to get started"
        sh "#{$adb} -e wait-for-device"
        sleep 10

        puts "Loading package into emulator: #{apk}"
        theoutput = `#{$adb} -e install -r #{apk}`
        count = 0
        while (not theoutput.to_s.match(/Success/)) and count < 20 do
          puts "Failed to load (emulator not ready?), retrying..."
          sleep 5
          count += 1
          theoutput = `#{$adb} -e install -r "#{apk}"`
        end
        puts "Loading complete."

        sh "#{$adb} shell am start -a android.intent.action.MAIN -n org.openqa.selenium.android.app/.MainActivity"
        sleep 5

        sh "#{$adb} forward tcp:8080 tcp:8080"
      end
    end
  end

  class Clean < BaseAndroid
    def intialize
      properties = read_properties()
      if (android_installed?)
        android_target =  "android-" << properties["androidtarget"].to_s
        avdname = "debug_rake_#{android_target}"
        sh "#{$android} delete avd -n #{avdname}"
      end
    end
  end
end
