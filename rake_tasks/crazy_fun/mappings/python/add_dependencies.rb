module Python
  class AddDependencies < PyTask
    def handle(fun, dir, args)
      (args[:browsers] || [:ff]).each do |browser|
        target = Rake::Task[task_name(dir, "#{args[:name]}_#{browser}")]
        add_dependencies(target, dir, args[:deps])
        resources = get_resources(browser, args)
        add_dependencies(target, dir, resources)
      end
    end
  end
end
