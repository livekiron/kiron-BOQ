// --- PUT YOUR ORIGINAL content.js HERE UNCHANGED ---
// (copy the whole content you sent earlier exactly into this file)
(function waitForPage() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", waitForPage);
    return;
  }

  (function () {
    let autoYesEnabled = false;

    function setSelectToYes(selectEl) {
      if (!selectEl || selectEl.tagName !== 'SELECT') return false;

      const current = selectEl.options[selectEl.selectedIndex]?.text?.trim()?.toUpperCase();
      if (current === 'YES') return true;

      const yesVariants = ['YES', 'Yes', 'হ্যাঁ', 'হাঁ', 'হ্যাঁ।'];
      for (let i = 0; i < selectEl.options.length; i++) {
        const optText = selectEl.options[i].text?.trim();
        if (optText && yesVariants.some(v => v.toUpperCase() === optText.toUpperCase())) {
          selectEl.selectedIndex = i;
          selectEl.dispatchEvent(new Event('change', { bubbles: true }));
          selectEl.dispatchEvent(new Event('input', { bubbles: true }));
          return true;
        }
      }
      return false;
    }

    function processAllSelects() {
      if (!autoYesEnabled) return;
      document.querySelectorAll('select').forEach(setSelectToYes);
    }

    const observer = new MutationObserver(muts => {
      if (!autoYesEnabled) return;

      muts.forEach(m => {
        m.addedNodes.forEach(node => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;

          if (node.tagName === 'SELECT') {
            setSelectToYes(node);
          } else {
            node.querySelectorAll?.('select')?.forEach(setSelectToYes);
          }
        });
      });
    });

    observer.observe(document.documentElement || document.body, { childList: true, subtree: true });

    function setPercentageToMinusFive() {
      const targetBoxes = Array.from(document.querySelectorAll("input"))
        .filter(el => el.type === "text" || el.type === "number");

      if (targetBoxes.length > 0) {
        const box = targetBoxes[0];
        box.value = "-5";
        box.dispatchEvent(new Event("input", { bubbles: true }));
        box.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }

    // BUTTON CREATION FUNCTIONS
    function createYesButton() {
      const btn = document.createElement('button');
      btn.title = 'Toggle Auto YES';
      btn.textContent = 'YES kiron';

      Object.assign(btn.style, {
        position: 'fixed',
        bottom: '20px',
        right: '170px', // YES
        width: '45px',
        height: '45px',
        borderRadius: '50%',
        background: '#ff4444',
        color: '#fff',
        fontSize: '12px',
        border: 'none',
        cursor: 'pointer',
        zIndex: '999999999',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
      });

      btn.addEventListener('click', () => {
        autoYesEnabled = !autoYesEnabled;
        if (autoYesEnabled) {
          btn.style.background = '#28a745';
          processAllSelects();
        } else {
          btn.style.background = '#ff4444';
        }
      });

      document.body.appendChild(btn);
    }

    function createMinusFiveButton() {
      const btn = document.createElement('button');
      btn.title = 'Set -5';
      btn.textContent = '-5';

      Object.assign(btn.style, {
        position: 'fixed',
        bottom: '20px',
        right: '120px', // -5
        width: '45px',
        height: '45px',
        borderRadius: '50%',
        background: '#007bff',
        color: '#fff',
        fontSize: '14px',
        border: 'none',
        cursor: 'pointer',
        zIndex: '999999999',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
      });

      btn.addEventListener('click', () => {
        setPercentageToMinusFive();
      });

      document.body.appendChild(btn);
    }

    function createPWDBtn() {
      const FILL_TEXT = "1";

      const btn = document.createElement("button");
      btn.id = "pwdFillBtn";
      btn.textContent = "C/A";

      Object.assign(btn.style, {
        position: "fixed",
        bottom: "20px",
        right: "70px", // C/A
        width: "45px",
        height: "45px",
        borderRadius: "50%",
        background: "#ff8800",
        color: "white",
        fontSize: "12px",
        border: "none",
        cursor: "pointer",
        zIndex: "999999999",
        boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
      });

      btn.onclick = () => {
        fillAllFieldsPWD();
        btn.textContent = "OK";
        btn.style.background = "#cc6600";
      };

      function fillAllFieldsPWD() {
        document.querySelectorAll(
          "input:not([type=hidden]):not([type=password]):not([type=checkbox]):not([type=radio])"
        ).forEach((el) => {
          if (el.value.trim() === "") {
            el.value = FILL_TEXT;
            el.dispatchEvent(new Event("input", { bubbles: true }));
          }
        });

        document.querySelectorAll("textarea").forEach((el) => {
          if (el.value.trim() === "") {
            el.value = FILL_TEXT;
            el.dispatchEvent(new Event("input", { bubbles: true }));
          }
        });

        document.querySelectorAll("select").forEach((sel) => {
          if (sel.value.trim() === "") {
            let opt = [...sel.options].find(
              (o) => o.text.toLowerCase() === FILL_TEXT.toLowerCase()
            );

            if (!opt) {
              opt = new Option(FILL_TEXT, FILL_TEXT);
              sel.add(opt);
            }

            sel.value = FILL_TEXT;
            sel.dispatchEvent(new Event("change", { bubbles: true }));
          }
        });
      }

      document.body.appendChild(btn);
    }

    function createNAButton() {
      const FILL_TEXT = "Not Applicable";

      const btn = document.createElement("button");
      btn.id = "naFillBtn";
      btn.textContent = "N/A";

      Object.assign(btn.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px', // N/A
        width: '45px',
        height: '45px',
        borderRadius: '50%',
        background: '#28a745',
        color: 'white',
        fontSize: '12px',
        border: 'none',
        cursor: 'pointer',
        zIndex: '999999999',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
      });

      btn.onclick = () => {
        fillAllFields();
        btn.textContent = "OK";
        btn.style.background = "#1e7e34";
      };

      function fillAllFields() {
        document.querySelectorAll(
          "input:not([type=hidden]):not([type=password]):not([type=checkbox]):not([type=radio])"
        ).forEach((el) => {
          if (el.value.trim() === "") {
            el.value = FILL_TEXT;
            el.dispatchEvent(new Event("input", { bubbles: true }));
          }
        });

        document.querySelectorAll("textarea").forEach((el) => {
          if (el.value.trim() === "") {
            el.value = FILL_TEXT;
            el.dispatchEvent(new Event("input", { bubbles: true }));
          }
        });

        document.querySelectorAll("select").forEach((sel) => {
          if (sel.value.trim() === "") {
            let opt = [...sel.options].find(
              (o) => o.text.toLowerCase() === FILL_TEXT.toLowerCase()
            );

            if (!opt) {
              opt = new Option(FILL_TEXT, FILL_TEXT);
              sel.add(opt);
            }

            sel.value = FILL_TEXT;
            sel.dispatchEvent(new Event("change", { bubbles: true }));
          }
        });
      }

      document.body.appendChild(btn);
    }

    // Load all buttons
    createYesButton();
    createMinusFiveButton();
    createPWDBtn();
    createNAButton();

  })();
})();