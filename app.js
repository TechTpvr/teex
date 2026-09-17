const $ = (s,root=document)=>root.querySelector(s);
const $$ = (s,root=document)=>[...root.querySelectorAll(s)];
const money = n => new Intl.NumberFormat('fa-IR').format(Math.round(n));
const state = {
 page: localStorage.getItem('tx_page') || 'home',
 balance: Number(localStorage.getItem('tx_balance') || 125000000),
 orders: JSON.parse(localStorage.getItem('tx_orders') || '[]'),
 chart: 'روزانه',
 side: 'خرید',
 prices: {dollar: 109800, gold: 12650000, coin: 148900000}
};
const markets = [
 {id:'dollar',name:'دلار آمریکا',code:'USD',price:109800,change:1.24,icon:'$',tone:'blue'},
 {id:'gold',name:'طلای ۲۴ عیار',code:'XAU',price:12650000,change:.82,icon:'Au',tone:'pink'},
 {id:'coin',name:'سکه تمام بهار',code:'COIN',price:148900000,change:-.36,icon:'◈',tone:'purple'},
 {id:'usdt',name:'تتر',code:'USDT',price:109950,change:.48,icon:'₮',tone:'cyan'},
 {id:'eur',name:'یورو',code:'EUR',price:128400,change:.62,icon:'€',tone:'blue'},
 {id:'aed',name:'درهم امارات',code:'AED',price:29900,change:-.11,icon:'د',tone:'green'}
];

function save(){localStorage.setItem('tx_balance',state.balance);localStorage.setItem('tx_orders',JSON.stringify(state.orders));localStorage.setItem('tx_page',state.page)}

function pageShell(title,sub,body){return `<div class="page-title"><div><h1>${title}</h1><p>${sub}</p></div></div>${body}`}

function home(){
 const top = markets.slice(0,3);
 return `
 <section class="hero">
   <div class="hero-top"><span class="eyebrow">ارزش کل دارایی شما</span><span class="status-pill">● بازار آزمایشی</span></div>
   <h1>${money(state.balance)} <span class="unit">تومان</span></h1>
   <div class="hero-actions"><button class="glass-btn" onclick="openDeposit()">＋ واریز آزمایشی</button><button class="glass-btn" onclick="navigate('trade')">معامله سریع ←</button></div>
 </section>
 <div class="section-head"><h2>بازار امروز</h2><button class="link" onclick="navigate('markets')">مشاهده همه</button></div>
 <div class="market-strip">${top.map(m=>mini(m)).join('')}</div>
 <div class="section-head"><h2>دسترسی سریع</h2></div>
 <div class="quick-grid">
   <button class="quick" onclick="navigate('trade')"><i>↕</i><b>خرید و فروش</b></button>
   <button class="quick" onclick="openConvert()"><i>⇄</i><b>تبدیل</b></button>
   <button class="quick" onclick="navigate('wallet')"><i>▣</i><b>کیف پول</b></button>
   <button class="quick" onclick="showToast('بخش احراز هویت در نسخه متصل فعال می‌شود')"><i>✓</i><b>احراز هویت</b></button>
 </div>
 <div class="section-head"><h2>روند بازار</h2><button class="link" onclick="navigate('markets')">جزئیات</button></div>
 <section class="card chart-card"><div class="chart-head"><div><b>دلار آمریکا</b><small style="display:block;color:var(--muted);font-size:10px;margin-top:5px">USD / IRR</small></div><strong class="up">+۱٫۲۴٪</strong></div><canvas id="homeChart"></canvas></section>
 <div class="section-head"><h2>آخرین فعالیت</h2></div>
 <section class="card">${state.orders.length ? state.orders.slice(0,3).map(orderRow).join('') : `<div style="text-align:center;color:var(--muted);padding:18px;font-size:11px">هنوز تراکنشی ثبت نشده است.</div>`}</section>
 `;
}
function mini(m){return `<button class="mini-card" onclick="navigate('markets')"><div class="title"><span>${m.name}</span><span>${m.code}</span></div><strong>${money(m.price)}</strong><span class="change ${m.change>=0?'up':'down'}">${m.change>=0?'▲':'▼'} ${Math.abs(m.change).toLocaleString('fa-IR')}٪</span></button>`}
function orderRow(o){return `<div class="asset-row"><div class="asset-main"><div class="coin">${o.side==='خرید'?'↑':'↓'}</div><div class="asset-name"><strong>${o.side} ${o.asset}</strong><small>${o.time}</small></div></div><div class="asset-price"><strong>${money(o.amount)} تومان</strong><small class="${o.side==='خرید'?'up':'down'}">تکمیل شد</small></div></div>`}

