$.confirm({
    title: 'Be careful!',
    content: 'Are you sure you want to delete all messages?',
    theme: 'supervan',
    buttons: {
        confirm: {
            text: 'Yes, delete',
            action: function() {
                deletAllMessages()
            }
        },
        cancel: {
            text: `Cancel`,
            action: function() {
                chrome.extension.sendMessage({ 'action': 'close' }, function(response) {});
            }
        }
    }
});
$("html, body, .jconfirm.jconfirm-supervan.jconfirm-open").css("overflow", "hidden");















var success = function() {
    $("#body")
        .remove();
    $.confirm({
        title: "Success",
        content: "All messages have been removed. If you like this tool - please rate it 5 stars on Chrome Web Store! :)",
        theme: 'supervan',
        buttons: {
            confirm: {
                "text": "Ok",
                action: function() {
                    chrome.extension.sendMessage({
                        'action': 'close'
                    }, function(response) {});
                }
            }
        }
    });
}

const FB_ORGIN = window.location.origin;
const FB_MESSAGE_URL = "https://web.facebook.com/messages";
const VERIFY_FB_MESSAGE_URL = "facebook.com/messages";
const FB_DEL_CONVERSATION_API = FB_ORGIN + "/ajax/mercury/delete_thread.php?dpr=1";
const FB_DEL_UNREAD_THREAD_API = FB_ORGIN + "/ajax/mercury/unread_threads.php?dpr=1";
const FB_PULL_MESSAGES_API = FB_ORGIN + "/ajax/mercury/threadlist_info.php?dpr=1";
const NO_MESSAGES_SELECTED = "No messages selected";
const PLEASE_WAIT_MOMENT = "Please wait a moment...";
const DELETE_SELECTED_CHAT_SUMMARIES = "DELETE_SELECTED_CHAT_SUMMARIES";
const SELECT_ALL_CHATSUMMARY_CHECKBOX = "SELECT_ALL_CHATSUMMARY_CHECKBOX";
const CHATSUMMARY_CHECKBOX = "CHATSUMMARY_CHECKBOX ";
const PULL_MESSAGE_COUNT = 1000;
//Functions for select and delete:
//another way of getting the object and properly populates the list
function getChatSummaryObject() {
    if (window.location.href.search(VERIFY_FB_MESSAGE_URL) >= 0) {
        var iframe = document.getElementsByTagName('iframe')[0];
        chatSummaryObj = iframe ? iframe.contentDocument.getElementById('globalContainer')
            .querySelectorAll('[role="navigation"] > div > ul > li') : document.querySelectorAll('[role="navigation"]')[1].querySelectorAll('li');
        chatSummaryCount = chatSummaryObj.length;
        return chatSummaryObj
    }
}
function constructPullChatPayload(userInfo) {
    if (currentlyLoggedUserInfo != null && window.location.href.search(VERIFY_FB_MESSAGE_URL) >= 0) {
        return "client=web_messenger&inbox[offset]=0&inbox[limit]=" + PULL_MESSAGE_COUNT + "&&__user=" + currentlyLoggedUserInfo.accountId + "&__a=1&__dyn=&__af=i0&__req=3e&__be=-1&__pc=" + userInfo.pkgCoHort + "&__rev=" + userInfo.revision + "&fb_dtsg=" + userInfo.token + "&ttstamp="
    }
}
function constructDeleteChatPayload(userInfo) {
    if (currentlyLoggedUserInfo != null && window.location.href.search(VERIFY_FB_MESSAGE_URL) >= 0) {
        return "ids[0]={{CHAT_ID}}&__user=" + currentlyLoggedUserInfo.accountId + "&__a=1&__dyn=&__af=o&__req=l&__be=-1&__pc=" + userInfo.pkgCoHort + "&fb_dtsg=" + userInfo.token + "&ttstamp=&__rev=" + userInfo.revision + "&__srp_t=" + userInfo.pageGenTime
    }
}
var isChatSummaryAlreadySelecetd = function isChatSummaryAlreadySelecetd(selectedChatSummaries, elementId) {
    var flag = false;
    if (selectedChatSummaries && elementId) {
        for (var i = 0; i < selectedChatSummaries.length; i++) {
            if (selectedChatSummaries[i].id == elementId) {
                flag = true;
                break
            }
        }
    }
    return flag
};
var startDel = async function startDel(chatSummaryObj, callback, isDeleteAll) {
    this.chatSummaryCount = chatSummaryObj.length;
    for (var i = 0; i < chatSummaryObj.length; i++) {
        if (chatSummaryObj[i].name === CHATSUMMARY_CHECKBOX) {
            getRecipientUIDAndDeleteConversation(chatSummaryObj[i].id, callback, isDeleteAll);
        } else {
            const indexOfHref = chatSummaryObj[i].innerHTML.search('data-href');
            const id = chatSummaryObj[i].innerHTML.substr(indexOfHref)
                .match('^(.+?)>')[1].split("=")[1].replace(/"/g, '');
            getRecipientUIDAndDeleteConversation(id, callback, isDeleteAll);
        }
    }
};
var getRecipientUIDAndDeleteConversation = function(id, callback, isDeleteAll) {
    const fbUrlSplit = id.split('/');
    var iframe = document.getElementsByTagName('iframe')[0];
    let chatIdOrRecipientUsername = fbUrlSplit[fbUrlSplit.length - 1].split('?')[0];
    if (Number(chatIdOrRecipientUsername)) {
        deleteConversation(chatIdOrRecipientUsername, callback, isDeleteAll);
    } else {
        $.get(FB_ORGIN + '/' + chatIdOrRecipientUsername, function(data) {
            let indexOfUidObj = data.search('owning_profile');
            const symbolsToCut = iframe ? 2 : 1;
            let profileIdObj = data.substr(indexOfUidObj + 'owning_profile'.length + symbolsToCut)
                .match(/(.*?\})/)[0];
            if (iframe) {
                if (indexOfUidObj !== -1) {
                    try {
                        recipientUID = JSON.parse(profileIdObj)
                            .id;
                    } catch (err) {}
                } else {
                    let indexOfUid = data.search('pageID');
                    let profileIdStr = data.substr(indexOfUid + 'pageID'.length + 3);
                    if (indexOfUid === -1) {
                        indexOfUid = data.search('userID');
                        profileIdStr = data.substr(indexOfUid + 'userID'.length + 3);
                    }
                    if (profileIdStr.match('^[0-9]+')) {
                        recipientUID = profileIdStr.match('^[0-9]+')[0];
                    }
                }
            } else {
                const idIndex = profileIdObj.search('id');
                const profileId = profileIdObj.substr(idIndex + 4)
                    .match('^[0-9]+');
                if (profileId) {
                    recipientUID = profileId[0];
                } else {
                    let indexOfUid = data.search('fb://profile/');
                    let profileIdStr = data.substr(indexOfUid + 'fb://profile/'.length);
                    if (indexOfUid === -1) {
                        indexOfUid = data.search('fb://page/');
                        profileIdStr = data.substr(indexOfUid + 'fb://page/'.length);
                    }
                    if (profileIdStr.match('^[0-9]+')) {
                        recipientUID = profileIdStr.match('^[0-9]+')[0];
                    }
                }
            }
            deleteConversation(recipientUID, callback, isDeleteAll);
        })
    }
};
var deleteConversation = function(chatId, callback) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(chatId + " deleted");
            chatSummaryCount--;
            if (!chatSummaryCount) {
                deleteUnrreadThreads();
                window.setTimeout(function() {
                    tmpChatSummaryObj = getChatSummaryObject();
                    if (tmpChatSummaryObj.childNodes.length > 0) {
                        startDel(tmpChatSummaryObj)
                    } else {
                        callback(true)
                    }
                }, 3500)
            }
        }
    };
    xhttp.open("POST", FB_DEL_CONVERSATION_API, true);
    xhttp.send(deletePayload.replace("{{CHAT_ID}}", chatId))
};
var deleteUnrreadThreads = function() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log("deleteUnrreadThreads executed")
        }
    };
    xhttp.open("POST", FB_DEL_UNREAD_THREAD_API, true);
    xhttp.send("folders[0]:other&__user:" + currentlyLoggedUserInfo.accountId + "&client=mercury")
};
function getCurrentlyLoggedUserInfo() {
    if (window.location.href.search(VERIFY_FB_MESSAGE_URL) >= 0) {
        return getUserInfoObject(getUserInfoFromFbScript())
    } else {
        return null
    }
}
function getUserInfoObject(userInfoFromFbScript) {
    var userInfo = {};
    userInfo.pageGenTime = getPageGenerationTime(userInfoFromFbScript);
    userInfo.revision = getRevision(userInfoFromFbScript);
    userInfo.accountId = getAccountId(userInfoFromFbScript);
    userInfo.pkgCoHort = getPkgCoHort(userInfoFromFbScript);
    userInfo.token = getToken(userInfoFromFbScript);
    return userInfo
}
function getAccountId(userInfoObject) {
    return extractUserInfo(userInfoObject, "CurrentUserInitialData", "ACCOUNT_ID")
}
function getRevision(userInfoObject) {
    return extractUserInfo(userInfoObject, "SiteData", "revision")
}
function getPkgCoHort(userInfoObject) {
    return extractUserInfo(userInfoObject, "SiteData", "pkg_cohort")
}
function getPageGenerationTime(userInfoObject) {
    return extractUserInfo(userInfoObject, "SiteData", "__spin_t")
}
function getToken(userInfoObject) {
    return extractUserInfo(userInfoObject, "DTSGInitialData", "token")
}
function getUserInfoFromFbScript() {
    let s = [...document.querySelectorAll('script')].find(x => /DTSG/.test(x.innerHTML))
        .innerHTML;
    let userInfoObject = JSON.parse(/({"define":.*]]]]})\);/m.exec(s)[1])
        .define;
    return userInfoObject;
}
function extractUserInfo(userInfoObject, category, key) {
    var tempValue = null;
    for (var i = 0; i < userInfoObject.length; i++) {
        if (userInfoObject[i][0] == category) {
            tempValue = userInfoObject[i][2][key];
            break
        }
    }
    return tempValue
};
var chatSummaryCount = 0;
window.onload = function() {
    var chatSummaryCount = 0;
    var chatSummaryObj = getChatSummaryObject(),
        currentlyLoggedUserInfo, deletePayload, pullAnotherSetMsgsPayload
};
function initBackgroundProcess() {
    currentlyLoggedUserInfo = getCurrentlyLoggedUserInfo();
    deletePayload = constructDeleteChatPayload(currentlyLoggedUserInfo);
    pullAnotherSetMsgsPayload = constructPullChatPayload(currentlyLoggedUserInfo)
}
var deleteConversation = function deleteConversation(chatId, callback, isDeleteAll) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            chatSummaryCount--;
            if (!chatSummaryCount) {
                if (isDeleteAll) {
                    pullFBAnotherSetOfMsgs(callback)
                } else {
                    callback(true)
                }
            }
        }
    };
    xhttp.open("POST", FB_DEL_CONVERSATION_API, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(deletePayload.replace("{{CHAT_ID}}", chatId))
};
var insertDeleteBtn = function insertDeleteBtn() {
    var headerNode = document.querySelectorAll("[role='navigation']")[0];
    var iframe = document.getElementsByTagName('iframe')[0];
    if (!document.getElementById(DELETE_SELECTED_CHAT_SUMMARIES) || (iframe && !iframe.contentDocument.getElementById(DELETE_SELECTED_CHAT_SUMMARIES))) {
        var deleteBtn = document.createElement("input");
        deleteBtn.setAttribute("type", "button");
        deleteBtn.setAttribute("id", DELETE_SELECTED_CHAT_SUMMARIES);
        deleteBtn.setAttribute("name", DELETE_SELECTED_CHAT_SUMMARIES);
        deleteBtn.setAttribute("style", "position: absolute;top: 150px; z-index: 200; margin: -37px 0px 0px; width: 100;left: 40%;border: none;background-color: #d9534f;color: white;padding: 4px 32px;font-size: 16px;");
        deleteBtn.setAttribute("value", "Delete Selected Messages");
        deleteBtn.addEventListener("click", function() {
            if (selectedChatSummaries.length > 0) {
                document.getElementById(DELETE_SELECTED_CHAT_SUMMARIES)
                    .value = PLEASE_WAIT_MOMENT;
                startDel(selectedChatSummaries, function() {
                    window.location.href = '/messages';
                }, false)
            } else {
                alert(NO_MESSAGES_SELECTED)
            }
        });
        headerNode.appendChild(deleteBtn)
    }
    //creates select all button
    if (iframe && !iframe.contentDocument.getElementById(SELECT_ALL_CHATSUMMARY_CHECKBOX)) {
        insertSelectAllCheckbox(iframe);
    } else if (!document.getElementById(SELECT_ALL_CHATSUMMARY_CHECKBOX)) {
        insertSelectAllCheckbox();
    }
};
var insertSelectAllCheckbox = function(iframe) {
    //creates label beside button
    var conversationList = iframe ? iframe.contentDocument.getElementById('globalContainer')
        .querySelectorAll('[role="navigation"] > div > ul')[0] : document.querySelector('[role="navigation"] > div > ul');
    var selectAllLabel = document.createElement("label");
    selectAllLabel.innerHTML = "Select All";
    selectAllLabel.setAttribute("style", "margin:15px;font-size: 16px;");
    conversationList.insertBefore(selectAllLabel, conversationList.firstChild);
    //creates select all button
    var selectAllCheckbox = document.createElement("input");
    selectAllCheckbox.setAttribute("type", "checkbox");
    selectAllCheckbox.setAttribute("id", SELECT_ALL_CHATSUMMARY_CHECKBOX);
    selectAllCheckbox.setAttribute("name", SELECT_ALL_CHATSUMMARY_CHECKBOX);
    selectAllCheckbox.setAttribute("style", "margin-top:20px;height: 20px;width: 20px;cursor: pointer;");
    selectAllCheckbox.addEventListener("change", function() {
        toggleSelectAllChatSummaries(selectAllCheckbox)
    });
    conversationList.insertBefore(selectAllCheckbox, conversationList.firstChild)
}
var selectedChatSummaries = [];
var initSelectAndDeleteOperation = function initSelectAndDeleteOperation(script) {
    if (getChatSummaryObject()
        .length > 0) {
        insertDeleteBtn();
        //inserts checkboxes
        insertCheckboxes();
        return true
    }
    return false
};
//creates checkboxes
var createNewCheckboxElement = function createNewCheckboxElement(id) {
    var newCheckbox = document.createElement("input");
    newCheckbox.setAttribute("type", "checkbox");
    newCheckbox.setAttribute("id", id);
    newCheckbox.setAttribute("name", CHATSUMMARY_CHECKBOX);
    newCheckbox.setAttribute("style", "margin-top:20px;height: 20px;width: 20px;cursor: pointer;");
    newCheckbox.addEventListener("change", function() {
        updateSelectedChatSummaries(newCheckbox, newCheckbox.checked)
    });
    return newCheckbox
};
//puts checkboxes on the page
var insertCheckboxes = function insertCheckboxes() {
    var chatSummaryObj = getChatSummaryObject();
    for (var i = 0; i < chatSummaryObj.length; i++) {
        try {
            if (chatSummaryObj[i].firstElementChild.name != CHATSUMMARY_CHECKBOX) {
                const indexOfHref = chatSummaryObj[i].innerHTML.search('data-href');
                const id = chatSummaryObj[i].innerHTML.substr(indexOfHref)
                    .match('^(.+?)>')[1].split("=")[1].replace(/"/g, '');
                chatSummaryObj[i].insertBefore(createNewCheckboxElement(id), chatSummaryObj[i].firstChild)
            }
        } catch (err) {}
    }
};
var toggleSelectAllChatSummaries = function toggleSelectAllChatSummaries(selectAllCheckbox) {
    console.log(selectAllCheckbox);
    if (selectAllCheckbox) {
        var chatSummaryObj = getChatSummaryObject();
        for (var i = 0; i < chatSummaryObj.length; i++) {
            updateSelectedChatSummaries(chatSummaryObj[i].firstChild, selectAllCheckbox.checked)
        }
    }
    var checkboxes = document.querySelectorAll("[name='" + CHATSUMMARY_CHECKBOX + "']");
    var iframe = document.getElementsByTagName('iframe')[0];
    if (iframe) {
        checkboxes = iframe.contentDocument.querySelectorAll("[name='" + CHATSUMMARY_CHECKBOX + "']");
    }
    for (var i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = selectAllCheckbox.checked
    }
    initBackgroundProcess();
};
//updates kill list
var updateSelectedChatSummaries = function updateSelectedChatSummaries(element, isSelected) {
    console.log(element)
    if (isSelected && element && element.id) {
        console.log("1");
        if (!isChatSummaryAlreadySelecetd(selectedChatSummaries, element.id)) {
            console.log("1-1");
            selectedChatSummaries.push(element)
        }
        if (chatSummaryCount == selectedChatSummaries.length) {
            var iframe = document.getElementsByTagName('iframe')[0];
            if (iframe) {
                iframe.contentDocument.getElementById(SELECT_ALL_CHATSUMMARY_CHECKBOX)
                    .checked = true
            } else {
                document.getElementById(SELECT_ALL_CHATSUMMARY_CHECKBOX)
                    .checked = true
            }
            console.log("1-2");
        }
    } else {
        console.log("2");
        for (var i = 0; i < selectedChatSummaries.length; i++) {
            if (selectedChatSummaries[i].id == element.id) {
                console.log("2-1");
                selectedChatSummaries.splice(i, 1);
                --i
            }
        }
        if (selectedChatSummaries.length < chatSummaryCount) {
            console.log("2-2");
            var iframe = document.getElementsByTagName('iframe')[0];
            if (iframe) {
                iframe.contentDocument.getElementById(SELECT_ALL_CHATSUMMARY_CHECKBOX)
                    .checked = false
            } else {
                document.getElementById(SELECT_ALL_CHATSUMMARY_CHECKBOX)
                    .checked = false
            }
        }
    }
    initBackgroundProcess();
};
//DELETE ALL CONVERSATIONS FUNCTIONS:
var pullFBAnotherSetOfMsgs = function pullFBAnotherSetOfMsgs(callback) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            try {
                var responseData = JSON.parse(this.responseText.replace("for (;;);", ""));
                chatSummaryCount = responseData.payload.threads.length;
                for (var i = 0; i < chatSummaryCount; i++) {
                    deleteConversation(responseData.payload.threads[i].thread_fbid, callback)
                }
            } catch (err) {
                callback(true)
            }
        }
    };
    xhttp.open("POST", FB_PULL_MESSAGES_API, true);
    xhttp.send(pullAnotherSetMsgsPayload)
};
var buildKillAll = function buildKillAll(element, isSelected) {
    selectedChatSummaries.push(element)
    initBackgroundProcess();
}
function deletAllMessages(){
    var chatSummaryObj = getChatSummaryObject();
    for (var i = 0; i < chatSummaryObj.length; i++) {
        buildKillAll(chatSummaryObj[i], true);
    }
    startDel(selectedChatSummaries, function() {
        window.location.href = '/messages';
    }, true);
};



