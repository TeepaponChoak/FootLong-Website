import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
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

// Movie Production Roles
const productionRoles = [
  'Director', 'Producer', 'Editor', 'Gaffer', 
  'Grip', 'Sound Mixer', 'Camera Operator', 'Script Supervisor',
  'Production Designer', 'Costume Designer', 'Makeup Artist', 'Stunt Coordinator',
  'Visual Effects', 'Colorist', 'Casting Director', 'Location Manager'
];

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, default: "" },
  isAdmin: { type: Boolean, default: false },
  roles: { type: [String], default: ['Crew Member'] }
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
    const { bio } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { bio },
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

// Blog Post Routes
app.get("/api/posts", async (req, res) => {
  try {
    const posts = await BlogPost.find().sort({ createdAt: -1 });
    // Map _id to id for frontend compatibility
    const formattedPosts = posts.map(post => ({
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