function marketsPage(){
 return pageShell('بازار','نرخ‌های نمایشی برای نسخه اولیه',`
 <input id="marketSearch" class="search" placeholder="جستجوی ارز، طلا یا سکه..." oninput="filterMarkets(this.value)">
 <div class="filter-row">
  <button class="filter active" onclick="filterCategory(this,'همه')">همه</button><button class="filter" onclick="filterCategory(this,'ارز')">ارز</button><button class="filter" onclick="filterCategory(this,'طلا')">طلا</button><button class="filter" onclick="filterCategory(this,'رمزارز')">رمزارز</button>
 </div>
 <div id="marketList" class="card" style="margin-top:12px">${markets.map(m=>marketRow(m)).join('')}</div>
 <div class="section-head"><h2>نمودار</h2></div>
 <section class="card chart-card"><div class="chart-tabs">${['روزانه','هفتگی','ماهانه','سالانه'].map(x=>`<button class="${state.chart===x?'active':''}" onclick="setChart('${x}')">${x}</button>`).join('')}</div><canvas id="marketChart"></canvas></section>
 `)
}
function marketRow(m){return `<button class="asset-row" style="width:100%;background:none;text-align:right" onclick="openTrade('${m.id}')"><div class="asset-main"><div class="coin">${m.icon}</div><div class="asset-name"><strong>${m.name}</strong><small>${m.code} · ${m.change>=0?'مثبت':'منفی'} امروز</small></div></div><div class="asset-price"><strong>${money(m.price)}</strong><small class="${m.change>=0?'up':'down'}">${m.change>=0?'+':''}${m.change.toLocaleString('fa-IR')}٪</small></div></button>`}

