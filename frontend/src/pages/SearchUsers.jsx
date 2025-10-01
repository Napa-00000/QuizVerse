// src/pages/SearchUsers.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import Avatar from "../components/Avatar";
import axios from "axios";

const SearchUsers = () => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (query.trim().length < 2) {
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const response = await axios.get(
        "http://localhost:5000/api/user/search",
        {
          params: { query },
        }
      );
      setUsers(response.data.data || []);
    } catch (error) {
      console.error("Search error:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Search Users</h1>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="join w-full">
          <input
            type="text"
            placeholder="Search by username..."
            className="input input-bordered join-item w-full"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            minLength={2}
          />
          <button
            type="submit"
            className={`btn btn-primary join-item ${loading ? "loading" : ""}`}
            disabled={loading || query.trim().length < 2}
          >
            Search
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Enter at least 2 characters
        </p>
      </form>

      {loading && (
        <div className="flex justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}

      {!loading && searched && users.length === 0 && (
        <div className="alert alert-info">
          <span>No users found matching "{query}"</span>
        </div>
      )}

      {!loading && users.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map((user) => (
            <Link
              key={user._id}
              to={`/profile/${user._id}`}
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
            >
              <div className="card-body">
                <div className="flex items-center gap-4">
                  <Avatar username={user.username} />
                  <div>
                    <h3 className="card-title">{user.username}</h3>
                    <p className="text-sm text-gray-500">
                      Member since{" "}
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchUsers;
