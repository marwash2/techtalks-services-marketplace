import { Types } from "mongoose";

interface UserDocument {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: string;
  avatar?: string | null;
  phone?: string | null;
  bio?: string | null;
  createdAt?: Date;
}

export function toUserDTO(user: UserDocument) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar ?? null,
    phone: user.phone ?? null,
    bio: user.bio ?? null,
    createdAt: user.createdAt,
  };
}

export function toUserListDTO(users: UserDocument[]) {
  return users.map(toUserDTO);
}
