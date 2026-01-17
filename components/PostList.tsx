import React from 'react';
import { Post } from '../types';
import PostListItem from './PostListItem';

interface PostListProps {
  posts: Post[];
  onSelectPost: (post: Post) => void;
  onToggleBookmark: (postId: string) => void;
}

const PostList: React.FC<PostListProps> = ({ posts, onSelectPost, onToggleBookmark }) => {
  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <PostListItem key={post.id} post={post} onSelectPost={onSelectPost} onToggleBookmark={onToggleBookmark} />
      ))}
    </div>
  );
};

export default PostList;