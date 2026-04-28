import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  projectIdea: { type: String },
  description: { type: String, required: true },
  level: { type: String },
  duration: { type: String },
  workflow: { type: mongoose.Schema.Types.Mixed },
  techStack: [{
    module: { type: String },
    tech: { type: String },
    reason: { type: String }
  }],
  status: { type: String, default: 'generating' },
  blueprint: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Project', projectSchema);
