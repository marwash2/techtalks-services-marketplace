import type { Types } from 'mongoose';
import type { IUser } from './user';

export interface INotification {
  _id: Types.ObjectId | string;
  userId: Types.ObjectId | string | IUser;
  type: string;
  message: string;
  read: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}