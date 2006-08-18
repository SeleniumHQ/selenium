require 'htree/modules'

module HTree::Container
  # +children+ returns children nodes as an array.
  def children
    @children.dup
  end
end
