(() => {
  'use strict';
  const campusBase = new URL('./', document.currentScript.src);
  const installed = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const atWebsiteHome = location.pathname === campusBase.pathname || location.pathname === campusBase.pathname + 'index.html';
  if (installed && atWebsiteHome && new URL(location.href).searchParams.get('vista') !== 'web') {
    location.replace(new URL('app/', campusBase).href);
    return;
  }
  let installEvent = null;
  let registration = null;
  let updating = false;
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const tools = document.createElement('div');
  tools.id = 'campusPwaTools';
  const install = document.createElement('button');
  install.type = 'button'; install.textContent = 'Instalar aplicación';
  install.hidden = standalone();
  const update = document.createElement('button');
  update.type = 'button'; update.textContent = 'Nueva versión disponible'; update.hidden = true;
  tools.append(install, update); document.body.append(tools);
  const help = document.createElement('dialog');
  help.id = 'campusPwaHelp'; help.setAttribute('aria-labelledby', 'campusPwaHelpTitle');
  help.innerHTML = '<h2 id="campusPwaHelpTitle">Instalar FDS SMART CAMPUS</h2><div id="campusPwaHelpText"></div><form method="dialog"><button>Cerrar</button></form>';
  document.body.append(help);
  function instructions() {
    const text = help.querySelector('#campusPwaHelpText');
    if (!window.isSecureContext || location.protocol === 'file:') {
      text.innerHTML = '<p>Abre la página publicada en GitHub Pages con https:// para instalar la aplicación.</p>';
    } else if (/iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
      text.innerHTML = '<p>Abre esta página en Safari. Toca <b>Compartir</b>, elige <b>Añadir a pantalla de inicio</b> y confirma con <b>Añadir</b>.</p>';
    } else {
      text.innerHTML = '<p>Abre el menú del navegador (⋮) y selecciona <b>Instalar aplicación</b> o <b>Añadir a la pantalla de inicio</b>.</p><p>En una computadora, busca también el icono de instalación junto a la dirección. Si acabas de abrir la página, espera unos segundos y vuelve a intentarlo.</p>';
    }
    if (!help.open) help.showModal();
  }
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault(); installEvent = event; install.hidden = standalone();
  });
  window.addEventListener('appinstalled', () => {installEvent = null; install.hidden = true;});
  matchMedia('(display-mode: standalone)').addEventListener?.('change', () => {install.hidden = standalone();});
  install.addEventListener('click', async () => {
    if (!installEvent) {instructions(); return;}
    const event = installEvent; installEvent = null;
    try {await event.prompt(); const choice = await event.userChoice; if (choice.outcome === 'accepted') install.hidden = true;}
    catch (_) {instructions();}
  });
  update.addEventListener('click', () => {
    if (!registration?.waiting) {location.reload(); return;}
    updating = true; update.disabled = true; update.textContent = 'Actualizando…';
    registration.waiting.postMessage({type: 'ACTIVATE_UPDATE'});
  });
  if ('serviceWorker' in navigator && window.isSecureContext && location.protocol !== 'file:') {
    navigator.serviceWorker.addEventListener('controllerchange', () => {if (updating) location.reload();});
    window.addEventListener('load', async () => {
      try {
        registration = await navigator.serviceWorker.register(new URL('sw.js', campusBase).href, {scope: campusBase.href, updateViaCache: 'none'});
        const showUpdate = () => {update.hidden = !(registration.waiting && navigator.serviceWorker.controller);};
        showUpdate();
        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          worker?.addEventListener('statechange', () => {if (worker.state === 'installed') showUpdate();});
        });
      } catch (error) {console.warn('La instalación sin conexión no está disponible todavía.');}
    }, {once: true});
  }
})();
