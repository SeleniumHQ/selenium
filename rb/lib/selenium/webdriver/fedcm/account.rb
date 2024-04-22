module FedCM
  # Represents an account displayed in a FedCM account list.
  # See: https://fedidcg.github.io/FedCM/#dictdef-identityprovideraccount
  #      https://fedidcg.github.io/FedCM/#webdriver-accountlist
  class Account
    LOGIN_STATE_SIGNIN = "SignIn"
    LOGIN_STATE_SIGNUP = "SignUp"

    attr_reader :account_id, :email, :name, :given_name, :picture_url,
                :idp_config_url, :login_state, :terms_of_service_url, :privacy_policy_url

    # Initializes a new account with the provided attributes.
    #
    # @param [Hash]
    def initialize(**args)
      @account_id = args[:accountId]
      @email = args[:email]
      @name = args[:name]
      @given_name = args[:givenName]
      @picture_url = args[:pictureUrl]
      @idp_config_url = args[:idpConfigUrl]
      @login_state = args[:loginState]
      @terms_of_service_url = args[:termsOfServiceUrl]
      @privacy_policy_url = args[:privacyPolicyUrl]
    end
  end
end
