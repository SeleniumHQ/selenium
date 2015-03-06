require File.expand_path("../spec_helper", __FILE__)

describe "Driver" do
  context "sql database" do
    let(:select) { "SELECT * FROM docs" }
    let(:insert) { "INSERT INTO docs(docname) VALUES (?)" }
    let(:delete) { "DELETE from docs" }
    let(:update) { "UPDATE docs SET docname='DocBar' WHERE docname='DocFooBar'" }

    before do
      driver.get url_for("html5Page.html")
      wait.until { driver.find_element(:id => "db_completed") }
    end

    compliant_on :browser => nil do
      it "includes inserted rows in the result set" do
        driver.execute_sql insert, "DocFoo"
        driver.execute_sql insert, "DocFooBar"

        result = driver.execute_sql select
        result.rows.size.should == 2

        result.rows[0]['docname'].should == 'DocFoo'
        result.rows[1]['docname'].should == 'DocFooBar'

        driver.execute_sql delete
        result = driver.execute_sql select
        result.rows.size.should == 0
      end

      it "knows the number of rows affected" do
        result = driver.execute_sql insert, "DocFooBar"
        result.rows_affected.should == 1

        result = driver.execute_sql select
        result.rows_affected.should == 0

        driver.execute_sql update
        result.rows.affected.should == 1
      end

      it "returns last inserted row id" do
        result = driver.execute_sql select
        result.last_inserted_row_id.should == -1

        driver.execute_sql insert, "DocFoo"
        result.last_inserted_row_id.should_not == -1

        result = driver.execute_sql select
        result.last_inserted_row_id.should == -1

        result = driver.execute_sql delete
        result.last_inserted_row_id.should == -1
      end
    end

  end
end

