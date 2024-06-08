require_relative '../spec_helper'

module Selenium
  module WebDriver
    module FedCM
      describe Dialog, exclusive: {browser: :chrome} do
        let(:url) { 'https://fedcm-rp-demo.glitch.me/' }

        it 'dismisses dialog' do
          driver.navigate.to url
          driver.fedcm_dialog.title
        end
      end
    end # FedCm
  end
end
