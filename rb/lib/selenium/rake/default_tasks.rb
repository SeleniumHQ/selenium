require 'selenium/rake/tasks'

Selenium::Rake::SeleniumServerControlStartTask.new do |rc|
  rc.timeout_in_seconds = 3 * 60
  rc.background = true
  rc.nohup = false
  rc.wait_until_up_and_running = true
  rc.additional_args << "-singleWindow"
end

Selenium::Rake::SeleniumServerStopTask.new

desc "Restart Selenium Server"
task :'selenium:server:restart' do
  Rake::Task[:'selenium:server:stop'].execute [] rescue nil
  Rake::Task[:'selenium:server:start'].execute []
end
