Phase 1: Hugging Face Space Setup

  Step 1: Create an Account
   1. Open your web browser and go to https://huggingface.co (https://huggingface.co).
   2. Click the Sign Up button in the top-right corner.
   3. Enter your email address and create a strong password. Click Next.
   4. Choose your username (e.g., yourusername) and enter your full name. Check the Terms of Service box and click    
      Create Account.
   5. Check your email inbox. Click the verification link sent by Hugging Face to activate your account.

  Step 2: Create a New Space
   1. Log into Hugging Face.
   2. In the top-right corner, click on your Profile Picture (Avatar) and select New Space from the dropdown menu (or 
      go directly to huggingface.co/new-space (https://huggingface.co/new-space)).
   3. Space Name: Type deep-detect-api (or any name you prefer).
   4. License: Click the dropdown and select mit (or leave it blank).
   5. Select the Space SDK: Click the Docker icon.
   6. Choose a Docker template: Click on Blank (do not select template options like Gradio, Streamlit, etc.).
   7. Space Hardware: Ensure Cpu basic • 2 vCPU • 16 GB • Free is selected (this is the default).
   8. Visibility: Make sure Public is selected (if private, your mobile app cannot call the API).
   9. Click the Create Space button at the bottom.

  ---

  Phase 2: Preparing Your Local Backend Files

  Before pushing your files, we need to create two configuration files inside your local Image_Detector folder.

  Step 1: Create the Dockerfile
  Using your text editor, create a new file named Dockerfile (no file extension) in the root of your Image_Detector   
  folder and paste the following content:

    1 FROM python:3.10-slim
    2
    3 WORKDIR /app
    4
    5 # Install build dependencies
    6 RUN apt-get update && apt-get install -y \
    7     build-essential \
    8     && rm -rf /var/lib/apt/lists/*
    9
   10 # Copy requirements
   11 COPY requirements.txt .
   12
   13 # Install optimized CPU PyTorch and dependencies
   14 RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu
   15 RUN pip install --no-cache-dir -r requirements.txt
   16
   17 # Copy the rest of the application files
   18 COPY . .
   19
   20 # Expose Hugging Face default port
   21 EXPOSE 7860
   22
   23 # Run FastAPI using uvicorn
   24 CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]

  Step 2: Create a .dockerignore File
  To keep your uploaded container small and prevent massive temporary files from uploading, create a .dockerignore    
  file in the root of your Image_Detector folder:

   1 venv/
   2 .git/
   3 __pycache__/
   4 *.pyc
   5 .DS_Store

  ---

  Phase 3: Push Your Code to Hugging Face

  There are two ways to upload your code: via the Web Browser (Easiest) or via Git CLI (Developer-friendly).

  Option A: Uploading via Web Browser (Easiest & No Terminal Commands)
   1. On your newly created Hugging Face Space page, click the Files tab (next to the "App" tab near the top).        
   2. Click the + Add file button on the right, and choose Upload files.
   3. Drag and drop all files and folders from your local Image_Detector folder EXCEPT your venv/ folder and .git/    
      folder.
      * Files to upload: app.py, inference.py, model.py, predict.py, requirements.txt, Dockerfile, .dockerignore, and 
        your trained weight files inside your models/ directory.
   4. Scroll down to the bottom, type a commit message like Initial deploy, and click the Commit changes to main      
      button.

  Option B: Uploading via Git CLI (Standard Developer Path)
   1. Ensure Git is installed. Open your terminal inside your Image_Detector directory.
   2. Initialize and commit your files locally:

   1    git init
   2    git add .
   3    git commit -m "initial commit"
   3. Connect your local directory to your Hugging Face Space (replace YOUR_USERNAME with your actual Hugging Face    
      username):

   1    git remote add origin https://huggingface.co/spaces/YOUR_USERNAME/deep-detect-api
   4. Push your changes (you will be prompted to enter your Hugging Face Username and your User Access Token as your  
      password. You can generate a token in your Hugging Face Profile Settings → Access Tokens):

   1    git push -u origin main --force

  ---

  Phase 4: Retrieve and Verify Your Public URL

   1. Click on the App tab of your Hugging Face Space.
   2. You will see a status box. First, it will show Building. It takes about 2 to 4 minutes to compile PyTorch and   
      install your requirements. Once finished, it will display a green Running badge.
   3. Once running, look at the top right of your Space page. Click the three vertical dots (next to the "Like"       
      button) and select Embed this Space from the dropdown menu.
   4. Look for the Direct URL field. It will look like this:
     https://yourusername-deep-detect-api.hf.space
   5. Copy this URL. Open a new browser tab, paste the URL, and press enter.
   6. You should immediately see your FastAPI welcome JSON response:

   1    {
   2      "status": "healthy",
   3      "api_name": "Deep-Detect Image Classification Service"
   4    }
     Your backend API is now officially live on the internet!

  ---

  Phase 5: Keep-Alive Configuration on UptimeRobot

  To bypass Hugging Face's automatic sleep policy (which pauses your Space if there is no traffic for 48 hours), we   
  configure UptimeRobot to ping the server continuously.

  Step 1: Create a Free Account
   1. Open your browser and go to https://uptimerobot.com (https://uptimerobot.com).
   2. Click Register for FREE.
   3. Fill in your name, email address, and password. Click Register.
   4. Confirm your account by clicking the activation link in the email UptimeRobot sends you.

  Step 2: Configure the Keep-Alive Monitor
   1. Log into your dashboard at uptimerobot.com/dashboard (https://uptimerobot.com/dashboard).
   2. Click the green + Add New Monitor button in the top left.
   3. Fill out the form with the following settings:
      * Monitor Type: Click the dropdown and select HTTPS (or HTTP(s)).
      * Friendly Name: Type DeepDetect Space Keeper.
      * URL (or IP): Paste your Hugging Face Direct URL retrieved in Phase 4 (e.g.,
        https://yourusername-deep-detect-api.hf.space).
      * Monitoring Interval: Drag the slider to 10 minutes (this is ideal. Every 10 minutes, UptimeRobot will ping    
        your API, which resets the Hugging Face idle shutdown timer).
      * Monitor Timeout: Leave it at the default 30 seconds.
   4. On the right-hand side, make sure the checkbox next to your email address is checked under "Select Alert        
      Contacts To Notify" (this alerts you if your Space goes offline).
   5. Click the Create Monitor button at the bottom of the popup.
  ---

  Step 6: Connect Your React Native Mobile App

  Now that your backend is deployed with zero latency, open your mobile app's API configuration file
  (C:\Users\USMAN-PC\OneDrive\Desktop\Deep-Detect\DeepDetectMobile\src\config\config.ts or apiService.ts) and change
  the base API URL to:

   1 export const API_BASE_URL = "https://yourusername-deep-detect-api.hf.space";

  Your mobile app is now officially wired to a production-ready, ultra-fast, permanently awake, and entirely free
  backend cloud service!