const path = require('path');
const fs = require('fs');

String.prototype.hashCode = function () {
    var hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}
function create_button(name, cl, element) {
    let _cl = cl ? cl : name;
    let _element = element ? element : "a";

    const button = document.createElement(_element);
    button.innerText = name;
    button.classList.add(_cl);

    return button;
}

class Settings {
    constructor() {
        this.reload_default();
        this.reload();
        this.reload_default();
    }

    reload_default() {
        if (!this.content)
            this.content = {};
        if (!this.content.temp)
            this.content.temp = {};

        if (!this.content.home_dir)
            this.content.home_dir = path.resolve('.');
        if (!this.content.data_dir)
            this.content.data_dir = path.resolve('./data/');
        if (!this.content.practice_set_dir)
            this.content.practice_set_dir = path.resolve('./data/practice_sets/');

        if (!this.content.sidebar_visible)
            this.content.sidebar_visible = true;

        if (!this.content.min_correct)
            this.content.min_correct = 1;

        // if (!this.content.temp.test)
        //     this.content.temp.test = "test";

        if (!this.content.practice_block_size)
            this.content.practice_block_size = 20;
    }

    reload() {
        const buffer = fs.readFileSync(path.join(this.content.data_dir, "/settings.json")).toString();
        this.content = JSON.parse(buffer);
        this.reload_default();
    }


    review_save_props(key, value) {

        if (key == 'temp') return undefined;
        return value;
    }

    save() {
        const buffer = JSON.stringify(this.content, this.review_save_props);
        fs.writeFileSync(path.join(this.content.data_dir, "/settings.json"), buffer);
    }
}
const settings = new Settings();

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

    gen_element() {
        const menu_element = document.createElement('div');
        menu_element.classList.add('menu-bar');
        menu_element.appendChild(this.gen_menu_element("menu-top", this.top_menu_layout));
        menu_element.appendChild(this.gen_menu_element("menu-bottom", this.bottom_menu_layout));

        return menu_element;
    }

    gen_header_element() {
        const header_element = document.createElement('header');

        const title_element = document.createElement('div');
        header_element.appendChild(title_element);
        title_element.append('lang learn');
        title_element.classList.add('title');

        const toggle_element = document.createElement('i');
        header_element.appendChild(toggle_element);
        toggle_element.classList.add('bx');
        toggle_element.classList.add('bx-chevron-right');
        toggle_element.classList.add('toggle');

        return header_element;
    }

    gen_menu_element(menu_type, layout) {
        const menu_list = document.createElement("ul");
        menu_list.classList.add(menu_type);

        for (let i = 0; i < layout.length; i++) {
            const element = layout[i];
            const is_current = settings.content.temp.page_title == element.title;

            const list_element = document.createElement("li");
            menu_list.appendChild(list_element);
            if (is_current)
                list_element.classList.add("active");

            const link_element = document.createElement('a');
            list_element.appendChild(link_element);
            link_element.href = is_current ? '#' : element.link;

            const icon_element = document.createElement('i');
            link_element.appendChild(icon_element);
            icon_element.classList.add('bx');
            icon_element.classList.add(element.icon);
            icon_element.classList.add('icon');

            const title_element = document.createElement('span');
            link_element.appendChild(title_element);
            title_element.append(element.title);
        }

        return menu_list;
    }
}

class PracticeDefinition {
    constructor(expression, group) {
        this.group = group;
        this.expression = expression;
    }
}

class PracticeSet {
    constructor() {
        this.meta_data = {};

        this.meta_data.file_name = getRandomInt(100000000000000) + '' + getRandomInt(100000000000000) + ".json";

        this.definitions = [];
        this.links = [];
    }

    static load_all() {
        const practice_set_dir = path.join(settings.content.data_dir, "/practice_sets/");
        const file_names = fs.readdirSync(practice_set_dir);

        let practice_sets = [];
        for (let i = 0; i < file_names.length; i++) {
            const file_name = file_names[i];

            const json_str = fs.readFileSync(path.join(practice_set_dir, file_name)).toString();
            const json_practice_set = JSON.parse(json_str);
            const practice_set = new PracticeSet();

            practice_set.meta_data = json_practice_set.meta_data;
            practice_set.meta_data.file_name = file_name;
            practice_set.definitions = json_practice_set.definitions;
            practice_set.links = json_practice_set.links;

            practice_sets.push(practice_set);
        }
        return practice_sets;
    }

