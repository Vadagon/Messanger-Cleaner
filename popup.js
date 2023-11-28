var a = {
    purchased: undefined
}

class PopupActions {
    constructor() {
        this.pageFacebook = "https://www.facebook.com/messages/?locale=en_US";
    }

    isMessagePage(url) {
        if (url.indexOf("https://www.facebook.com/messages/") != -1) {
            return true;
        } else {
            return false;
        }
    }

    removeMessages() {
        chrome.windows.getCurrent(function (currentWindow) {
            chrome.tabs.query({ active: true, windowId: currentWindow.id }, function (activeTabs) {
                activeTabs.map(function (tab) {
                    chrome.scripting.insertCSS({
                        target: { tabId: tab.id },
                        files: ["assets/css/confirm.css", "assets/css/content.css"]
                    });
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: [
                            "libs/jquery.js",
                            "libs/jquery-confirm.min.js",
                            "content/script.js",
                            "content/payment.js"
                        ]
                    })
                    // chrome.tabs.insertCSS(tab.id, { file: 'assets/css/confirm.css', allFrames: false })
                    // chrome.tabs.insertCSS(tab.id, { file: 'assets/css/content.css', allFrames: false })
                    // chrome.tabs.executeScript(tab.id, { file: 'libs/jquery.js', allFrames: false });
                    // chrome.tabs.executeScript(tab.id, { file: 'libs/jquery-confirm.min.js', allFrames: false });
                    // if (a.purchased) chrome.tabs.executeScript(tab.id, { file: 'content/script.js', allFrames: false });
                    // else chrome.tabs.executeScript(tab.id, { file: 'content/payment.js', allFrames: false });
                });
            });
        });
    }



    openPage() {
        chrome.tabs.create({ url: this.pageFacebook });
    }


    initAction() {

        chrome.windows.getCurrent((currentWindow) => {
            chrome.tabs.query({ active: true, windowId: currentWindow.id }, (activeTabs) => {
                activeTabs.map((tab) => {
                    var currentUrl = tab.url;
                    if (this.isMessagePage(currentUrl) == true) {
                        $("#removeMessages").on("click", this.removeMessages.bind(this));
                        $("#openMessenger").addClass('disabled');
                        $("#openMessenger").attr('disabled', 'disabled');
                        $("#openMessenger").on("click", function (e) {
                            e.preventDefault();
                        })
                    } else {
                        $("#openMessenger").on("click", this.openPage.bind(this))
                        $("#removeMessages").addClass('disabled');
                        $("#removeMessages").attr('disabled', 'disabled');
                        $("#removeMessages").on("click", function (e) {
                            e.preventDefault();
                            return
                        })
                    }
                });
            });
        })
        $("#link").attr('href', `https://chrome.google.com/webstore/detail/${chrome.runtime.id}`);

    }
}

$(function () {
    let actions = new PopupActions();
    actions.initAction();
});
