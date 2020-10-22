function insertPayment(){
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
                            <h2>Access to MassUnfriender™ is paid
                            <br>
                            Choose payment below
                            </h2>
                            <div class="MassUnfrienderPlans">
                                <label>Plans available</label>
                                <p>Monthly subscription <a href="https://node.verblike.com/massunfriender/oneTime/month">$5</a></p>
                                <p>Annual subscription <a href="https://node.verblike.com/massunfriender/oneTime/annual">$40</a></p>
                                <p>Lifetime one-time payment <a href="https://node.verblike.com/massunfriender/oneTime/full">$140</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`).appendTo('body').on('click', 'button', function(event){
                event.preventDefault()
                chrome.extension.sendMessage({email: $(this).parent().find('input').val()}, (e)=>{
                    if(e==true){
                        $('#payRequestUnfriender').remove()
                    }
                })
            })
}
insertPayment()