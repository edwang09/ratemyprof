/* 
This gets teachers name from Campusconnect
*/


window.addEventListener('mouseup', wordSelected);

function wordSelected() {
    let selectedText = window.getSelection().toString();
    console.log(selectedText);
    if (selectedText.length>0){
        let message = {
           text: selectedText 
        }
        chrome.runtime.sendMessage(null, message);
    }
}








/*const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');



var url = 
request(url, (error, response, html) => {
    if(!error && response.statusCode ==200){
        const $ = cheerio.load(html); 
        

        $('insert first div class here').each((i, el) => {
            cosnt title = $(el)
            .find('find each of the childeren classes')
            .text()
            .replace(/\s\s+/g, ''); //removes all uneeded whitespace

           
        });
    }
});


$().each((i, el) => {
    const item = $(el).text(); 
    console.log(item); 
});

*/