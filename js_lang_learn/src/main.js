const path = require('path');
const fs = require('fs');

class NavPoint {
    constructor(title, icon, link) {
        this.title = title;
        this.icon = icon;
        this.link = link;
    }
}

class Sidebar {
    constructor(top_menu_layout, bottom_menu_layout) {
        this.top_menu_layout = top_menu_layout;
        this.bottom_menu_layout = bottom_menu_layout;
    }

    gen_html(page_title) {
        return [
            this.gen_title_html(),
            '<div class="menu-bar">',
            this.gen_menu_html("menu-top", this.top_menu_layout, page_title),
            this.gen_menu_html("menu-bottom", this.bottom_menu_layout, page_title),
            '</div>'
        ].join("");
    }

    gen_title_html() {
        return [
            '<header>',
                '<div class="title">lang learn</div>',
                '<i class="bx bx-chevron-right toggle"></i>',
            '</header>'
        ].join("");
    }

    gen_menu_html(name, layout, page_title) {
        let ret = ['<ul class="', name, '">'].join("");
        for (let i = 0; i < layout.length; i++) {
            const element = layout[i];
            const is_active = (page_title == element.title)? 'class="active"': '';

            ret += ['<li ', is_active, '><a href="', element.link, '">',
                        '<i class="bx ', element.icon, ' icon"></i>',
                        '<span>', element.title, '</span>',
                    '</a></li>'].join("");
        }
        ret += '</ul>';

        return ret;
    }
}

class Search {
    constructor(text) {
        this.text = text;
        this.html = new DOMParser().parseFromString(text, "text/html");
    }

    searchQuery(search_text) {
        return this.html.querySelectorAll(search_text);
    }
}

class PractcieExpression {
    constructor(expression, language) {
        this.visited = 0;
        this.correct = 0;

        this.expression = expression;
        // this.language = language;
    }
}

class PracticeUnit {
    constructor(left, right) {
        this.left = [left]
        this.right = [right]
    }
}

class PracticeSet {
    constructor(title, author) {
        this.title = ""
        this.author = ""

        this.cards = []
    }

    add_unit(left, right) {
        for(let i = 0; i < this.cards.length; i++) {
            const element = this.cards[i];

            for(let j = 0; j < element.left.length; j++) {
                if (left == element.left[j]) {
                    element.right.push(right)
                    return;
                }
            }

            for(let j = 0; j < element.right.length; j++) {
                if (right == element.right[j]) {
                    element.left.push(left)
                    return;
                }
            }
        }

        this.cards.push(new PracticeUnit(left, right))
    }
}

const set_html_by_class = function(element_class, html) {
    let e = document.getElementsByClassName(element_class);

    for(let i = 0; i < e.length; i++) {
        e[i].innerHTML = html;
    }
}

const set_replace_by_class = function(element_class, html) {
    let e = document.getElementsByClassName(element_class);

    for(let i = 0; i < e.length; i++) {
        e[i].outerHTML = html;
    }
}

function load_settings() {
    const buffer = fs.readFileSync(path.join(__dirname, "../data/settings.json")).toString();
    const settings = JSON.parse(buffer);
    return settings;
}
function save_settings(settings) {
    const buffer = JSON.stringify(settings);
    console.log(buffer);
    fs.writeFileSync(path.join(__dirname, "../data/settings.json"), buffer);
}

function http_get(theUrl) {
    try {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
        // xmlHttp.setRequestHeader("User-Agent", "Mozilla/5.0");
        xmlHttp.send( null );
        return xmlHttp.responseText;

    } catch (e) {
        console.log(e);
        return null;
    }
}

async function parse_quizlet(url) {
    let text = http_get(url);
    if (!text) return null;
    let searcher = new Search(text);

    let title = searcher.searchQuery(".SetPage-titleWrapper h1");
    if (title.length == 0) return null;
    title = title[0].innerHTML;

    let author = searcher.searchQuery(".UserLink-createdBy + .UILink span");
    if (author.length == 0) return null;
    author = author[0].innerHTML;

    let result = searcher.searchQuery(".TermText");
    let practice_set = new PracticeSet(title, author);
    let left = "";
    
    for (let i = 0; i < result.length; i++) {
        let element = result[i];
        if (i % 2 == 0)
            left = element.innerHTML;
        else
            practice_set.add_unit(left, element.innerHTML);
        
        // console.log(result[i].innerHTML);
        // console.log(result[i].classList[result[i].classList.length - 1]);
    }

    return practice_set;
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

async function handle_download() {
    let content = document.querySelector(".practice-set-download .content");
    content.innerHTML = '<div style="display:flex;justify-content:center;"><div class="loading-ring"></div></div>';
    
    let url = document.querySelector(".practice-set-download .search input").value;
    if (!url) {
        content.innerHTML = 'please enter a url.'
        return;
    }

    await delay(20);

    // debugger;
    parse_quizlet(url).then((set) => {
        if (!set || set.cards.length == 0)
            content.innerHTML = 'sorry... we could not find this practice set.';
        else
            content.innerHTML = 'found it!'
    },
    () => {content.innerHTML = 'sorry... we could not find this practice set.';});
}

function load_set_downloader() {
    let search  = document.querySelector(".practice-set-download i");
    if (!search) return;

    search.addEventListener("click", handle_download);
}

// main
{
    // titlebar
    set_html_by_class("page-title", page_title);
    document.title = ["lang learn", page_title? ' - ' + page_title : ''].join("");
    
    // sidebar
    const top_menu_layout = [
        new NavPoint("home", "bx-home", "./index.html"),
        new NavPoint("practice sets", "bx-math", "./practice-sets.html"),
        // new NavPoint("settings", "bx-dots-vertical-rounded", "#"),
    ];
    const bottom_menu_layout = [
        // new NavPoint("update", "bx-sync", "#"),
        // new NavPoint("about", "bx-code-curly", "#"),
    ];
    const sidebar_html = new Sidebar(top_menu_layout, bottom_menu_layout);
    set_html_by_class("sidebar", sidebar_html.gen_html(page_title));

    // settings
    const settings = load_settings();
    const sidebar_dom = document.querySelector(".sidebar");

    if (!settings.sidebar_visible)
        sidebar_dom.classList.add("close");
    
    document.querySelector(".toggle").addEventListener("click", () => {
        settings.sidebar_visible = !settings.sidebar_visible;
        save_settings(settings);

        sidebar_dom.classList.toggle("close");
    })


    load_set_downloader();
}