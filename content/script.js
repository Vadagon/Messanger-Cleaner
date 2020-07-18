$.confirm({
    title: 'Be careful!',
    content: 'Are you sure you want to delete all messages?',
    theme: 'supervan',
    buttons: {
        confirm: {
            text: 'Yes, delete',
            action: function () {
                chrome.extension.sendMessage({'action': 'run'}, function (response) {});
            }
        },
        cancel: {
                text: `Cancel`,
                action: function () {
                    chrome.extension.sendMessage({'action': 'close'}, function (response) {});

                }
            }
    }
});
$("html, body, .jconfirm.jconfirm-supervan.jconfirm-open").css("overflow", "hidden");