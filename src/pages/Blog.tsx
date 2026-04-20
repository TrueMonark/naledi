import Navigation from "@/components/Navigation";
import HeroSlider from "@/components/HeroSlider";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Loading } from "@/components/ui/loading";
import { Calendar, User, ArrowRight, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { blogApi } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { BlogPost } from "@/types/blog";
import { API_BASE_URL } from "@/lib/api";

const Blog = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchBlogPosts();
  }, [currentPage, searchTerm]);

  const fetchBlogPosts = async () => {
    try {
      if (currentPage === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await blogApi.getPublished(currentPage, 6, searchTerm);
      const { blogs, totalPages } = response.data || {};
      if (blogs) {
        setBlogPosts((prev) =>
          currentPage === 1 ? blogs : [...prev, ...blogs]
        );
        setTotalPages(totalPages || 1);
      } else {
        setError(response.error || "Failed to fetch blog posts");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch blog posts");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchBlogDetail = async (id: string) => {
    try {
      const blog = await blogApi.getById(id); // blog IS the post object
      setSelectedBlog(blog); // ✅ directly set it
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Error fetching blog detail:", error);
    }
  };

  const handleOpenDialog = async (id: string) => {
    await fetchBlogDetail(id);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBlogPosts();
  };

  const loadMorePosts = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  if (loading && currentPage === 1) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="h-96">
          <HeroSlider />
        </div>
        <div className="flex justify-center items-center py-20">
          <Loading size="lg" text="Loading blog posts..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="h-96">
          <HeroSlider />
        </div>
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      <HeroSlider />

      {/* <section className="py-28 bg-muted/50">
          <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
            <form onSubmit={handleSearch} className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                    type="text"
                    placeholder="Search blog posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
              </div>
            </form>
          </div>
        </section> */}

      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-4">
              School News & Updates
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Stay updated with the latest news, events, and achievements from
              Naledi Day and Boarding School
            </p>
          </div>

          {blogPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No blog posts found.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {blogPosts.map((post) => (
                  <article
                    key={post._id}
                    className="bg-card rounded-lg shadow-card overflow-hidden hover:shadow-elegant transition-shadow duration-300">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={`${API_BASE_URL}${post.image}`}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-medium">
                          {post.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-primary mb-3 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>{post.author}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(post.publishedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <Button onClick={() => handleOpenDialog(post._id)}>
                        Read More
                      </Button>
                    </div>
                  </article>
                ))}
              </div>

              {currentPage < totalPages && (
                <div className="text-center mt-12">
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={loadMorePosts}
                    disabled={loadingMore}>
                    {loadingMore ? (
                      <Loading size="sm" text="Loading..." />
                    ) : (
                      "Load More Posts"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}

          {/* GLOBAL Dialog — only one */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl text-primary pr-8">
                  {selectedBlog?.title || "Loading..."}
                </DialogTitle>
                <DialogDescription>
                  {selectedBlog
                    ? `Posted by ${selectedBlog.author} on ${new Date(
                        selectedBlog.publishedAt
                      ).toLocaleDateString()}`
                    : "Fetching post details..."}
                </DialogDescription>
              </DialogHeader>

              {!selectedBlog ? (
                <div className="py-8 text-center">
                  <Loading size="lg" text="Loading blog content..." />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative h-64 overflow-hidden rounded-lg">
                    <img
                      src={`${API_BASE_URL}${selectedBlog.image}`}
                      alt={selectedBlog.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-medium">
                        {selectedBlog.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{selectedBlog.author}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(
                          selectedBlog.publishedAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="prose prose-lg max-w-none">
                    <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                      {selectedBlog.content}
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