function tradePage(){
 const m=markets.find(x=>x.id==='dollar');
 return pageShell('معامله','ثبت سفارش خرید یا فروش',`
 <div class="trade-switch"><button class="${state.side==='خرید'?'active':''}" onclick="setSide('خرید')">خرید</button><button class="${state.side==='فروش'?'active':''}" onclick="setSide('فروش')">فروش</button></div>
 <section class="card">
  <div class="asset-row" style="padding-top:0"><div class="asset-main"><div class="coin">$</div><div class="asset-name"><strong>دلار آمریکا</strong><small>USD / تومان</small></div></div><div class="asset-price"><strong>${money(m.price)}</strong><small class="up">+۱٫۲۴٪</small></div></div>
  <label class="form-label">مقدار تومان</label><div class="input-wrap"><input id="tradeAmount" type="number" inputmode="decimal" placeholder="مثلاً ۱۰,۰۰۰,۰۰۰"><span>تومان</span></div>
  <label class="form-label">قیمت هر واحد</label><div class="input-wrap"><input id="tradePrice" type="number" value="${m.price}"><span>تومان</span></div>
  <label class="form-label">نوع سفارش</label><div class="input-wrap"><select id="tradeType"><option>بازار</option><option>حدی</option></select><span>نوع</span></div>
  <button class="primary" onclick="submitTrade()">${state.side} دلار</button>
  <div class="notice"><b>نسخه اولیه</b><span>این محیط برای طراحی و تست رابط کاربری است. سفارش واقعی و اتصال بانکی تا زمان اتصال سرویس سرور/صرافی فعال نیست.</span></div>
 </section>`)
}
function wallet(){
 return pageShell('کیف پول','موجودی و دارایی‌های شما',`
 <section class="balance-box"><small style="color:var(--muted)">موجودی کل</small><div class="balance-big">${money(state.balance)} <small>تومان</small></div><div class="stats"><div class="stat"><small>سود/زیان امروز</small><b class="up">+ ۱٫۲۴٪</b></div><div class="stat"><small>تغییر ماهانه</small><b>+ ۸٫۷٪</b></div></div></section>
 <div class="section-head"><h2>دارایی‌ها</h2><button class="link" onclick="openDeposit()">واریز</button></div>
 <section class="card">${[
 ['تومان','IRR',state.balance,'ریال/تومان'],
 ['دلار آمریکا','USD',0,'ارز'],
 ['تتر','USDT',0,'رمزارز'],
 ['طلا','XAU',0,'گرم']
 ].map(a=>`<div class="asset-row"><div class="asset-main"><div class="coin">${a[1].slice(0,2)}</div><div class="asset-name"><strong>${a[0]}</strong><small>${a[3]}</small></div></div><div class="asset-price"><strong>${money(a[2])}</strong><small>${a[1]}</small></div></div>`).join('')}</section>
 <div class="section-head"><h2>عملیات</h2></div><div class="quick-grid"><button class="quick" onclick="openDeposit()"><i>↓</i><b>واریز</b></button><button class="quick" onclick="showToast('برداشت در نسخه متصل فعال می‌شود')"><i>↑</i><b>برداشت</b></button><button class="quick" onclick="openConvert()"><i>⇄</i><b>تبدیل</b></button><button class="quick" onclick="showToast('آدرس‌های واریز پس از اتصال کیف پول ساخته می‌شوند')"><i>⌁</i><b>آدرس‌ها</b></button></div>
 `)
}
function more(){
 return pageShell('بیشتر','تنظیمات و امکانات تیکسا',`
 <section class="profile-card"><div class="profile-avatar">ت</div><div><strong>حساب تیکسا</strong><small style="display:block;color:var(--muted);font-size:10px;margin-top:4px">حساب آزمایشی · احراز نشده</small></div><button class="link" style="margin-right:auto" onclick="navigate('profile')">پروفایل</button></section>
 <div class="section-head"><h2>امکانات</h2></div><div class="menu-grid">
  <button class="menu-item" onclick="navigate('orders')"><span>☷</span><b>سفارش‌ها</b><small>سابقه و وضعیت سفارش‌ها</small></button>
  <button class="menu-item" onclick="openConvert()"><span>⇄</span><b>مبدل ارز</b><small>تبدیل سریع بین دارایی‌ها</small></button>
  <button class="menu-item" onclick="navigate('notifications')"><span>♢</span><b>اعلان‌ها</b><small>قیمت و امنیت حساب</small></button>
  <button class="menu-item" onclick="navigate('security')"><span>⌑</span><b>امنیت</b><small>رمز، ورود و نشست‌ها</small></button>
  <button class="menu-item" onclick="showToast('پشتیبانی آنلاین در نسخه متصل فعال می‌شود')"><span>?</span><b>پشتیبانی</b><small>پاسخ‌گویی و تیکت</small></button>
  <button class="menu-item" onclick="showToast('نسخه ۱٫۰٫۰ — رابط اولیه TeeXaa®')"><span>i</span><b>درباره تیکسا</b><small>اطلاعات نسخه و محصول</small></button>
 </div>
 <div class="notice"><b>نکته</b><span>قیمت‌ها و سفارش‌ها در این نسخه محلی و آزمایشی هستند و روی دستگاه شما ذخیره می‌شوند.</span></div>
 `)
}
function profile(){
 return pageShell('پروفایل','مدیریت حساب کاربری',`
 <section class="profile-card"><div class="profile-avatar">ت</div><div><strong>کاربر تیکسا</strong><small style="display:block;color:var(--muted);font-size:10px;margin-top:4px">سطح پایه · احراز نشده</small></div></section>
 <div class="section-head"><h2>امنیت حساب</h2></div><section class="card">${[['احراز هویت','تکمیل نشده'],['ورود دو مرحله‌ای','خاموش'],['دستگاه‌های فعال','۱ دستگاه']].map(x=>`<div class="asset-row"><div><strong style="font-size:12px">${x[0]}</strong><small style="display:block;color:var(--muted);font-size:9px;margin-top:4px">${x[1]}</small></div><button class="link" onclick="showToast('این قابلیت در نسخه متصل فعال می‌شود')">مدیریت</button></div>`).join('')}</section>
 `)
}
function orders(){
 return pageShell('سفارش‌ها','تاریخچه معاملات آزمایشی',`<section class="card">${state.orders.length?state.orders.map(orderRow).join(''):`<div style="text-align:center;color:var(--muted);padding:30px;font-size:11px">سفارشی ندارید.</div>`}</section>`)
}
function notifications(){
 return pageShell('اعلان‌ها','رویدادها و پیام‌های تیکسا',`<section class="card">${[['خوش آمدید','نسخه اولیه TeeXaa® آماده است.','همین حالا'],['بازار آزمایشی','نرخ‌ها برای نمایش رابط کاربری به‌صورت محلی تغییر می‌کنند.','اکنون'],['امنیت','برای استفاده واقعی، اتصال احراز هویت و سرور امن ضروری است.','راهنما']].map(x=>`<div class="asset-row"><div><strong style="font-size:12px">${x[0]}</strong><small style="display:block;color:var(--muted);font-size:9px;line-height:1.7;margin-top:4px">${x[1]}</small></div><small style="color:var(--muted)">${x[2]}</small></div>`).join('')}</section>`)
}
function security(){return pageShell('امنیت','تنظیمات امنیتی حساب',`<section class="card">${['قفل برنامه با رمز','ورود دو مرحله‌ای','اعلان ورود جدید','خروج از همه دستگاه‌ها'].map((x,i)=>`<div class="asset-row"><div><strong style="font-size:12px">${x}</strong><small style="display:block;color:var(--muted);font-size:9px;margin-top:4px">${i===3?'قطع دسترسی نشست‌های فعال':'پیشنهاد می‌شود فعال باشد'}</small></div><button class="filter ${i===3?'':'active'}" onclick="showToast('تنظیم ${x} در نسخه متصل فعال می‌شود')">${i===3?'انجام':'فعال'}</button></div>`).join('')}</section>`)}

