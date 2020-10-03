/* 
This Event page basically take the teachersname from rate my proffessor and using the URL searches 
that teachers name up and scrape the curcuial info of teacher and then send that info to the popup.html
*/
const SEARCHQUERY = "ul.listings > li:first-child > a"
const COMMENTQUERY = ".Comments__StyledComments-dzzyvm-0.dvnRbr"
const RATINGQUERY = ".RatingValue__Numerator-qw8sqy-2.gxuTRq"
const FNAMEQUERY = ".NameTitle__Name-dowf0z-0.jeLOXk >span:first-child"
const LNAMEQUERY = ".NameTitle__LastNameWrapper-dowf0z-2.glXOHH"
const WTAQUERY = ".FeedbackItem__FeedbackNumber-uof32n-1.bGrrmf"
const LODQUERY = ".FeedbackItem__FeedbackNumber-uof32n-1.bGrrmf"
const STYLE = `
    <style>
    #extensionInjectionContent{
        position: fixed;
        height: 500px;
        width: 300px;
        right: 10px;
        top: 300px;
        padding: 30px 20px;
        background-color: #eeeeee;
        border-radius: 10px;
        box-shadow: 2px 2px 5px #ddd;
        overflow: auto;
    }
    #extensionInjectionContent h2{
        margin: 20px 0;
        font-size: 26px;
        text-aling: center;
        font-weight: bold;
    }
    #extensionInjectionContent h4{
        margin: 5px 0;
        font-size: 18px;
    }
    </style>
`
chrome.runtime.onMessage.addListener(receiver);
function receiver(request, sender, sendResponse){
    const name = request.text.replace(/\s/g,"%20")
    const tabid = sender.tab.id
    removeInjection(tabid)
    const searchlink = "https://www.ratemyprofessors.com/search.jsp?queryBy=teacherName&schoolName=DePaul+university&queryoption=HEADER&query=" + name + "&facetSearch=true";
    getLink(searchlink).then(link=>{
        if(link && link.length){
            const resultlink = `https://www.ratemyprofessors.com${link}`
            getResult(resultlink).then(result=>{
                console.log(result)
                injectResult(result,tabid)
            })
        }else{
            injectResult(null,tabid)
        }
    })
}
// const request = require('request');
// const cheerio = require('cheerio');
// const writeStream = fs.createWriteStream('proffessorData.csv');
// //Figure out how to make the url work!!!!
// //remove spaces after adding teachers name!
//  //write to CSV
// writeStream.write('Teachers Name,rating,percentWTA,difficulty,topcomment \n');
// request(name, url, (error, response, html) => {
//     if(!error && response.statusCode ==200){
//        //console.log(html);
//         const $ = cheerio.load(html); 
        
//         const profTopComment = $('.Comments__StyledComments-dzzyvm-0.dvnRbr');
//         const profRating = $('.RatingValue__Numerator-qw8sqy-2.gxuTRq');
//         //const profFirstName = $('.NameTitle__Name-dowf0z-0.jeLOXk');
//         //const profLastname = $('.NameTitle__LastNameWrapper-dowf0z-2.glXOHH');
//         const percentWTA = $('.FeedbackItem__FeedbackNumber-uof32n-1.bGrrmf');
//         const levelOfDiff = $('.FeedbackItem__FeedbackNumber-uof32n-1.bGrrmf');
        
