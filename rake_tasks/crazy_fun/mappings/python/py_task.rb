module Python
  class PyTask < Tasks
    def get_resources(_browser, args)
      resources = []
      resources.concat(args[:resources]) if args[:resources]
      resources
    end
  end
end
