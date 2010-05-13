require "rake-tasks/files.rb"

class OriginalMozilla < BaseGenerator
  def xpi(args)
    if !jar?
      puts "Unable to find jar. This is used to pack the archive"
      exit -1
    end
    
    create_deps_("build/#{args[:out]}", args)
    
    file "build/#{args[:out]}" do
      puts "Building #{args[:name]} as build/#{args[:out]}"
      # Set up a temporary directory
      target = "build/#{args[:out]}.temp"
      if (File.exists?(target))
        rm_rf target
      end
      mkdir_p target

      # Copy the sources into it
      FileList[args[:srcs]].each do |src|
        cp_r "#{src}", target
      end

      # Copy the resources into the desired location
      args[:resources].each do |res|
        copy_resource_(res, target)
      end

      # Package up into the output file
      rm_r Dir.glob("#{target}/**/.svn")
      sh "cd #{target} && jar cMf ../#{args[:out]} *"
      rm_r target
    end
  end
end


def xpi(args)
  OriginalMozilla.new().xpi(args)
end