    save() {
        const json_str = JSON.stringify(this);
        fs.writeFileSync(path.join(settings.content.practice_set_dir, this.meta_data.file_name), json_str);
    }

    delete() {
        fs.unlinkSync(path.join(settings.content.practice_set_dir, this.meta_data.file_name));
    }

    get_def(definition) {
        for (let i = 0; i < this.definitions.length; i++) {
            if (definition.expression == this.definitions[i].expression &&
                definition.group == this.definitions[i].group)
                    return i;
        }
            
        this.links.push([]);
        return this.definitions.push(definition) - 1;
    }

    gen_preview() {
        const preview_element = document.createElement('div');
        preview_element.classList.add('practice-set-preview');

        const title_element = document.createElement('h1');
        title_element.append(this.meta_data.title);
        preview_element.appendChild(title_element);

        const list_element = document.createElement('ul');
        
        const author_element = document.createElement('li');
        author_element.append(this.meta_data.author);
        
        const count_element = document.createElement('li');
        count_element.append(this.definitions.length);
        
        list_element.appendChild(author_element);
        list_element.appendChild(count_element);
        preview_element.appendChild(list_element);

        return preview_element;
    }
}

class PracticeMode01_MetaData {
    constructor() {
        this.correct = [];
        this.visited = [];
        this.blocks = [];

        this.size = 20;
        this.group = 0;

        this.last_block = 0;
        this.last_def = 0;

        this.last_block_correct = true;
        this.min_correct = 1;
    }

    static from_practice_set(practice_set) {
        if (!practice_set.meta_data.practice_mode_01)
            return PracticeMode01_MetaData.gen_blocks(practice_set, 1);
        else {
            const mode_data = new PracticeMode01_MetaData();
            mode_data.correct = practice_set.meta_data.practice_mode_01.correct;
            mode_data.visited = practice_set.meta_data.practice_mode_01.visited;
            mode_data.blocks = practice_set.meta_data.practice_mode_01.blocks;

            mode_data.size = practice_set.meta_data.practice_mode_01.size;
            mode_data.group = practice_set.meta_data.practice_mode_01.group;

            mode_data.last_block = practice_set.meta_data.practice_mode_01.last_block;
            mode_data.last_def = practice_set.meta_data.practice_mode_01.last_def;

            mode_data.min_correct = practice_set.meta_data.practice_mode_01.min_correct;
            return mode_data;
        }
    }

    static gen_blocks(practice_set, group) {
        if (!practice_set.meta_data.practice_mode_01)
            practice_set.meta_data.practice_mode_01 = new PracticeMode01_MetaData();
        
        const mode = practice_set.meta_data.practice_mode_01;
        mode.correct = [];
        mode.visited = [];
        mode.blocks = [];
        mode.group = group;

        let current = 0;
        for (let i = 0; i < practice_set.definitions.length; i++) {
            const def = practice_set.definitions[i];

            if (def.group != group) continue;
            if (current == 0) {
                mode.correct.push([]);
                mode.visited.push([]);
                mode.blocks.push([]);
            }
            
            mode.correct[mode.blocks.length - 1].push(0);
            mode.visited[mode.blocks.length - 1].push(0);
            mode.blocks[mode.blocks.length - 1].push(i);
            current = (current + 1) % mode.size;
        }

        practice_set.save();
        return mode;
    }

    get_next(correct) {
        if (this.last_def == 0) this.last_block_correct = true;
        
        if (correct) this.correct[this.last_block][this.last_def] += 1;
        if (this.correct[this.last_block][this.last_def] < this.min_correct) this.last_block_correct = false;
        
        this.last_def = (this.last_def + 1) % this.size;
        if (this.last_def == 0 && this.last_block_correct) {
            this.last_block += 1;
            
            if (this.last_block >= this.blocks.length) return -1;
        }
        
        this.visited[this.last_block][this.last_def] += 1;
        return this.blocks[this.last_block][this.last_def];
    }

    get_current() {
        if (this.last_block >= this.blocks.length) return -1;
        return this.blocks[this.last_block][this.last_def];
    }
}

