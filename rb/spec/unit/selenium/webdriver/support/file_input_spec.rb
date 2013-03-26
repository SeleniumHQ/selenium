require File.expand_path("../../spec_helper", __FILE__)

module Selenium
  module WebDriver
    module Support

      describe FileInput do
        let(:file_input) {
          s = mock(Element, :tag_name => 'input')
          s.stub(:attribute).with(:type).and_return 'file'
          s.stub(:attribute).with(:multiple).and_return nil
          s
        }

        let(:multi_file_input) {
          s = mock(Element, :tag_name => 'input')
          s.stub(:attribute).with(:type).and_return 'file'
          s.stub(:attribute).with(:multiple).and_return "multiple"
          s
        }

        it 'raises ArgumentError if passed a non-input Element' do
          link = mock(Element, :tag_name => "a")

          lambda {
            FileInput.new link
          }.should raise_error(ArgumentError)
        end

        it 'raises ArgumentError if passed a non-file input Element' do
          link = mock(Element, :tag_name => "input")
          link.stub(:attribute).with(:type).and_return 'text'

          lambda {
            FileInput.new link
          }.should raise_error(ArgumentError)
        end

        it 'indicates whether a file_input is multiple correctly' do
          file_inputs = [
            mock(Element, :tag_name => "input"),
            mock(Element, :tag_name => "input"),
            mock(Element, :tag_name => "input"),
            mock(Element, :tag_name => "input")
          ]
          file_inputs.each { |f| f.stub(:attribute).with(:type).and_return 'file'}

          file_inputs[0].stub(:attribute).with(:multiple).and_return("false")
          file_inputs[1].stub(:attribute).with(:multiple).and_return(nil)
          file_inputs[2].stub(:attribute).with(:multiple).and_return("true")
          file_inputs[3].stub(:attribute).with(:multiple).and_return("multiple")

          FileInput.new(file_inputs[0]).should_not be_multiple
          FileInput.new(file_inputs[1]).should_not be_multiple
          FileInput.new(file_inputs[2]).should be_multiple
          FileInput.new(file_inputs[3]).should be_multiple
        end
        
        it 'allows one file to be attached to a non multiple file input' do
          filename = 'tmp/file1'
          file_input.should_receive(:send_keys).
                        with(filename).
                        once
          FileInput.new(file_input).attach_files(filename)
        end

        it 'allows multiple files to be attached to a multiple file input' do
          filenames = ['/tmp/file1', '/tmp/file2']
          multi_file_input.should_receive(:send_keys).
                         with(filenames[0],filenames[1]).
                         once

          FileInput.new(multi_file_input).attach_files(*filenames)
        end
        
        it 'allows Pathname convertible objects to be used' do
          files = [Tempfile.new('test'), Pathname.new('/tmp/file2')]
          filenames = [files[0].path.to_s, files[1].to_s]
          multi_file_input.should_receive(:send_keys).
                        with(filenames[0],filenames[1]).
                        once
          FileInput.new(multi_file_input).attach_files(files)
        end
        
        it 'does not allow multiple files to be attached to a single file input' do
          filenames = ['tmp/file1', '/tmp/file2']
          lambda {
            FileInput.new(file_input).attach_files(*filenames)
          }.should raise_error(ArgumentError)
        end
        
      end # FileInput

    end # Support
  end # WebDriver
end # Selenium
