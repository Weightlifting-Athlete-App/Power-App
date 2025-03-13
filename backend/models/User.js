const mongoose = require('mongoose');

const PoseDataSchema = new mongoose.Schema({
  shoulder_angle: Number,
  knees_angle: Number,
  back_angle: Number,
  wrist_angle: Number,
  hips_angle: Number,
});

const InjuryRiskSchema = new mongoose.Schema({
  shoulder_angle: String,
  knees_angle: String,
  back_angle: String,
  wrist_angle: String,
  hips_angle: String,
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  age: Number,
  age_start: Number,
  yrs_experience: Number,
  sex_encoded: Number,
  body_weight: Number,
  lifted_weight: Number,
  pose_data: PoseDataSchema,
  injury_risk: InjuryRiskSchema,
  predicted_performance: Number,
  performance_category: String,
});

module.exports = mongoose.model('User', UserSchema);
