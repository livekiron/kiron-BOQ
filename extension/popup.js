const BASE_URL = "https://boq-1-click-auto-fill-5-and-n-a-and-six.vercel.app";

const statusEl = document.getElementById("status");
const btnLogin = document.getElementById("btnLogin");
const btnVerify = document.getElementById("btnVerify");

let lastToken = null;

function setStatus(t) {
  statusEl.innerText = t;
}

btnLogin.addEventListener("click", async () => {
  chrome.runtime.sendMessage({ cmd: "OPEN_OAUTH", baseUrl: BASE_URL }, () => {
    setStatus("Login window opened. Complete login...");
  });

  window.addEventListener(
    "message",
    (ev) => {
      if (ev.data?.type === "EGP_AUTH" && ev.data.token) {
        lastToken = ev.data.token;

        chrome.storage.local.set({ authToken: lastToken });

        setStatus("OAuth token received. Now click Verify & Activate.");
        btnVerify.disabled = false;
      }
    },
    { once: true }
  );
});

btnVerify.addEventListener("click", async () => {
  const res = await chrome.storage.local.get(["authToken", "deviceId"]);
  const token = res.authToken;
  let deviceId = res.deviceId;

  if (!deviceId) {
    deviceId = crypto.randomUUID();
    await chrome.storage.local.set({ deviceId });
  }

  if (!token) return setStatus("No token found. Please login first.");

  setStatus("Verifying with server...");

  try {
    const r = await fetch(`${BASE_URL}/api/verify`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, deviceId })
    });

    const j = await r.json();

    if (j.ok && j.allowed) {
      await chrome.storage.local.set({
        verified: true,
        userEmail: j.email
      });

      setStatus(`Verified: ${j.email}. Extension active on this device.`);
      btnVerify.disabled = true;

    } else if (j.pending) {
      setStatus("Permission pending. Ask owner to approve.");
    } else {
      setStatus(j.message || "Not allowed.");
    }

  } catch (e) {
    setStatus("Network error: " + e.message);
  }
});