require 'test/spec'
require 'stringio'
require 'rack/rewindable_input'

shared_context "a rewindable IO object" do
  setup do
    @rio = Rack::RewindableInput.new(@io)
  end
  
  teardown do
    @rio.close
  end
  
  specify "should be able to handle to read()" do
    @rio.read.should.equal "hello world"
  end
  
  specify "should be able to handle to read(nil)" do
    @rio.read(nil).should.equal "hello world"
  end
  
  specify "should be able to handle to read(length)" do
    @rio.read(1).should.equal "h"
  end
  
  specify "should be able to handle to read(length, buffer)" do
    buffer = ""
    result = @rio.read(1, buffer)
    result.should.equal "h"
    result.object_id.should.equal buffer.object_id
  end
  
  specify "should be able to handle to read(nil, buffer)" do
    buffer = ""
    result = @rio.read(nil, buffer)
    result.should.equal "hello world"
    result.object_id.should.equal buffer.object_id
  end
  
  specify "should rewind to the beginning when #rewind is called" do
    @rio.read(1)
    @rio.rewind
    @rio.read.should.equal "hello world"
  end
  
  specify "should be able to handle gets" do
    @rio.gets.should == "hello world"
  end
  
  specify "should be able to handle each" do
    array = []
    @rio.each do |data|
      array << data
    end
    array.should.equal(["hello world"])
  end
  
  specify "should not buffer into a Tempfile if no data has been read yet" do
    @rio.instance_variable_get(:@rewindable_io).should.be.nil
  end
  
  specify "should buffer into a Tempfile when data has been consumed for the first time" do
    @rio.read(1)
    tempfile = @rio.instance_variable_get(:@rewindable_io)
    tempfile.should.not.be.nil
    @rio.read(1)
    tempfile2 = @rio.instance_variable_get(:@rewindable_io)
    tempfile2.should.equal tempfile
  end
  
  specify "should close the underlying tempfile upon calling #close" do
    @rio.read(1)
    tempfile = @rio.instance_variable_get(:@rewindable_io)
    @rio.close
    tempfile.should.be.closed
  end
  
  specify "should be possibel to call #close when no data has been buffered yet" do
    @rio.close
  end
  
  specify "should be possible to call #close multiple times" do
    @rio.close
    @rio.close
  end
end

context "Rack::RewindableInput" do
  context "given an IO object that is already rewindable" do
    setup do
      @io = StringIO.new("hello world")
    end
    
    it_should_behave_like "a rewindable IO object"
  end
  
  context "given an IO object that is not rewindable" do
    setup do
      @io = StringIO.new("hello world")
      @io.instance_eval do
        undef :rewind
      end
    end
    
    it_should_behave_like "a rewindable IO object"
  end
  
  context "given an IO object whose rewind method raises Errno::ESPIPE" do
    setup do
      @io = StringIO.new("hello world")
      def @io.rewind
        raise Errno::ESPIPE, "You can't rewind this!"
      end
    end
    
    it_should_behave_like "a rewindable IO object"
  end
end
