import { connectDB } from "@/lib/db";
import { User } from "@/lib/schemas/User.schema";
import { PAGINATION, MESSAGES } from "@/constants/config";

// Get all users with pagination
export async function getAllUsers(page = 1, limit = PAGINATION.DEFAULT_LIMIT) {
  await connectDB();

  const skip = (page - 1) * limit;
  const users = await User.find().skip(skip).limit(limit).exec();
  const total = await User.countDocuments();

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

// Create new user
export async function createUser(userData: {
  name: string;
  email: string;
  password: string;
  role?: string;
}) {
  await connectDB();

  const { name, email, password, role } = userData;

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  //   if (existingUser) {
  //     throw new Error("Email already exists");
  //   }
  if (existingUser) {
    throw new Error(MESSAGES.ERROR.DUPLICATE_EMAIL);
  }

  const user = new User({ name, email, password, role: role || "user" });
  await user.save();

  return user;
}

// Get user by ID
export async function getUserById(id: string) {
  await connectDB();

  const user = await User.findById(id);
  //   if (!user) {
  //     throw new Error("User not found");
  //   }
  if (!user) {
    throw new Error(MESSAGES.ERROR.NOT_FOUND);
  }

  return user;
}

// Update user
export async function updateUser(id: string, userData: any) {
  await connectDB();

  const user = await User.findByIdAndUpdate(id, userData, {
    new: true,
    runValidators: true,
  });

  //   if (!user) {
  //     throw new Error("User not found");
  //   }
  if (!user) {
    throw new Error(MESSAGES.ERROR.NOT_FOUND);
  }

  return user;
}

// Delete user
export async function deleteUser(id: string) {
  await connectDB();

  const user = await User.findByIdAndDelete(id);
  //   if (!user) {
  //     throw new Error("User not found");
  //   }
  if (!user) {
    throw new Error(MESSAGES.ERROR.NOT_FOUND);
  }

  return user;
}
