
//#region [=== VARIABLE ===]

var v_title = '';
var v_key = '';

var m_loading = '';
var m_list = [];
var m_images = [];

var m_isIE7 = false;
var m_isIE8 = false;
var m_browserWidth = window.innerWidth || Math.max(document.documentElement.clientWidth, document.body.clientWidth);
var m_browserHeight = window.innerHeight || Math.max(document.documentElement.clientHeight, document.body.clientHeight);
var m_device = 'pc';

var m_edit = null;
var m_view = null;
var m_menu = null;
var m_title = null;
var m_iconMenu = null;
var m_iconSearch = null;
var m_iconUser = null;
var m_textSearch = null;
var m_textSearchWidth = 200;

var m_boximg;
var m_userid = '';

//#endregion

//#region [=== DETECT DEVICE, BROWSER WIDTH ===]

if (!window.console) console = { log: function () { } };

if (m_browserWidth < 500)
    m_device = 'mobile';
else if (m_browserWidth < 1024)
    m_device = 'tablet';

var ua = navigator.userAgent;
m_isIE7 = ua.indexOf('MSIE 7') > 0;
m_isIE8 = ua.indexOf('MSIE 8') > 0;

document.getElementsByTagName('body')[0].className = m_device;

console.log(m_device, m_browserWidth);

//#endregion

//#region [=== FUNCTION ===]

