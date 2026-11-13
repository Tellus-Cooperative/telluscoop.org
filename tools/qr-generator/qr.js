// Simple QR generator: link + optional center image, export PNG or SVG. Runs fully in the browser.
(function () {
  var MAX_IMAGE_BYTES = 2 * 1024 * 1024;
  var SIZE = 1024;

  var url = document.getElementById('qr-url');
  var fileInput = document.getElementById('qr-image');
  var fileName = document.getElementById('qr-image-name');
  var clearBtn = document.getElementById('qr-image-clear');
  var msg = document.getElementById('qr-msg');
  var canvas = document.getElementById('qr-canvas');
  var empty = document.getElementById('qr-empty');
  var buttons = document.querySelectorAll('[data-download]');

  var image = null;
  var qr = null;
  var timer;

  function say(text) { msg.textContent = text || ''; }

  function enable(on) { buttons.forEach(function (b) { b.disabled = !on; }); }

  function options(data) {
    return {
      width: SIZE,
      height: SIZE,
      type: 'svg',
      data: data,
      margin: 24,
      image: image || undefined,
      qrOptions: { errorCorrectionLevel: image ? 'H' : 'M' },
      dotsOptions: { type: 'square', color: '#1F3536' },
      backgroundOptions: { color: '#FFFFFF' },
      imageOptions: { hideBackgroundDots: true, imageSize: 0.3, margin: 8 }
    };
  }

  function render() {
    var data = url.value.trim();
    if (!data) {
      canvas.hidden = true; empty.hidden = false; enable(false); say('');
      return;
    }
    if (!window.QRCodeStyling) { say('No se pudo cargar el generador. Recarga la página.'); return; }
    if (!qr) { qr = new window.QRCodeStyling(options(data)); canvas.innerHTML = ''; qr.append(canvas); }
    else qr.update(options(data));
    canvas.hidden = false; empty.hidden = true; enable(true); say('');
  }

  function schedule() { clearTimeout(timer); timer = setTimeout(render, 150); }

  function filename() {
    try { return 'tellus-qr-' + new URL(url.value.trim()).hostname.replace(/^www\./, '').replace(/\./g, '-'); }
    catch (e) { return 'tellus-qr'; }
  }

  url.addEventListener('input', schedule);

  fileInput.addEventListener('change', function () {
    var file = fileInput.files[0];
    if (!file) return;
    if (!/^image\//.test(file.type)) { say('El archivo debe ser una imagen.'); fileInput.value = ''; return; }
    if (file.size > MAX_IMAGE_BYTES) { say('La imagen debe pesar menos de 2 MB.'); fileInput.value = ''; return; }
    var reader = new FileReader();
    reader.onload = function () {
      image = reader.result;
      fileName.textContent = file.name;
      clearBtn.hidden = false;
      render();
    };
    reader.readAsDataURL(file);
  });

  clearBtn.addEventListener('click', function () {
    image = null; fileInput.value = '';
    fileName.textContent = 'Sin imagen'; clearBtn.hidden = true;
    render();
  });

  buttons.forEach(function (b) {
    b.addEventListener('click', function () {
      if (qr) qr.download({ name: filename(), extension: b.getAttribute('data-download') });
    });
  });

  render();
})();
