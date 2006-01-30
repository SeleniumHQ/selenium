/*
 * Copyright (c) 2003-2005, Wiley & Sons, Joe Walnes,Ara Abrahamian,
 * Mike Cannon-Brookes,Patrick A Lightbody
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 * notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the distribution.
 *     * Neither the name of the 'Wiley & Sons', 'Java Open Source
 * Programming' nor the names of the authors may be used to endorse or
 * promote products derived from this software without specific prior
 * written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

package org.petsoar.search.lucene;

import junit.framework.TestCase;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.document.Document;

public class TestDefaultLuceneDocumentFactory extends TestCase {
    private DefaultLuceneDocumentFactory defaultLuceneDocumentFactory;

    protected void setUp() throws Exception {
        super.setUp();

        defaultLuceneDocumentFactory = new DefaultLuceneDocumentFactory();
    }

    public void testCreateDocument() throws Exception {
        DefaultLuceneDocumentTestData obj = createDefaultLuceneDocumentTestData();
        Document doc = defaultLuceneDocumentFactory.createDocument(obj);

        assertEquals("" + obj.getHandleAttr(), doc.get("handleField"));
        assertEquals(obj.getKeywordAttr(), doc.get("keywordField"));
        assertEquals("" + obj.getTextAttr(), doc.get("textField"));
        assertEquals("" + obj.getUnIndexedAttr(), doc.get("unIndexedField"));
        assertEquals("" + obj.getUnStoredAttr(), doc.get("unStoredField"));
    }

    public void testGetHandleAttributeName() throws Exception {
        DefaultLuceneDocumentTestData obj = createDefaultLuceneDocumentTestData();

        assertEquals("handleAttr", defaultLuceneDocumentFactory.getHandleAttributeName(obj));
    }

    public void testGetHandleFieldName() throws Exception {
        DefaultLuceneDocumentTestData obj = createDefaultLuceneDocumentTestData();

        assertEquals("handleField", defaultLuceneDocumentFactory.getHandleFieldName(obj));
    }

    public void testCreateAnalyzer() throws Exception {
        Analyzer analyzer = defaultLuceneDocumentFactory.createAnalyzer();

        assertNotNull(analyzer);
        assertEquals(DefaultLuceneDocumentFactory.DefaultAnalyzer.class, analyzer.getClass());
    }

//    public void testCreateSearchHit() throws Exception {
//        Document doc= new Document();
//
//        doc.add(new Field("handle","111",true,true,true));
//        doc.add(new Field("image","112",true,true,true));
//        doc.add(new Field("name","113",true,true,true));
//        doc.add(new Field("description","114",true,true,true));
//
//        Pet Pet=(Pet)defaultLuceneDocumentFactory.createSearchHit(doc);
//
//        assertEquals(""+Pet.getId(),doc.get("handle"));
//    }
//
    private DefaultLuceneDocumentTestData createDefaultLuceneDocumentTestData() {
        DefaultLuceneDocumentTestData obj = new DefaultLuceneDocumentTestData();

        obj.setHandleAttr(111);
        obj.setKeywordAttr("112");
        obj.setTextAttr(113);
        obj.setUnIndexedAttr(114);
        obj.setUnStoredAttr(115);

        return obj;
    }
}