function cooSet(cname, cvalue) {
    var exdays = 10;
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function cooGet(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function pad2(n) { return n < 10 ? '0' + n : n }

function eventAdd(obj, type, fn) {
    if (obj.attachEvent) {
        obj['e' + type + fn] = fn;
        obj[type + fn] = function () { obj['e' + type + fn](window.event); }
        obj.attachEvent('on' + type, obj[type + fn]);
    } else
        obj.addEventListener(type, fn, false);
}

function eventRemove(obj, type, fn) {
    if (obj.detachEvent) {
        obj.detachEvent('on' + type, obj[type + fn]);
        obj[type + fn] = null;
    } else
        obj.removeEventListener(type, fn, false);
}

function convertNumber(text) {
    if (/^(\-|\+)?([0-9]+|Infinity)$/.test(text))
        return Number(text);
    return null;
}

function callAjax(url, callback, data, method) {
    if (method == null) method = 'GET';
    var xmlhttp;
    // compatible with IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
            if (callback.ok != null) callback.ok(xmlhttp.responseText);
    }
    xmlhttp.onerror = function () {
        if (callback.error != null) callback.error(xmlhttp.status);
    }
    xmlhttp.open(method, url, true);
    xmlhttp.setRequestHeader('Cache-Control', 'no-cache');
    xmlhttp.send(data);
}

//#endregion

function logout() {
    cooSet('userid', '');
    location.href = '/login.html';
}

function login() {
    var user = document.getElementById('Username').value;
    var pass = document.getElementById('Password').value;
    var url = '/user?user=' + user + '&pass=' + pass;

    callAjax(url, {
        error: function (err) { },
        ok: function (val) {
            console.log(val);
            if (val != '') {
                cooSet('userid', val);
                location.href = '/admin.html';
            } else {
                alert('Đăng nhập không thành công. Nhập chính xác tài khoản.');
            }
        }
    });
}

function menuLoad() {
    var key = m_textSearch.value;
    m_menu.innerHTML = '';

    callAjax('/api?key=' + key, {
        error: function (err) { },
        ok: function (json) {
            if (json == 'login') logout();

            try {
                var obj = JSON.parse(json);
                m_list = obj;

                var s = '<div class="menuIcon"><span class="icon" onclick="itemAddNew()">&#61943</span><span class="icon" onclick="logout()">&#61720</span></div>';
                s += '<div class="menuItems">';
                for (var i = 0; i < m_list.length; i++)
                    s += '<a href="javascript:itemLoad(\'' + m_list[i]['Key'] + '\',\'' + m_list[i]['Title'] + '\')" name="' + m_list[i]['Key'] + '">' + m_list[i]['Title'] + '</a>';
                s += '</div>';
                m_menu.innerHTML = s;
            } catch (err) { }
        }
    });
}

function pageReady() {
    m_userid = cooGet('userid');
    if (m_userid == null || m_userid == '') {
        location.href = '/login.html';
    }

    if (location.href.indexOf('/login.html') != -1) return;

    m_loading = document.getElementById('loading');
    m_loading.style.display = 'none';
    m_boximg = document.getElementById('box-img');
    m_view = document.getElementById('view');
    m_edit = document.getElementById('edit');
    m_menu = document.getElementById('menu');
    m_title = document.getElementById('title');
    m_iconMenu = document.getElementById('iconMenu');
    m_iconUser = document.getElementById('iconUser');
    m_iconSearch = document.getElementById('iconSearch');
    m_textSearch = document.getElementById('textSearch');
    m_textSearch.style.width = m_textSearchWidth + 'px';

    if (m_device == 'mobile') {
        m_title.style.width = (m_browserWidth - 70) + 'px';
    } else {
        var wi = (m_browserWidth - (m_textSearchWidth + 70)).toString() + 'px';
        m_title.style.width = wi;
    }

    m_view.style.height = m_browserHeight + 'px';

    menuLoad();

    //#region [=== EVENT ===]

    eventAdd(m_iconSearch, 'click', function () {
        if (m_device == 'mobile') {
            if (m_textSearch.style.display == 'block') {
                m_title.style.display = 'block';
                m_textSearch.style.display = 'none';
            } else {
                m_title.style.display = 'none';
                m_textSearch.style.display = 'block';
                m_textSearch.focus();
            }
        }
    });

    eventAdd(m_iconMenu, 'click', function () {
        if (m_menu.style.display == 'none')
            m_menu.style.display = 'table-cell';
        else
            m_menu.style.display = 'none';
    });

    //#endregion
}


function itemLoad(key, title) {
    v_key = key;
    v_title = title;
    var nodes = m_menu.getElementsByTagName('a');
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        if (node.name == key)
            node.className = 'active';
        else
            node.className = '';
    }

    if (m_device == 'mobile') {
        m_menu.style.display = 'none';
    }

    m_title.innerHTML = title;


    var ls = _.filter(m_list, function (m) { return m.Key == key; });
    if (ls == null || ls.length == 0) return;
    var obj = ls[0];

    var file = '/data/' + obj['File'] + '.htm';
    console.log(file);

    callAjax('/module/view/temp.htm', {
        error: function (_err) { },
        ok: function (_temp) {
            callAjax(file, {
                error: function (_err) { },
                ok: function (_text) {
                    //console.log(text);

                    var a_headingNumber = ['1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.', '10.', '11.', '12.', '13.', '14.', '15.', '16.', '17.', '18.', '19.', '20.', '21.', '22.', '23.', '24.', '25.', '26.', '27.', '28.', '29.', '30.', '31.', '32.', '33.', '34.', '35.', '36.', '37.', '38.', '39.', '40.', '41.', '42.', '43.', '44.', '45.', '46.', '47.', '48.', '49.', '50.', '51.', '52.', '53.', '54.', '55.', '56.', '57.', '58.', '59.', '60.', '61.', '62.', '63.', '64.', '65.', '66.', '67.', '68.', '69.', '70.', '71.', '72.', '73.', '74.', '75.', '76.', '77.', '78.', '79.', '80.', '81.', '82.', '83.', '84.', '85.', '86.', '87.', '88.', '89.', '90.', '91.', '92.', '93.', '94.', '95.', '96.', '97.', '98.', '99.'];

                    var lines = [];
                    var contents = [];
                    var article = { Key: obj['Key'], File: obj['File'] };

                    var a = _text.split('\n');
                    for (var i = 0; i < a.length; i++) {
                        var _value = a[i];
                        switch (i) {
                            case 0:
                                article['DateCreate'] = _value;
                                break;
                            case 1:
                                article['Theme'] = _value;
                                break;
                            case 2:
                                article['Tags'] = _value;
                                break;
                            case 3:
                                article['Title'] = _value;
                                break;
                            default:
                                contents.push(_value);
                                var text = _value.trim();

                                if (text.length > 0) {
                                    if (text.indexOf('{img') == 0) {
                                        var src = text.substring(4, text.length - 4);
                                        text = '<p class="img"><img src="' + src + '"></p>';
                                    } else {
                                        var headingNumber = _.filter(a_headingNumber, function (m) {
                                            return text.indexOf(m) == 0 || text.indexOf('*') == 0;
                                        }).length > 0;
                                        if (headingNumber) text = '<p class="b"><b>' + text + '</b></p>';
                                        else text = '<p>' + text + '</p>';
                                    }
                                }

                                lines.push(text);
                                break;
                        }
                    }

                    article['Content'] = lines.join('');
                    //console.log(article);
                    var htm = _.template(_temp, { variable: 'item' })(article);

                    var theme = obj['Theme'];
                    var hostKey = 'blog-' + location.host.split('.').join('-');
                    var del = '';
                    if (v_title != 'home' && v_title != hostKey)
                        del = '<div class="menuRemove icon" onclick="itemRemove(\'' + obj['File'] + '\')">&#61918</div>';

                    //console.log(htm); 
                    m_view.innerHTML = del + '<div class="menuPlus icon" onclick="itemEdit(\'' + obj['File'] + '\')">&#61943</div>' + htm;


                    m_edit.innerHTML = '<textarea id="edit_content">' + _text + '\r\r\r\r\r\r\r\r\r\r\r\r\r\r\r\r\r\r\r\r\r\r\r\r\r\r\r\r\r\r\r\r\r\r\r\r\r\r\r\r\r\r\r\r\r\r\r\r\r\r</textarea>' +
                        '<div class="menuClose icon" onclick="itemCloseEdit()">&#61956</div>' +
                    '<div class="menuPlus icon" style="right:42px;" onclick="itemSave(\'' + obj['File'] + '\')">&#61787</div>' +
                    '<div class="menuPlus icon" style="right:82px;" onclick="imgLoad()">&#61782</div>';

                    if (theme == 'home' || theme == hostKey) {
                        m_edit.style.display = 'table-cell';
                        m_view.style.display = 'none';
                    } else {
                        m_edit.style.display = 'none';
                        m_view.style.display = 'table-cell';
                    }
                }
            });
        }
    });
}

