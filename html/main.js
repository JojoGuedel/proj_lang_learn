class NavPoint {
    constructor(title, link) {
        this.title = title;
        this.link = link;

        this.children = [];
    }

    add_child(nav_point) {
        this.children.push(nav_point);
        return this;
    }
}

let gen_nav_menu_html = function (nav_menu_layout, layer) {
    if (layer == null)
        layer = 0;

    ret = ["<div class=\"nav-menu-element nav-menu-depth-", layer, "\">"].join("");

    for (let i = 0; i < nav_menu_layout.length; i++) {
        const e = nav_menu_layout[i];

        ret += ["<a href=\"", e.link, "\"><span>", e.title, "</span></a>"].join("");

        if (e.children.length > 0)
            ret += gen_nav_menu_html(e.children, layer + 1);
    
    }
        
    ret += "</div>";
    return ret;
}

let set_html_by_id = function(element_id, html) {
    let e = document.getElementById(element_id);

    if (e != null)
        e.innerHTML = html;
}

{
    let nav_menu = [
        new NavPoint("practice set", "/index.html")
            .add_child(new NavPoint("learn", "/index.html"))
            .add_child(new NavPoint("download", "/index.html"))
            .add_child(new NavPoint("edit", "/index.html")),

        new NavPoint("settings", "/index.html"),
        new NavPoint("about", "/index.html"),
    ];

    let nav_menu_html = gen_nav_menu_html(nav_menu);
    set_html_by_id("nav-menu-anchor", nav_menu_html);
}