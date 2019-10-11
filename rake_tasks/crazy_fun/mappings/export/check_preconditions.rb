module Export
  class CheckPreconditions < Tasks
    def handle(_fun, _dir, args)
      raise StandardError, ":name must be set" if args[:name].nil?
      raise StandardError, ":srcs must be set" if args[:srcs].nil?
    end
  end
end
