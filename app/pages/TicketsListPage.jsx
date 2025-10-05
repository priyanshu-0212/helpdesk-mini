// client/src/pages/TicketsListPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axios';
import Spinner from '../components/Spinner';

function TicketsListPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await apiClient.get('/tickets');
        setTickets(response.data.data);
      } catch (err) {
        setError('Failed to fetch tickets. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-slate-800">All Tickets</h1>
        <Link
          to="/tickets/new"
          className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-semibold px-5 py-2 rounded-lg shadow-md hover:scale-105 transition-transform"
        >
          Create New Ticket
        </Link>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <h2 className="text-xl font-medium text-slate-600">No tickets found.</h2>
          <p className="text-slate-500 mt-2">Why not create the first one?</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => (
            <Link 
              to={`/tickets/${ticket.id}`} 
              key={ticket.id} 
              className="block bg-white rounded-xl shadow-md border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="p-6">
                <h2 className="text-xl font-bold text-slate-800 truncate">{ticket.title}</h2>
                <div className="flex items-center space-x-4 mt-4 text-xs font-medium">
                  <span className={`px-2.5 py-1 rounded-full ${
                    ticket.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                    ticket.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {ticket.status}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full ${
                    ticket.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                    ticket.priority === 'MEDIUM' ? 'bg-sky-100 text-sky-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {ticket.priority}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-4">
                  Created: {new Date(ticket.createdAt).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
export default TicketsListPage;