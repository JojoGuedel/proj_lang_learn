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

class PractcieExpression {
    constructor() {
        this.visited = 0;
        this.correct = 0;

        this.expression = "";
        this.language = ""
    }
}

class PracticeUnit {
    constructor() {
        this.left = []
        this.right = []
    }
}

class PracticeSet {
    constructor() {
        this.title = ""
        this.author = ""

        this.cards = []
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

// main
{
    const top_menu_layout = [
        new NavPoint("home", "bx-home", "./index.html"),
        new NavPoint("practice sets", "bx-math", "./practice-sets.html"),
        new NavPoint("settings", "bx-dots-vertical-rounded", "#"),
    ];
    const bottom_menu_layout = [
        new NavPoint("update", "bx-sync", "#"),
        new NavPoint("about", "bx-code-curly", "#"),
    ];
    const sidebar = new Sidebar(top_menu_layout, bottom_menu_layout);

    set_html_by_class("sidebar", sidebar.gen_html(page_title));
    
    set_html_by_class("page-title", page_title);
    document.title = ["lang learn", page_title? ' - ' + page_title : ''].join("");
};