class String #:nodoc:
  def to_class_name
    gsub(/(^|_)(.)/) { $2.upcase }  
  end
end