//          //write to CSV
//          writeStream.write(`${name},${profRating},${percentWTA},
//          ${levelOfDiff},${profTopComment} \n`);
//         //console.log(profTopComment.html());
//     }
// });
function getLink(URL){
    return new Promise((resolve, reject)=>{
        let xhr = new XMLHttpRequest();
        console.log(URL)
        xhr.open("GET", URL, true);
        xhr.send();
        xhr.onreadystatechange = function() { // Call a function when the state changes.
            if (this.readyState === XMLHttpRequest.DONE ) {
                var parser = new DOMParser();
                var htmlDoc = parser.parseFromString(xhr.responseText, 'text/html');
                console.log(htmlDoc.querySelector(SEARCHQUERY))
                resolve(htmlDoc.querySelector(SEARCHQUERY) ? htmlDoc.querySelector(SEARCHQUERY).getAttribute("href") : null)
            }
        }
    })
    
}
function getResult(URL){
    return new Promise((resolve, reject)=>{
        let xhr = new XMLHttpRequest();
        console.log(URL)
        xhr.open("GET", URL, true);
        xhr.send();
        xhr.onreadystatechange = function() { // Call a function when the state changes.
            if (this.readyState === XMLHttpRequest.DONE ) {
                var parser = new DOMParser();
                var htmlDoc = parser.parseFromString(xhr.responseText, 'text/html');
                const result = {
                    profTopComment : DOMtoString(htmlDoc.querySelector(COMMENTQUERY)),
                    profRating : DOMtoString(htmlDoc.querySelector(RATINGQUERY)),
                    profFirstName : DOMtoString(htmlDoc.querySelector(FNAMEQUERY)),
                    profLastname : DOMtoString(htmlDoc.querySelector(LNAMEQUERY)).split(" ")[0],
                    percentWTA : DOMtoString(htmlDoc.querySelector(WTAQUERY)),
                    levelOfDiff : DOMtoString(htmlDoc.querySelector(LODQUERY))
                }
                resolve(result)
            }
        }
    })
}
function DOMtoString(document_root) {
    if (!document_root){
        return null
    }
    var html = '',
        node = document_root.firstChild;
    while (node) {
        switch (node.nodeType) {
        case Node.ELEMENT_NODE:
            html += node.outerHTML;
            break;
        case Node.TEXT_NODE:
            html += node.nodeValue;
            break;
        }
        node = node.nextSibling;
    }
    return html;
}
function constructHTML(result){
    if( result){
        return `
        <div id="extensionInjectionContent">
            <div id="extenstionInjectMessage">
                <h2>${result.profFirstName} ${result.profLastname}</h2>
                <h4>profRating:</h4>
                <p">${result.profRating}</p>
                <h4>percentWTA:</h4>
                <p">${result.percentWTA}</p>
                <h4>levelOfDiff:</h4>
                <p">${result.levelOfDiff}</p>
                <h4>profTopComment:</h4>
                <p">${result.profTopComment}</p>
            </div>
        </div>
        `
    }
    return `
    <div id="extensionInjectionContent">
        <h2>Professor not found</h2>
    </div>
    `
}
function injectResult(result,tabid){
    const HTML = constructHTML(result)
    const code = `
    if (typeof node === 'undefined'){
        let node = document.createElement("div")
        node.classList.add("extensionInjectionWindow");
        node.innerHTML = \`${HTML}${STYLE}\`
        document.querySelector("body").appendChild(node)
    }else{
        node = document.createElement("div")
        node.classList.add("extensionInjectionWindow");
        node.innerHTML = \`${HTML}${STYLE}\`
        document.querySelector("body").appendChild(node)
    }
    `
    chrome.tabs.executeScript(null, {
        code: code
      }, function() {
        if (chrome.runtime.lastError) {
          console.log('There was an error injecting getLoading script : \n' + chrome.runtime.lastError.message);
        }
      });
}
function removeInjection(tabid){
    const code = `
    if (typeof element === 'undefined'){
        let element = document.querySelector("div.extensionInjectionWindow")
        console.log(element)
        if (element){
            element.parentNode.removeChild(element);
        }
    }else{
        element = document.getElementById("extensionInjectionWindow")
        console.log(element)
        if (element){
            element.parentNode.removeChild(element);
        }
    }
    `
    chrome.tabs.executeScript(null, {
        code: code
      }, function() {
        if (chrome.runtime.lastError) {
          console.log('There was an error injecting getLoading script : \n' + chrome.runtime.lastError.message);
        }
      });
}