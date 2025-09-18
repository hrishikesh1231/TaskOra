import React from 'react';
import './Post.css';
import { useNavigate } from 'react-router-dom';

const Post = () => {
  const navigate = useNavigate();
  return (
    <div className="post-container">
      <button className="post-btn gig-btn" onClick={() => navigate('/postGig')}>
        Post Gig
      </button>
      <button className="post-btn service-btn" onClick={() => navigate('/postService')}>
        Post Service
      </button>
    </div>
  );
};

export default Post;
