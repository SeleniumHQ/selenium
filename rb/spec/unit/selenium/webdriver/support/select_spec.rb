require File.expand_path("../../spec_helper", __FILE__)

module Selenium
  module WebDriver
    module Support

      describe Select do
        let(:select) {
          mock(Element, :tag_name => 'select')
        }

        let(:multi_select) {
          s = mock(Element, :tag_name => 'select')
          s.stub(:attribute).with(:multiple).and_return "multiple"

          s
        }

        it 'raises ArgumentError if passed a non-select Element' do
          link = mock(Element, :tag_name => "a")

          lambda {
            Select.new link
          }.should raise_error(ArgumentError)
        end

        it 'indicates whether a select is multiple correctly' do
          selects = [
            mock(Element, :tag_name => "select"),
            mock(Element, :tag_name => "select"),
            mock(Element, :tag_name => "select"),
            mock(Element, :tag_name => "select")
          ]

          selects[0].stub(:attribute).with(:multiple).and_return("false")
          selects[1].stub(:attribute).with(:multiple).and_return(nil)
          selects[2].stub(:attribute).with(:multiple).and_return("true")
          selects[3].stub(:attribute).with(:multiple).and_return("multiple")

          Select.new(selects[0]).should_not be_multiple
          Select.new(selects[1]).should_not be_multiple
          Select.new(selects[2]).should be_multiple
          Select.new(selects[3]).should be_multiple
        end

        it 'returns all options' do
          options = []

          multi_select.should_receive(:find_elements).
                         with(:tag_name, 'option').
                         once.
                         and_return(options)

          Select.new(multi_select).options.should eql(options)
        end

        it 'returns all selected options' do
          bad_option  = mock(Element, :selected? => false)
          good_option = mock(Element, :selected? => true)

          multi_select.should_receive(:find_elements).
                         with(:tag_name, 'option').
                         once.
                         and_return([bad_option, good_option])

          opts = Select.new(multi_select).selected_options

          opts.size.should == 1
          opts.first.should == good_option
        end

        it 'returns the first selected option' do
          first_option  = mock(Element, :selected? => true)
          second_option = mock(Element, :selected? => true)

          multi_select.should_receive(:find_elements).
                         with(:tag_name, 'option').
                         once.
                         and_return([first_option, second_option])

          option = Select.new(multi_select).first_selected_option
          option.should == first_option
        end

        it 'raises a NoSuchElementError if nothing is selected' do
          option = mock(Element, :selected? => false)

          multi_select.should_receive(:find_elements).
                         with(:tag_name, 'option').
                         once.
                         and_return([option])

          lambda {
            Select.new(multi_select).first_selected_option
          }.should raise_error(Error::NoSuchElementError)
        end

        it 'allows options to be selected by visible text' do
          option = mock(Element, :selected? => false)

          multi_select.should_receive(:find_elements).
                         with(:xpath, './/option[normalize-space(.) = "fish"]').
                         once.
                         and_return([option])

          option.should_receive(:click).once

          Select.new(multi_select).select_by(:text, 'fish')
        end

        it 'allows options to be selected by index' do
          first_option = mock(Element, :selected? => true)
          second_option = mock(Element, :selected? => false)

          first_option.should_receive(:attribute).with(:index).and_return "0"
          first_option.should_receive(:click).never

          second_option.should_receive(:attribute).with(:index).and_return '1'
          second_option.should_receive(:click).once

          multi_select.should_receive(:find_elements).
                       with(:tag_name, 'option').
                       and_return([first_option, second_option])

          Select.new(multi_select).select_by(:index, 1)
        end

        it 'allows options to be selected by returned value' do
          first_option = mock(Element, :selected? => false)
          multi_select.should_receive(:find_elements).
                         with(:xpath, './/option[@value = "b"]').
                         and_return([first_option])

          first_option.should_receive(:click).once

          Select.new(multi_select).select_by(:value, 'b')
        end

        it 'can deselect all when select supports multiple selections' do
          first_option = mock(Element, :selected? => true)
          second_option = mock(Element, :selected? => false)

          multi_select.should_receive(:find_elements).
                         with(:tag_name, 'option').
                         once.
                         and_return([first_option, second_option])

          first_option.should_receive(:click).once
          second_option.should_receive(:click).never

          Select.new(multi_select).deselect_all
        end

        it 'can not deselect all when select does not support multiple selections' do
          select.should_receive(:attribute).with(:multiple).and_return nil

          lambda {
            Select.new(select).deselect_all
          }.should raise_error(Error::UnsupportedOperationError)
        end

        it 'can deselect options by visible text' do
          first_option  = mock(Element, :selected? => true)
          second_option = mock(Element, :selected? => false)

          multi_select.should_receive(:find_elements).
                         with(:xpath, './/option[normalize-space(.) = "b"]').
                         and_return([first_option, second_option])

          first_option.should_receive(:click).once
          second_option.should_receive(:click).never

          Select.new(multi_select).deselect_by(:text, 'b')
        end

        it 'can deselect options by index' do
          first_option  = mock(Element, :selected? => true)
          second_option = mock(Element)

          multi_select.should_receive(:find_elements).
                         with(:tag_name, 'option').
                         and_return([first_option, second_option])

          first_option.should_receive(:attribute).with(:index).and_return("2")
          second_option.should_receive(:attribute).with(:index).and_return("1")

          first_option.should_receive(:click).once
          second_option.should_receive(:click).never

          Select.new(multi_select).deselect_by(:index, 2)
        end

        it 'can deselect options by returned value' do
          first_option = mock(Element, :selected? => true)
          second_option = mock(Element, :selected? => false)

          multi_select.should_receive(:find_elements).
                         with(:xpath, './/option[@value = "b"]').
                         and_return([first_option, second_option])

          first_option.should_receive(:click).once
          second_option.should_receive(:click).never

          Select.new(multi_select).deselect_by(:value, 'b')
        end

        it 'should fall back to slow lookups when "get by visible text fails" and there is a space' do
          first_option = mock(Element, :selected? => false, :text => 'foo bar')
          first_option.stub(:to_a => [first_option])

          xpath1 = './/option[normalize-space(.) = "foo bar"]'
          xpath2 = './/option[contains(., "foo")]'

          select.should_receive(:attribute).with(:multiple).and_return 'false'
          select.should_receive(:find_elements).with(:xpath, xpath1).once.and_return([])
          select.should_receive(:find_elements).with(:xpath, xpath2).once.and_return([first_option])

          first_option.should_receive(:click).once

          Select.new(select).select_by(:text, 'foo bar')
        end

        it 'should raise NoSuchElementError if there are no selects to select' do
          select.should_receive(:attribute).with(:multiple).and_return('false')
          select.should_receive(:find_elements).at_least(3).times.and_return []

          s = Select.new select

          lambda {
            s.select_by :index, 12
          }.should raise_error(Error::NoSuchElementError)

          lambda {
            s.select_by :value, 'not there'
          }.should raise_error(Error::NoSuchElementError)

          lambda {
            s.select_by :text, 'also not there'
          }.should raise_error(Error::NoSuchElementError)
        end

        it 'should raise NoSuchElementError if there are no selects to deselect' do
          select.should_receive(:attribute).with(:multiple).and_return('false')
          select.should_receive(:find_elements).at_least(3).times.and_return []

          s = Select.new select

          lambda {
            s.deselect_by :index, 12
          }.should raise_error(Error::NoSuchElementError)

          lambda {
            s.deselect_by :value, 'not there'
          }.should raise_error(Error::NoSuchElementError)

          lambda {
            s.deselect_by :text, 'also not there'
          }.should raise_error(Error::NoSuchElementError)
        end
      end # Select

      describe Select::Escaper do
        it 'converts an unquoted string into one with quotes' do
          Select::Escaper.escape('abc').should == '"abc"'
          Select::Escaper.escape('abc  aqewqqw').should == '"abc  aqewqqw"'
          Select::Escaper.escape('').should == '""'
          Select::Escaper.escape('  ').should == '"  "'
          Select::Escaper.escape('  abc  ').should == '"  abc  "'
        end

        it 'double quotes a string that contains a single quote' do
          Select::Escaper.escape("f'oo").should == %{"f'oo"}
        end

        it 'single quotes a string that contains a double quote' do
          Select::Escaper.escape('f"oo').should == %{'f"oo'}
        end

        it 'provides concatenated strings when string to escape contains both single and double quotes' do
          Select::Escaper.escape(%{f"o'o}).should == %{concat("f", '"', "o'o")}
        end

        it 'provides concatenated strings when string ends with quote' do
          Select::Escaper.escape(%{'"}).should == %{concat("'", '"')}
        end
      end # Select::Escaper

    end # Support
  end # WebDriver
end # Selenium
