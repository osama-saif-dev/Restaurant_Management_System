import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true
    },
    code: {
        type: String
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    codeExpiresAt: {
        type: Date
    },
    image: {
        type: String,
        default: `https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg`
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        required: true,
        minLength: 8
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

const User = mongoose.model('User', userSchema);
export default User;