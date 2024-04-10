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
      @account_id = args.fetch("accountId", nil)
      @email = args.fetch("email", nil)
      @name = args.fetch("name", nil)
      @given_name = args.fetch("givenName", nil)
      @picture_url = args.fetch("pictureUrl", nil)
      @idp_config_url = args.fetch("idpConfigUrl", nil)
      @login_state = args.fetch("loginState", nil)
      @terms_of_service_url = args.fetch("termsOfServiceUrl", nil)
      @privacy_policy_url = args.fetch("privacyPolicyUrl", nil)
    end
  end
end
