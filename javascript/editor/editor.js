    // Визуальный редактор, админка

    class Parse {
        constructor() {
            this.data = JSON.parse(data); // получаем объект преобразованный в JSON из php (MySQL)
            this.filter = function (arr, key, value) { // шаблон для фильтрации массива
                return arr.filter(function (item) {
                    return +item[key] === +value;
                })
            }
        }
        id(arr) {
            return this.filter(arr, 'id', id)[0]; // фильтрация по id параметру из php
        }
        section(section, arr) { // функция для фильтрации массива по разделу
            return this.filter(arr, 'section', section);
        }
        level(level, arr) { // фильтрация по уровню
            return this.filter(arr, 'level', level);
        }
        cat(cat, arr) { // фильтрация по категории
            return this.filter(arr, 'cat', cat);
        }
        currentData() {
            this.sectionId = this.id(this.data)['section']; // текущий раздел
            this.levelId = this.id(this.data)['level']; // текущий уровень
            this.catId = this.id(this.data)['cat']; // текущая категория
            this.subCatId = this.id(this.data)['subcat']; // текущая подкатегория  
            return this;
        }
        filterArray() {
            this.sortSection = this.section(this.sectionId, this.data); // сортировка по разделу
            this.sortLevel = this.level(this.levelId, this.data); // сортировка по уровню
            this.sortCat = this.cat(this.catId, this.data); // сортировка по категории
            this.level2 = this.level(1, this.sortSection); // сортировка по уровню и разделу (уровень 2)
            this.subCatLevel3 = this.level(this.levelId - 1, this.cat(this.catId, this.data)); // сортировка массива по уровню и категории (субкатегория уровень 3)
            this.subCatLevel2 = this.level(this.levelId, this.cat(this.catId, this.data));
            return this;
        }
        newData() {
            this.sectionId = 1;
            this.levelId = 1;
            this.catLast();
            return this;
        }
        catLast() {
            let lastCat = parse.data.map(function (item) { // все категории
                return item['cat']
            }).sort(function (a, b) {
                return a - b;
            })
            this.catId = +lastCat[lastCat.length - 1] + 1;
        }
        subCatLast() {
            let lastSubCat = parse.data.map(function (item) { // получаем все субкатегории
                return item['subcat']
            }).sort(function (a, b) { // сортируем по возрастанию
                return a - b;
            })
            this.subCatId = +lastSubCat[lastSubCat.length - 1] + 1; // номер новой субкатегории
        }
    }
    let parse = new Parse();


    class Form {
        constructor() {
            this.form = document.querySelector('form');
            this.submit();
        }
        element(formElement) {
            return this.form.querySelector(formElement);
        }
        sendForm() {
            let xhr = new XMLHttpRequest();
            let formData = new FormData(this.form)
            xhr.open("POST", "/admin/articles/upload.php", true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    let an = xhr.responseText;
                    if (an) {
                        console.log(an);
                    }
                    document.location.href = '/admin/bs.php';
                }
            };
            xhr.send(formData);
        }
        submit() {
            this.form.addEventListener('submit', function (e) {
                e.preventDefault();
                if (form.element('#editable').dataset.status === '0') {
                    form.element('#text').value = form.element('#editable').innerText;
                } else {
                    form.element('#text').value = form.element('#editable').innerHTML;
                }
                form.sendForm();
            });
        }
    }
    let form = new Form();


    class Menu {
        constructor() {
            if (Boolean(id)) { // если id существует
                parse.currentData().filterArray();
                this.section().level().cat().subCat();
            } else {
                parse.newData().filterArray();
                this.section().level().catLast().subCatDefault();
            }
        }
        section() {
            form.element('#section select').children[parse.sectionId - 1].setAttribute("selected", "selected");
            return this;
        }
        level() {
            form.element('#level select').addEventListener('change', function () {
                parse.levelId = this.value;
                menu.cat();
                parse.catId = form.element('#cat select').value;
                parse.filterArray();
                if (+parse.levelId === 2) {
                    menu.subCat();
                } else if (+parse.levelId === 3) {
                    menu.subCat();
                } else {
                    parse.catLast();
                    menu.catLast().subCatDefault();
                }
            });
            form.element('#level select').children[parse.levelId - 1].setAttribute("selected", "selected");
            return this;
        }
        catLast() {
            if (!form.element('#cat').classList.contains('hide')) {
                form.element('#cat').classList.add('hide');
            }
            form.element('#cat select').innerHTML = '<option value="' + parse.catId + '"></option>';
            return this;
        }
        cat() {
            form.element('#cat select').addEventListener('change', function () {
                parse.catId = this.value;
                parse.filterArray();
                menu.subCat();
            })
            form.element('#cat select').innerHTML = '';
            form.element('#cat').classList.remove('hide');
            for (let key in parse.level2) {
                form.element('#cat select').innerHTML += '<option value="' + parse.level2[key]['cat'] + '">' + parse.level2[key]['title'] + '</option>';
                if (parse.level2[key]['cat'] === parse.catId) {
                    form.element('#cat select').children[key].setAttribute("selected", "selected");
                }
            }
            return this;
        }
        subCatHide() {
            if (!form.element('#subcat').classList.contains('hide')) {
                form.element('#subcat').classList.add('hide');
            }
            return this;
        }
        subCatLast() {
            this.subCatHide();
            parse.subCatLast();
            form.element('#subcat select').innerHTML = '<option value="' + parse.subCatId + '"></option>';
            return this;
        }
        subCatDefault() {
            form.element('#subcat select').innerHTML = '<option value="0"></option>';
            return this;
        }
        subCat() {
            form.element('#subcat select').innerHTML = '';
            let toggle;
            if (+parse.levelId === 2) {
                toggle = parse.subCatLevel2;
                form.element('#subcat').classList.add('hide');
            } else if (+parse.levelId === 3) {
                toggle = parse.subCatLevel3;
                form.element('#subcat').classList.remove('hide');
            }
            for (let key in toggle) {
                form.element('#subcat select').innerHTML += '<option value="' + toggle[key]['subcat'] + '">' + toggle[key]['title'] + '</option>';
                if (toggle[key]['subcat'] === parse.subCatId) {
                    form.element('#subcat select').children[key].setAttribute("selected", "selected");
                }
            }
            return this;
        }
    }
    let menu = new Menu();


    class Editor {
        constructor() {
            this.htmlButton().boldButton().spanButton().preJsButton()
                .preCssButton().preBashButton().preUlLiButton();
        }
        htmlButton() {
            form.element('#html').addEventListener('click', function (e) {
                e.preventDefault();
                if (form.element('#editable').dataset.status === '0') {
                    form.element('#editable').classList.remove('html');
                    form.element('#editable').dataset.status = '1';
                    form.element('#editable').innerHTML = form.element('#editable').innerText.trim();
                } else {
                    form.element('#editable').dataset.status = '0';
                    form.element('#editable').classList.add('html');
                    form.element('#editable').innerText = form.element('#editable').innerHTML.trim();
                }
            });
            return this;
        }
        boldButton() {
            form.element('#bold').addEventListener('click', e => {
                e.preventDefault();
                let range = document.getSelection().getRangeAt(0);
                let outer = document.getSelection().focusNode.parentNode;
                console.log(outer);
                if (outer.tagName === 'B') {
                    outer.outerHTML = outer.innerText;
                } else {
                    range.surroundContents(document.createElement('b'));
                }
            })
            return this;
        }
        spanButton() {
            form.element('#spanht').addEventListener('click', e => {
                e.preventDefault();

                let range = document.getSelection().getRangeAt(0);
                let outer = document.getSelection().focusNode.parentNode;

                if (outer.tagName === 'SPAN') {
                    outer.outerHTML = outer.innerText;
                } else {
                    range.surroundContents(document.createElement('span'));
                    let span = range.commonAncestorContainer.querySelectorAll('span');
                    span.forEach(item => {
                        if (item.classList.value === '') {
                            item.classList.add('ht');
                        }
                    });
                }
            });
            return this;
        }
        preJsButton() {
            form.element('#prejs').addEventListener('click', e => {
                e.preventDefault();
                let range = document.getSelection().getRangeAt(0);
                let pre = document.createElement('pre');
                this.tagPre(range);
                range.surroundContents(pre);
                pre.classList.add('language-js', 'line-numbers');
                pre.innerHTML = "<code class = 'language-js'>&nbsp;</code>";
            });
            return this;
        }
        tagPre(range) {
            //range.setStartAfter(document.getSelection().focusNode); // выводим диапазон за внешний тег
            if (document.getSelection().focusNode.parentNode.parentNode.tagName === 'PRE') { // если выходим прямо за тег pre
                range.setStartAfter(document.getSelection().focusNode.parentNode.parentNode); // устанавливаем диапазон прямо за тегом pre
            }
        }
        preCssButton() {
            form.element('#precss').addEventListener('click', e => {
                e.preventDefault();
                let range = document.getSelection().getRangeAt(0);
                let pre = document.createElement('pre');
                range.surroundContents(pre);
                pre.classList.add('language-css', 'line-numbers');
                pre.innerHTML = "<code class = 'language-css'>&nbsp;</code>";
            });
            return this;
        }
        preBashButton() {
            form.element('#prebash').addEventListener('click', e => {
                e.preventDefault();
                let range = document.getSelection().getRangeAt(0);
                let pre = document.createElement('pre');
                this.tagPre(range);
                range.surroundContents(pre);
                pre.classList.add('language-bash', 'line-numbers');
                pre.innerHTML = "<code class = 'language-bash'>&nbsp;</code>";
            });
            return this;
        }
        preUlLiButton() {
            form.element('#preulli').addEventListener('click', e => {
                e.preventDefault();
                let range = document.getSelection().getRangeAt(0); // получение диапазона под выделением или курсором

                if (document.getSelection().focusNode.tagName === 'LI') { // если элемент слева от фокуса li
                    let ul = document.getSelection().focusNode.closest('ul'); // текущий список ul
                    ul.insertAdjacentHTML("beforeend", "<li class = 'li'>&nbsp;</li>"); // добавление HTML в конец списка
                } else if (document.getSelection().focusNode.parentNode.parentNode.tagName === 'PRE') {
                    range.setStartAfter(document.getSelection().focusNode.parentNode);
                    this.createUlLi();
                } else {
                    this.createUlLi();
                }
            });
            return this;
        }
        createUlLi() {
            let ul = document.createElement('ul'); // создание элемента ul
            document.getSelection().focusNode.after(ul); // добавление элемента ul за смещённую позицию
            ul.innerHTML = "<li class = 'li'>&nbsp;</li>";
        }
    }
    const editor = new Editor();