module Folder
  class CheckPreconditions < Tasks
    def handle(fun, dir, args)
      raise StandardError, ":name must be set" if args[:name].nil?
      raise StandardError, ":srcs or :deps must be set" if args[:srcs].nil? and args[:deps].nil?
      raise StandardError, ":out must be set" if args[:out].nil?
    end
  end
end
