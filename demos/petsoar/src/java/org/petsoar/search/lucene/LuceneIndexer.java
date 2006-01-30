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

import org.apache.commons.beanutils.BeanUtils;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.document.Document;
import org.apache.lucene.index.IndexReader;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.Term;
import org.petsoar.search.Indexer;

import java.io.IOException;

public class LuceneIndexer implements LuceneDocumentFactoryAware, LuceneIndexStoreAware, Indexer {

    private LuceneDocumentFactory luceneDocumentFactory;
    private LuceneIndexStore indexStore;

    public void setIndexStore(LuceneIndexStore indexStore) {
        this.indexStore = indexStore;
    }

    public void setLuceneDocumentFactory(
            LuceneDocumentFactory luceneDocumentFactory) {
        this.luceneDocumentFactory = luceneDocumentFactory;
    }

    public synchronized void index(Object obj) {
        unIndex(obj);
        try {
            Analyzer analyzer = luceneDocumentFactory.createAnalyzer();
            IndexWriter writer = indexStore.createWriter(analyzer);
            try {
                Document doc = luceneDocumentFactory.createDocument(obj);
                writer.addDocument(doc);
                writer.optimize();
            } finally {
                writer.close();
            }
        } catch (IOException e) {
            throw new LuceneException("Cannot update index", e);
        }
    }

    public synchronized void unIndex(Object obj) {
        String handleAttributeName = luceneDocumentFactory.getHandleAttributeName(obj);
        String handleFieldName = luceneDocumentFactory.getHandleFieldName(obj);
        String handleAttributeValue = null;

        try {
            handleAttributeValue = BeanUtils.getProperty(obj, handleAttributeName);
        } catch (Exception e) {
            throw new LuceneException("Cannot identify object", e);
        }

        try {
            IndexReader reader = indexStore.createReader();

            try {
                Term t = new Term(handleFieldName, handleAttributeValue);
                reader.delete(t);
            } finally {
                reader.close();
            }
        } catch (IOException e) {
            throw new LuceneException("Cannot delete from index", e);
        }
    }

}
