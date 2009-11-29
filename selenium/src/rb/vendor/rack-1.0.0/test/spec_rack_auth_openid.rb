require 'test/spec'

begin
# requires the ruby-openid gem
require 'rack/auth/openid'

context "Rack::Auth::OpenID" do
  OID = Rack::Auth::OpenID
  host = 'host'
  subd = 'sub.host'
  wild = '*.host'
  path = 'path'
  long = 'path/long'
  scheme = 'http://'
  realm = scheme+host+'/'+path

  specify 'realm uri should be valid' do
    lambda{OID.new('/'+path)}.should.raise ArgumentError
    lambda{OID.new('/'+long)}.should.raise ArgumentError
    lambda{OID.new(scheme+host)}.should.not.raise
    lambda{OID.new(scheme+host+'/')}.should.not.raise
    lambda{OID.new(scheme+host+'/'+path)}.should.not.raise
    lambda{OID.new(scheme+subd)}.should.not.raise
    lambda{OID.new(scheme+subd+'/')}.should.not.raise
    lambda{OID.new(scheme+subd+'/'+path)}.should.not.raise
  end

  specify 'should be able to check if a uri is within the realm' do
  end

  specify 'return_to should be valid' do
    uri = '/'+path
    lambda{OID.new(realm, :return_to=>uri)}.should.raise ArgumentError
    uri = '/'+long
    lambda{OID.new(realm, :return_to=>uri)}.should.raise ArgumentError
    uri = scheme+host
    lambda{OID.new(realm, :return_to=>uri)}.should.raise ArgumentError
    uri = scheme+host+'/'+path
    lambda{OID.new(realm, :return_to=>uri)}.should.not.raise
    uri = scheme+subd+'/'+path
    lambda{OID.new(realm, :return_to=>uri)}.should.raise ArgumentError
    uri = scheme+host+'/'+long
    lambda{OID.new(realm, :return_to=>uri)}.should.not.raise
    uri = scheme+subd+'/'+long
    lambda{OID.new(realm, :return_to=>uri)}.should.raise ArgumentError
  end

  specify 'extensions should have required constants defined' do
    badext = Rack::Auth::OpenID::BadExtension
    ext = Object.new
    lambda{OID.new(realm).add_extension(ext)}.should.raise(badext)
    ext = Module.new
    lambda{OID.new(realm).add_extension(ext)}.should.raise(badext)
    ext::Request = nil
    lambda{OID.new(realm).add_extension(ext)}.should.raise(badext)
    ext::Response = nil
    lambda{OID.new(realm).add_extension(ext)}.should.raise(badext)
    ext::NS_URI = nil
    lambda{OID.new(realm).add_extension(ext)}.should.raise(badext)
  end

  specify 'extensions should have Request and Response defined and inherit from OpenID::Extension' do
    $-w, w = nil, $-w               # yuck
    badext = Rack::Auth::OpenID::BadExtension
    ext = Module.new
    ext::Request = nil
    ext::Response = nil
    ext::NS_URI = nil
    lambda{OID.new(realm).add_extension(ext)}.should.raise(badext)
    ext::Request = Class.new()
    lambda{OID.new(realm).add_extension(ext)}.should.raise(badext)
    ext::Response = Class.new()
    lambda{OID.new(realm).add_extension(ext)}.should.raise(badext)
    ext::Request = Class.new(::OpenID::Extension)
    lambda{OID.new(realm).add_extension(ext)}.should.raise(badext)
    ext::Response = Class.new(::OpenID::Extension)
    lambda{OID.new(realm).add_extension(ext)}.should.raise(badext)
    $-w = w
  end
end

rescue LoadError
  $stderr.puts "Skipping Rack::Auth::OpenID tests (ruby-openid 2 is required). `gem install ruby-openid` and try again."
end
