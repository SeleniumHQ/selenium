require 'win32ole'

def kill_process(name)
  process_table.each{|process| 
    if process.name =~ Regexp.compile(name)
      puts "terminating #{process.caption} : #{process.commandLine} process"
      process.Terminate
      puts "#{process.name} process terminated"
    end
  }
end

def process_exists?(name)
  process_table.each{|process| return true if process.name =~ Regexp.compile(name) }
  return false
end

def process_table
  mgmt = WIN32OLE.connect('winmgmts:\\\\.')
  mgmt.InstancesOf("win32_process");
end
