module HTree
  class Name; include HTree end
  class Context; include HTree end

  # :stopdoc:
  module Tag; include HTree end
    class STag; include Tag end
    class ETag; include Tag end
  # :startdoc:

  module Node; include HTree end
    module Container; include Node end
      class Doc; include Container end
      class Elem; include Container end
    module Leaf; include Node end
      class Text; include Leaf end
      class XMLDecl; include Leaf end
      class DocType; include Leaf end
      class ProcIns; include Leaf end
      class Comment; include Leaf end
      class BogusETag; include Leaf end

  module Traverse end
  module Container::Trav; include Traverse end
  module Leaf::Trav; include Traverse end
  class Doc;       module Trav; include Container::Trav end; include Trav end
  class Elem;      module Trav; include Container::Trav end; include Trav end
  class Text;      module Trav; include Leaf::Trav      end; include Trav end
  class XMLDecl;   module Trav; include Leaf::Trav      end; include Trav end
  class DocType;   module Trav; include Leaf::Trav      end; include Trav end
  class ProcIns;   module Trav; include Leaf::Trav      end; include Trav end
  class Comment;   module Trav; include Leaf::Trav      end; include Trav end
  class BogusETag; module Trav; include Leaf::Trav      end; include Trav end

  class Location; include HTree end
  module Container::Loc end
  module Leaf::Loc end
  class Doc;       class Loc < Location; include Trav, Container::Loc end end
  class Elem;      class Loc < Location; include Trav, Container::Loc end end
  class Text;      class Loc < Location; include Trav, Leaf::Loc      end end
  class XMLDecl;   class Loc < Location; include Trav, Leaf::Loc      end end
  class DocType;   class Loc < Location; include Trav, Leaf::Loc      end end
  class ProcIns;   class Loc < Location; include Trav, Leaf::Loc      end end
  class Comment;   class Loc < Location; include Trav, Leaf::Loc      end end
  class BogusETag; class Loc < Location; include Trav, Leaf::Loc      end end

  class Error < StandardError; end
end

