import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc, 
  deleteDoc,
  query, 
  orderBy, 
  where,
  serverTimestamp,
  Timestamp,
  updateDoc,
  addDoc,
  limit
} from 'firebase/firestore';
import { db } from './firebase';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  status: 'draft' | 'review' | 'published' | 'archived';
  category: string;
  tags: string[];
  publishedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  views: number;
  featured: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

export interface CreateBlogPostData {
  title: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  category: string;
  tags: string[];
  status: 'draft' | 'review' | 'published' | 'archived';
  featured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

export interface UpdateBlogPostData extends Partial<CreateBlogPostData> {
  id: string;
}

/**
 * Generate URL-friendly slug from title
 */
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

/**
 * Create a new blog post
 */
export const createBlogPost = async (
  postData: CreateBlogPostData,
  authorId: string,
  authorName: string,
  authorEmail: string
): Promise<string> => {
  try {
    const slug = generateSlug(postData.title);
    const now = serverTimestamp();
    
    const blogPost: Omit<BlogPost, 'id'> = {
      title: postData.title,
      slug,
      content: postData.content,
      excerpt: postData.excerpt,
      featuredImage: postData.featuredImage,
      author: {
        id: authorId,
        name: authorName,
        email: authorEmail,
      },
      status: postData.status,
      category: postData.category,
      tags: postData.tags,
      publishedAt: postData.status === 'published' ? now as Timestamp : undefined,
      createdAt: now as Timestamp,
      updatedAt: now as Timestamp,
      views: 0,
      featured: postData.featured || false,
      seoTitle: postData.seoTitle,
      seoDescription: postData.seoDescription,
    };

    const docRef = await addDoc(collection(db, 'blogPosts'), blogPost);
    return docRef.id;
  } catch (error) {
    console.error('Error creating blog post:', error);
    throw error;
  }
};

/**
 * Update an existing blog post
 */
export const updateBlogPost = async (updateData: UpdateBlogPostData): Promise<void> => {
  try {
    const { id, ...data } = updateData;
    const updatePayload: any = {
      ...data,
      updatedAt: serverTimestamp() as Timestamp,
    };

    // Update slug if title changed
    if (data.title) {
      updatePayload.slug = generateSlug(data.title);
    }

    // Set publishedAt if status changed to published
    if (data.status === 'published') {
      updatePayload.publishedAt = serverTimestamp() as Timestamp;
    }

    await updateDoc(doc(db, 'blogPosts', id), updatePayload);
  } catch (error) {
    console.error('Error updating blog post:', error);
    throw error;
  }
};

/**
 * Delete a blog post
 */
export const deleteBlogPost = async (postId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'blogPosts', postId));
  } catch (error) {
    console.error('Error deleting blog post:', error);
    throw error;
  }
};

/**
 * Get all blog posts with optional filtering
 */
export const getBlogPosts = async (options?: {
  status?: BlogPost['status'];
  category?: string;
  limit?: number;
  orderByField?: 'createdAt' | 'publishedAt' | 'updatedAt' | 'views';
  orderDirection?: 'asc' | 'desc';
}): Promise<BlogPost[]> => {
  try {
    const {
      status,
      category,
      limit: limitCount,
      orderByField = 'createdAt',
      orderDirection = 'desc'
    } = options || {};

    let q = query(collection(db, 'blogPosts'));

    // Add filters
    if (status) {
      q = query(q, where('status', '==', status));
    }
    if (category) {
      q = query(q, where('category', '==', category));
    }

    // Add ordering
    q = query(q, orderBy(orderByField, orderDirection));

    // Add limit
    if (limitCount) {
      q = query(q, limit(limitCount));
    }

    const querySnapshot = await getDocs(q);
    const posts: BlogPost[] = [];

    querySnapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data()
      } as BlogPost);
    });

    return posts;
  } catch (error) {
    console.error('Error getting blog posts:', error);
    throw error;
  }
};

/**
 * Get a single blog post by ID
 */
export const getBlogPost = async (postId: string): Promise<BlogPost | null> => {
  try {
    const docSnap = await getDoc(doc(db, 'blogPosts', postId));
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as BlogPost;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting blog post:', error);
    throw error;
  }
};

/**
 * Get a blog post by slug
 */
export const getBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  try {
    const q = query(collection(db, 'blogPosts'), where('slug', '==', slug));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as BlogPost;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting blog post by slug:', error);
    throw error;
  }
};

/**
 * Increment view count for a blog post
 */
export const incrementBlogPostViews = async (postId: string): Promise<void> => {
  try {
    const postRef = doc(db, 'blogPosts', postId);
    const postSnap = await getDoc(postRef);
    
    if (postSnap.exists()) {
      const currentViews = postSnap.data().views || 0;
      await updateDoc(postRef, {
        views: currentViews + 1
      });
    }
  } catch (error) {
    console.error('Error incrementing blog post views:', error);
    throw error;
  }
};

/**
 * Get blog categories
 */
export const getBlogCategories = async (): Promise<string[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'blogPosts'));
    const categories = new Set<string>();
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.category) {
        categories.add(data.category);
      }
    });
    
    return Array.from(categories).sort();
  } catch (error) {
    console.error('Error getting blog categories:', error);
    throw error;
  }
};

/**
 * Get popular tags
 */
export const getBlogTags = async (): Promise<string[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'blogPosts'));
    const tagCounts = new Map<string, number>();
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.tags && Array.isArray(data.tags)) {
        data.tags.forEach((tag: string) => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
      }
    });
    
    // Sort by usage count and return top tags
    return Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag)
      .slice(0, 20);
  } catch (error) {
    console.error('Error getting blog tags:', error);
    throw error;
  }
};
