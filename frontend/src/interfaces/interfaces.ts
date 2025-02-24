export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  dataLogs?: any;
}

export interface IEvent {
  id: string;
  name: string;
  description?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  dataLogs?: any;
  polls?: IPoll[];
}

export interface IPoll {
  id: string;
  eventId?: string;
  userId: string;
  question: string;
  description?: string;
  isPublic: boolean;
  canEdit: boolean;
  startVoteAt: Date;
  endVoteAt: Date;
  isVoteEnd: boolean;
  banner?: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  dataLogs?: any;
  options?: IOption[];
}

export interface IOption {
  id: string;
  text: string;
  banner?: string;
  description?: string;
  pollId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  dataLogs?: any;
}

export interface IWhitelistUser {
  id: string;
  userId: string;
  eventId?: string;
  point: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  dataLogs?: any;
}

export interface IGuest {
  id: string;
  name: string;
  key: string;
  point: number;
  eventId?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  dataLogs?: any;
}

export interface IVoteRestriction {
  id: string;
  userId?: string;
  guestId?: string;
  pollId: string;
  optionId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  dataLogs?: any;
}

export interface IVote {
  id: string;
  pollId: string;
  optionId: string;
  userId?: string;
  guestId?: string;
  point: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  dataLogs?: any;
}

export interface IFailedJob {
  id: string;
  jobId: string;
  queueName: string;
  data: any;
  error: string;
  createdAt: Date;
}