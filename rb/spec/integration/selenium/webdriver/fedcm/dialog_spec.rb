require_relative '../spec_helper'

module Selenium
  module WebDriver
    module FedCM
      describe Dialog, exclusive: {browser: :chrome} do
        let(:url) { 'https://fedcm-rp-demo.glitch.me/' }
        let(:dialog) { driver.fedcm_dialog }

        before do
          driver.get(url)
        end

        it 'throws an error when dialog is not present' do
          expect { dialog.title }.to raise_error(Error::NoSuchAlertError)
        end
      end
    end # FedCm
  end # WebDriver
end # Selenium
