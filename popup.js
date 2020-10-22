var a = {
    purchased: undefined
}
chrome.extension.sendMessage({type: 'data'}, (e)=>{
    a.purchased = e.purchased;
})
class PopupActions {
    constructor() {
        this.pageFacebook = "https://www.facebook.com/messages/?locale=en_US";
    }

    isMessagePage(url) {
        if(url.indexOf("https://www.facebook.com/messages/") != -1){
            return true;
        } else {
            return false;
        }
    }

    removeMessages() {
        chrome.windows.getCurrent(function (currentWindow) {
            chrome.tabs.query({active: true, windowId: currentWindow.id}, function (activeTabs) {
                activeTabs.map(function (tab) {
                    chrome.tabs.insertCSS(tab.id, {file: 'assets/css/confirm.css', allFrames: false})
                    chrome.tabs.insertCSS(tab.id, {file: 'assets/css/content.css', allFrames: false})
                    chrome.tabs.executeScript(tab.id, {file: 'libs/jquery.js', allFrames: false});
                    chrome.tabs.executeScript(tab.id, {file: 'libs/jquery-confirm.min.js', allFrames: false});
                    if(a.purchased) chrome.tabs.executeScript(tab.id, {file: 'content/script.js', allFrames: false});
                    else chrome.tabs.executeScript(tab.id, {file: 'content/payment.js', allFrames: false});
                });
            });
        });
    }



    openPage() {
        chrome.tabs.create({url: this.pageFacebook});
    }


    initAction() {


        chrome.tabs.getSelected(null, function (tab) {
            this.currentUrl = tab.url;
            if (this.isMessagePage(this.currentUrl) == true) {
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
        }.bind(this));
        $("#link").attr('href', `https://chrome.google.com/webstore/detail/${chrome.runtime.id}`);

    }
}

$(function () {
    let actions = new PopupActions();
    actions.initAction();
});
