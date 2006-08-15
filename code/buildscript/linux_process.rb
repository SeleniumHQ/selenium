def kill_process(name)
  process_line = `ps aux | grep #{name}`
  pid = process_line.split(/\s+/)[1]
  `kill #{pid}`
end
