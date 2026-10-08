(function(){
  var LEAD_EMAIL = 'mckenna.jbannister@gmail.com';
  var t = document.querySelector('.menu-toggle'), m = document.querySelector('.menu');
  if (t && m) t.addEventListener('click', function(){ var o = m.classList.toggle('open'); t.setAttribute('aria-expanded', o); });
  document.querySelectorAll('form.lead-form').forEach(function(f){
    var page = f.querySelector('[name="Page"]'); if (page) page.value = document.title + ' — ' + location.pathname;
    var s = f.querySelector('.form-status');
    f.addEventListener('submit', function(e){
      e.preventDefault();
      if (!f.reportValidity()) return;
      var btn = f.querySelector('button[type=submit]'); btn.disabled = true; btn.textContent = 'Sending…';
      s.className = 'form-status'; s.textContent = '';
      var data = {}; new FormData(f).forEach(function(v,k){ data[k] = v; });
      data._subject = 'New lead: ' + (data.Service || 'Pet care') + ' — ' + (data.Name || '');
      data._template = 'table'; data._captcha = 'false';
      if (data.Email) data._replyto = data.Email;
      fetch('https://formsubmit.co/ajax/' + LEAD_EMAIL, { method:'POST', headers:{'Content-Type':'application/json','Accept':'application/json'}, body: JSON.stringify(data) })
        .then(function(r){ return r.json(); })
        .then(function(j){
          if (j && (j.success === true || j.success === 'true')) { location.href = f.getAttribute('data-thanks'); }
          else throw new Error(j && j.message);
        })
        .catch(function(){
          s.className = 'form-status err'; s.textContent = 'Something went wrong sending your request. Please try again in a moment.';
          btn.disabled = false; btn.textContent = 'Request a meet & greet';
        });
    });
  });
})();
