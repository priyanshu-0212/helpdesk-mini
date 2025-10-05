// client/src/pages/TicketDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../api/axios';
import jwtDecode  from 'jwt-decode';
import toast from 'react-hot-toast';         // <-- ADDED: Import toast
import Spinner from '../components/Spinner'; // <-- ADDED: Import Spinner

// Helper function to get user from token (no changes here)
const getUserFromToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch (error) {
    return null;
  }
};

function TicketDetailPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [status, setStatus] = useState('');

  const user = getUserFromToken();
  const isAgentOrAdmin = user && (user.role === 'AGENT' || user.role === 'ADMIN');

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/tickets/${id}`);
      setTicket(response.data);
      setStatus(response.data.status);
    } catch (err) {
      setError('Failed to fetch ticket details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await apiClient.post(`/tickets/${id}/comments`, { content: newComment });
      setNewComment('');
      fetchTicket();
    } catch (err) {
      toast.error('Failed to post comment.'); // <-- CHANGED from alert()
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await apiClient.patch(`/tickets/${id}`, {
        status,
        version: ticket.version,
      });
      toast.success('Status updated successfully!'); // <-- CHANGED from alert()
      fetchTicket();
    } catch (err) {
      if (err.response && err.response.status === 409) {
        toast.error('Conflict: This ticket was updated by someone else. Refreshing...'); // <-- CHANGED from alert()
        fetchTicket(); 
      } else {
        toast.error('Failed to update status.'); // <-- CHANGED from alert()
      }
    }
  };

  if (loading) return <Spinner />; // <-- CHANGED from <p> to <Spinner />
  if (error) return <p className="text-red-500">{error}</p>;
  if (!ticket) return <p>Ticket not found.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        {/* Main Ticket Details (no changes here) */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h1 className="text-3xl font-bold mb-2">{ticket.title}</h1>
          <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              ticket.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>{ticket.status}</span>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              ticket.priority === 'HIGH' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
            }`}>{ticket.priority}</span>
            <span>Created by: {ticket.creator.name}</span>
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
        </div>

        {/* Comments Section (no changes here) */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Comments</h2>
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="space-y-4">
              {ticket.comments.length > 0 ? (
                ticket.comments.map(comment => (
                  <div key={comment.id} className="border-b pb-2">
                    <p className="text-gray-800">{comment.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      by {comment.author.name} on {new Date(comment.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No comments yet.</p>
              )}
            </div>
            <form onSubmit={handleCommentSubmit} className="mt-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add your comment..."
                required
                rows="4"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <button type="submit" className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                Add Comment
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="md:col-span-1 space-y-8">
        {/* Agent/Admin Panel (no changes here) */}
        {isAgentOrAdmin && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Admin Actions</h2>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="CLOSED">Closed</option>
              </select>
              <button onClick={handleStatusUpdate} className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Save Status
              </button>
            </div>
          </div>
        )}
        {/* Timeline (no changes here) */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Timeline</h2>
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <ul className="space-y-4">
              {ticket.timelineEvents.map(event => (
                <li key={event.id} className="text-sm">
                  <p className="font-semibold text-gray-800">{event.action.replace('_', ' ')}</p>
                  <p className="text-gray-600">{event.details}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    by {event.actor.name} on {new Date(event.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TicketDetailPage;