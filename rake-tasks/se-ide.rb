require 'rake-tasks/checks.rb'

namespace :se_ide do
  base_ide_dir = File.expand_path(File.dirname(Dir.glob("Rakefile")[0]))
  files = []

  task :setup_proxy do
    # create the content-files directory
    if File.directory? "ide/main/src/content-files"
      rm_r "ide/main/src/content-files"
    end
    mkdir "ide/main/src/content-files"
    
    if unix?
      # the files in core -- except for the scripts directory which already exists in the target
      ln_s Dir.glob(base_ide_dir + "/javascript/selenium-core/*").select { |fn| fn != base_ide_dir + "/javascript/selenium-core/scripts" },
           "ide/main/src/content/selenium-core"
      # and now the script dir
      ln_s Dir.glob(base_ide_dir + "/javascript/selenium-core/scripts/*").select { |fn| not [base_ide_dir + "/javascript/selenium-core/scripts/selenium-testrunner.js", base_ide_dir + "/javascript/selenium-core/scripts/user-extensions.js"].include?(fn)},
           "ide/main/src/content/selenium-core/scripts"
      # mkdir "ide/main/src/content-files"
      ln_s Dir.glob(base_ide_dir + "/javascript/selenium-core/scripts/selenium-testrunner.js"), "ide/main/src/content-files"
      # atoms
      cp "build/javascript/selenium-atoms/selenium-atoms.js", "ide/main/src/content/selenium-core/scripts/atoms.js"
      # sizzle
      # mkdir "ide/main/src/content/selenium-core/lib"
      cp "third_party/js/sizzle/sizzle.js", "ide/main/src/content/selenium-core/lib/sizzle.js"
    elsif windows?
      # the files in core -- except for the scripts directory which already exists in the target
      f = Dir.glob(base_ide_dir + "/javascript/selenium-core/*").select { |fn| fn != base_ide_dir + "/javascript/selenium-core/scripts" }
      f.each do |c|
        files << c.gsub(base_ide_dir + "/javascript/selenium-core/", "ide/main/src/content/selenium-core/")
        cp_r c, "ide/main/src/content/selenium", :remove_destination => true
      end

      # and now the script dir
      f = Dir.glob(base_ide_dir + "/javascript/selenium-core/scripts/*").select { |fn| ![base_ide_dir + "/javascript/selenium-core/scripts/selenium-testrunner.js", base_ide_dir + "/javascript/selenium-core/scripts/user-extensions.js"].include?(fn)}
      f.each do |c|
        files << c.gsub(base_ide_dir + "/javascript/selenium-core/scripts", "ide/main/src/content/selenium-core/scripts")
        cp c, "ide/main/src/content/selenium-core/scripts"
      end

      # atoms
      f = Dir.glob(base_ide_dir + "/build/javascript/selenium-atoms/selenium-atoms.js")
      f.each do |c|
        files << base_ide_dir + "/build/javascript/selenium-atoms/selenium-atoms.js"
        cp c, "ide/main/src/content/selenium-core/scripts/atoms.js"
      end
      
      # sizzle
      if File.directory? "ide/main/src/content/selenium-core/lib"
      	rm_r "ide/main/src/content/selenium-core/lib"
      end
      mkdir "ide/main/src/content/selenium-core/lib"

      f = Dir.glob(base_ide_dir + "/third_party/js/sizzle/sizzle.js")
      f.each do |c|
        files << base_ide_dir + "/ide/main/src/content/selenium-core/lib/sizzle.js"
        cp c, "ide/main/src/content/selenium-core/lib/sizzle.js"
      end
      
      # and lastly the scriptrunner
      f = Dir.glob(base_ide_dir + "/javascript/selenium-core/scripts/selenium-testrunner.js")
      f.each do |c|
        files << base_ide_dir + "/ide/main/src/content-files/selenium-testrunner.js"
        cp c, "ide/main/src/content-files"
      end

      # no, really, this is lastly; user-extensions.js
      f = Dir.glob(base_ide_dir + "/javascript/selenium-core/scripts/user-extensions.js")
      f.each do |c|
        files << base_ide_dir + "/ide/main/src/content-files/user-extensions.js"
        cp c, "ide/main/src/content-files"
      end
    end
    
    # jsunit
    if unix?
      ln_s Dir.glob(base_ide_dir + "/common/src/js/jsunit"), "ide/main/src/content/", :force => true
    elsif windows?
      f = Dir.glob(base_ide_dir + "/common/src/js/jsunit")
      f.each do |c|
        files << c.gsub(base_ide_dir + "/common/src/js/", "ide/main/src/content/")
        cp_r c, "ide/main/src/content/jsunit", :remove_destination => true
      end
    end
    
    # autocomplete
    # note: xpt files cannot be symlinks
    cp base_ide_dir + "/ide/main/prebuilt/main/SeleniumIDEGenericAutoCompleteSearch.xpt", "ide/main/src/components" unless File.exists?("ide/main/src/components/SeleniumIDEGenericAutoCompleteSearch.xpt")
    
    if windows?
      listoffiles = File.new(base_ide_dir + "/proxy_files.txt", "w")
      files.each do |f|
        listoffiles.write(f + "\r\n")
      end
      listoffiles.close()
    end
  end
  
  task :remove_proxy do
    if unix?
      Dir.glob("ide/**/*").select { |fn| rm fn if File.symlink?(fn) }
      rm_f "ide/main/src/content-files"
      rm "ide/main/src/content/selenium-core/scripts/atoms.js"
      rm "ide/main/src/content/selenium-core/lib/sizzle.js"
      rm_f "ide/main/src/content/selenium-core/lib"
    elsif windows?
      listoffiles = File.open(base_ide_dir + "/proxy_files.txt", "r")
      listoffiles.each do |f|
        if File.directory?(f.strip())
          rm_rf f.strip()
        elsif File.file?(f.strip())
          rm f.strip()
        end
      end
      listoffiles.close()
      rm base_ide_dir + "/proxy_files.txt"
    end
    rmdir "ide/main/src/content-files"
    rmdir "ide/main/src/content/selenium-core/lib"
    rm "ide/main/src/components/SeleniumIDEGenericAutoCompleteSearch.xpt"
  end

  task :assemble_ide_in_bamboo do
    src = "ide/bamboo/stage"
    dest = "ide/bamboo"
    name = "selenium-ide.xpi"
    
    cp "ide/install.rdf", src
    
    # copy-and-pasted from crazy_fun/mappings/common.rb
    Dir.chdir(src) {
      ok = system(%{jar cMf "../#{name}" * 2>&1})
      ok or raise "could not zip #{src} => #{dest}"
    }
  end

  # require 'rake/packagetask'  
  # Rake::PackageTask.new("selenium-ide", "1.2.0") do |p|
  #   p.package_dir = "build/ide/multi/"
  #   p.need_zip = true
  #   p.package_files.include("build/ide/multi/*")
  #   if unix?
  #     p.zip_command = "jar cMf"
  #   end
  #  end
end