class PracticeMode01 {
    constructor(practice_set) {
        this.practice_set = practice_set;
        this.mode_data = PracticeMode01_MetaData.from_practice_set(this.practice_set);
    }

    save() {
        this.practice_set.meta_data.practice_mode_01.size = this.mode_data.size;
        this.practice_set.meta_data.practice_mode_01.group = this.mode_data.group;

        this.practice_set.meta_data.practice_mode_01.last_block = this.mode_data.last_block;
        this.practice_set.meta_data.practice_mode_01.last_def = this.mode_data.last_def;

        this.practice_set.meta_data.practice_mode_01.last_block_correct = this.mode_data.last_block_correct;
        this.practice_set.meta_data.practice_mode_01.min_correct = this.mode_data.min_correct;

        this.practice_set.save();
    }

    submit_awnser() {
        const awnser = this.input_element.value;
        const links = this.practice_set.links[this.mode_data.get_current()];

        this.correct_awnsers = [];
        this.wrong_awnsers = [];

        for (let i = 0; i < links.length; i++) {
            const solution = this.practice_set.definitions[links[i]].expression;
            
            if (awnser.includes(solution)) this.correct_awnsers.push(solution);
            else this.wrong_awnsers.push(solution);
        }

        if (this.wrong_awnsers.length == 0) {
            this.input_element.value = '';

            if (this.mode_data.get_next(true) == -1)
                this.quit_view();

            this.save();
            this.load_practice();
        }
        else {
            this.practice_view_element.classList.add('hide');
            this.practice_solution_element.classList.remove('hide');

            this.load_solution();
        }
    }
    
    load_solution() {
        this.title_element.innerHTML = '';
        this.title_element.append(this.practice_set.definitions[this.mode_data.get_current()].expression);
        
        this.user_awnser_element.innerHTML = '';
        this.user_awnser_element.append(this.input_element.value);
        
        this.solution_list_element.innerHTML = '';
        this.wrong_awnsers.forEach(awnser => {
            const li_element = document.createElement('li');
            li_element.classList.add('wrong');
            li_element.append(awnser);
            this.solution_list_element.appendChild(li_element);
        });
        
        this.correct_awnsers.forEach(awnser => {
            const li_element = document.createElement('li');
            li_element.classList.add('correct');
            li_element.append(awnser);
            this.solution_list_element.appendChild(li_element);
        });
    }
    
    load_practice() {
        this.span_element.innerHTML = '';
        this.input_element.value = '';
        this.input_element.focus();
        this.span_element.append(this.practice_set.definitions[this.mode_data.get_current()].expression);
    }
    
    load_solution_view() {
        this.practice_solution_element = document.createElement('div');
        this.practice_solution_element.classList.add('practice-solution');
        this.practice_solution_element.classList.add('hide');
        
        this.awnser_element = document.createElement('div');
        this.awnser_element.classList.add('awnser');
        this.practice_solution_element.appendChild(this.awnser_element);
        
        this.title_element = document.createElement('span');
        this.awnser_element.appendChild(this.title_element);
        
        this.user_awnser_element = document.createElement('span');
        this.awnser_element.append(this.user_awnser_element);
        
        this.solution_list_element = document.createElement('ul');
        this.solution_list_element.classList.add('practice-solution-list');
        this.practice_solution_element.appendChild(this.solution_list_element);

        this.solution_user_actions = document.createElement('div');
        this.solution_user_actions.classList.add('practice-set-solution-actions');
        this.practice_solution_element.appendChild(this.solution_user_actions);

        const correct_awnser_button_element = create_button('i was correct', 'correct-awnser');
        correct_awnser_button_element.addEventListener('click', () => {
            this.practice_solution_element.classList.add('hide');
            this.practice_view_element.classList.remove('hide');

            if (this.mode_data.get_next(true) == -1)
                this.quit_view();

            this.save();
            this.load_practice();
        });
        this.solution_user_actions.appendChild(correct_awnser_button_element);

        const continue_button_element = create_button('continue');
        continue_button_element.addEventListener('click', () => {
            this.practice_solution_element.classList.add('hide');
            this.practice_view_element.classList.remove('hide');

            if (this.mode_data.get_next(false) == -1)
                this.quit_view();

            this.save();
            this.load_practice();
        });
        this.solution_user_actions.appendChild(continue_button_element);

        this.anchor_element.appendChild(this.practice_solution_element);

        // window.onkeydown = (event) => {
        //     if (event.keyCode != 13) return;

        //     this.practice_solution_element.classList.add('hide');
        //     this.practice_view_element.classList.remove('hide');

        //     window.onkeydown = (event) => {};
        //     this.mode_data.get_next(false);
        //     this.load_practice();
        // };
    }

