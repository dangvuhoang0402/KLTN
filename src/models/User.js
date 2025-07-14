const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const UserSchema = new mongoose.Schema(
  {
    UserName: {
      type: String,
      required: true,
    },
    Password: {
      type: String,
      required: true,
    },
    Role: {
      type: String,
      required: true,
    },
    Token: {
      type: String,
    },
  },
  { timestamps: true }
);
UserSchema.plugin(mongooseDelete, {
  overrideMethods: "all",
  deletedAt: true,
  deletedBy: true, 
  deletedByType: mongoose.Schema.Types.ObjectId,

});

module.exports = mongoose.model("User", UserSchema);
