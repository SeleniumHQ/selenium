require 'base64'

module Base64
  
  def self.strict_encode64(str)
    encode64(str).gsub(/\n/, '')
  end unless respond_to?(:strict_encode64) # added in 1.9
  
end