    load_view() {
        const local_list =  document.querySelector('.practice-set-local-list');
        local_list.classList.add('hide');

        this.anchor_element = document.querySelector('.practice-view-placeholder');
        this.practice_view_element = document.createElement('div');

        this.practice_expr_element = document.createElement('div');
        this.practice_expr_element.classList.add('practice-expr');

        this.span_element = document.createElement('span');
        // this.span_element.append(this.blocks[this.current_block][this.current_expr].left[0]);
        this.practice_expr_element.appendChild(this.span_element);

        this.submit_section_element = document.createElement('div');
        this.submit_section_element.classList.add('search');

        this.input_element = document.createElement('input');
        this.input_element.type = 'text';
        this.input_element.placeholder = 'enter awnser...';
        this.input_element.addEventListener("keypress", (event) => {
            if (event.keyCode == 13)
                this.submit_awnser();
        });
        this.submit_section_element.appendChild(this.input_element);

        const submit_button_element = create_button('submit');
        submit_button_element.addEventListener("click", () => {
            this.submit_awnser();
        });
        this.submit_section_element.appendChild(submit_button_element);

        const option_section_element = document.createElement('div');
        option_section_element.classList.add('options');

        const go_back_button_element = create_button('go back', 'back');
        go_back_button_element.addEventListener('click', () => {
            this.quit_view();
            this.save();
        });
        option_section_element.appendChild(go_back_button_element);

        // const button_reset_progress = create_button("reset progress", "reset-progress");
        // button_reset_progress.addEventListener("click", () => {
        // });
        // option_section_element.appendChild(button_reset_progress);

        // const swap_button_element = create_button('swap');
        // swap_button_element.addEventListener('click', () => {
        // })
        // option_section_element.appendChild(swap_button_element);

        this.practice_view_element.innerHTML = '';
        this.practice_view_element.appendChild(this.practice_expr_element);
        this.practice_view_element.appendChild(this.submit_section_element);
        this.practice_view_element.appendChild(option_section_element);

        this.anchor_element.appendChild(this.practice_view_element);

        this.load_solution_view();

        this.load_practice();
    }

    quit_view() {
        const local_list = document.querySelector('.practice-set-local-list');
        local_list.classList.remove('hide');

        this.anchor_element.innerHTML = '';
    }
}

const set_html_by_class = function (element_class, html) {
    let e = document.getElementsByClassName(element_class);

    for (let i = 0; i < e.length; i++) {
        e[i].innerHTML = html;
    }
}

const set_replace_by_class = function (element_class, html) {
    let e = document.getElementsByClassName(element_class);

    for (let i = 0; i < e.length; i++) {
        e[i].outerHTML = html;
    }
}

function http_get(theUrl) {
    try {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", theUrl, false); // false for synchronous request
        // xmlHttp.setRequestHeader("User-Agent", "Mozilla/5.0");
        xmlHttp.send(null);
        return xmlHttp.responseText;

    } catch (e) {
        console.log(e);
        return null;
    }
}

function parse_quizlet(url) {
    const text = http_get(url);
    if (!text) return;
    const html = new DOMParser().parseFromString(text, "text/html");

    let title = html.querySelectorAll(".SetPage-titleWrapper h1");
    if (title.length == 0) return;
    title = title[0].innerHTML;

    let author = html.querySelectorAll(".UserLink-createdBy + .UILink span");
    if (author.length == 0) return;
    author = author[0].innerHTML;

    let practice_set = new PracticeSet();
    practice_set.meta_data.url = url;
    practice_set.meta_data.title = title;
    practice_set.meta_data.author = author;

    let last;
    let definitions = html.querySelectorAll(".TermText");
    for (let i = 0; i < definitions.length; i++) {
        const def_expr = definitions[i].innerHTML;
        const group = i % 2;
        const def = new PracticeDefinition(def_expr, group);

        if (group == 0)
            last = def;
        else {
            const def_a = practice_set.get_def(last);
            const def_b = practice_set.get_def(def);

            practice_set.links[def_a].push(def_b);
            practice_set.links[def_b].push(def_a);
        }
    }

    return practice_set;
}

