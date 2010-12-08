
class DotNet < BaseGenerator
  def library(args)
    task args[:name].to_sym => args[:project] do
      if msbuild_installed?
        sh "msbuild #{args[:project]} /t:#{args[:target]}"
      else
        copy_prebuilt(args[:prebuilt], args[:name])
      end
    end
  end
end

def dotnet_library(args)
  DotNet.new().library(args)
end