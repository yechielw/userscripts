// ==UserScript==
// @name         Timesheet Auto-Fill with File Dialog
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  Add a button to load timesheet JSON and auto-fill daily shifts, triggering events
// @match        https://cloud.attenix.co.il/wt_daily_emp.adp
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  const WORK_CODE     = 663;
  const VACATION_CODE = 289;

  function trigger(el, type) {
    el.dispatchEvent(new Event(type, { bubbles: true }));
  }

  function setAndTrigger(el, val) {
    if (!el) return;
    el.value = val;
    trigger(el, 'input');
    trigger(el, 'change');
  }

  function fillTimesheet(data) {
    data.forEach(day => {
      const date = new Date(day.date);
      const lineNo = date.getDate();
      const sel = document.getElementById(`fstjid_${lineNo}`);
      if (!sel) return;

      // choose mission: vacation or work (including office/home codes)
      const code = day.dailyData[0]?.absenceCode;
      let label = null;
      if (code === VACATION_CODE) {
        label = 'חופשה';
      } else if (code && code !== VACATION_CODE) {
        label = 'מכבי';
      }
      if (label) {
        const opt = Array.from(sel.options).find(o => o.text.includes(label));
        if (opt) setAndTrigger(sel, opt.value);
      }

      // fill each in/out and trigger events
      day.dailyData.forEach((entry, i) => {
        const idx = i + 1;
        const start = entry.start || '00:00:00';
        const end = entry.end;
        if (!end) return;

        const [sh, sm] = start.split(':');
        const [eh, em] = end.split(':');
        const getInput = name => document.querySelector(`input[name=\"${name}_${lineNo}\"]`);

        setAndTrigger(getInput(`time_start_${idx}_HH`), sh);
        setAndTrigger(getInput(`time_start_${idx}_MM`), sm);
        setAndTrigger(getInput(`time_end_${idx}_HH`),   eh);
        setAndTrigger(getInput(`time_end_${idx}_MM`),   em);
      });
    });
  }

  // hidden file picker
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.json';
  fileInput.style.display = 'none';
  fileInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        fillTimesheet(JSON.parse(reader.result));
      } catch {
        alert('Invalid JSON');
      }
    };
    reader.readAsText(file);
  });
  document.body.appendChild(fileInput);

  // dialog button
  const button = document.createElement('button');
  button.textContent = 'Load Timesheet JSON';
  Object.assign(button.style, {
    position: 'fixed',
    top: '10px',
    right: '10px',
    padding: '8px 12px',
    background: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    zIndex: 10000,
  });
  button.addEventListener('click', () => fileInput.click());
  document.body.appendChild(button);
})();
