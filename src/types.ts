
export interface Driver {
  id: number;
  name: string;
  image: string;
  car: string;
  tripsCount: number;
  experience: number;
  rating: number;
  matchScore: number;
  pickupPoints: Point[];
  tripPoints: Point[];
  svgPickupPath: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface Message {
  id: number;
  sender: 'user' | 'driver';
  text: string;
  timestamp: Date;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'parcel_offer' | 'ride' | 'system' | 'parcel';
  isRead: boolean;
  payload?: {
    driverId: number;
    parcelId: string;
    eta: string;
    distance: string;
    price: string;
    driverName: string;
    driverImage: string;
    driverRating: number;
  };
}

export enum TransportMode {
  CITY = 'City',
  PARCEL = 'Parcel'
}

export type ParcelStatus = 'Prepared' | 'DriverAssigned' | 'InTransit' | 'Delivered' | 'Closed';

export interface Parcel {
  id: string;
  title: string;
  size: 'S' | 'M' | 'L' | 'XL';
  weight: string;
  description: string;
  photos: string[];
  from: string;
  to: string;
  receiver: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
  status: ParcelStatus;
  date: string; // Creation date
  handoverDate?: string; // Date when driver picked up the parcel
  deliveryDate?: string; // Date when parcel reached destination
  receivedDate?: string; // Date when receiver scanned the code and took it
  qrCode: string;
  driverId?: number;
  agreedPrice?: string;
}

export interface CustomPassengerAddress {
  id: string;
  passengerIndex: number; // 1, 2, 3... (не 0, бо перший завжди основна адреса)
  type: 'adult' | 'child';
  address: string;
}
