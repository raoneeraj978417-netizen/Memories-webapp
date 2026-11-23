const seedYears = {
  2004:{title:'Before we knew how fast it goes.',description:'The start of a thousand stories. Grainy, imperfect, entirely ours.',theme:'mono',image:'',media:[]},
  2008:{title:'Loud laughs & scraped knees.',description:'Every day had an outside voice and a little more colour.',theme:'warm',image:'',media:[]},
  2012:{title:'The world got brighter.',description:'A blur of birthdays, bad haircuts, and the very best kind of chaos.',theme:'pop',image:'',media:[]},
  2016:{title:'We found our rhythm.',description:'Somewhere between growing up and letting go, we became us.',theme:'neon',image:'',media:[]},
  2020:{title:'Closer than ever.',description:'The quiet years taught us what we never wanted to forget.',theme:'warm',image:'',media:[]},
  2025:{title:'Still writing the story.',description:'The best part? There are whole chapters yet to be lived.',theme:'now',image:'',media:[]}
};
Object.values(seedYears).forEach(chapter=>{chapter.image='';chapter.media=[]});
// Supabase cloud configuration: publishable key is safe for browser use; RLS is the security boundary.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
const SUPABASE_URL = 'https://mxantgyaedapdaazoibl.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_2K1y19tqWSRW-uRK8_hp7g_OCyvZnBi';
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
let cloudReady = false;
let cloudArchiveId = 'main';
async function cloudLoadArchive() {
  const { data, error } = await supabase.from('archive_state').select('data').eq('id', cloudArchiveId).maybeSingle();
  if (error) throw error;
  if (data?.data && typeof data.data === 'object') {
    state.data = data.data.years || seedYears;
    state.home = { ...defaultHome, ...(data.data.home || {}) };
    return true;
  }
  return false;
}
async function cloudSaveArchive() {
  if (!cloudReady || state.role !== 'admin') return;
  const payload = { years: state.data, home: state.home };
  const { error } = await supabase.from('archive_state').upsert({ id: cloudArchiveId, data: payload }, { onConflict: 'id' });
  if (error) { console.error('Cloud save failed:', error); toast('Cloud save failed. Check connection or permissions.'); throw error; }
}
async function cloudSetupAfterLogin() {
  const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', (await supabase.auth.getUser()).data.user.id).single();
  if (profileError || !profile) throw profileError || new Error('Account profile missing.');
  const actualRole = profile.role;
  const selectedRole = state.role;
  if (actualRole !== selectedRole) {
    await supabase.auth.signOut();
    throw new Error('This account is not authorized for the selected profile.');
  }
  const cloudHasData = await cloudLoadArchive();
  cloudReady = true;
  // Migrate legacy browser archive only if cloud row is absent, and only for admin.
  if (!cloudHasData && actualRole === 'admin') {
    const localYears = JSON.parse(localStorage.getItem('rewindArchiveV2') || 'null');
    const localHome = JSON.parse(localStorage.getItem('rewindHomeV1') || 'null');
    if (localYears) state.data = localYears;
    if (localHome) state.home = { ...defaultHome, ...localHome };
    await cloudSaveArchive();
  }
}
const defaultHome={brand:'REWIND',eyebrow:'THE MEMORY ARCHIVE',heading:'Who’s\nrewinding?',copy:'Step into the years that made us.',background:'',viewerLabel:'Memory viewer',adminLabel:'Archive keeper',footer:'A private collection · made with love'};
const state={role:null,year:null,focusYear:2004,type:'photo',data:seedYears,home:{...defaultHome,...JSON.parse(localStorage.getItem('rewindHomeV1')||'{}')}};
const $=id=>document.getElementById(id); const years=Array.from({length:22},(_,i)=>2004+i);
function save(){ return cloudSaveArchive(); } function toast(text){$('toast').textContent=text;$('toast').classList.remove('hidden');setTimeout(()=>$('toast').classList.add('hidden'),2400)}
function yearData(y){return state.data[y]||{title:'A year still unfolding.',description:'Nothing has been filed here yet. Add the first memory when you are ready.',theme:'now',image:'',media:[]}}
function driveFileId(url=''){const match=url.match(/\/d\/([\w-]+)/)||url.match(/[?&]id=([\w-]+)/);return match?.[1]||null}
function mediaSource(url,type){try{const parsed=new URL(url);if(parsed.protocol!=='https:')return '';}catch{return ''}const id=driveFileId(url);if(!id)return url;return type==='photo'?`https://drive.google.com/thumbnail?id=${id}&sz=w1600`:`https://drive.google.com/file/d/${id}/preview`}
function mediaFallback(url,type){const id=driveFileId(url);return id&&type==='photo'?`https://drive.google.com/uc?export=view&id=${id}`:''}
function renderHome(){const h=state.home;$('gateBrandName').textContent=h.brand;$('gateBrandMark').textContent=(h.brand.trim()[0]||'R').toUpperCase();$('gateEyebrow').textContent=h.eyebrow;$('gateHeading').innerHTML=escapeHTML(h.heading).replace(/\n/g,'<br>');$('gateCopy').textContent=h.copy;$('viewerProfileLabel').textContent=h.viewerLabel;$('adminProfileLabel').textContent=h.adminLabel;$('gateFoot').textContent=h.footer;const source=h.background?mediaSource(h.background,'photo'):'';$('gateBackground').style.backgroundImage=source?`url("${source.replaceAll('"','%22')}")`:''}
function populateHomeForm(){const h=state.home;$('homeBrand').value=h.brand;$('homeEyebrowInput').value=h.eyebrow;$('homeHeadingInput').value=h.heading;$('homeCopyInput').value=h.copy;$('homeBackgroundInput').value=h.background;$('homeViewerLabelInput').value=h.viewerLabel;$('homeAdminLabelInput').value=h.adminLabel;$('homeFooterInput').value=h.footer}
function renderTimeline(){ $('timelineTrack').innerHTML=years.map(y=>`<button class="timeline-year ${y===state.focusYear?'active':''} ${y===state.year?'selected':''}" data-year="${y}"><span>${y}</span></button>`).join(''); $('timelineTrack').querySelectorAll('button').forEach(b=>b.onclick=()=>selectYear(+b.dataset.year)); }
function escapeHTML(s=''){return s.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function renderArchive(){if(!state.year){document.body.className='era-now';$('heroImage').style.backgroundImage='none';$('heroYear').textContent='REWIND';$('heroTitle').innerHTML='Pick a year,<br>open a world.';$('heroDescription').textContent='Move across the timeline, then select a year to bring its photos and films to life.';$('heroEyebrow').textContent='THE ARCHIVE IS WAITING';$('heroCount').textContent='SCROLL TO EXPLORE';$('eraLabel').textContent='TIMELINE MODE';$('memories').classList.add('hidden');$('footerYear').textContent='THE STORY';renderTimeline();return}let d=yearData(state.year);$('memories').classList.remove('hidden');document.body.className=`era-${d.theme}`;$('heroImage').style.backgroundImage=`url("${d.image}")`;$('heroYear').textContent=state.year;$('heroTitle').innerHTML=escapeHTML(d.title).replace(/\n/g,'<br>');$('heroDescription').textContent=d.description;$('heroEyebrow').textContent=state.year<2008?'CHAPTER ONE':state.year<2016?'THE GOLDEN YEARS':state.year<2021?'A NEW FREQUENCY':'THE NOW';$('heroCount').textContent=`${String(d.media.length).padStart(2,'0')} MOMENT${d.media.length===1?'':'S'}`;$('sectionTitle').textContent=`${state.year}, in frames`;$('memoryTotal').textContent=`${d.media.length} ${d.media.length===1?'memory':'memories'}`;$('footerYear').textContent=state.year;$('eraLabel').textContent=state.year<2008?'THE BEGINNING':state.year<2016?'GROWING UP':state.year<2021?'FINDING OUR WAY':'THE PRESENT';
 $('mediaGrid').innerHTML=d.media.map((m,i)=>{const source=mediaSource(m[3],m[0]),fallback=mediaFallback(m[3],m[0]),isDriveVideo=m[0]==='video'&&!!driveFileId(m[3]),media=isDriveVideo?`<iframe src="${escapeHTML(source)}" title="${escapeHTML(m[1])}" allow="autoplay" loading="lazy"></iframe>`:m[0]==='video'?`<video src="${escapeHTML(source)}" muted></video>`:`<img src="${escapeHTML(source)}" ${fallback?`data-fallback="${escapeHTML(fallback)}"`:''} alt="${escapeHTML(m[1])}" loading="lazy">`;return `<article class="memory-card" data-index="${i}">${state.role==='admin'?'<button class="delete-memory" title="Remove memory">×</button>':''}${media}<span class="media-badge">${m[0]==='video'?'▶ VIDEO':'PHOTO'}</span><div class="card-copy"><h3>${escapeHTML(m[1])}</h3><p>${escapeHTML(m[2])}</p></div></article>`}).join(''); $('emptyState').classList.toggle('hidden',!!d.media.length);
 document.querySelectorAll('img[data-fallback]').forEach(image=>image.onerror=()=>{image.onerror=null;image.src=image.dataset.fallback});
 document.querySelectorAll('.memory-card').forEach(card=>{card.onclick=e=>{if(e.target.closest('.delete-memory'))return;openLightbox(d.media[+card.dataset.index])};let del=card.querySelector('.delete-memory');if(del)del.onclick=async()=>{d.media.splice(+card.dataset.index,1);state.data[state.year]=d;await save();renderArchive();toast('Memory removed from this year.')}});renderTimeline();}
function selectYear(y){state.year=y;state.focusYear=y;renderArchive();let btn=document.querySelector(`.timeline-year[data-year="${y}"]`);btn?.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'});}
let lastTimelinePosition=0;
$('timelineScroller').addEventListener('scroll',()=>{const scroller=$('timelineScroller'),buttons=[...document.querySelectorAll('.timeline-year')];if(!buttons.length)return;const direction=scroller.scrollLeft>lastTimelinePosition?'forward':'backward';if(scroller.scrollLeft!==lastTimelinePosition){document.body.classList.toggle('timeline-forward',direction==='forward');document.body.classList.toggle('timeline-backward',direction==='backward')}lastTimelinePosition=scroller.scrollLeft;const center=scroller.scrollLeft+scroller.clientWidth/2;let closest=buttons.reduce((best,button)=>Math.abs(button.offsetLeft+button.offsetWidth/2-center)<Math.abs(best.offsetLeft+best.offsetWidth/2-center)?button:best,buttons[0]);const year=+closest.dataset.year;if(year===state.focusYear)return;state.focusYear=year;buttons.forEach(button=>button.classList.toggle('active',button===closest));});
function populateSelects(){let options=years.map(y=>`<option value="${y}">${y}</option>`).join('');$('memoryYear').innerHTML=options;$('settingsYear').innerHTML=options;$('memoryYear').value=state.year;$('settingsYear').value=state.year}
function openLightbox(m){const src=mediaSource(m[3],m[0]),isDriveVideo=m[0]==='video'&&!!driveFileId(m[3]);$('lightboxContent').innerHTML=`${isDriveVideo?`<iframe src="${escapeHTML(src)}" title="${escapeHTML(m[1])}" allow="autoplay" allowfullscreen></iframe>`:m[0]==='video'?`<video controls autoplay src="${escapeHTML(src)}"></video>`:`<img src="${escapeHTML(src)}" alt="${escapeHTML(m[1])}">`}<div class="lightbox-copy"><h3>${escapeHTML(m[1])}</h3><p>${escapeHTML(m[2])}</p></div>`;$('lightbox').classList.remove('hidden')}
function renderDrivePreview(){const url=$('memoryUrl').value.trim(),preview=$('drivePreview'),host=$('drivePreviewMedia');if(!url){preview.classList.add('hidden');host.innerHTML='';return}const src=mediaSource(url,state.type),isDriveVideo=state.type==='video'&&!!driveFileId(url);host.innerHTML=isDriveVideo?`<iframe src="${escapeHTML(src)}" title="Google Drive video preview" allow="autoplay"></iframe>`:state.type==='video'?`<video controls muted src="${escapeHTML(src)}"></video>`:`<img src="${escapeHTML(src)}" alt="Photo preview">`;preview.classList.remove('hidden')}
document.querySelectorAll('.profile-card').forEach(b=>b.onclick=()=>{
  state.role=b.dataset.role;
  $('gateScreen').classList.add('hidden');$('loginScreen').classList.remove('hidden');
  const admin=state.role==='admin';
  $('loginIcon').textContent=admin?'+':'M';$('loginKicker').textContent=admin?'ARCHIVE KEEPER':'VIEWER ACCESS';
  $('loginTitle').textContent=admin?'Keeper access.':'Welcome back.';
  $('loginDescription').textContent=admin?'Sign in to manage the archive.':'Sign in to revisit the good old days.';
  $('loginHint').textContent='Use the email and password assigned to your account.';
  $('loginEmail').value='';$('password').value='';$('loginEmail').focus();
});
$('backToProfiles').onclick=()=>{$('loginScreen').classList.add('hidden');$('gateScreen').classList.remove('hidden');$('loginError').textContent='';$('loginEmail').value='';$('password').value=''};
$('loginForm').onsubmit=async e=>{
  e.preventDefault(); $('loginError').textContent=''; const email=$('loginEmail').value.trim(), password=$('password').value;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  $('password').value='';
  if(error || !data?.user){$('loginError').textContent='Sign-in failed. Check your email and password.';return;}
  try {
    await cloudSetupAfterLogin();
  } catch(err) {
    console.error('REWIND login verification failed:', err);
    await supabase.auth.signOut(); cloudReady=false;
    $('loginError').textContent=err.message || 'Account verification failed.';
    return;
  }
  $('loginScreen').classList.add('hidden');$('archive').classList.remove('hidden');
  $('keeperFab').classList.toggle('hidden',state.role!=='admin');
  $('accountInitial').textContent=state.role==='admin'?'+':'M';
  $('accountRole').textContent=state.role==='admin'?'Archive keeper':'Memory viewer';
  populateSelects();renderHome();renderArchive();
};
$('accountButton').onclick=()=>$('accountMenu').classList.toggle('hidden');
// Password changes are performed by Supabase Auth; never reveal or store passwords in this app.
const passwordMenuButton=document.createElement('button');
passwordMenuButton.type='button'; passwordMenuButton.textContent='Change password';
$('accountMenu').appendChild(passwordMenuButton);
passwordMenuButton.onclick=async()=>{
  const next=window.prompt('Enter a new password (minimum 8 characters):');
  if(next===null)return;
  if(next.length<8){toast('Password must be at least 8 characters.');return;}
  const confirm=window.prompt('Re-enter the new password to confirm:');
  if(confirm===null)return;
  if(next!==confirm){toast('Passwords do not match.');return;}
  const {error}=await supabase.auth.updateUser({password:next});
  if(error){console.error(error);toast('Password update failed.');return;}
  toast('Password updated successfully.');
};
$('logoutButton').onclick=async()=>{await supabase.auth.signOut();cloudReady=false;state.role=null;$('loginEmail').value='';$('password').value='';$('archive').classList.add('hidden');$('gateScreen').classList.remove('hidden');$('accountMenu').classList.add('hidden');$('keeperFab').classList.add('hidden')};$('switchRole').onclick=async()=>{await supabase.auth.signOut();cloudReady=false;state.role=null;$('loginEmail').value='';$('password').value='';$('archive').classList.add('hidden');$('accountMenu').classList.add('hidden');$('gateScreen').classList.remove('hidden');};$('homeButton').onclick=()=>window.scrollTo({top:0,behavior:'smooth'});$('jumpToMemories').onclick=()=>$('memories').scrollIntoView({behavior:'smooth'});
$('keeperFab').onclick=()=>{$('adminDrawer').classList.remove('hidden');populateAdminYear()};$('closeDrawer').onclick=()=>$('adminDrawer').classList.add('hidden');$('closeLightbox').onclick=()=>$('lightbox').classList.add('hidden');$('lightbox').onclick=e=>{if(e.target===$('lightbox'))$('lightbox').classList.add('hidden')};
document.querySelectorAll('.admin-tabs button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.admin-tabs button').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelectorAll('.admin-panel').forEach(x=>x.classList.add('hidden'));$(`tab-${b.dataset.tab}`).classList.remove('hidden');if(b.dataset.tab==='settings')populateAdminYear();if(b.dataset.tab==='home')populateHomeForm()});
document.querySelectorAll('.type-toggle').forEach(b=>b.onclick=()=>{state.type=b.dataset.type;document.querySelectorAll('.type-toggle').forEach(x=>x.classList.toggle('active',x===b));renderDrivePreview()});$('memoryUrl').oninput=renderDrivePreview;
$('mediaForm').onsubmit=async e=>{e.preventDefault();let url=$('memoryUrl').value.trim();if(!url)return;let y=+$('memoryYear').value,d=yearData(y);d.media.push([state.type,$('memoryTitle').value,$('memoryCaption').value,url]);state.data[y]=d;await save();selectYear(y);e.target.reset();$('memoryYear').value=y;toast('Memory link added to '+y+'.')};
function populateAdminYear(){let d=yearData(+$('settingsYear').value);$('yearTitle').value=d.title;$('yearDescription').value=d.description;$('yearTheme').value=d.theme}$('settingsYear').onchange=populateAdminYear;
$('yearForm').onsubmit=async e=>{e.preventDefault();let y=+$('settingsYear').value,d=yearData(y);d.title=$('yearTitle').value;d.description=$('yearDescription').value;d.theme=$('yearTheme').value;state.data[y]=d;await save();selectYear(y);toast(`${y} now has a new mood.`)};
// Removed obsolete passcode-settings handler: the passwordForm/viewerPassword/adminPassword controls no longer exist in index.html.
$('homeForm').onsubmit=e=>{e.preventDefault();state.home={brand:$('homeBrand').value.trim()||defaultHome.brand,eyebrow:$('homeEyebrowInput').value.trim()||defaultHome.eyebrow,heading:$('homeHeadingInput').value.trim()||defaultHome.heading,copy:$('homeCopyInput').value.trim()||defaultHome.copy,background:$('homeBackgroundInput').value.trim(),viewerLabel:$('homeViewerLabelInput').value.trim()||defaultHome.viewerLabel,adminLabel:$('homeAdminLabelInput').value.trim()||defaultHome.adminLabel,footer:$('homeFooterInput').value.trim()||defaultHome.footer};cloudSaveArchive();renderHome();toast('Home page saved.')};
renderHome();

