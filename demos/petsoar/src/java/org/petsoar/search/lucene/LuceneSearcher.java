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

import org.apache.lucene.document.Document;
import org.apache.lucene.queryParser.QueryParser;
import org.apache.lucene.search.Hits;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.Query;
import org.petsoar.search.Searcher;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class LuceneSearcher implements Searcher, LuceneDocumentFactoryAware, LuceneIndexStoreAware {

    private LuceneDocumentFactory luceneDocumentFactory;
    private LuceneIndexStore indexStore;

    public void setIndexStore(LuceneIndexStore indexStore) {
        this.indexStore = indexStore;
    }

    public LuceneDocumentFactory getLuceneDocumentFactory() {
        return luceneDocumentFactory;
    }

    public void setLuceneDocumentFactory(
            LuceneDocumentFactory luceneDocumentFactory) {
        this.luceneDocumentFactory = luceneDocumentFactory;
    }

    public List search(String query) {
        QueryParser qp = null;
        Query myquery = null;

        try {
            qp = new QueryParser("description",
                    luceneDocumentFactory.createAnalyzer());
            myquery = qp.parse(query);
        } catch (Throwable e) {
            throw new LuceneException("Couldn't parse the query successfully:" +
                    e.getMessage());
        }

        IndexSearcher searcher = null;

        try {
            searcher = indexStore.createSearcher();

            Hits hits = searcher.search(myquery);
            List result = new ArrayList(hits.length());
            for (int i = 0; i < hits.length(); i++) {
                Document doc = hits.doc(i);
                result.add(Long.valueOf(doc.get("handle")));
            }

            return result;
        } catch (Throwable e) {
            throw new LuceneException("Couldn't complete search successfully", e);
        } finally {
            try {
                if (searcher != null)
                    searcher.close();
            } catch (IOException e) {
                throw new LuceneException("Couldn't complete search successfully", e);
            }
        }
    }

}
