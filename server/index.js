import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// Movie Production Roles - Comprehensive list
const productionRoles = [
  // Direction & Production
  'Director',
  'Assistant Director',
  'Second Assistant Director',
  'Third Assistant Director',
  'Producer',
  'Executive Producer',
  'Line Producer',
  'Associate Producer',
  'Co-Producer',
  'Production Manager',
  'Production Coordinator',
  'Production Assistant',
  'Unit Production Manager',
  
  // Camera Department
  'Director of Photography',
  'Camera Operator',
  'First Assistant Camera',
  'Second Assistant Camera',
  'Camera Loader',
  'Steadicam Operator',
  'Drone Operator',
  'Still Photographer',
  
  // Lighting & Electrical
  'Gaffer',
  'Best Boy Electric',
  'Lighting Technician',
  'Electrician',
  'Rigging Gaffer',
  'Rigging Electrician',
  
  // Grip Department
  'Key Grip',
  'Best Boy Grip',
  'Dolly Grip',
  'Grip',
  'Rigging Grip',
  
  // Sound Department
  'Sound Mixer',
  'Boom Operator',
  'Sound Utility',
  'Playback Operator',
  
  // Art Department
  'Production Designer',
  'Art Director',
  'Set Decorator',
  'Props Master',
  'Props Assistant',
  'Leadman',
  'Swing Gang',
  'Set Dresser',
  'Graphic Designer',
  'Storyboard Artist',
  'Concept Artist',
  
  // Costume & Makeup
  'Costume Designer',
  'Costume Supervisor',
  'Wardrobe Assistant',
  'Makeup Artist',
  'Hair Stylist',
  'Special Effects Makeup Artist',
  'Key Makeup Artist',
  'Key Hair Stylist',
  
  // Editing & Post-Production
  'Editor',
  'Assistant Editor',
  'Colorist',
  'Post-Production Supervisor',
  'Digital Intermediate Editor',
  'Conform Editor',
  
  // Visual Effects
  'Visual Effects Supervisor',
  'Visual Effects Producer',
  'Visual Effects Coordinator',
  'Compositor',
  'Roto Artist',
  'Matchmove Artist',
  'CG Supervisor',
  '3D Animator',
  'Texture Artist',
  'Lighting Artist',
  
  // Stunts
  'Stunt Coordinator',
  'Stunt Performer',
  'Stunt Double',
  'Fight Choreographer',
  
  // Casting
  'Casting Director',
  'Casting Assistant',
  
  // Locations
  'Location Manager',
  'Location Scout',
  'Location Assistant',
  
  // Script & Continuity
  'Script Supervisor',
  'Script Reader',
  'Script Editor',
  
  // Transportation
  'Transportation Coordinator',
  'Driver',
  
  // Catering & Craft
  'Caterer',
  'Craft Service',
  
  // Safety & Security
  'Safety Supervisor',
  'Security Guard',
  'Medic',
  
  // General
  'Crew Member'
];

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, default: "" },
  isAdmin: { type: Boolean, default: false },
  roles: { type: [String], default: ['Crew Member'] },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

// Blog Post Schema
const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  authorId: { type: String, required: true },
  tags: [{ type: String }],
  images: [{ type: String }],
  videoUrl: { type: String }
}, { timestamps: true });

postSchema.index({ createdAt: -1 });

const BlogPost = mongoose.model("BlogPost", postSchema);

// Announcement Schema
const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String },
  link: { type: String }
}, { timestamps: true });

announcementSchema.index({ createdAt: -1 });

const Announcement = mongoose.model("Announcement", announcementSchema);

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

// Auth Routes
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: "Username or email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id, username: user.username, email: user.email, isAdmin: user.isAdmin, roles: user.roles }, process.env.JWT_SECRET);

    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email, bio: user.bio, isAdmin: user.isAdmin, roles: user.roles }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier }] });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, username: user.username, email: user.email, isAdmin: user.isAdmin, roles: user.roles }, process.env.JWT_SECRET);

    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email, bio: user.bio, isAdmin: user.isAdmin, roles: user.roles }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/roles", (req, res) => {
  res.json(productionRoles);
});