function itemCloseEdit() {
    m_view.style.display = 'table-cell';
    m_edit.style.display = 'none';
}

function itemEdit() {
    m_view.style.display = 'none';
    m_edit.style.display = 'table-cell';
}

function itemSave(file) {
    var data = document.getElementById('edit_content').value;
    var url = '/api?file=' + file;

    callAjax(url, {
        error: function (err) { },
        ok: function (val) {
            if (val == "")
                alert('Save error');
            else {
                var a = val.split('|');
                if (a.length > 2) {
                    var len = a[0].length + a[1].length + 2;
                    var json = val.substring(len, val.length);
                    m_list = JSON.parse(json);
                    itemLoad(a[0], a[1]);
                    itemEdit();
                    menuLoad();
                }
            }
        }
    }, data, 'POST');
}

function itemAddNew() {
    v_key = '';
    v_title = '';
    var date = new Date();
    var dt = date.getFullYear().toString() + pad2(date.getMonth() + 1) + pad2(date.getDate()) + pad2(date.getHours()) + pad2(date.getMinutes()) + pad2(date.getSeconds()) + ("0" + date.getMilliseconds()).slice(-3);;

    var hostKey = 'blog-' + location.host.split('.').join('-');

    /** create id modal */
    var key = 'title-' + dt;
    m_edit.innerHTML =
        '<textarea id="edit_content">' + dt + '\r' + hostKey + '\rBlog\r' + key.toUpperCase().split('-').join(' ') + '\r\r</textarea>' +
        '<div class="menuClose icon" onclick="itemCloseEdit()">&#61956</div>' +
                    '<div class="menuPlus icon" style="right:42px;" onclick="itemSave(\'[NEW]\')">&#61787</div>' +
                    '<div class="menuPlus icon" style="right:82px;" onclick="imgLoad()">&#61782</div>';
    m_edit.style.display = 'table-cell';
    m_view.style.display = 'none';

    if (m_device == 'mobile')
        m_menu.style.display = 'none';
}

function imgLoad() {
    m_boximg.style.display = 'inline-block';
    m_boximg.innerHTML = '';

    callAjax('/img', {
        error: function (err) { },
        ok: function (json) {
            m_images = JSON.parse(json);

            var s = '<div class=imgaction><input id="searchImage" type="text" /><button onclick="imgLoad()">Search</button>' +
                '<input id="browserFile" onchange="imgBrowserUpload()" type="file" />' +
                '<span class="icon imgclose" onclick="imgClose()">&#61956</span></div>';
            for (var i = 0; i < m_images.length; i++)
                s += '<img onclick="imgInsertAtCursor(\'/images/' + m_images[i] + '\')" src="/images/' + m_images[i] + '"/>';

            m_boximg.innerHTML = s;
        }
    });
}

