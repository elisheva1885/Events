import mongoose from 'mongoose';
export function mongoHealth(req, res) {
  const state = mongoose.connection.readyState; // 0=disconnected,1=connected,2=connecting,3=disconnecting
  res.json({ mongoState: state });
}
