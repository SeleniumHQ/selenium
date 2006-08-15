def kill_process(name)
  processes = `ps aux | grep #{name}`
  processes.split(/(\n|\r)+/).each do |process_line|
    next if process_line.strip.length == 0
    pid = process_line.split(/\s+/)[1]
    `kill #{pid}`
  end
end
