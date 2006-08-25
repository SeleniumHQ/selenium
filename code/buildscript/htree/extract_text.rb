require 'htree/text'
require 'htree/doc'
require 'htree/elem'

module HTree
  module Node
    def extract_text
      raise NotImplementedError
    end
  end

  class Location
    def extract_text
      to_node.extract_text
    end
  end

  # :stopdoc:
  module Container
    def extract_text
      Text.concat(*@children.map {|n| n.extract_text })
    end
  end

  module Leaf
    def extract_text
      Text.new('')
    end
  end

  class Text
    def extract_text
      self
    end
  end
  # :startdoc:
end