function imgInsertAtCursor(img) {
    var myField = document.getElementById('edit_content');
    var myValue = '\r\r{img' + img + 'img}\r\r';

    //IE support
    if (document.selection) {
        myField.focus();
        sel = document.selection.createRange();
        sel.text = myValue;
    }
        //MOZILLA and others
    else if (myField.selectionStart || myField.selectionStart == '0') {
        var startPos = myField.selectionStart;
        var endPos = myField.selectionEnd;
        myField.value = myField.value.substring(0, startPos)
            + myValue
            + myField.value.substring(endPos, myField.value.length);
    } else {
        myField.value += myValue;
    }
}

function imgClose() {
    m_boximg.style.display = 'none';
}

/* Utility function to convert a canvas to a BLOB */
function dataURLToBlob(dataURL) {
    var BASE64_MARKER = ';base64,';
    if (dataURL.indexOf(BASE64_MARKER) == -1) {
        var parts = dataURL.split(',');
        var contentType = parts[0].split(':')[1];
        var raw = parts[1];

        return new Blob([raw], { type: contentType });
    }

    var parts = dataURL.split(BASE64_MARKER);
    var contentType = parts[0].split(':')[1];
    var raw = window.atob(parts[1]);
    var rawLength = raw.length;

    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
}

function imgBrowserUpload() {
    m_loading.style.display = 'block';

    var fileInput = document.getElementById("browserFile");
    var file = fileInput.files[0];
    console.log('file = ', file);

    // Ensure it's an image
    if (file.type.match(/image.*/)) {
        console.log('An image has been loaded');


        // Load the image
        var reader = new FileReader();
        reader.onload = function (readerEvent) {
            var image = new Image();
            image.onload = function (imageEvent) {

                // Resize the image
                var canvas = document.createElement('canvas'),
                    max_size = 544,// TODO : pull max size from a site config
                    width = image.width,
                    height = image.height;
                if (width > height) {
                    if (width > max_size) {
                        height *= max_size / width;
                        width = max_size;
                    }
                } else {
                    if (height > max_size) {
                        width *= max_size / height;
                        height = max_size;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                canvas.getContext('2d').drawImage(image, 0, 0, width, height);
                var dataUrl = canvas.toDataURL('image/jpeg');
                var resizedImage = dataURLToBlob(dataUrl);
                //$.event.trigger({
                //    type: "imageResized",
                //    blob: resizedImage,
                //    url: dataUrl
                //});

                //console.log('dataUrl = ', dataUrl);
                console.log('resizedImage = ', resizedImage);

                var fd = new FormData();
                fd.append('file', resizedImage);
                var xhr = new XMLHttpRequest();
                xhr.open('POST', '/img?file=123');
                xhr.setRequestHeader('Key', v_key);
                xhr.setRequestHeader('FileName', file.name);

                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        //alert(xhr.responseText);
                        imgLoad();
                        m_loading.style.display = 'none';
                    }
                }
                xhr.onerror = function () {
                    console.log(xhr.status);
                    alert('Upload image error.');
                    m_loading.style.display = 'none';
                }
                xhr.send(fd);
            }
            image.src = readerEvent.target.result;
        }
        reader.readAsDataURL(file);
    }


    ////var fd = new FormData();
    ////fd.append('file', file);
    ////var xhr = new XMLHttpRequest();
    ////xhr.open('POST', '/img?file=123');

    ////xhr.onreadystatechange = function () {
    ////    if (xhr.readyState == 4 && xhr.status == 200) {
    ////        console.log(xhr.responseText);
    ////        imgLoad();
    ////    }
    ////}
    ////xhr.onerror = function () {
    ////    console.log(xhr.status);
    ////}
    ////xhr.send(fd);
}

function itemRemove(file) {
    var result = confirm("Are you sure to delete file?");
    if (result) {
        m_loading.style.display = 'block';
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/del?file=' + file);

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                //alert(xhr.responseText);
                m_view.innerHTML = '';
                m_edit.innerHTML = '';
                menuLoad();
                m_loading.style.display = 'none';
                m_menu.style.display = 'table-cell';
                alert('Delete [ ' + v_title + ' ] successfully');
            }
        }
        xhr.onerror = function () {
            console.log(xhr.status);
        }
        xhr.send(null);
    }
}