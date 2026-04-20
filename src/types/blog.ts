export interface BlogPost {
    _id: string;
    title: string;
    excerpt: string;
    content: string;
    author: string;
    category: string;
    image: string;
    publishedAt: string;
    views: number;
}

export interface BlogListResponse {
    blogs: BlogPost[];
    totalPages: number;
    currentPage: number;
    total: number;
}
