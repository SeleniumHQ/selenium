
class DotNet < BaseGenerator
  def library(args)
    task args[:name].to_sym => FileList[args[:srcs]] do
      if msbuild?
        sh "devenv #{args[:solution]} /project #{args[:project]} Release /rebuild", :verbose => false
      else
        copy_prebuilt(args[:prebuilt], args[:name])
      end
    end

    task args[:name].to_sym => args[:solution]
  end
end

def dotnet_library(args)
  DotNet.new().library(args)
end