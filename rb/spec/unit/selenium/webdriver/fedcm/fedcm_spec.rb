require File.expand_path('../spec_helper', __dir__)

describe 'FederatedCredentialManagementTest' do
  let(:options) do
    Selenium::WebDriver::Chrome::Options.new.tap do |opts|
      opts.add_argument("host-resolver-rules=MAP localhost:443 localhost:#{get_secure_port}")
      opts.add_argument('ignore-certificate-errors')
    end
  end

  let(:driver) { Selenium::WebDriver.for :chrome, options: options }
  let(:app_server) { 'localhost' }

  before do
    driver.navigate.to "https://#{app_server}/fedcm/fedcm.html"
  end

  def trigger_fed_cm
    driver.execute_script('triggerFedCm()')
  end

  def wait_for_dialog
    wait = Selenium::WebDriver::Wait.new(timeout: 5)
    wait.until { !driver.federated_credential_management_dialog }
  end

  def get_secure_port
    uri = URI("https://#{app_server}/")
    uri.port
  rescue URI::InvalidURIError
    0 # This should not happen
  end

  it 'dismisses dialog' do
    fedcm_driver.set_delay_enabled(false)
    expect(fedcm_driver.federated_credential_management_dialog).to be_nil

    wait_for_dialog

    dialog = fedcm_driver.federated_credential_management_dialog
    expect(dialog.title).to eq("Sign in to localhost with localhost")
    expect(dialog.dialog_type).to eq("AccountChooser")

    dialog.cancel_dialog

    expect { js_driver.execute_script('await promise') }.to raise_error(Selenium::WebDriver::Error::JavascriptError)
  end

  it 'selects an account' do
    fedcm_driver.set_delay_enabled(false)
    expect(fedcm_driver.federated_credential_management_dialog).to be_nil

    wait_for_dialog

    dialog = fedcm_driver.federated_credential_management_dialog
    expect(dialog.title).to eq("Sign in to localhost with localhost")
    expect(dialog.dialog_type).to eq("AccountChooser")

    dialog.select_account(0)

    response = driver.execute_script('return await promise')
    expect(response).to include("token" => "a token")
  end
end
