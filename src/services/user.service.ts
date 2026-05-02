import { connectDB } from "@/lib/db";
import { User } from "@/models/User.model";
import { MESSAGES, PAGINATION } from "@/constants/config";
import { ApiError } from "@/lib/api-error";
import { toUserDTO, toUserListDTO } from "@/lib/dto/user.dto";
import bcrypt from "bcryptjs";

async function fetchUsers(
  page = 1,
  limit = PAGINATION.DEFAULT_LIMIT,
  role?: string,
) {
  await connectDB();

  const skip = (page - 1) * limit;
  const query = role ? { role } : {};

  const users = await User.find(query).skip(skip).limit(limit).exec();
  const total = await User.countDocuments(query);

  return {
    users: toUserListDTO(users),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

export async function getAllUsers(page = 1, limit = PAGINATION.DEFAULT_LIMIT) {
  return fetchUsers(page, limit);
}

export async function getUsersByRole(
  role: "user" | "provider" | "admin",
  page = 1,
  limit = PAGINATION.DEFAULT_LIMIT,
) {
  return fetchUsers(page, limit, role);
}

export async function createUser(userData: {
  name: string;
  email: string;
  password: string;
  role?: string;
}) {
  await connectDB();

  const { name, email, password, role } = userData;

  if (!name || !email || !password) {
    throw new ApiError(MESSAGES.ERROR.INVALID_INPUT, 400);
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new ApiError(MESSAGES.ERROR.DUPLICATE_EMAIL, 409);

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = new User({
    name,
    email,
    password: hashedPassword,
    role: role || "user",
  });
  await user.save();

  return toUserDTO(user);
}

export async function loginUser(email: string, password: string) {
  await connectDB();

  if (!email || !password) {
    throw new ApiError(MESSAGES.ERROR.INVALID_INPUT, 400);
  }

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(MESSAGES.ERROR.INVALID_CREDENTIALS, 401);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new ApiError(MESSAGES.ERROR.INVALID_CREDENTIALS, 401);

  return toUserDTO(user);
}

export async function getUserById(id: string) {
  await connectDB();

  const user = await User.findById(id);
  if (!user) throw new ApiError(MESSAGES.ERROR.NOT_FOUND, 404);

  return toUserDTO(user);
}

export async function updateUser(
  id: string,
  userData: Partial<{ name: string; email: string; role: string }>,
) {
  await connectDB();

  const user = await User.findByIdAndUpdate(id, userData, {
    new: true,
    runValidators: true,
  });
  if (!user) throw new ApiError(MESSAGES.ERROR.NOT_FOUND, 404);

  return toUserDTO(user);
}

export async function deleteUser(id: string) {
  await connectDB();

  const user = await User.findByIdAndDelete(id);
  if (!user) throw new ApiError(MESSAGES.ERROR.NOT_FOUND, 404);

  return toUserDTO(user);
}
