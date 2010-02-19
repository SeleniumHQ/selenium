namespace :websites
  task :addons do
    cp_r "websites/addons.seleniumhq.org/", "/var/www/domains/seleniumhq.org/addons/htdocs"
  end
end