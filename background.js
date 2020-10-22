var user = {
    purchased: false
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action == 'run') {

    }
    if (message.action == 'close') {
        chrome.tabs.remove(sender.tab.id);
    }
    if(message.type == 'data')  
        sendResponse(user)
    if(message.email) 
        checkPayment(message.email, (e)=>{
            sendResponse(e);
            user.purchased = e;
        }) 

    return true;
});




function catcher(f){
    try{
        f()
        return true;
    }catch(err){
        console.log(err)
        // _gaq.push(['_trackEvent', 'catcher', err]);
        return false;
    }
}
// tesEmail2@gmail.com
function checkPayment(email, cb){
  $.get('https://us-central1-massunfriender.cloudfunctions.net/DBinsert/isMember?email='+email).done((e)=>{
    cb(e && e.result)
  }).fail(()=>{
    cb(false)
  })
}