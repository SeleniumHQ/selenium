require 'htree/modules'

module HTree
  # :stopdoc:
  def HTree.with_frozen_string_hash
    if Thread.current[:htree_frozen_string_hash]
      yield
    else
      begin
        Thread.current[:htree_frozen_string_hash] = {}
        yield
      ensure
        Thread.current[:htree_frozen_string_hash] = nil
      end
    end
  end

  def HTree.frozen_string(str)
    if h = Thread.current[:htree_frozen_string_hash]
      if s = h[str]
        s
      else
        str = str.dup.freeze unless str.frozen?
        h[str] = str
      end
    else
      str = str.dup.freeze unless str.frozen?
      str
    end
  end
  # :startdoc:
end
