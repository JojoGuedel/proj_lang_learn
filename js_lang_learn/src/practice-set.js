const path = require('path');
const fs = require('fs');

function http_get(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    // xmlHttp.setRequestHeader("User-Agent", "Mozilla/5.0");
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

// main
{
    const url = "https://quizlet.com/ch/714744922/learning-the-press-thinkinglearning-without-word-formation-flash-cards/";
    let result = http_get(url);

    console.log(path.join(__dirname, '/..data/practice_sets/en_1.set'));

    try { fs.writeFileSync(path.join(__dirname, '/../data/practice_sets/en_1.set'), result, 'utf-8'); }
    catch(e) { alert('Failed to save the file !'); }
};
