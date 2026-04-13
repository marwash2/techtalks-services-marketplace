import { Types } from "mongoose";

interface UserDocument {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: string;
  createdAt?: Date;
}

export function toUserDTO(user: UserDocument) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export function toUserListDTO(users: UserDocument[]) {
  return users.map(toUserDTO);
}