app.get("/api/user", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all users (admin only)
app.get("/api/users", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    const formattedUsers = users.map(user => ({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      bio: user.bio,
      isAdmin: user.isAdmin,
      roles: user.roles,
      createdAt: user.createdAt
    }));
    res.json(formattedUsers);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update user roles (admin only)
app.put("/api/users/:id/roles", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { roles, isAdmin } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // Prevent admin from removing their own admin role
    if (user._id.toString() === req.user.id && !isAdmin) {
      return res.status(400).json({ message: "Cannot remove your own admin role" });
    }
    
    if (roles !== undefined) user.roles = roles;
    if (isAdmin !== undefined) user.isAdmin = isAdmin;
    await user.save();
    
    res.json({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      bio: user.bio,
      isAdmin: user.isAdmin,
      roles: user.roles
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Announcement Routes
app.get("/api/announcements", async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    const formattedAnnouncements = announcements.map(ann => ({
      id: ann._id.toString(),
      title: ann.title,
      content: ann.content,
      image: ann.image,
      link: ann.link,
      createdAt: ann.createdAt,
      updatedAt: ann.updatedAt
    }));
    res.json(formattedAnnouncements);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/announcements", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, content, image, link } = req.body;
    const announcement = new Announcement({ title, content, image, link });
    await announcement.save();
    res.json({
      id: announcement._id.toString(),
      title: announcement.title,
      content: announcement.content,
      image: announcement.image,
      link: announcement.link,
      createdAt: announcement.createdAt,
      updatedAt: announcement.updatedAt
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/api/announcements/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, content, image, link } = req.body;
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: "Announcement not found" });
    
    announcement.title = title || announcement.title;
    announcement.content = content || announcement.content;
    announcement.image = image !== undefined ? image : announcement.image;
    announcement.link = link !== undefined ? link : announcement.link;
    await announcement.save();
    
    res.json({
      id: announcement._id.toString(),
      title: announcement.title,
      content: announcement.content,
      image: announcement.image,
      link: announcement.link,
      createdAt: announcement.createdAt,
      updatedAt: announcement.updatedAt
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/api/announcements/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: "Announcement not found" });
    await announcement.deleteOne();
    res.json({ message: "Announcement deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/api/user", authenticateToken, async (req, res) => {
  try {
    const { bio, password } = req.body;
    const updateData = {};
    
    if (bio !== undefined) updateData.bio = bio;
    if (password !== undefined) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/api/user", authenticateToken, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    await BlogPost.deleteMany({ authorId: req.user.id });
    res.json({ message: "Account deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Email transporter setup
const createTransporter = () => {
  // Check if SMTP credentials are configured
  if (process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return null;
};

// Forgot Password Route
app.post("/api/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // For security, don't reveal if email exists or not
      return res.json({ message: "If the email exists, a reset link has been sent." });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Generate reset link
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetLink = `${clientUrl}/reset-password/${resetToken}`;

    // Try to send email if SMTP is configured
    const transporter = createTransporter();
    if (transporter) {
      try {
        await transporter.sendMail({
          from: `"${process.env.EMAIL_FROM_NAME || 'FootLong Blog'}" <${process.env.EMAIL_FROM || 'noreply@footlongblog.com'}>`,
          to: email,
          subject: 'Password Reset Request - FootLong Blog',
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  body {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    line-height: 1.6;
                    color: #e8e8ff;
                    background-color: #0a0a1a;
                    margin: 0;
                    padding: 0;
                  }
                  .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                  }
                  .header {
                    text-align: center;
                    padding: 30px 0;
                    border-bottom: 1px solid rgba(168, 85, 247, 0.3);
                  }
                  .header h1 {
                    color: #a855f7;
                    font-size: 24px;
                    margin: 0;
                    font-family: 'Space Mono', monospace;
                  }
                  .content {
                    padding: 30px 0;
                  }
                  .greeting {
                    font-size: 18px;
                    color: #ffffff;
                    margin-bottom: 15px;
                  }
                  .message {
                    color: #e8e8ff;
                    margin-bottom: 25px;
                  }
                  .button-container {
                    text-align: center;
                    margin: 30px 0;
                  }
                  .button {
                    display: inline-block;
                    padding: 12px 30px;
                    background: linear-gradient(135deg, #a855f7, #3b82f6);
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 16px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                  }
                  .link-text {
                    color: #8888aa;
                    font-size: 12px;
                    word-break: break-all;
                    margin-top: 15px;
                  }
                  .link-text a {
                    color: #3b82f6;
                  }
                  .warning {
                    background: rgba(234, 179, 8, 0.1);
                    border: 1px solid rgba(234, 179, 8, 0.3);
                    border-radius: 8px;
                    padding: 15px;
                    margin: 20px 0;
                    color: #fbbf24;
                    font-size: 14px;
                  }
                  .footer {
                    text-align: center;
                    padding: 20px 0;
                    border-top: 1px solid rgba(168, 85, 247, 0.3);
                    color: #8888aa;
                    font-size: 12px;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>🎬 FootLong Blog</h1>
                  </div>
                  <div class="content">
                    <p class="greeting">Hello,</p>
                    <p class="message">
                      You have requested to reset your password for your FootLong Blog account. 
                      Click the button below to create a new password:
                    </p>
                    <div class="button-container">
                      <a href="${resetLink}" class="button">Reset Password</a>
                    </div>
                    <p class="link-text">
                      Or copy and paste this link into your browser:<br>
                      <a href="${resetLink}">${resetLink}</a>
                    </p>
                    <div class="warning">
                      <strong>⚠️ Important:</strong> This link will expire in 1 hour. 
                      If you did not request this password reset, please ignore this email and your password will remain unchanged.
                    </div>
                  </div>
                  <div class="footer">
                    <p>This is an automated message from FootLong Blog.</p>
                    <p>&copy; ${new Date().getFullYear()} FootLong Blog. All rights reserved.</p>
                  </div>
                </div>
              </body>
            </html>
          `,
          text: `
            Hello,

            You have requested to reset your password for your FootLong Blog account.
            Click the link below to create a new password:

            ${resetLink}

            This link will expire in 1 hour.

            If you did not request this password reset, please ignore this email and your password will remain unchanged.

            ---
            FootLong Blog
          `
        });
        console.log(`Password reset email sent to ${email}`);
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Still return success to not reveal email issues
      }
    } else {
      // No SMTP configured - log the link for development/testing
      console.log('SMTP not configured. Password reset link (development only):');
      console.log(resetLink);
    }

    res.json({ message: "If the email exists, a reset link has been sent." });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Reset Password Route (with token)
app.post("/api/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Hash new password and update user
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Verify Reset Token Route
app.get("/api/verify-reset-token/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (user) {
      res.json({ valid: true });
    } else {
      res.json({ valid: false });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Blog Post Routes
app.get("/api/posts", async (req, res) => {
  try {
    const posts = await BlogPost.find().sort({ createdAt: -1 });
    // Map _id to id for frontend compatibility and include author roles
    const formattedPosts = await Promise.all(posts.map(async (post) => {
      const author = await User.findById(post.authorId).select('roles');
      return {
        id: post._id.toString(),
        title: post.title,
        content: post.content,
        author: post.author,
        authorId: post.authorId.toString(),
        authorRoles: author ? author.roles : ['Crew Member'],
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        tags: post.tags,
        images: post.images,
        videoUrl: post.videoUrl
      };
    }));
    res.json(formattedPosts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/posts/:id", async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    // Map _id to id for frontend compatibility and include author roles
    const author = await User.findById(post.authorId).select('roles');
    res.json({
      id: post._id.toString(),
      title: post.title,
      content: post.content,
      author: post.author,
      authorId: post.authorId.toString(),
      authorRoles: author ? author.roles : ['Crew Member'],
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      tags: post.tags,
      images: post.images,
      videoUrl: post.videoUrl
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/posts", authenticateToken, async (req, res) => {
  try {
    const { title, content, tags, images, videoUrl } = req.body;
    const user = await User.findById(req.user.id);

    const post = new BlogPost({
      title,
      content,
      author: user.username,
      authorId: req.user.id,
      tags,
      images,
      videoUrl
    });

    await post.save();
    // Map _id to id for frontend compatibility
    res.json({
      id: post._id.toString(),
      title: post.title,
      content: post.content,
      author: post.author,
      authorId: post.authorId.toString(),
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      tags: post.tags,
      images: post.images,
      videoUrl: post.videoUrl
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/api/posts/:id", authenticateToken, async (req, res) => {
  try {
    const { title, content, tags, images, videoUrl } = req.body;
    const post = await BlogPost.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.authorId !== req.user.id) return res.status(403).json({ message: "Not authorized" });

    post.title = title || post.title;
    post.content = content || post.content;
    post.tags = tags || post.tags;
    post.images = images || post.images;
    post.videoUrl = videoUrl || post.videoUrl;

    await post.save();
    // Map _id to id for frontend compatibility
    res.json({
      id: post._id.toString(),
      title: post.title,
      content: post.content,
      author: post.author,
      authorId: post.authorId.toString(),
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      tags: post.tags,
      images: post.images,
      videoUrl: post.videoUrl
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/api/posts/:id", authenticateToken, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.authorId !== req.user.id) return res.status(403).json({ message: "Not authorized" });

    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
