require 'rake-tasks/checks.rb'

namespace :se_ide do
  base_ide_dir = File.expand_path(File.dirname(Dir.glob("Rakefile")[0]))
  files = []

  task :setup_proxy do
    if unix?
      # the files in core -- except for the scripts directory which already exists in the target
      ln_s Dir.glob(base_ide_dir + "/common/src/js/core/*").select { |fn| fn != base_ide_dir + "/common/src/js/core/scripts" },
           "ide/src/extension/content/selenium"
      # and now the script dir
      ln_s Dir.glob(base_ide_dir + "/common/src/js/core/scripts/*").select { |fn| fn != base_ide_dir + "/common/src/js/core/scripts/selenium-testrunner.js"},
           "ide/src/extension/content/selenium/scripts"
    elsif windows?
      # the files in core -- except for the scripts directory which already exists in the target
      f = Dir.glob(base_ide_dir + "/common/src/js/core/*").select { |fn| fn != base_ide_dir + "/common/src/js/core/scripts" }
      f.each do |c|
        files << c.gsub(base_ide_dir + "/common/src/js/core/", "ide/src/extension/content/selenium/")
        cp_r c, "ide/src/extension/content/selenium", :remove_destination => true
      end

      # and now the script dir
      f = Dir.glob(base_ide_dir + "/common/src/js/core/scripts/*").select { |fn| fn != base_ide_dir + "/common/src/js/core/scripts/selenium-testrunner.js"}
      f.each do |c|
        files << c.gsub(base_ide_dir + "/common/src/js/core/scripts", "ide/src/extension/content/selenium/scripts")
        cp c, "ide/src/extension/content/selenium/scripts"
      end
    end
    
    # jsunit
    if unix?
      ln_s Dir.glob(base_ide_dir + "/common/src/js/jsunit"), "ide/src/extension/content/", :force => true
    elsif windows?
      f = Dir.glob(base_ide_dir + "/common/src/js/jsunit")
      f.each do |c|
        files << c.gsub(base_ide_dir + "/common/src/js/", "ide/src/extension/content/")
        cp_r c, "ide/src/extension/content/jsunit", :remove_destination => true
      end
    end
    
    # autocomplete
    # note: xpt files cannot be symlinks
    cp base_ide_dir + "/ide/prebuilt/SeleniumIDEGenericAutoCompleteSearch.xpt", "ide/src/extension/components" unless File.exists?("ide/src/extension/components/SeleniumIDEGenericAutoCompleteSearch.xpt")
    
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
    
    rm "ide/src/extension/components/SeleniumIDEGenericAutoCompleteSearch.xpt"
  end
end