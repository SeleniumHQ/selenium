namespace :se_ide do
  base_ide_dir = File.expand_path(File.dirname(Dir.glob("Rakefile")[0]))
  
  task :setup_proxy do
    # the files in core -- except for the scripts directory which already exists in the target
    ln_s Dir.glob(base_ide_dir + "/common/src/js/core/*").select { |fn| fn != base_ide_dir + "/common/src/js/core/scripts" },
         "ide/src/extension/content/selenium"
    # and now the script dir
    ln_s Dir.glob(base_ide_dir + "/common/src/js/core/scripts/*").select { |fn| fn != base_ide_dir + "/common/src/js/core/scripts/selenium-testrunner.js"},
         "ide/src/extension/content/selenium/scripts"

    # jsunit
    ln_s Dir.glob(base_ide_dir + "/common/src/js/jsunit"), "ide/src/extension/content/", :force => true
    
    # autocomplete
    # note: xpt files cannot be symlinks
    cp base_ide_dir + "/ide/prebuilt/SeleniumIDEGenericAutoCompleteSearch.xpt", "ide/src/extension/components" unless File.exists?("ide/src/extension/components/SeleniumIDEGenericAutoCompleteSearch.xpt")
  end
  
  task :remove_proxy do
    Dir.glob("ide/**/*").select { |fn| rm fn if File.symlink?(fn) }

    rm "ide/src/extension/components/SeleniumIDEGenericAutoCompleteSearch.xpt"
  end
end