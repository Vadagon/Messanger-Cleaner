function startScript() {
    if (!$('div[role="navigation"] div[aria-label="Menu"]').length) alert('Make sure your Facebook interface language is English.')
    else $.confirm({
        title: 'Be careful!',
        content: 'Are you sure you want to delete all messages?',
        theme: 'supervan',
        buttons: {
            confirm: {
                text: 'Yes, delete',
                action: function () {
                    deletAllMessages()
                }
            },
            cancel: {
                text: `Cancel`,
                action: function () {
                    location.reload();
                }
            }
        }
    });
    $("html, body, .jconfirm.jconfirm-supervan.jconfirm-open").css("overflow", "hidden");



    var success = function () {
        $("#body")
            .remove();
        $.confirm({
            title: "Success",
            content: "All messages have been removed. If you like this tool - please rate it 5 stars on Chrome Web Store! :)",
            theme: 'supervan',
            buttons: {
                confirm: {
                    "text": "Ok",
                    action: function () {
                        location.reload();
                    }
                }
            }
        });
    }


    async function deletAllMessages() {
        $('div[role="grid"]').children().children().children().animate({ scrollTop: 0 })
        await sleep(800)
        // eventFire($('div[role="navigation"] div[aria-label="Menu"]')[0]);
        $('div[role="navigation"] div[aria-label="Menu"]').eq(1).click();
        await sleep(800)
        $('span:contains("Delete conversation"), span:contains("Delete chat")').closest('div[role="menuitem"]').eq(0).click()
        await sleep(800)
        $('div[aria-label="Delete Conversation"][role="button"], div[aria-label="Delete chat"][role="button"]').eq(1).click()
        await sleep(800)
        $('div[role="grid"]').children().children().children().animate({ scrollTop: 800 })
        await sleep(800)
        deletAllMessages()
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    function eventFire(el, etype) {
        // console.log('eventFire', el);
        if (el.fireEvent) {
            el.fireEvent('on' + etype);
        } else {
            var evObj = document.createEvent('Events');
            evObj.initEvent(etype, true, false);
            el.dispatchEvent(evObj);
        }
    }
}