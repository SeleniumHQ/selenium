package org.openqa.selenium.safari.helpers;

public class InstallationHtml {

  public static String getHtml() {

    StringBuilder html = new StringBuilder(headSnippet());
    html.append(dontTouchInstallPopUpSnippet());
    html.append(endSnippet());
    html.append(safariKeychain());
    return html.toString();
  }

  protected static String dontTouchInstallPopUpSnippet(){
    return "When prompted to 'Install WebDriver', the Install button should be clicked automatically.<br/><br/>";
  }

  protected static String safariKeychain(){
    return "If prompted to give access to 'Safari Extensions List' keychain, click on 'Always Allow'";
  }

  protected static String headSnippet(){
    return "<html><body><h2>Attempting to install SafariDriver Extension, please wait...</h2><br/>";
  }

  protected static String endSnippet(){
    return "</body></html>";
  }
}
