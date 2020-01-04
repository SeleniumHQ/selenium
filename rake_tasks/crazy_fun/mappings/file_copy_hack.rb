module CrazyFun
  module Mappings
    module FileCopyHack
      def cp_r(src, dest, opts = {})
        super
      rescue => ex
        raise unless ex.message =~ /operation not permitted|Permission denied/i
        Dir["#{dest}/**/.svn"].each { |file| rm_rf file }

        # virtual box shared folders has a problem with some of the .svn files
        if ENV['USER'] == "vagrant" && opts.empty?
          sh "cp", "-r", src, dest
        else
          super(src, dest, opts)
        end
      end
    end
  end
end
