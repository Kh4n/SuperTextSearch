"use strict";
// a short script to help assist in finding information in a PDF based off of a question. inspired by bad quizzes
var fs = require("fs");
require("lunr");
require("natural");

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
function splitSlice(str, len, nchunks=false) {
    var ret = [];
    if (nchunks)
        len = Math.round(str.length/len);
    for (var offset = 0, strLen = str.length; offset < strLen; offset += len) {
        ret.push(str.slice(offset, len + offset));
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
function advSearch(text, question, length=2000, offset=0, debug=false) {
    // cant have offset > length
    offset %= length;

    // using natural to get TF-IDF
    var natural = require("natural");
    var TfIdf = natural.TfIdf;
    var tfidf = new TfIdf();

    // add text so that it can analyze and generate a TF-IDF score
    tfidf.addDocument(text);
    // evaluate each word in question separately
    question = question.split(" ");
    // the final string that contains the most relevant words
    var relevenceString = ""
    question.forEach(function(e) {
        tfidf.tfidfs(e, function(i, measure) {
            if (debug) {
                console.log(e + ": " + measure);
            }
            if (measure > 0)
                relevenceString += e + " ";
        });
    });
    if (debug) {
        console.log(`\nKeyword string: ${relevenceString}`);
        console.log("\n");
    }
    var texts = splitSlice(text, length + offset);
    var idx = genIdx(texts)
    return texts[idx.search(relevenceString)[0].ref];
}