require File.expand_path("../spec_helper", __FILE__)

module Selenium
  module WebDriver
    describe FileReaper do
      before { FileReaper.reap = true }

      let(:tmp_file) do
        Pathname.new(Dir.tmpdir).join(SecureRandom.uuid).tap { |f| f.mkpath }
      end

      it 'reaps files that have been added' do
        tmp_file.should exist

        FileReaper << tmp_file.to_s
        FileReaper.reap!.should be true

        tmp_file.should_not exist
      end

      it 'fails if the file has not been added' do
        tmp_file.should exist

        expect {
          FileReaper.reap(tmp_file.to_s)
        }.to raise_error(Error::WebDriverError)
      end

      it 'does not reap if reaping has been disabled' do
        tmp_file.should exist

        FileReaper.reap = false
        FileReaper << tmp_file.to_s

        FileReaper.reap!.should be false

        tmp_file.should exist
      end

      unless Platform.jruby? || Platform.windows?
        it 'reaps files only for the current pid' do
          tmp_file.should exist

          FileReaper << tmp_file.to_s

          pid = fork { FileReaper.reap!; exit; exit }
          Process.wait pid

          tmp_file.should exist
        end
      end

    end
  end
end
