const express = require("express");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const USERS_FILE = path.join(__dirname, "users.json");

// Middleware
app.use(express.json());

// Helper functions
const readUsers = () => {
    try {
        if (fs.existsSync(USERS_FILE)) {
            const data = fs.readFileSync(USERS_FILE, "utf8");
            return JSON.parse(data);
        }
        return [];
    } catch (error) {
        return [];
    }
};

const writeUsers = (users) => {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

// Routes
app.get("/", (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Code Academy Gatekeeper</title>
      <style>
        body { font-family: Arial; margin: 40px; background: #f5f5f5; }
        .container { max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
        h1 { text-align: center; color: #333; }
        .form-group { margin: 15px 0; }
        label { display: block; margin-bottom: 5px; }
        input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
        button { width: 100%; padding: 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #0056b3; }
        .message { padding: 10px; margin: 10px 0; border-radius: 4px; }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
        .tabs { display: flex; margin-bottom: 20px; }
        .tab { flex: 1; padding: 10px; text-align: center; cursor: pointer; background: #f8f9fa; border: 1px solid #ddd; }
        .tab.active { background: #007bff; color: white; }
        .form { display: none; }
        .form.active { display: block; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎓 Code Academy Gatekeeper</h1>
        
        <div class="tabs">
          <div class="tab active" onclick="showForm('login')">Login</div>
          <div class="tab" onclick="showForm('signup')">Sign Up</div>
        </div>
        
        <div id="message"></div>
        
        <!-- Login Form -->
        <div id="loginForm" class="form active">
          <h3>Student Login</h3>
          <div class="form-group">
            <label>Email:</label>
            <input type="email" id="loginEmail" required>
          </div>
          <div class="form-group">
            <label>Password:</label>
            <input type="password" id="loginPassword" required>
          </div>
          <button onclick="login()">Login</button>
        </div>
        
        <!-- Signup Form -->
        <div id="signupForm" class="form">
          <h3>Student Registration</h3>
          <div class="form-group">
            <label>Name:</label>
            <input type="text" id="signupName" required>
          </div>
          <div class="form-group">
            <label>Email:</label>
            <input type="email" id="signupEmail" required>
          </div>
          <div class="form-group">
            <label>Password:</label>
            <input type="password" id="signupPassword" required>
          </div>
          <button onclick="signup()">Sign Up</button>
        </div>
      </div>
      
      <script>
        function showForm(formType) {
          document.querySelectorAll('.form').forEach(f => f.classList.remove('active'));
          document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
          
          document.getElementById(formType + 'Form').classList.add('active');
          event.target.classList.add('active');
          document.getElementById('message').innerHTML = '';
        }
        
        function showMessage(text, type) {
          document.getElementById('message').innerHTML = 
            '<div class="message ' + type + '">' + text + '</div>';
        }
        
        async function signup() {
          const name = document.getElementById('signupName').value;
          const email = document.getElementById('signupEmail').value;
          const password = document.getElementById('signupPassword').value;
          
          try {
            const response = await fetch('/api/signup', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
              showMessage('Registration successful! You can now login.', 'success');
              showForm('login');
            } else {
              showMessage(data.message, 'error');
            }
          } catch (error) {
            showMessage('Registration failed. Please try again.', 'error');
          }
        }
        
        async function login() {
          const email = document.getElementById('loginEmail').value;
          const password = document.getElementById('loginPassword').value;
          
          try {
            const response = await fetch('/api/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
              showMessage('Login successful! Welcome to Code Academy!', 'success');
              setTimeout(() => {
                window.location.href = '/dashboard?user=' + encodeURIComponent(data.user.name);
              }, 1000);
            } else {
              showMessage(data.message, 'error');
            }
          } catch (error) {
            showMessage('Login failed. Please try again.', 'error');
          }
        }
      </script>
    </body>
    </html>
  `);
});

app.get("/dashboard", (req, res) => {
    const userName = req.query.user || "Student";
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Dashboard - Code Academy</title>
      <style>
        body { font-family: Arial; margin: 0; background: #f5f5f5; }
        .header { background: #007bff; color: white; padding: 20px; text-align: center; }
        .container { max-width: 800px; margin: 20px auto; padding: 20px; }
        .card { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .logout { background: #dc3545; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; float: right; }
        .logout:hover { background: #c82333; }
        h2 { color: #333; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Welcome to Code Academy Dashboard, ${userName}! 🎓</h1>
        <button class="logout" onclick="logout()">Logout</button>
      </div>
      
      <div class="container">
        <div class="grid">
          <div class="card">
            <h2>📚 Your Profile</h2>
            <p><strong>Name:</strong> ${userName}</p>
            <p><strong>Status:</strong> Active Student</p>
            <p><strong>Member Since:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="card">
            <h2>🚀 Quick Actions</h2>
            <p>• Browse Available Courses</p>
            <p>• View Learning Progress</p>
            <p>• Join Study Groups</p>
            <p>• Access Resources</p>
          </div>
          
          <div class="card">
            <h2>📊 Learning Stats</h2>
            <p>Courses Completed: 0</p>
            <p>Total Study Time: 0 hours</p>
            <p>Certificates Earned: 0</p>
          </div>
          
          <div class="card">
            <h2>🏆 Achievements</h2>
            <p>🥇 First Login Complete</p>
            <p>⭐ Quick Learner Badge</p>
            <p>🎯 Goal Setter Status</p>
          </div>
        </div>
      </div>
      
      <script>
        function logout() {
          alert('Logged out successfully!');
          window.location.href = '/';
        }
      </script>
    </body>
    </html>
  `);
});

// API Routes
app.post("/api/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.json({
                success: false,
                message: "All fields are required",
            });
        }

        const users = readUsers();

        if (users.find((user) => user.email === email)) {
            return res.json({
                success: false,
                message: "Student already exists with this email",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password: hashedPassword,
        };

        users.push(newUser);
        writeUsers(users);

        res.json({
            success: true,
            message: "Student registered successfully!",
            user: { id: newUser.id, name: newUser.name, email: newUser.email },
        });
    } catch (error) {
        res.json({ success: false, message: "Registration failed" });
    }
});

app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.json({
                success: false,
                message: "Email and password are required",
            });
        }

        const users = readUsers();
        const user = users.find((u) => u.email === email);

        if (!user) {
            return res.json({ success: false, message: "Student not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.json({ success: false, message: "Invalid password" });
        }

        res.json({
            success: true,
            message: "Login successful!",
            user: { id: user.id, name: user.name, email: user.email },
        });
    } catch (error) {
        res.json({ success: false, message: "Login failed" });
    }
});

app.listen(PORT, () => {
    console.log(
        `🚀 Code Academy Gatekeeper running on http://localhost:${PORT}`
    );
});
