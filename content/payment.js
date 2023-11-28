function insertPayment() {
    $(`<div id="payRequestUnfriender">
                <div>
                    <div>
                        <div class="leftColumn">
                            <h2>Please use the email you have provided for purchasing Messenger Cleaner</h2>
                            <p>
                                <form>
                                    <input type="text" name="email" placeholder="Email"> <button>OK</button>
                                </form>
                            </p>
                        </div>
                        <div>
                            <h2>Access to Messenger Cleaner is paid
                            <br>
                            Choose payment below
                            </h2>
                            <div class="MassUnfrienderPlans">
                                <label>Plans available</label>
                                <p>Monthly subscription <a href="https://node.verblike.com/messengercleaner/oneTime/month">$3.99</a></p>
                                <p class="specialOffer">Unlimited access <span>limited time offer</span> <a href="https://node.verblike.com/messengercleaner/oneTime/oneday" class="specialYellowButton">$5.99</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`).appendTo('body').on('click', 'button', function (event) {
        event.preventDefault()
        checkPayment($(this).parent().find('input').val(), (e) => {
            if (e == true) {
                $('#payRequestUnfriender').remove()
                startScript();
            }
        })
    })
}
insertPayment()


function checkPayment(email, cb) {
    $.get('https://us-central1-massunfriender.cloudfunctions.net/DBinsert/isMember?email=' + email).done((e) => {
        cb(e && e.result)
    }).fail(() => {
        cb(false)
    })
}