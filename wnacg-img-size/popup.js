const DEFAULTS = {
  enabled: true,
  width: '1000px',
  upscale: false,
  applyToPageMode: false
};

const $ = (id) => document.getElementById(id);
let statusTimer = null;

function showStatus(text) {
  $('status').textContent = text;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => { $('status').textContent = ''; }, 1200);
}

function save() {
  chrome.storage.sync.set({
    enabled: $('enabled').checked,
    width: $('width').value.trim(),
    upscale: $('upscale').checked,
    applyToPageMode: $('applyToPageMode').checked
  }, () => showStatus('已保存'));
}

chrome.storage.sync.get(DEFAULTS, (cfg) => {
  $('enabled').checked = cfg.enabled;
  $('width').value = cfg.width;
  $('upscale').checked = cfg.upscale;
  $('applyToPageMode').checked = cfg.applyToPageMode;
});

['enabled', 'upscale', 'applyToPageMode'].forEach((id) => {
  $(id).addEventListener('change', save);
});
$('width').addEventListener('input', save);

document.querySelectorAll('.presets button').forEach((btn) => {
  btn.addEventListener('click', () => {
    $('width').value = btn.dataset.w;
    save();
  });
});
