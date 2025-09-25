(() => {
  const $ = (id) => document.getElementById(id);
  const el = {
    prompt: $('prompt'),
    system: $('system'),
    mode: $('mode'),
    useOpenAI: $('use-openai'),
    useGemini: $('use-gemini'),
    useXAI: $('use-xai'),
    modelOpenAI: $('model-openai'),
    modelGemini: $('model-gemini'),
    modelXAI: $('model-xai'),
    temperature: $('temperature'),
    timeout: $('timeout'),
    maxTokens: $('maxTokens'),
    run: $('run'),
    clear: $('clear'),
    status: $('status'),
    results: $('results'),
  };

  const API = { status: '/api/status', compare: '/api/compare', consensus: '/api/consensus' };
  const sanitize = (s) => String(s ?? '');
  const shortTrace = (h) => { try { const v = h.get('x-cloud-trace-context'); if (!v) return ''; const first = v.split('/')[0]||''; return first.slice(-8);} catch { return ''; } };
  const saveLocal = () => {
    const o = {
      prompt: el.prompt.value, system: el.system?.value || '', mode: el.mode?.value || 'compare',
      use: { openai: el.useOpenAI.checked, gemini: el.useGemini.checked, xai: el.useXAI.checked },
      models: { openai: el.modelOpenAI.value, gemini: el.modelGemini.value, xai: el.modelXAI.value },
      temperature: el.temperature.value, timeout: el.timeout.value, maxTokens: el.maxTokens.value,
    };
    localStorage.setItem('magi-ui', JSON.stringify(o));
  };
  const loadLocal = () => {
    try {
      const o = JSON.parse(localStorage.getItem('magi-ui') || '{}'); if (!o) return;
      if (o.prompt) el.prompt.value = o.prompt; if (o.system) el.system.value = o.system; if (o.mode) el.mode.value = o.mode;
      if (o.use){ el.useOpenAI.checked=!!o.use.openai; el.useGemini.checked=!!o.use.gemini; el.useXAI.checked=!!o.use.xai; }
      if (o.models){ if (o.models.openai) el.modelOpenAI.value=o.models.openai; if (o.models.gemini) el.modelGemini.value=o.models.gemini; if (o.models.xai) el.modelXAI.value=o.models.xai; }
      if (o.temperature) el.temperature.value=o.temperature; if (o.timeout) el.timeout.value=o.timeout; if (o.maxTokens) el.maxTokens.value=o.maxTokens;
    } catch {}
  };

  function card({ title, meta='', body='', highlight=false, error='' }) {
    const div = document.createElement('div');
    div.className = `p-4 rounded-xl border bg-white space-y-2 ${highlight?'ring-2 ring-blue-600':''}`;
    const h = document.createElement('div'); h.className='font-medium'; h.textContent=title;
    const m = document.createElement('div'); m.className='text-xs text-neutral-500'; m.textContent=meta;
    const pre = document.createElement('pre'); pre.className='mono text-sm whitespace-pre-wrap break-words max-h-72 overflow-y-auto'; pre.textContent = body || (error?'':'(no output)');
    div.append(h,m);
    if (error){ const err=document.createElement('div'); err.className='text-sm text-red-600'; err.textContent=`ERROR: ${error}`; div.append(err); }
    div.append(pre);
    if ((body||'').length>800){ const btn=document.createElement('button'); btn.className='mt-2 px-2 py-1 border rounded text-xs'; btn.textContent='全文を展開'; btn.onclick=()=>{ pre.style.maxHeight='none'; btn.remove(); }; div.append(btn); }
    return div;
  }

  async function pingStatus(){
    try{
      const r = await fetch(API.status);
      const trace = shortTrace(r.headers);
      const js = await r.json();
      el.status.textContent = `API OK / region=${js.region} / secrets: OAI=${js.secretsBound.OPENAI_API_KEY?'✔':'×'}, GEM=${js.secretsBound.GEMINI_API_KEY?'✔':'×'}, XAI=${js.secretsBound.XAI_API_KEY?'✔':'×'}${trace?` / trace:${trace}`:''}`;
    }catch(e){ el.status.textContent = `API NG: ${e?.message||e}`; }
  }

  function buildPayload(){
    const providers=[]; const models={};
    if (el.useOpenAI.checked){ providers.push('openai'); models.openai = el.modelOpenAI.value.trim(); }
    if (el.useGemini.checked){ providers.push('gemini'); models.gemini = el.modelGemini.value.trim(); }
    if (el.useXAI.checked){ providers.push('xai'); models.xai = el.modelXAI.value.trim(); }
    const p = {
      prompt: el.prompt.value.trim(),
      system: (el.system?.value||'').trim() || undefined,
      providers, models,
      temperature: Number(el.temperature.value||0.2),
      timeout_ms: Number(el.timeout.value||25000),
    };
    const mt=Number(el.maxTokens.value); if (!Number.isNaN(mt) && mt>0) p.max_tokens=mt;
    return p;
  }

  async function run(){
    el.status.textContent='実行中…'; el.results.innerHTML='';
    const payload=buildPayload();
    if (!payload.prompt){ el.status.textContent='エラー: promptが空です'; return; }
    if (!payload.providers?.length){ el.status.textContent='エラー: providerを1つ以上選択してください'; return; }
    saveLocal();

    const ctrl=new AbortController(); const to=setTimeout(()=>ctrl.abort(), payload.timeout_ms+2000); const started=performance.now();
    try{
      const endpoint = (el.mode?.value==='consensus') ? API.consensus : API.compare;
      const r = await fetch(endpoint, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload), signal:ctrl.signal });
      const trace = shortTrace(r.headers);
      if (!r.ok){ const text=await r.text(); el.status.textContent=`HTTP ${r.status} / trace:${trace} / ${text}`; return; }
      const js = await r.json();
      const elapsed = Math.round(performance.now()-started);

      const hdr = document.createElement('div'); hdr.className='text-sm text-neutral-600';
      const decided = js.decidedBy ? ` / decidedBy=${js.decidedBy}${js.judge?.reason?` (${js.judge.reason})`:''}` : '';
      hdr.textContent = `started=${sanitize(js.started_at||'')} / finished=${sanitize(js.finished_at||'')} / total=${elapsed}ms${decided}` + (trace?` / trace:${trace}`:'');
      el.results.append(hdr);

      const res = Array.isArray(js.results)?js.results:[];
      const norm = (s)=>String(s||'').toLowerCase().replace(/\s+/g,' ').replace(/[。．]/g,'.').trim();
      const final = js.final || ''; const finalNorm = norm(final);

      for (const it of res){
        const isWin = final && norm(it.output)===finalNorm;
        el.results.append(card({
          title: `${it.provider}${it.model?` (${it.model})`:''}`,
          meta: `latency=${it.latency_ms ?? '-'}ms${it.error?'':' / OK'}`,
          body: it.output || '',
          highlight: !!isWin,
          error: it.error || ''
        }));
      }

      if (final){
        const box = card({ title:'FINAL', meta:'consensus output', body:final, highlight:true });
        el.results.prepend(box);
      }

      el.status.textContent = `完了 / ${res.length}件 / total=${elapsed}ms`;
    } catch(e){
      el.status.textContent = `失敗: ${e?.name==='AbortError' ? 'timeout/abort' : (e?.message||e)}`;
    } finally { clearTimeout(to); }
  }

  function clearAll(){ el.results.innerHTML=''; el.status.textContent=''; }

  el.run.addEventListener('click', run);
  el.clear.addEventListener('click', clearAll);
  ['prompt','system','mode','temperature','timeout','maxTokens','model-openai','model-gemini','model-xai'].forEach(id=>{
    const n=document.getElementById(id); if (n) n.addEventListener('change', saveLocal);
  });
  ['use-openai','use-gemini','use-xai'].forEach(id=>{
    const n=document.getElementById(id); if (n) n.addEventListener('change', saveLocal);
  });

  loadLocal(); pingStatus();
})();
