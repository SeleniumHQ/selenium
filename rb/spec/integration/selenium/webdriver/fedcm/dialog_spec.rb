require_relative '../spec_helper'

module Selenium
  module WebDriver
    module FedCM
      describe Dialog, exclusive: {browser: :chrome} do
        let(:url) { 'https://fedcm-rp-demo.glitch.me/' }

        it 'dismisses dialog' do
          create_driver! do |driver|
            driver.navigate.to url
            expect(driver.fedcm_title).to eq('Sign in to localhost with localhost')
          end
        end
      end
    end # FedCm
  end
end
