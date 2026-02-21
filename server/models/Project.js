import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, default: 'generating' },
  blueprint: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Project', projectSchema);