async function handle_download() {
    const content = document.querySelector(".practice-set-download .content");
    content.innerHTML = '<div style="display:flex;justify-content:center;"><div class="loading-ring"></div></div>';

    const url = document.querySelector(".practice-set-download .search input").value;
    if (!url) {
        content.innerHTML = 'please enter a url.';
        return;
    }

    await delay(20);

    // debugger;
    const practice_set = parse_quizlet(url);
    if (!practice_set || practice_set.definitions.length == 0)
        content.innerHTML = 'sorry... we could not find this practice set.';
    else {
        content.innerHTML = '';
        content.appendChild(practice_set.gen_preview());

        const practice_set_buttons_element = document.createElement('div');
        practice_set_buttons_element.classList.add('practice-set-buttons');

        const save_button_element = create_button('save');
        save_button_element.addEventListener('click', () => {
            practice_set.save();
        });

        practice_set_buttons_element.appendChild(save_button_element);
        content.appendChild(practice_set_buttons_element);
    }
}

function load_practice_set_downloader() {
    let search = document.querySelector(".practice-set-download i");
    if (!search) return;
    search.addEventListener("click", handle_download);

    search = document.querySelector(".practice-set-download input");
    if (!search) return;
    search.addEventListener("keypress", (event) => {
        if (event.keyCode == 13)
            handle_download();
    });
}

function load_practice_set_local_list() {
    let content = document.querySelector(".practice-set-local-list ul");
    if (!content)
        return;

    let practice_sets = PracticeSet.load_all();

    for (let i = 0; i < practice_sets.length; i++) {
        const element = practice_sets[i];

        const list_element = document.createElement('li');
        list_element.appendChild(element.gen_preview());

        const buttons = document.createElement('div');
        buttons.classList.add('practice-set-buttons');

        const button_open = create_button("practice");
        button_open.addEventListener('click', () => {
            settings.content.temp.selected_practice_set = element;
            load_practice_mode();
        })
        buttons.appendChild(button_open);

        // const button_reset_progress = create_button("reset progress", "reset-progress");
        // button_reset_progress.addEventListener("click", () => {
        //     element.reset();
        // });
        // buttons.appendChild(button_reset_progress);

        const button_delete = create_button("delete");
        button_delete.addEventListener("click", () => {
            element.delete();
            list_element.remove();
        });
        buttons.appendChild(button_delete);

        list_element.appendChild(buttons);
        content.append(list_element);
    }
}

function load_practice_mode() {
    const practice_set = settings.content.temp.selected_practice_set;
    if (!practice_set) return;

    let practice_mode = new PracticeMode01(practice_set);
    practice_mode.load_view();
}

// main
{
    // page title
    set_html_by_class("page-title", page_title);
    settings.content.temp.page_title = page_title;
    document.title = ["lang learn", page_title ? ' - ' + page_title : ''].join("");

    // sidebar
    const top_menu_layout = [
        // new NavPoint("home", "bx-home", "./index.html"),
        new NavPoint("practice", "bx-math", "./practice-sets.html"),
        new NavPoint("download", "bx-download", "./download.html"),
        // new NavPoint("settings", "bx-dots-vertical-rounded", "#"),
    ];
    const bottom_menu_layout = [
        // new NavPoint("update", "bx-sync", "#"),
        // new NavPoint("about", "bx-code-curly", "#"),
    ];

    const sidebar_model = new Sidebar(top_menu_layout, bottom_menu_layout);
    const sidebar_element = document.querySelector('.sidebar');
    sidebar_element.appendChild(sidebar_model.gen_header_element());
    sidebar_element.appendChild(sidebar_model.gen_element());

    if (!settings.content.sidebar_visible)
        sidebar_element.classList.add("close");

    document.querySelector(".toggle").addEventListener("click", () => {
        settings.content.sidebar_visible = !settings.content.sidebar_visible;
        settings.save();

        sidebar_element.classList.toggle("close");
    });

    load_practice_set_downloader();

    load_practice_set_local_list();
}