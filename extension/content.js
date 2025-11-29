/* content.js - prompts user for their email (or you can implement OAuth) and verifies with server.
   IMPORTANT: Update the server base URL in the background.js or send 'server' field in message.
*/
(function () {
  function showLoginPrompt() {
    const div = document.createElement('div');
    div.style.position = 'fixed';
    div.style.bottom = '20px';
    div.style.right = '20px';
    div.style.zIndex = 999999;
    div.style.background = '#fff';
    div.style.padding = '10px';
    div.style.border = '1px solid #ddd';
    div.style.borderRadius = '6px';
    div.innerHTML = '<input id="boq_email" placeholder="Enter allowed Gmail" style="width:200px;padding:6px" /> <button id="boq_login">Login</button> <button id="boq_close">X</button>';
    document.body.appendChild(div);
    document.getElementById('boq_close').onclick = () => div.remove();
    document.getElementById('boq_login').onclick = async () => {
      const email = document.getElementById('boq_email').value.trim();
      if (!email) return alert('Enter email');
      chrome.runtime.sendMessage({ type: 'BOQ_VERIFY', email, server: 'https://kiron-boq.vercel.app' }, (resp) => {
        if (!resp) return alert('No response from background');
        if (resp.success) {
          alert('Login OK — extension active');
          div.remove();
          // you can now initialize your autofill UI here
        } else {
          alert('Login failed: ' + (resp.message || 'unknown'));
        }
      });
    };
  }

  // show login prompt when page loads (you can add logic to show only when not authed)
  showLoginPrompt();
})();
