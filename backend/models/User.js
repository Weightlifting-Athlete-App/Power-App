// models/User.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const PoseDataSchema = new Schema({
  angles: {
    shoulder_angle: Number,
    knees_angle: Number,
    back_angle: Number,
    wrist_angle: Number,
    hips_angle: Number,
  },
  correctness: {
    shoulder_angle: Number,
    knees_angle: Number,
    back_angle: Number,
    wrist_angle: Number,
    hips_angle: Number,
  },
});

const InjuryRiskSchema = new Schema({
  shoulder_angle: String,
  knees_angle: String,
  back_angle: String,
  wrist_angle: String,
  hips_angle: String,
});

const UserSchema = new Schema({
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

module.exports = mongoose.model("User", UserSchema, "User_Data");
// routes/UserRoutes.js


