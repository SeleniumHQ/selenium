module Python
  class PyTask < Tasks
    def get_resources(browser, args)
      resources = []
      resources.concat(args[:resources]) if args[:resources]
      browser_specific_resources = SeleniumRake::Browsers::BROWSERS[browser][:python][:resources]
      resources.concat(browser_specific_resources) if browser_specific_resources
      return resources
    end
  end
end
