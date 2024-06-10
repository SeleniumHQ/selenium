# frozen_string_literal: true

require File.expand_path('../../spec_helper', __dir__)

module Selenium
  module WebDriver
    module FedCM
      describe Account do
        let(:account) do
          described_class.new(
            'accountId' => '12341234',
            'email' => 'fake@email.com',
            'name' => 'Real Name',
            'givenName' => 'Fake Name',
            'pictureUrl' => 'picture-url',
            'idpConfigUrl' => 'idp-config-url',
            'loginState' => 'login-state',
            'termsOfServiceUrl' => 'terms-of-service-url',
            'privacyPolicyUrl' => 'privacy-policy-url'
          )
        end

        it 'sets the provided attributes' do
          expect(account.account_id).to eq('12341234')
          expect(account.email).to eq('fake@email.com')
          expect(account.name).to eq('Real Name')
          expect(account.given_name).to eq('Fake Name')
          expect(account.picture_url).to eq('picture-url')
          expect(account.idp_config_url).to eq('idp-config-url')
          expect(account.login_state).to eq('login-state')
          expect(account.terms_of_service_url).to eq('terms-of-service-url')
          expect(account.privacy_policy_url).to eq('privacy-policy-url')
        end
      end # Account
    end # FedCM
  end # WebDriver
end # Selenium
