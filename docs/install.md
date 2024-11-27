# Steps for setting up the repository and running the web app

## Step 1: Git Clone the Repository
  
    git clone https://github.com/brwali/PopcornPicks.git
    
  (OR) Download the .zip file on your local machine from the following link
  
    https://github.com/brwali/PopcornPicks/

## Step 2: Install the required packages by running the following command in the terminal
   
    pip install -r requirements.txt

## Step 3: MySQL Install
   Download and Install [MySQL Workbench](https://dev.mysql.com/downloads/workbench/) and [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)
   Host a server on port 27276
   Make an account with username: root, password: password

## Step 4: Setting up MySQL Community Server

   In the `Type and Networking` tab, select config type as **Server Computer**
   
   All other menus, use default settings. If you create a root password, be sure not to lose it!

   Click `Execute` button on the bottom of the window to start the MySQL Service.

## Step 5: Setting up MySQL Workbench
 1. Launch MySQL Workbench
 2. Under MySQL Connections, Right click in the whitespace. Select `Rescan for Local MySQL Instances`. It should detect the server established in the previous step.
 3. Select the discovered Local instance and enter your password if created in server setup.
 4. Click `File` > `Open SQL Script` then select `init.sql` in the `PopcornPicks/src` directory. This will create the tables required for the application's persistence.
 5. Run movies.py in the same directory
   
    
## Step 6: Python Packages
   Run the following command in the terminal from the /frontend directory

   `npm install`
   `npm install @mui/material @emotion/react @emotion/styled`
   `npm run dev`

   This starts the frontend.

   Now open another terminal and navigate to src/recommenderapp
   Run the following command
   
   `python app.py`
   
    
## Step 7: Open the URL in your browser 

    Go to the following page:

    `http://localhost:3000/login`

