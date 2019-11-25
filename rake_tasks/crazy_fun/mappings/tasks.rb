module CrazyFun
  module Mappings
    class Tasks
      include FileCopyHack

      def task_name(dir, name)
        return name if name.to_s.start_with? "//"

        # Strip any leading ".", "./" or ".\\"
        # I am ashamed
        use = dir.gsub(/\\/, '/').sub(/^\./, '').sub(/^\//, '')

        "//#{use}:#{name}"
      end

      def output_name(dir, name, suffix)
        t = task_name(dir, name)
        result = "build/" + (t.slice(2 ... t.length)) + "." + suffix
        result.gsub(":", "/")
      end

      def add_dependencies(target, dir, all_deps)
        return if all_deps.nil?

        Array(all_deps).each do |dep|
          target.enhance(dep_type(dir, dep))
        end
      end

      def copy_resources(dir, to_copy, out_dir)
        to_copy.each do |res|
          if res.is_a? Symbol
            out = Rake::Task[task_name(dir, res)].out
          elsif Rake::Task.task_defined?(res)
            task = Rake::Task[res]
            out = task.out
            while out.nil? && task.prerequisites.size == 1 do
              task = Rake::Task[task.prerequisites[0]]
              out = task.out
            end
          elsif res.is_a? Hash
            # Copy the key to "out_dir + value"
            res.each do |from, to|
              possible_task = task_name(dir, from)
              if Rake::Task.task_defined?(possible_task) and Rake::Task[possible_task].out
                target = Rake::Task[possible_task].out

                if File.directory? target
                  dest = File.join(out_dir, to)
                  mkdir_p dest
                  cp_r target, dest
                else
                  dest = File.join(out_dir, to)
                  mkdir_p File.dirname(dest)
                  cp_r target, dest, remove_destination: true
                end
              else
                tdir = to.gsub(/\/.*?$/, "")
                mkdir_p "#{out_dir}/#{tdir}"
                src = find_file(File.join(dir, from))

                if File.directory? src
                  mkdir_p "#{out_dir}/#{to}"
                else
                  mkdir_p File.join(out_dir, File.dirname(to))
                end
                cp_r src, "#{out_dir}/#{to}"
              end
            end

            next
          else
            if File.exists? res
              out = res
            else
              out = File.join(dir, res)
              return copy_all(dir, to_copy, out_dir) unless File.exists?(out)
            end
          end

          if out.is_a? Array
            out.each { |o| cp_r o, out_dir }
          else
            cp_r out, out_dir
          end
        end
      end

      def zip(src, dest)
        out = SeleniumRake::Checks.path_for(File.expand_path(dest))
        Dir.chdir(src) {
          # TODO(jari): something very weird going on here on windows
          # the 2>&1 is needed for some reason
          ok = system(%{jar cMf "#{out}" * 2>&1})
          ok or raise "could not zip #{src} => #{dest}"
        }
      end

      private

      def find_file(file)
        puts "Copying #{file}" if $DEBUG

        if Rake::Task.task_defined?(file) && Rake::Task[file].out
          # Grab the "out" of the task represented by this symbol
          file = Rake::Task[file].out.to_s
        end

        if File.exist?(file)
          file
        elsif File.exist?("build/#{file}")
          "build/#{file}"
        else
          fl = FileList.new(file).existing!
          return fl unless fl.empty?

          fl = FileList.new("build/#{file}").existing!
          return fl unless fl.empty?

          puts "Unable to locate #{file}"
          exit -1
        end
      end

      def copy_string(dir, src, dest)
        if Rake::Task.task_defined? src
          from = Rake::Task[src].out
        else
          from = to_filelist(dir, src)
        end

        cp_r from, to_dir(dest), :remove_destination => true
      end

      def copy_symbol(dir, src, dest)
        from = Rake::Task[task_name(dir, src)].out

        if File.directory? from
          cp_r from, to_dir(dest)
        else
          mkdir_p File.dirname(dest)
          cp from, dest
        end
      end

      def copy_array(dir, src, dest)
        src.each do |item|
          if item.is_a? Hash
            copy_hash(dir, item, dest)
          elsif item.is_a? Array
            # TODO: Is this correct here? Shouldn't we do +copy_array+ (Luke - Sep 2019')
            raise StandardError, "Undetermined type: #{item.class}"
          elsif item.is_a? String
            copy_string(dir, item, dest)
          elsif item.is_a? Symbol
            copy_symbol(dir, item, dest)
          else
            raise StandardError, "Undetermined type: #{item.class}"
          end
        end
      end

      def copy_hash(dir, src, dest)
        src.each do |key, value|
          if key.is_a? Symbol
            copy_symbol dir, key, SeleniumRake::Checks.path_for(File.join(dest, value))
          else
            from, to = File.join(dir, key), File.join(dest, value)
            cp_r from, to
          end
        end
      end

      def copy_all(dir, srcs, dest)
        if srcs.is_a? Array
          copy_array(dir, srcs, dest)
        elsif srcs.is_a? String
          copy_string(dir, srcs, dest)
        elsif srcs.is_a? Hash
          copy_hash(dir, srcs, dest)
        elsif srcs.is_a? Symbol
          copy_symbol(dir, srcs, dest)
        else
          raise StandardError, "Undetermined type: #{srcs.class}"
        end
      end

      def to_dir(name)
        mkdir_p name unless File.exists?(name)
        name
      end

      def dep_type(dir, dep)
        if dep.is_a? String
          if dep.start_with?("//")
            return [dep]
          else
            return to_filelist(dir, dep)
          end
        end

        return [task_name(dir, dep)] if dep.is_a? Symbol

        if dep.is_a? Hash
          all_deps = []
          dep.each do |k, v|
            # We only care about the keys
            all_deps += dep_type(dir, k)
          end
          return all_deps
        end

        raise "Unmatched dependency type: #{dep.class}"
      end

      def to_filelist(dir, src)
        str = dir + "/" + src
        FileList[str].collect do |file|
          SeleniumRake::Checks.path_for(file)
        end
      end

      def halt_on_error?
        [nil, 'true'].include?(ENV['haltonerror']) &&
            [nil, 'true'].include?(ENV['haltonfailure'])
      end

      def halt_on_failure?
        halt_on_error?
      end
    end
  end
end
