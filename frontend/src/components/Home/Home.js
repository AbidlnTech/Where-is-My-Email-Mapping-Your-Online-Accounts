// src/components/Home/Home.js
import React, { useEffect, useState } from "react";
import Header from "../Header";
import "../../styles/theme.css";
import "../../styles/Home.css";

const API_KEY = "27678207e74646dba050f9b8d27016e3"; // your NewsAPI key

const Home = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const fetchNews = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://newsapi.org/v2/everything?q=email+breach+cybersecurity&language=en&sortBy=publishedAt&pageSize=9&page=${pageNum}&apiKey=${API_KEY}`
      );
      const data = await res.json();

      if (data.articles) {
        setNews(data.articles);
        setTotalResults(data.totalResults);
      } else {
        setNews([]);
      }
    } catch (err) {
      console.error("Failed to fetch news:", err);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(page);
  }, [page]);

  const totalPages = Math.ceil(totalResults / 9);
  const handleNext = () => setPage((p) => Math.min(p + 1, totalPages));
  const handlePrev = () => setPage((p) => Math.max(p - 1, 1));

  return (
    <>
      <Header />
      <div className="home-container">
        <h1 className="home-title">
          🔐 Latest <span className="home-highlight">Cybersecurity</span> News
        </h1>
        <p className="home-subtitle">
          Stay updated on email breaches, data leaks, and security alerts.
        </p>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Fetching latest updates...</p>
          </div>
        ) : news.length === 0 ? (
          <p>No news available at the moment.</p>
        ) : (
          <>
            <div className="news-grid">
              {news.map((item, idx) => (
                <div key={idx} className="news-card">
                  <img
                    src={
                      item.urlToImage ||
                      "https://cdn.pixabay.com/photo/2016/11/29/12/54/hacker-1869826_960_720.jpg"
                    }
                    alt={item.title}
                    className="news-img"
                  />
                  <div className="news-content">
                    <h3>{item.title}</h3>
                    <p>{item.description || "No description available."}</p>
                    <div className="news-footer">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="read-more"
                      >
                        Read full article →
                      </a>
                      <span className="news-date">
                        {new Date(item.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="pagination">
              <button
                onClick={handlePrev}
                disabled={page === 1 || loading}
                className="page-btn"
              >
                ← Prev
              </button>
              <span className="page-info">
                Page <strong>{page}</strong> of {totalPages || 1}
              </span>
              <button
                onClick={handleNext}
                disabled={page >= totalPages || loading}
                className="page-btn"
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Home;
