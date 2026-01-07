/**
 * API Endpoints
 * Централізоване визначення всіх API маршрутів
 */

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },

  // Driver
  DRIVER: {
    PROFILE: '/driver/profile',
    UPDATE_PROFILE: '/driver/profile',
    VEHICLE: '/driver/vehicle',
    UPDATE_VEHICLE: '/driver/vehicle',
    REQUESTS: '/driver/requests',
    ACCEPT_REQUEST: (id: string) => `/driver/requests/${id}/accept`,
    REJECT_REQUEST: (id: string) => `/driver/requests/${id}/reject`,
    ROUTE: '/driver/route',
    UPDATE_ROUTE: '/driver/route',
    STATUS: '/driver/status',
    EARNINGS: '/driver/earnings',
    STATS: '/driver/stats',
    CALENDAR: '/driver/calendar',
    BLACKLIST: '/driver/blacklist',
    REWARDS: '/driver/rewards',
  },

  // Passenger
  PASSENGER: {
    CREATE_RIDE: '/passenger/rides',
    CANCEL_RIDE: (id: string) => `/passenger/rides/${id}/cancel`,
    RIDE_STATUS: (id: string) => `/passenger/rides/${id}/status`,
    RIDES_HISTORY: '/passenger/rides',
  },

  // Parcels
  PARCELS: {
    CREATE: '/parcels',
    LIST: '/parcels',
    DETAIL: (id: string) => `/parcels/${id}`,
    TRACK: (id: string) => `/parcels/${id}/track`,
    CANCEL: (id: string) => `/parcels/${id}/cancel`,
    OFFERS: (id: string) => `/parcels/${id}/offers`,
    ACCEPT_OFFER: (id: string, offerId: string) => `/parcels/${id}/offers/${offerId}/accept`,
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
  },

  // Chat
  CHAT: {
    MESSAGES: (rideId: string) => `/chat/rides/${rideId}/messages`,
    SEND: (rideId: string) => `/chat/rides/${rideId}/messages`,
    DRIVER_COMMUNITY: '/chat/driver-community',
    EMERGENCY: '/chat/emergency',
  },

  // Payments
  PAYMENTS: {
    CREATE: '/payments',
    STATUS: (id: string) => `/payments/${id}`,
    WITHDRAW: '/payments/withdraw',
  },

  // Maps
  MAPS: {
    GEOCODE: '/maps/geocode',
    REVERSE_GEOCODE: '/maps/reverse-geocode',
    ROUTE: '/maps/route',
  },
} as const;

