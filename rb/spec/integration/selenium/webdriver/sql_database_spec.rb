# encoding: utf-8
#
# Licensed to the Software Freedom Conservancy (SFC) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The SFC licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

require_relative 'spec_helper'

module Selenium
  module WebDriver
    describe Driver do
      context 'sql database' do
        let(:select) { 'SELECT * FROM docs' }
        let(:insert) { 'INSERT INTO docs(docname) VALUES (?)' }
        let(:delete) { 'DELETE from docs' }
        let(:update) { "UPDATE docs SET docname='DocBar' WHERE docname='DocFooBar'" }

        before do
          driver.get url_for('html5Page.html')
          wait.until { driver.find_element(id: 'db_completed') }
        end

        compliant_on browser: nil do
          it 'includes inserted rows in the result set' do
            driver.execute_sql insert, 'DocFoo'
            driver.execute_sql insert, 'DocFooBar'

            result = driver.execute_sql select
            expect(result.rows.size).to eq(2)

            expect(result.rows[0]['docname']).to eq('DocFoo')
            expect(result.rows[1]['docname']).to eq('DocFooBar')

            driver.execute_sql delete
            result = driver.execute_sql select
            expect(result.rows.size).to eq(0)
          end

          it 'knows the number of rows affected' do
            result = driver.execute_sql insert, 'DocFooBar'
            expect(result.rows_affected).to eq(1)

            result = driver.execute_sql select
            expect(result.rows_affected).to eq(0)

            driver.execute_sql update
            expect(result.rows.affected).to eq(1)
          end

          it 'returns last inserted row id' do
            result = driver.execute_sql select
            expect(result.last_inserted_row_id).to eq(-1)

            driver.execute_sql insert, 'DocFoo'
            expect(result.last_inserted_row_id).not_to eq(-1)

            result = driver.execute_sql select
            expect(result.last_inserted_row_id).to eq(-1)

            result = driver.execute_sql delete
            expect(result.last_inserted_row_id).to eq(-1)
          end
        end
      end
    end
  end # WebDriver
end # Selenium
