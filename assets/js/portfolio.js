(() => {
  'use strict';
  const menu = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#navigation');
  const setMenu = (open) => {
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    navigation.classList.toggle('is-open', open);
  };
  menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menu.focus();
    }
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.site-header')) setMenu(false);
  });
  const mobileQuery = window.matchMedia('(max-width: 760px)');
  mobileQuery.addEventListener('change', () => setMenu(false));
  document.documentElement.classList.add('js-ready');

  const filters = document.querySelector('.project-filters');
  const cards = [...document.querySelectorAll('.project-card')];
  filters.hidden = false;
  filters.addEventListener('click', (event) => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    filters.querySelectorAll('button').forEach((item) => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    cards.forEach((card) => {
      card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
    });
    const count = cards.filter((card) => !card.hidden).length;
    document.querySelector('#filter-status').textContent = `${count} ${count === 1 ? 'proyecto visible' : 'proyectos visibles'}.`;
  });

  const email = 'tomas.ingenieriaindustrial@gmail.com';
  const copy = document.querySelector('#copy-email');
  copy.hidden = false;
  copy.addEventListener('click', async () => {
    const status = document.querySelector('#copy-status');
    try {
      await navigator.clipboard.writeText(email);
      status.textContent = 'Correo copiado. ¡Hablemos pronto!';
    } catch {
      status.textContent = `Puedes seleccionar y copiar este correo: ${email}`;
    }
  });

  const form = document.querySelector('#contact-form');
  const submit = document.querySelector('#send-button');
  const status = document.querySelector('#form-status');
  submit.disabled = false;
  let sending = false;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form));
    for (const key of Object.keys(data)) data[key] = data[key].trim();
    if (Object.values(data).some((value) => !value)) {
      status.textContent = 'Completa todos los campos antes de enviar.';
      return;
    }
    sending = true;
    submit.disabled = true;
    form.setAttribute('aria-busy', 'true');
    status.textContent = 'Enviando tu mensaje…';
    status.dataset.state = 'pending';
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch('https://backend-portafolio-six.vercel.app/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: controller.signal,
      });
      const result = await response.json();
      if (!response.ok || result.success === false || result.error) throw new Error('Submission failed');
      status.textContent = '¡Mensaje enviado! Gracias por escribirme.';
      status.dataset.state = 'success';
      form.reset();
    } catch {
      status.textContent = 'No se pudo enviar. Conservamos tu mensaje: vuelve a intentarlo o escríbeme directamente al correo.';
      status.dataset.state = 'error';
    } finally {
      clearTimeout(timeout);
      sending = false;
      submit.disabled = false;
      form.removeAttribute('aria-busy');
    }
  });
})();