function render(){
 const pages={home,markets:marketsPage,trade:tradePage,wallet,more,profile,orders,notifications,security};
 $('#main').innerHTML=(pages[state.page]||home)();
 $$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.page===state.page));
 if(state.page==='home') drawChart($('#homeChart'),1);
 if(state.page==='markets') drawChart($('#marketChart'),state.chart==='روزانه'?1:state.chart==='هفتگی'?2:state.chart==='ماهانه'?3:4);
}
function navigate(p){state.page=p;save();render();window.scrollTo({top:0,behavior:'smooth'})}
$$('[data-page]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.page)));

function setSide(s){state.side=s;render()}
function openTrade(id){state.side='خرید';navigate('trade')}
function submitTrade(){
 const amount=Number($('#tradeAmount')?.value||0);
 if(!amount||amount<10000){showToast('مبلغ معتبر وارد کنید');return}
 if(state.side==='خرید') state.balance-=amount; else state.balance+=amount;
 state.orders.unshift({side:state.side,asset:'دلار آمریکا',amount,time:new Date().toLocaleTimeString('fa-IR',{hour:'2-digit',minute:'2-digit'})});
 save();showToast(`سفارش ${state.side} با موفقیت ثبت شد`);navigate('orders')
}
function filterMarkets(q){const x=q.trim(); $$('#marketList .asset-row').forEach((r)=>r.style.display=r.innerText.includes(x)?'flex':'none')}
function filterCategory(btn,cat){$$('.filter').forEach(x=>x.classList.remove('active'));btn.classList.add('active');showToast(cat==='همه'?'نمایش همه بازارها':`فیلتر ${cat}`)}
function setChart(c){state.chart=c;render()}
function showToast(t){const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>el.classList.remove('show'),2400)}
function modal(html){$('#modal').innerHTML=`<div class="sheet">${html}</div>`;$('#modal').classList.remove('hidden')}
function closeModal(){$('#modal').classList.add('hidden');$('#modal').innerHTML=''}
$('#modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal()})
function openDeposit(){modal(`<div class="sheet-head"><h3>واریز آزمایشی</h3><button class="close" onclick="closeModal()">×</button></div><p style="color:var(--muted);font-size:10px;line-height:1.8">برای تست رابط کاربری می‌توانید موجودی محلی را افزایش دهید. این عملیات واقعی نیست.</p><label class="form-label">مبلغ</label><div class="input-wrap"><input id="dep" type="number" placeholder="۵۰,۰۰۰,۰۰۰"><span>تومان</span></div><button class="primary" onclick="const n=Number($('#dep').value||0);if(n>0){state.balance+=n;save();closeModal();render();showToast('موجودی آزمایشی افزایش یافت')}">افزایش موجودی</button>`)}
function openConvert(){modal(`<div class="sheet-head"><h3>مبدل ارز</h3><button class="close" onclick="closeModal()">×</button></div><label class="form-label">مبلغ</label><div class="input-wrap"><input id="conv" type="number" value="1000000"><span>تومان</span></div><label class="form-label">دارایی مقصد</label><div class="input-wrap"><select id="convTo"><option>دلار آمریکا</option><option>تتر</option><option>یورو</option><option>طلای ۲۴ عیار</option></select></div><div class="notice"><b>نرخ نمایشی</b><span>مبلغ خروجی فقط برای نمایش محاسبه می‌شود و معامله واقعی انجام نمی‌شود.</span></div><button class="primary" onclick="const n=Number($('#conv').value||0);showToast('نتیجه تبدیل برای مبلغ '+money(n)+' تومان آماده شد')">محاسبه</button>`)}
function drawChart(canvas,mode=1){
 if(!canvas)return; const dpr=devicePixelRatio||1, rect=canvas.getBoundingClientRect();canvas.width=rect.width*dpr;canvas.height=180*dpr;
 const c=canvas.getContext('2d');c.scale(dpr,dpr);const w=rect.width,h=180;
 const vals=[];let base=55;
 for(let i=0;i<34;i++){base += (Math.sin(i*1.7+mode)*2 + (Math.random()-.42)*4)/mode;vals.push(base)}
 const min=Math.min(...vals)-5,max=Math.max(...vals)+5;
 c.clearRect(0,0,w,h);c.strokeStyle='#e8edf5';c.lineWidth=1;
 for(let i=1;i<4;i++){c.beginPath();c.moveTo(0,i*h/4);c.lineTo(w,i*h/4);c.stroke()}
 const grad=c.createLinearGradient(0,0,w,0);grad.addColorStop(0,'#153f91');grad.addColorStop(.5,'#24c9cf');grad.addColorStop(1,'#ed5aa7');
 c.strokeStyle=grad;c.lineWidth=3;c.lineJoin='round';c.lineCap='round';c.beginPath();
 vals.forEach((v,i)=>{const x=i*(w/(vals.length-1)),y=h-20-(v-min)/(max-min)*(h-38);i?c.lineTo(x,y):c.moveTo(x,y)});c.stroke();
}
setTimeout(()=>{ $('#splash').style.transition='opacity .55s';$('#splash').style.opacity='0';setTimeout(()=>{$('#splash').remove();$('#app').classList.remove('hidden');render()},560)},2600);
window.addEventListener('resize',()=>{if(state.page==='home')drawChart($('#homeChart'));if(state.page==='markets')drawChart($('#marketChart'))});
