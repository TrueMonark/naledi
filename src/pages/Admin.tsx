import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  PlusCircle, Users, FileText, Image, Heart, Settings, Edit, Trash2, 
  Upload, Eye, Calendar, User, Save, X, LogIn, LogOut 
} from 'lucide-react';

// Types
interface Blog {
  _id?: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  image: File | string;
  tags: string[];
  isPublished: boolean;
  publishedAt?: Date;
  views?: number;
}

interface Gallery {
  _id?: string;
  title: string;
  description: string;
  image: File | string;
  category: string;
  tags?: string[]; // Add this line
  order?: number;  // Add this line
  uploadedAt?: Date;
}

interface Devotion {
  _id?: string;
  title: string;
  verse: string;
  reference: string;
  message: string;
  image: File | string;
  date: Date;
  isActive: boolean;
}

const Admin = () => {
  const { toast } = useToast();
  
  // Add error boundary for debugging
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Unhandled error in Admin component:', error);
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for different content types
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [gallery, setGallery] = useState<Gallery[]>([]);
  const [devotions, setDevotions] = useState<Devotion[]>([]);
  const [stats, setStats] = useState({ blogs: 0, gallery: 0, devotions: 0, users: 0 });
  
  // Form states
  const [blogForm, setBlogForm] = useState<Blog>({
    title: '', excerpt: '', content: '', author: '', category: 'Academic News', 
    image: '', tags: [], isPublished: false
  });
  const [galleryForm, setGalleryForm] = useState<Gallery>({
    title: '', description: '', image: '', category: 'General'
  });
  const [devotionForm, setDevotionForm] = useState<Devotion>({
    title: '', verse: '', reference: '', message: '', image: '', 
    date: new Date(), isActive: true
  });

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    console.log('Admin component mounted, token:', !!token);
    if (token) {
      setIsAuthenticated(true);
      fetchData();
    }
  }, []);

  // API Base URL
  const API_BASE = 'http://localhost:5000/api';

  // Authentication
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Login attempt:', loginData);
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      
      console.log('Login response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Login successful, token received:', !!data.token);
        localStorage.setItem('adminToken', data.token);
        setIsAuthenticated(true);

        fetchData();
        toast({ title: "Login successful", description: "Welcome to admin dashboard" });
      } else {
        const errorData = await response.text();
        console.error('Login failed:', errorData);
        toast({ title: "Login failed", description: "Invalid credentials", variant: "destructive" });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({ title: "Error", description: "Connection failed", variant: "destructive" });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setLoginData({ email: '', password: '' });
    toast({ title: "Logged out", description: "You have been logged out successfully" });
  };

  // Fetch all data
  const fetchData = async () => {
    const token = localStorage.getItem('adminToken');
    const headers = { 'Authorization': `Bearer ${token}` };
    
    console.log('Fetching admin data with token:', !!token);
    setLoading(true);
    setError(null);

    try {
      const [blogsRes, galleryRes, devotionsRes] = await Promise.all([
        fetch(`${API_BASE}/blogs`, { headers }),
        fetch(`${API_BASE}/gallery`, { headers }),
        fetch(`${API_BASE}/devotions`, { headers })
      ]);

      console.log('API responses:', {
        blogs: blogsRes.status,
        gallery: galleryRes.status,
        devotions: devotionsRes.status
      });

      if (blogsRes.ok) {
        const blogsData = await blogsRes.json();
        console.log('Blogs data:', blogsData);
        // Handle different response formats
        const blogs = blogsData.success ? blogsData.data?.blogs || [] : (blogsData.blogs || blogsData || []);
        setBlogs(Array.isArray(blogs) ? blogs : []);
        setStats(prev => ({ ...prev, blogs: Array.isArray(blogs) ? blogs.length : 0 }));
      } else {
        console.error('Blogs API error:', await blogsRes.text());
      }

      if (galleryRes.ok) {
        const galleryData = await galleryRes.json();
        console.log('Gallery data:', galleryData);
        setGallery(galleryData.images || galleryData);
        setStats(prev => ({ ...prev, gallery: (galleryData.images || galleryData).length }));
      } else {
        console.error('Gallery API error:', await galleryRes.text());
      }

      if (devotionsRes.ok) {
        const devotionsData = await devotionsRes.json();
        console.log('Devotions data:', devotionsData);
        setDevotions(devotionsData.devotions || devotionsData);
        setStats(prev => ({ ...prev, devotions: (devotionsData.devotions || devotionsData).length }));
      } else {
        console.error('Devotions API error:', await devotionsRes.text());
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load admin data');
      toast({ 
        title: "Error", 
        description: "Failed to load admin data. Check console for details.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  // Blog operations
  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');

    try {
      const formData = new FormData();

      // Ensure this is an actual File object
      if (blogForm.image instanceof File) {
        formData.append('image', blogForm.image);
      } else {
        toast({ title: "Error", description: "Featured image is required", variant: "destructive" });
        return;
      }

      formData.append('title', blogForm.title);
      formData.append('excerpt', blogForm.excerpt);
      formData.append('content', blogForm.content);
      formData.append('author', blogForm.author);
      formData.append('category', blogForm.category);
      formData.append('tags', blogForm.tags.join(','));
      formData.append('isPublished', blogForm.isPublished ? 'true' : 'false');

      const response = await fetch(`${API_BASE}/blogs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // DO NOT manually set 'Content-Type' when sending FormData
        },
        body: formData
      });

      if (response.ok) {
        toast({ title: "Success", description: "Blog post created successfully" });
        setBlogForm({ title: '', excerpt: '', content: '', author: '', category: 'Academic News', image: '', tags: [], isPublished: false });
        fetchData();
      } else {
        const errorData = await response.json();
        console.error("Blog create failed:", errorData);
        toast({ title: "Error", description: errorData?.errors?.[0]?.msg || "Failed to create blog post", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Network error", variant: "destructive" });
    }
  };

  const deleteBlog = async (id: string) => {
    const token = localStorage.getItem('adminToken');
    
    try {
      const response = await fetch(`${API_BASE}/blogs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast({ title: "Success", description: "Blog post deleted successfully" });
        fetchData();
      } else {
        toast({ title: "Error", description: "Failed to delete blog post", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Network error", variant: "destructive" });
    }
  };

  // Gallery operations
  const handleGallerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');

    try {
      const formData = new FormData();

      // ✅ Make sure the image is a File object
      if (galleryForm.image instanceof File) {
        formData.append('image', galleryForm.image);
      } else {
        toast({ title: "Error", description: "Image file is required", variant: "destructive" });
        return;
      }

      formData.append('title', galleryForm.title);
      formData.append('description', galleryForm.description);
      formData.append('category', galleryForm.category);

      // Optional fields
      if (galleryForm.tags?.length) {
        formData.append('tags', galleryForm.tags.join(','));
      }

      if (typeof galleryForm.order === 'number') {
        formData.append('order', String(galleryForm.order));
      }

      const response = await fetch(`${API_BASE}/gallery`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (response.ok) {
        toast({ title: "Success", description: "Image uploaded successfully" });
        setGalleryForm({ title: '', description: '', image: '', category: 'General', tags: [], order: 0 });
        fetchData();
      } else {
        const errorData = await response.json();
        console.error("Gallery upload failed:", errorData);
        toast({
          title: "Error",
          description: errorData?.errors?.[0]?.msg || errorData?.error || "Failed to upload image",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({ title: "Error", description: "Network error", variant: "destructive" });
    }
  };

  const deleteGalleryImage = async (id: string) => {
    const token = localStorage.getItem('adminToken');
    
    try {
      const response = await fetch(`${API_BASE}/gallery/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast({ title: "Success", description: "Image deleted successfully" });
        fetchData();
      } else {
        toast({ title: "Error", description: "Failed to delete image", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Network error", variant: "destructive" });
    }
  };

  // Devotion operations
  const handleDevotionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');

    try {
      const formData = new FormData();

      if (devotionForm.image instanceof File) {
        formData.append('image', devotionForm.image);
      } else {
        toast({ title: "Error", description: "Devotion image is required", variant: "destructive" });
        return;
      }

      formData.append('title', devotionForm.title);
      formData.append('verse', devotionForm.verse);
      formData.append('reference', devotionForm.reference);
      formData.append('message', devotionForm.message);
      formData.append('scheduledDate', new Date(devotionForm.date).toISOString());
      formData.append('isActive', devotionForm.isActive ? 'true' : 'false');

      const response = await fetch(`${API_BASE}/devotions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (response.ok) {
        toast({ title: "Success", description: "Devotion created successfully" });
        setDevotionForm({
          title: '',
          verse: '',
          reference: '',
          message: '',
          image: '',
          date: new Date(),
          isActive: true
        });
        fetchData();
      } else {
        const errorData = await response.json();
        console.error("Devotion create failed:", errorData);
        toast({ title: "Error", description: errorData?.errors?.[0]?.msg || "Failed to create devotion", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Network error", variant: "destructive" });
    }
  };


  const deleteDevotions = async (id: string) => {
    const token = localStorage.getItem('adminToken');
    
    try {
      const response = await fetch(`${API_BASE}/devotions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast({ title: "Success", description: "Devotion deleted successfully" });
        fetchData();
      } else {
        toast({ title: "Error", description: "Failed to delete devotion", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Network error", variant: "destructive" });
    }
  };

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input 
                  type="email" 
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required 
                />
              </div>
              <div>
                <label className="text-sm font-medium">Password</label>
                <Input 
                  type="password" 
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required 
                />
              </div>
              <Button type="submit" className="w-full">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <Navigation />
      
      {/* Admin Header */}
      <div className="pt-20 pb-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold text-primary mb-4">Admin Dashboard</h1>
              <p className="text-lg text-muted-foreground">
                Manage your school website content and settings
              </p>
              {loading && <p className="text-sm text-blue-600 mt-2">Loading data...</p>}
              {error && <p className="text-sm text-red-600 mt-2">Error: {error}</p>}
            </div>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Admin Content */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="blogs">Blogs</TabsTrigger>
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
              <TabsTrigger value="devotions">Devotions</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              {/* Quick Stats */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-card text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{stats.blogs}</div>
                  <div className="text-muted-foreground">Blog Posts</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-card text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{stats.gallery}</div>
                  <div className="text-muted-foreground">Gallery Images</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-card text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{stats.devotions}</div>
                  <div className="text-muted-foreground">Devotions</div>
                </div>
                {/*<div className="bg-white p-6 rounded-lg shadow-card text-center">*/}
                {/*  <div className="text-3xl font-bold text-primary mb-2">{stats.users}</div>*/}
                {/*  <div className="text-muted-foreground">Admin Users</div>*/}
                {/*</div>*/}
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Blog Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                  {Array.isArray(blogs) && blogs.slice(0, 5).map((blog) => (
                        <div key={blog._id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{blog.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              By {blog.author} • {blog.views || 0} views
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline"><Eye className="h-4 w-4" /></Button>
                            <Button size="sm" variant="outline"><Edit className="h-4 w-4" /></Button>
                          </div>
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </TabsContent>

            <TabsContent value="blogs" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Blog Form */}
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Blog Post</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleBlogSubmit} className="space-y-4">
                      <Input 
                        placeholder="Blog Title"
                        value={blogForm.title}
                        onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                        required
                      />
                      <Textarea 
                        placeholder="Excerpt"
                        value={blogForm.excerpt}
                        onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                        required
                      />
                      <Textarea 
                        placeholder="Content"
                        value={blogForm.content}
                        onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                        className="min-h-[120px]"
                        required
                      />
                      <Input 
                        placeholder="Author"
                        value={blogForm.author}
                        onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })}
                        required
                      />
                      <Select value={blogForm.category} onValueChange={(value) => setBlogForm({ ...blogForm, category: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Academic News">Academic News</SelectItem>
                          <SelectItem value="Events">Events</SelectItem>
                          <SelectItem value="Facilities">Facilities</SelectItem>
                          <SelectItem value="Sports">Sports</SelectItem>
                          <SelectItem value="General">General</SelectItem>
                        </SelectContent>
                      </Select>
                      <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setBlogForm(prev => ({ ...prev, image: file }));
                            }
                          }}
                      />
                      <div className="flex items-center space-x-2">
                        <input 
                          type="checkbox"
                          checked={blogForm.isPublished}
                          onChange={(e) => setBlogForm({ ...blogForm, isPublished: e.target.checked })}
                        />
                        <label>Publish immediately</label>
                      </div>
                      <Button type="submit" className="w-full">
                        <Save className="mr-2 h-4 w-4" />
                        Create Blog Post
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Blog List */}
                <Card>
                  <CardHeader>
                    <CardTitle>Existing Blog Posts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {blogs.map((blog) => (
                        <div key={blog._id} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{blog.title}</h4>
                            <p className="text-xs text-muted-foreground">{blog.category} • {blog.author}</p>
                          </div>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="outline" onClick={() => deleteBlog(blog._id!)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="gallery" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Gallery Form */}
                <Card>
                  <CardHeader>
                    <CardTitle>Upload New Image</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleGallerySubmit} className="space-y-4">
                      <Input 
                        placeholder="Image Title"
                        value={galleryForm.title}
                        onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                        required
                      />
                      <Textarea 
                        placeholder="Description"
                        value={galleryForm.description}
                        onChange={(e) => setGalleryForm({ ...galleryForm, description: e.target.value })}
                        required
                      />
                      <Select value={galleryForm.category} onValueChange={(value) => setGalleryForm({ ...galleryForm, category: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="General">General</SelectItem>
                          <SelectItem value="Events">Events</SelectItem>
                          <SelectItem value="Facilities">Facilities</SelectItem>
                          <SelectItem value="Sports">Sports</SelectItem>
                          <SelectItem value="Academic">Academic</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setGalleryForm(prev => ({ ...prev, image: file })); // ✅ use File
                            }
                          }}
                          required
                      />
                      <Button type="submit" className="w-full">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Image
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Gallery List */}
                <Card>
                  <CardHeader>
                    <CardTitle>Gallery Images</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {gallery.map((image) => (
                        <div key={image._id} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{image.title}</h4>
                            <p className="text-xs text-muted-foreground">{image.category}</p>
                          </div>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="outline" onClick={() => deleteGalleryImage(image._id!)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="devotions" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Devotion Form */}
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Devotion</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleDevotionSubmit} className="space-y-4">
                      <Input 
                        placeholder="Devotion Title"
                        value={devotionForm.title}
                        onChange={(e) => setDevotionForm({ ...devotionForm, title: e.target.value })}
                        required
                      />
                      <Textarea 
                        placeholder="Bible Verse"
                        value={devotionForm.verse}
                        onChange={(e) => setDevotionForm({ ...devotionForm, verse: e.target.value })}
                        required
                      />
                      <Input 
                        placeholder="Scripture Reference (e.g., John 3:16)"
                        value={devotionForm.reference}
                        onChange={(e) => setDevotionForm({ ...devotionForm, reference: e.target.value })}
                        required
                      />
                      <Textarea 
                        placeholder="Devotional Message"
                        value={devotionForm.message}
                        onChange={(e) => setDevotionForm({ ...devotionForm, message: e.target.value })}
                        className="min-h-[120px]"
                        required
                      />
                      <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setDevotionForm(prev => ({ ...prev, image: file }));
                            }
                          }}
                      />
                      <Input 
                        type="date"
                        value={devotionForm.date.toISOString().split('T')[0]}
                        onChange={(e) => setDevotionForm({ ...devotionForm, date: new Date(e.target.value) })}
                        required
                      />
                      <div className="flex items-center space-x-2">
                        <input 
                          type="checkbox"
                          checked={devotionForm.isActive}
                          onChange={(e) => setDevotionForm({ ...devotionForm, isActive: e.target.checked })}
                        />
                        <label>Set as active devotion</label>
                      </div>
                      <Button type="submit" className="w-full">
                        <Save className="mr-2 h-4 w-4" />
                        Create Devotion
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Devotions List */}
                <Card>
                  <CardHeader>
                    <CardTitle>Existing Devotions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {devotions.map((devotion) => (
                        <div key={devotion._id} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{devotion.title}</h4>
                            <p className="text-xs text-muted-foreground">{devotion.reference} • {devotion.isActive ? 'Active' : 'Inactive'}</p>
                          </div>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="outline" onClick={() => deleteDevotions(devotion._id!)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

        </div>
      </div>
    </div>
  );
};

export default Admin;