"use strict";
var words = [
    'about', 'above', 'after', 'again', 'all', 'also', 'am', 'an', 'and', 'another',
    'any', 'are', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below',
    'between', 'both', 'but', 'by', 'came', 'can', 'cannot', 'come', 'could', 'did',
    'do', 'does', 'doing', 'during', 'each', 'few', 'for', 'from', 'further', 'get',
    'got', 'has', 'had', 'he', 'have', 'her', 'here', 'him', 'himself', 'his', 'how',
    'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'like', 'make', 'many', 'me',
    'might', 'more', 'most', 'much', 'must', 'my', 'myself', 'never', 'now', 'of', 'on',
    'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
    'said', 'same', 'see', 'should', 'since', 'so', 'some', 'still', 'such', 'take', 'than',
    'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they',
    'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was',
    'way', 'we', 'well', 'were', 'what', 'where', 'when', 'which', 'while', 'who',
    'whom', 'with', 'would', 'why', 'you', 'your', 'yours', 'yourself',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
    'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '$', '1',
    '2', '3', '4', '5', '6', '7', '8', '9', '0', '_'];

// a short script to help assist in finding information in a PDF based off of a question. inspired by bad quizzes
var fs = require("fs");
// require("lunr");
// require("natural");

// read in a file (just copy paste a PDF, getting PDF to work properly is painful. PDF is an export format, not designed to be worked with)
var text = fs.readFileSync("books/gift_of_fire.txt", "utf-8");

// some example questions
var question1 = "Computers free us from the boring aspects of jobs so that we can do what";
var question2 = "What was the fear that computer technology would cause";
var question3 = "What is a resource that technology helps reduce";

// function does the work
var res = advSearch(text, question1);
console.log(res);

// splits string into either n chunks with length len or into len chunks (depending on nchunks)
function splitSlice(str, len, offset) {
    var ret = [];
    for (var cur = offset, strLen = str.length; cur < strLen; cur += len) {
        ret.push(str.slice(cur, len + cur));
    }
    return ret;
}

// generates a search index using Lunr.js. assumes input is an array of texts that it then puts into a format Lunr recognizes
function genIdx(texts) {
    var lunr = require("lunr");
    var documents = [];
    texts.forEach(function(e, i) {
        documents.push({"id": i, "text": e});
    });
    var idx = lunr(function () {
        this.ref("id");
        this.field("text");
    
        documents.forEach(function (doc) {
        this.add(doc)
        }, this);
    });
    return idx;
}

// takes a search text and a question, returns a 2000 (default) character most relevant section of the text.
// length value is length of return chunk. 2000 seems good. too short and you get sentences that contain synonyms
// but don't reflect value of question. too long and you risk getting sections that are not relevant at all
// optional offset value lets you offset the return length so you can avoid splitting the most relevent string in the text.
function advSearch(text, question, length=2000, offset=0, debug=true) {
    var words = [
        'about', 'above', 'after', 'again', 'all', 'also', 'am', 'an', 'and', 'another',
        'any', 'are', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below',
        'between', 'both', 'but', 'by', 'came', 'can', 'cannot', 'come', 'could', 'did',
        'do', 'does', 'doing', 'during', 'each', 'few', 'for', 'from', 'further', 'get',
        'got', 'has', 'had', 'he', 'have', 'her', 'here', 'him', 'himself', 'his', 'how',
        'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'like', 'make', 'many', 'me',
        'might', 'more', 'most', 'much', 'must', 'my', 'myself', 'never', 'now', 'of', 'on',
        'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
        'said', 'same', 'see', 'should', 'since', 'so', 'some', 'still', 'such', 'take', 'than',
        'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they',
        'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was',
        'way', 'we', 'well', 'were', 'what', 'where', 'when', 'which', 'while', 'who',
        'whom', 'with', 'would', 'why', 'you', 'your', 'yours', 'yourself',
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
        'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '$', '1',
        '2', '3', '4', '5', '6', '7', '8', '9', '0', '_'
    ];
    // cant have offset > length
    offset %= length;
    
    question = question.split(" ");
    // the final string that contains the most relevant words
    var relevenceString = question.filter(e => !words.includes(e)).join(' ')
    if (debug) {
        console.log(`\nKeyword string: ${relevenceString}`);
        console.log("\n");
    }
    var texts = splitSlice(text, length, offset);
    var idx = genIdx(texts)
    return texts[idx.search(relevenceString)[0].ref];
}

function sum_tfidf(terms, documents) {
    // formula is sum(0 -> docs) tf(t, d)*idf(t)
    // we can factor out idf(t), so formula is idf(t)*sum() tf(t, d)
    var dc = {}
    var tf = {}
    var terms_lower = [];
    terms.forEach(function(t) {
        t = t.toLowerCase();
        dc[t] = 0; tf[t] = 0;
        terms_lower.push(t);
    });
    documents.forEach(function(d) {
        var tc = {}
        var words = d.split(' ');
        words.forEach(function(w) {
            terms_lower.forEach(function(t) {
                if (t == w.toLowerCase()) {
                    if (!tc[t]) {
                        dc[t] += 1;
                        tc[t] = 0;
                    }
                    tc[t] += 1;
                }
            });
        });
        terms_lower.forEach(function(t) {
            if (tc[t]) {
                tf[t] += tc[t]*1.0/words.length;
            }
        })
    });
    var ret = {}
    terms_lower.forEach(function(t) {
        ret[t] = tf[t]*(Math.log(documents.length*1.0/dc[t]));

    });
    return ret;
}