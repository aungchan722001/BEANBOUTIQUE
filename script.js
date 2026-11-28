const STORAGE_KEY="beanBoutiqueBag";
const PROFILE_KEY="beanBoutiqueProfile";
const money=n=>"£"+Number(n||0).toFixed(2);
const getBag=()=>JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");
const saveBag=bag=>
{
    localStorage.setItem(STORAGE_KEY,JSON.stringify(bag));
    updateBagCount();
};
function updateBagCount()
{
    const count=getBag().reduce((sum,item)=>sum+item.qty,0);
    document.querySelectorAll("#bagCount").forEach(el=>el.textContent=count);
}
function addItem(name,price)
{
    const bag=getBag();
    const found=bag.find(i=>i.name===name);
    if(found)found.qty++;
    else bag.push(
    {
        name,price:Number(price),qty:1
    }
    );
    saveBag(bag);
    toast(`${name} added to your bag`);
}
function toast(message)
{
    let el=document.querySelector(".toast-message");
    if(!el)
    {
        el=document.createElement("div");
        el.className="toast-message";
        document.body.appendChild(el);
    }
    el.textContent=message;
    el.classList.add("show");
    clearTimeout(window.toastTimer);
    window.toastTimer=setTimeout(()=>el.classList.remove("show"),2300);
}
function renderCart()
{
    const host=document.getElementById("cartItems");
    if(!host)return;
    const bag=getBag();
    if(!bag.length)
    {
        host.innerHTML='<div class="empty-state"><h3>Your bag is taking a little break.</h3><p>Find something lovely for your next brew.</p><a class="btn btn-copper" href="CoffeeSelection.html">Explore coffee ↗</a></div>';
        document.getElementById("checkoutLink").classList.add("disabled");
    }
    else
    {
        host.innerHTML=bag.map((item,index)=>`<article class="cart-row"><img src="${imageFor(item.name)}" alt=""><div><h3>${escapeHtml(item.name)}</h3><p>${money(item.price)} each</p><div class="qty-controls"><button data-qty="${index}" data-change="-1" aria-label="Decrease quantity">−</button><span>${item.qty}</span><button data-qty="${index}" data-change="1" aria-label="Increase quantity">+</button><button class="remove-item" type="button" data-remove="${index}" aria-label="Remove ${escapeHtml(item.name)} from bag" title="Remove item"><i class="bi bi-trash3" aria-hidden="true"></i></button></div></div><b class="cart-price">${money(item.price*item.qty)}</b></article>`).join("");
    }
    const subtotal=bag.reduce((s,i)=>s+i.price*i.qty,0),delivery=subtotal===0||subtotal>=40?0:3.5;
    document.getElementById("cartSubtotal").textContent=money(subtotal);
    document.getElementById("cartDelivery").textContent=delivery?money(delivery):"Free";
    document.getElementById("cartTotal").textContent=money(subtotal+delivery);
}
function imageFor(name)
{
    const map=
    {
        "Indonesia Single Origin":"Indonesia-bean.jpg","Everyday Organic":"Organic-blend.jpg","Brazil Espresso":"Brazil-Espresso.jpg","Brazil Decaf":"Brazil-Decaf.jpg","Arabica":"Arabica.jpg","Robusta":"Robusta.jpg","Liberica":"Liberica.jpg","Excelsa":"Excelsa.jpg","Cocoa Roast Blend":"CRB.jpg","Hand Grinder":"handgrinder.jpg","Coffee Grinder":"machinegrinder.jpg","French Press":"french-press.jpg","Gooseneck Kettle":"kettle.jpg","Coffee Dripper":"coffee-dripper.jpg","Coffee Maker":"coffee-maker.jpg","Digital Scale":"scale.jpg","Filter Set":"3-piece-filter-set.jpg"
    };
    return "images/"+(map[name]||"coffee.jpg");
}
function escapeHtml(value)
{
    return String(value).replace(/[&<>"']/g,c=>(
    {
        "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }
    [c]));
}
function renderCheckout()
{
    const host=document.getElementById("checkoutItems");
    if(!host)return;
    const bag=getBag();
    host.innerHTML=bag.length?bag.map(i=>`<div class="summary-line"><span>${escapeHtml(i.name)} × ${i.qty}</span><b>${money(i.price*i.qty)}</b></div>`).join(""):'<p class="summary-hint">Your bag is empty. Add something before checkout.</p>';
    const subtotal=bag.reduce((s,i)=>s+i.price*i.qty,0),delivery=subtotal===0||subtotal>=40?0:3.5;
    document.getElementById("checkoutTotal").textContent=money(subtotal+delivery);
}
document.addEventListener("DOMContentLoaded",()=>
{
    updateBagCount();renderCart();renderCheckout();

    // Homepage hero slideshow: advances automatically and supports dot navigation.
    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const slideDots = Array.from(document.querySelectorAll(".slide-dot"));
    if (slides.length > 1) {
        let currentSlide = 0;
        const showSlide = (nextIndex) => {
            currentSlide = (nextIndex + slides.length) % slides.length;
            slides.forEach((slide, index) => slide.classList.toggle("is-active", index === currentSlide));
            slideDots.forEach((dot, index) => {
                dot.classList.toggle("is-active", index === currentSlide);
                dot.setAttribute("aria-pressed", index === currentSlide ? "true" : "false");
            });
        };
        slideDots.forEach((dot, index) => dot.addEventListener("click", () => {
            showSlide(index);
            clearInterval(slideshowTimer);
            slideshowTimer = setInterval(() => showSlide(currentSlide + 1), 4500);
        }));
        let slideshowTimer = setInterval(() => showSlide(currentSlide + 1), 4500);
    }

    if(window.jQuery)
    {
        if(jQuery.fn.magnificPopup)
        {
            jQuery(".coffee-popup").magnificPopup(
            {
                type:"image",gallery:
                {
                    enabled:true
                }
                ,mainClass:"mfp-fade"
            }
            );
        }
        if(jQuery.fn.zoom)
        {
            jQuery(".zoom-area").zoom(
            {
                on:"mouseover"
            }
            );
        }
    }
    document.querySelectorAll(".add-button").forEach(btn=>btn.addEventListener("click",()=>addItem(btn.dataset.name,btn.dataset.price)));
    document.querySelectorAll("[data-qty]").forEach(()=>
    {
    }
    );document.addEventListener("click",e=>
    {
        const q=e.target.closest("[data-qty]");if(q)
        {
            const bag=getBag(),i=Number(q.dataset.qty);bag[i].qty+=Number(q.dataset.change);if(bag[i].qty<=0)bag.splice(i,1);saveBag(bag);renderCart();
        }
        const r=e.target.closest("[data-remove]");if(r)
        {
            const bag=getBag();bag.splice(Number(r.dataset.remove),1);saveBag(bag);renderCart();
        }
    }
    );
    const toggle=document.querySelector(".menu-toggle"),nav=document.querySelector(".main-nav");if(toggle&&nav)toggle.addEventListener("click",()=>
    {
        const open=nav.classList.toggle("is-open");toggle.setAttribute("aria-expanded",String(open));
    }
    );
    const search=document.getElementById("coffeeSearch");if(search)search.addEventListener("input",()=>
    {
        const q=search.value.toLowerCase();document.querySelectorAll("#coffeeGrid .shop-card").forEach(card=>card.hidden=!card.dataset.name.includes(q));
    }
    );
    const eSearch=document.getElementById("equipmentSearch");if(eSearch)eSearch.addEventListener("input",()=>
    {
        const q=eSearch.value.toLowerCase();document.querySelectorAll(".equipment-card").forEach(card=>card.hidden=!card.textContent.toLowerCase().includes(q));
    }
    );
    document.querySelectorAll(".filter-btn").forEach(btn=>btn.addEventListener("click",()=>
    {
        document.querySelectorAll(".filter-btn").forEach(b=>b.classList.remove("active"));btn.classList.add("active");document.querySelectorAll("#coffeeGrid .shop-card").forEach(card=>
        {
            const tag=card.querySelector(".tag-float").textContent;card.hidden=btn.dataset.filter!=="all"&&!tag.includes(btn.dataset.filter);
        }
        );
    }
    ));
    document.querySelectorAll(".choose-plan").forEach(btn=>btn.addEventListener("click",()=>
    {
        addItem(btn.dataset.plan+" Subscription",btn.dataset.price);location.href="Cart.html";
    }
    ));
    const welcome=document.getElementById("welcomeModal");if(welcome&&!sessionStorage.getItem("welcomeSeen"))setTimeout(()=>
    {
        welcome.classList.add("is-open");welcome.setAttribute("aria-hidden","false");sessionStorage.setItem("welcomeSeen","1");
    }
    ,1400);
    document.querySelectorAll(".modal-close").forEach(btn=>btn.addEventListener("click",()=>btn.closest(".modal-backdrop").classList.remove("is-open")));
    document.querySelectorAll(".modal-backdrop").forEach(modal=>modal.addEventListener("click",e=>
    {
        if(e.target===modal)modal.classList.remove("is-open");
    }
    ));
    const welcomeForm=document.getElementById("welcomeForm");if(welcomeForm)welcomeForm.addEventListener("submit",e=>
    {
        e.preventDefault();welcome.classList.remove("is-open");toast("Welcome to the Bean Boutique list!");
    }
    );
    const newsletter=document.getElementById("newsletterForm");if(newsletter)newsletter.addEventListener("submit",e=>
    {
        e.preventDefault();toast("Thanks for subscribing!");newsletter.reset();
    }
    );
    const eventForm=document.getElementById("eventForm");if(eventForm)eventForm.addEventListener("submit",e=>
    {
        e.preventDefault();
        const d=new FormData(eventForm);
        const name=d.get("firstName");
        const eventName=d.get("event");
        toast("Thanks "+name+"! Your demo interest in "+eventName+" has been recorded on this page.");
        eventForm.reset();
    }
    );
    document.querySelectorAll(".register-event").forEach(btn=>btn.addEventListener("click",()=>
    {
        const modal=document.getElementById("eventModal");modal.classList.add("is-open");modal.querySelector('[name="event"]').value=btn.dataset.event;
    }
    ));
    const quick=document.getElementById("quickEventForm");if(quick)quick.addEventListener("submit",e=>
    {
        e.preventDefault();
        const d=new FormData(quick);
        const eventName=d.get("event");
        document.getElementById("eventModal").classList.remove("is-open");
        toast("Thanks "+d.get("name")+"! Your demo interest in "+eventName+" has been recorded on this page.");
        quick.reset();
    }
    );
    const profileForm=document.getElementById("profileForm");if(profileForm)
    {
        const profile=JSON.parse(localStorage.getItem(PROFILE_KEY)||"{}");["name","email","phone","brew"].forEach(k=>
        {
            const el=document.getElementById("profile"+k.charAt(0).toUpperCase()+k.slice(1));if(el&&profile[k])el.value=profile[k];
        }
        );profileForm.addEventListener("submit",e=>
        {
            e.preventDefault();const data=Object.fromEntries(new FormData(profileForm));localStorage.setItem(PROFILE_KEY,JSON.stringify(data));document.getElementById("profileFeedback").textContent="Your profile has been saved on this device.";
        }
        );document.getElementById("clearProfile").addEventListener("click",()=>
        {
            localStorage.removeItem(PROFILE_KEY);profileForm.reset();document.getElementById("profileFeedback").textContent="Saved profile cleared.";
        }
        );
    }
    const subscriptionForm=document.getElementById("subscriptionForm");
    if(subscriptionForm)subscriptionForm.addEventListener("submit",e=>
    {
        e.preventDefault();const d=new FormData(subscriptionForm);const plan=d.get("plan");
        const prices=
        {
            "Daily Ritual":13,"Origin Explorer":25,"Household Hero":42
        };
        const itemName=plan+" Subscription";
        addItem(itemName,prices[plan]);
        const note=document.getElementById("subscriptionFeedback");
        if(note)note.textContent="Your selected plan has been added to your demo bag. Continue to your bag to review it.";
        const submit=subscriptionForm.querySelector('button[type="submit"]');
        if(submit)
        {
            submit.textContent="Plan added ✓";submit.disabled=true;
        }
    }
    );
    const checkout=document.getElementById("checkoutForm");
    if(checkout)
    {
        const bag=getBag(),subtotal=bag.reduce((s,i)=>s+i.price*i.qty,0),delivery=subtotal===0||subtotal>=40?0:3.5,total=subtotal+delivery;
        const payTotal=document.getElementById("payButtonTotal");if(payTotal)payTotal.textContent=money(total);
        const cardNumber=document.getElementById("cardNumber"),expiry=document.getElementById("cardExpiry"),cvv=document.getElementById("cardCvv");
        if(cardNumber)cardNumber.addEventListener("input",()=>
        {
            let digits=cardNumber.value.replace(/\D/g,"").slice(0,16);cardNumber.value=digits.replace(/(.{4})/g,"$1 ").trim();
        }
        );
        if(expiry)expiry.addEventListener("input",()=>
        {
            let digits=expiry.value.replace(/\D/g,"").slice(0,4);expiry.value=digits.length>2?digits.slice(0,2)+" / "+digits.slice(2):digits;
        }
        );
        if(cvv)cvv.addEventListener("input",()=>
        {
            cvv.value=cvv.value.replace(/\D/g,"").slice(0,4);
        }
        );
        checkout.addEventListener("submit",e=>
        {
            e.preventDefault();
            if(!bag.length)
            {
                toast("Your bag is empty.");return;
            }
            const digits=(cardNumber?.value||"").replace(/\D/g,"");
            if(digits.length<13||digits.length>16)
            {
                cardNumber.setCustomValidity("Enter a valid 13–16 digit demo card number.");cardNumber.reportValidity();cardNumber.setCustomValidity("");return;
            }
            const exp=(expiry?.value||"").replace(/\D/g,"");
            if(exp.length!==4||Number(exp.slice(0,2))<1||Number(exp.slice(0,2))>12)
            {
                expiry.setCustomValidity("Enter expiry as MM / YY.");expiry.reportValidity();expiry.setCustomValidity("");return;
            }
            if((cvv?.value||"").length<3)
            {
                cvv.setCustomValidity("Enter a 3 or 4 digit security code.");cvv.reportValidity();cvv.setCustomValidity("");return;
            }
            sessionStorage.setItem("lastOrder",JSON.stringify(
            {
                bag,total,reference:"BB-"+Math.floor(100000+Math.random()*900000)
            }
            ));
            localStorage.removeItem(STORAGE_KEY);location.href="ThankYou.html";
        }
        );
    }
    const order=document.getElementById("thankyouOrder");if(order)
    {
        const data=JSON.parse(sessionStorage.getItem("lastOrder")||"null");if(data)
        {
            document.getElementById("orderReference").textContent=data.reference;document.getElementById("thankyouTotal").textContent=money(data.total);
        }
        else
        {
            document.getElementById("orderReference").textContent="DEMO";document.getElementById("thankyouTotal").textContent="—";
        }
    }
}
);
