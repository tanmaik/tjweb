const MY_COOKIE_NAME = 'count';

function begin() {
    var cval = get_cookie(MY_COOKIE_NAME);
    update_display(cval)
}

function increment_and_update() {
    var cval = parseInt( get_cookie(MY_COOKIE_NAME) );
    if (Number.isInteger(cval)) {
        cval ++;
        set_cookie(MY_COOKIE_NAME, cval);
        update_display(cval);
    }
}

function update_display(cval) {
    var p_display = document.getElementById('id_display');
    p_display.innerHTML = cval;
}

function set_cookie(cookie_name, cval) {
    document.cookie = `${cookie_name}=${cval};path=/`
}

function get_cookie(cookie_name) {
    var decodedCookie = decodeURIComponent(document.cookie);
    return decodedCookie
        .split('; ')
        .find(row => row.startsWith(`${cookie_name}=`))
        .split('=')[1];
}

console.log(document.cookie)

begin()