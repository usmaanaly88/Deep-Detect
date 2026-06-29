Here are all commands, in order, across **3 terminals**:


$src = "C:\Users\USMAN-PC\OneDrive\Desktop\Deep-Detect\DeepDetectMobile\src\screens"
$dst = "C:\DD\DeepDetectMobile\src\screens"

Copy-Item "$src\Results\ResultsScreen.tsx" "$dst\Results\ResultsScreen.tsx" -Force
Copy-Item "$src\History\HistoryScreen.tsx"  "$dst\History\HistoryScreen.tsx"  -Force
Copy-Item "$src\Share\ShareScreen.tsx"      "$dst\Share\ShareScreen.tsx"      -Force

Write-Host "✅ Files synced to C:\DD"

---

## 🖥️ Terminal 1 — Python Backend
```powershell
cd C:\Users\USMAN-PC\OneDrive\Desktop\Deep-Detect\Image_Detector
.\venv\Scripts\activate
python app.py
```
✅ Leave running. Should show `Uvicorn running on http://0.0.0.0:8000`

---

## 🖥️ Terminal 2 — Metro Bundler
```powershell
cd C:\DD\DeepDetectMobile
npm start
```
✅ Leave running. Should show `Dev server ready`

---

## 🖥️ Terminal 3 — Android Build
```powershell
cd C:\DD\DeepDetectMobile
$env:ANDROID_HOME = "C:\Users\USMAN-PC\AppData\Local\Android\Sdk"
$env:PATH = "$env:PATH;$env:ANDROID_HOME\platform-tools"
npm run android
```
⏳ This will take **5–10 minutes** first time. App installs on phone when done.

---

> [!IMPORTANT]
> **Always use `C:\DD\DeepDetectMobile`** (not the OneDrive path) for Metro and the Android build — the OneDrive path is too long for Windows.

> [!TIP]
> Your phone must be **connected via USB** with **USB Debugging ON** before running Terminal 3.

That's it — 3 terminals, done! 🚀