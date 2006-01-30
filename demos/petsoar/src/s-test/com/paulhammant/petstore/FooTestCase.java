package com.paulhammant.petstore;

import com.thoughtworks.selenium.DefaultSelenium;
import com.thoughtworks.selenium.Selenium;
import com.thoughtworks.selenium.embedded.jetty.DirectoryStaticContentHandler;
import com.thoughtworks.selenium.embedded.jetty.JettyCommandProcessor;
import com.thoughtworks.selenium.launchers.SystemDefaultBrowserLauncher;
import junit.framework.TestCase;

import java.io.File;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

public class FooTestCase extends TestCase {

    static JettyCommandProcessor jettyCommandProcessor;
    Selenium selenium;
    Connection conn;

    protected void setUp() throws Exception {
        super.setUp();
        File codeRoot = getCodeRoot();

        if (jettyCommandProcessor == null) {
            jettyCommandProcessor = new JettyCommandProcessor(new File(codeRoot, "war-for-selenium"), DefaultSelenium.DEFAULT_SELENIUM_CONTEXT,
                        new DirectoryStaticContentHandler(new File(codeRoot, "war-for-selenium/selenium")));
        }
        selenium = new DefaultSelenium(
                        jettyCommandProcessor,
                        new SystemDefaultBrowserLauncher()
                );
        selenium.start();

        Class.forName("org.hsqldb.jdbcDriver");

        conn = DriverManager.getConnection("jdbc:hsqldb:petsoardb", "sa", "");


    }


    private File getCodeRoot() throws Exception {
        File codeRoot;
        String codeRootProperty = System.getProperty("code_root");
        if (codeRootProperty == null) {
            throw new Exception("'code_root' not specified");
        } else {
            codeRoot = new File(codeRootProperty);
            if (!codeRoot.exists()) {
                throw new Exception("'code_root' not a dir");
            }
        }
        return codeRoot;
    }

    protected void tearDown() throws Exception {
        selenium.testComplete();
        Thread.sleep(2 * 1000);
        selenium.stop();
        try {
            shutdownDB(conn);
        } catch (SQLException e) {
            // half expected
        }
    }

    public void testLogin() {
        selenium.setContext("Log into PetStore");
        goToFrontPage();
        attemptLogin("duke", "duke");
        selenium.verifyTextPresent("Welcome: duke");
    }

    private void attemptLogin(String user, String passwd) {
        selenium.open("/login.jsp");
        selenium.type("username", user);
        selenium.type("password", passwd);
        selenium.clickAndWait("Login");
    }

    public void testBogusLogin() {
        selenium.setContext("Test that unknown user results in unknown into PetStore");
        goToFrontPage();
        attemptLogin("lord", "lady");
        selenium.verifyTextPresent("Invalid username or password");
    }


    public void testSearchWorks() {

        selenium.setContext("Test of Searching For Pets");
        selenium.open("/storefront/listpets.action");
        selenium.verifyTextPresent("Pets In Stock");
        selenium.type("query", "Cat");
        selenium.clickAndWait("Submit");
        selenium.verifyTextPresent("Tiger");
    }

    public void testKnownPetsAreInTheInventory() {

        selenium.setContext("test Known Pets Are In The Inventory");
        attemptLogin("duke", "duke");
        goToFrontPage();
        selenium.clickAndWait("inventory");
        selenium.clickAndWait("ListPets");
        selenium.verifyTextPresent("Lizard");
        selenium.verifyTextPresent("Snake");
        selenium.verifyTextPresent("Pigeon");
        selenium.verifyTextPresent("Seagul");
        selenium.verifyTextPresent("Rexio");
    }

    private void goToFrontPage() {
        selenium.open("/");
        selenium.verifyTextPresent("Welcome to PetStore");
    }

    public void testPuttingAPetInTheCartAndOutAgain() {

        selenium.setContext("test Putting A Pet In The Cart And Out Again");

        putPetInCart("Lizard");
        selenium.clickAndWait("checkOut");
        selenium.verifyTextPresent("Credit Card Information");
        selenium.clickAndWait("viewCart");
        selenium.verifyTextPresent("$13.75");
        selenium.clickAndWait("del-Lizard");
        selenium.verifyTextPresent("Pet Removed from Cart");

    }

    private void putPetInCart(String petName) {
        displayPet(petName);
        selenium.clickAndWait("addToCart");
        selenium.verifyTextPresent("Pet Added to Cart");
    }

    private void displayPet(String petName) {
        attemptLogin("duke", "duke");
        goToFrontPage();
        selenium.clickAndWait("Pets");
        selenium.verifyTextPresent(petName);
        selenium.clickAndWait("pet-" + petName);
    }


    public void testDeletedPetResultsInPetCouldNotBeAddedPage() throws SQLException, ClassNotFoundException {

        selenium.setContext("test Deleted Pet Results In Pet Could Not Be Added Page");


        // just in case this hangs over from the last test run
        Statement st = conn.createStatement();
        st.executeUpdate("DELETE FROM PETS where PETID = 095");
        st.close();

        st = conn.createStatement();
        st.executeUpdate("INSERT INTO PETS VALUES(095,15,'Elephant','images/shark.gif',"
                + "'Female','Indian Elephant','Never forgets',44.44)");
        st.close();


        displayPet("Elephant");

        st = conn.createStatement();

        // this is the pulling the run bit.
        st.executeUpdate("DELETE FROM PETS where PETID = 095");
        st.close();

        selenium.clickAndWait("addToCart");
        selenium.verifyTextPresent("Pet Could Not Be Added to Cart");

    }

    public void testDeadDBResultsDecentWebAppOutagePage() throws ClassNotFoundException, SQLException {

        selenium.setContext("test Deleted Pet Results In Pet Could Not Be Added Page");

        Class.forName("org.hsqldb.jdbcDriver");

        Connection conn = DriverManager.getConnection("jdbc:hsqldb:petsoardb", "sa", "");

        displayPet("Lizard");


        // this is the pulling the run bit.
        shutdownDB(conn);

        selenium.clickAndWait("addToCart");

        //selenium.verifyTextPresent("The Pet Store web application is experiencing difficulties. Please try again later", "");
        selenium.verifyTextPresent("The database is shutdown in statement [select pet0_.PETID a");

    }

    private void shutdownDB(Connection conn) throws SQLException {
        Statement st = conn.createStatement();
        st.executeUpdate("SHUTDOWN");
    }


}
