// ========================================================================
// $Id: TestHtml.java,v 1.4 2004/05/09 20:33:27 gregwilkins Exp $
// Copyright 1996-2004 Mort Bay Consulting Pty. Ltd.
// ------------------------------------------------------------------------
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at 
// http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// ========================================================================

package org.openqa.jetty.html;
import java.io.IOException;


// ====================================================================
class TestHtml
{
    public static void main(String args[])
    {
        try{
            
            int loops=1;
            if (args.length==1)
                loops=Integer.parseInt(args[0]);

            for (int i=0;i<loops;i++)
            {
            
                Page page = new Page("Test Page");
                page.addHeader(new StyleLink("/File/jetty.css"));
                page.setBackGroundColor("A0A0A0");

                Break rule = new Break(Break.Rule);
                page.add(rule);

                page.add(new Heading(1,"Testing Testing 123"));

                Composite composite1 = new Composite();
                Composite composite2 = new Composite();
                Composite text1 = new Composite();
                Composite text2 = new Composite();
                Composite text3 = new Composite();

                text1.add("How now");
                text1.add("Brown cow");

                text2.add("The Quick Brown Fox Jumped Over The Lazy Dog");

                text3.add("Now is the time for all good men to come to");
                text3.add("the aid of the party.");

                composite1.add(text1);
                composite2.add(text2);
                composite2.add(text3);
                composite1.add(composite2);
                composite1.add("Plain Texted Added1");

                page.add(composite1);
                page.add("Plain Texted Added2");

                page.add(rule);

                Block right = new Block(Block.Right);
                right.add(text3);
                page.add(right);
                page.add(rule);

                page.add(new Heading(3,"Test List"));
                List list = new List(List.Ordered);
                list.add(text1);
                list.add(text2);
                list.add(composite1);
                page.add(list);

                DefList dList=new DefList();
                page.add(dList);
                Composite word1= new Composite();
                Composite word2= new Composite();
                Composite word3= new Composite();
                word1.add("Blah");
                word2.add("Foo");
                word3.add("Bah");
                dList.add(word1,text1);
                dList.add(word2,text2);
                dList.add(word3,text3);

                page.flush(System.out);

                page.add(rule);
                Composite c = new Composite();
                c.add("Test Link");
                page.add(new Link("test.html",c));

                page.add(rule);
                Table table = new Table(2);
                table.newRow();
                table.addHeading("Heading1");
                table.addHeading("Heading2");
                table.addHeading("Heading3");
                table.newRow();
                table.addCell("String1");
                table.addCell(text2);
                table.addCell(text3);
                page.add(table);
                
                page.add(rule);
                table = new Table(2);
                table.defaultRow().cssID("I1");
                table.defaultHead().cssID("I2");
                table.defaultCell().cssID("I3");
                table.defaultCell().add("<b>");
                table.newRow();
                table.addHeading("Heading1");
                table.addHeading("Heading2");
                table.addHeading("Heading3");
                table.newRow();
                table.addCell("String1");
                table.addCell(text2);
                table.addCell(text3);
                page.add(table);

                page.add(rule);

                Form form = new Form("/CGI/test-cgi");
                page.add(form);
                form.add(new Input(Input.Text,"N1","Value"));
                form.add(new Input(Input.Password,"N2","Value"));
                form.add(new Input(Input.Checkbox,"N3","Value"));
                form.add(new Input(Input.Checkbox,"N4","Value"));
                form.add(new Input(Input.Radio,"N5","Value"));
                form.add(new Input(Input.Radio,"N5","Value"));
                form.add(new Input(Input.Submit,"N6"));
                form.add(new Input(Input.Reset,"N7"));
                form.add(new Input(Input.Hidden,"N8","Value"));
                form.add(new TextArea("N9","Value"));

                Select select = new Select("Select",false);
                form.add(select);
                select.add("Tom");
                select.add("Dick");
                select.add("Harry");
                select.add("Thomas");
                select.add("Richard");
                select.add("Harold");

                select = new Select("Select",true);
                select.setSize(3);
                form.add(select);
                select.add("Tom");
                select.add("Dick");
                select.add("Harry");
                select.add("Thomas");
                select.add("Richard");
                select.add("Harold");

                page.add(Break.rule);
      
                TableForm tf = new TableForm("ScriptName");
                page.add(tf);
                tf.addText("Text","Plain Text Information. Which is not included in any data sent when the form is submitted.");
                tf.addTextField("F1","Text Field",0,null);
                tf.addTextField("F2","Text Field",10,"value");
                tf.addTextArea("F3","Text Area",0,4,"Value of the text area.\nWhich can be over many lines.");
                tf.addInfoField("F4","Info Field","value");
                tf.addHiddenField("F5","hidden value");
                tf.addPassword("F6","Password",10);
                tf.addButtonArea();
                tf.addButton("F11a","Button1a");
                tf.addButton("F11b","Button1b");
                tf.addButtonRow();
                tf.addButton("F11c","Button1c");
                tf.addButton("F11d","Button1d");
                tf.addCheckbox("F7","Checkbox",false);
                tf.addCheckbox("F8","Checkbox",true);
                tf.buttonsAtBottom();
                tf.addButton("F11","Button2");
                tf.addReset("Reset");
                tf.addTextField("F12","Extended",10,"value");
                tf.extendRow();
                tf.addCheckbox("F13",null,false);

                tf.addSelect("F9","Select",false,0).add("A").add("B").add("C").add("D");
                tf.addSelect("F0","Select",true,3).add("A").add("B").add("C").add("D");
      
                page.add(Break.rule);

                page.add(new Style().comment().add("dt { background: yellow; color: black }"));

                page.write(System.out);
            }
        }
        catch(IOException e){
            e.printStackTrace();}
    }
}

