import { http, HttpResponse } from 'msw';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const handlers = [
  // Auth handlers
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const { email, password } = (await request.json()) as any;

    if (email === 'manager@example.com' && password === 'password') {
      return HttpResponse.json({
        success: true,
        data: {
          user: {
            id: 1,
            full_name: 'Manager User',
            email: 'manager@example.com',
            role: 'manager',
          },
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
      });
    }

    if (email === 'staff@example.com' && password === 'password') {
      return HttpResponse.json({
        success: true,
        data: {
          user: {
            id: 2,
            full_name: 'Staff User',
            email: 'staff@example.com',
            role: 'staff',
          },
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
      });
    }

    if (email === 'customer@example.com' && password === 'password') {
      return HttpResponse.json({
        success: true,
        data: {
          user: {
            id: 3,
            full_name: 'Customer User',
            email: 'customer@example.com',
            role: 'customer',
          },
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
      });
    }

    return new HttpResponse(
      JSON.stringify({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      }),
      { status: 401 },
    );
  }),

  http.post(`${API_URL}/auth/logout`, () => {
    return HttpResponse.json({ success: true });
  }),

  http.get(`${API_URL}/auth/me`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: 1,
        full_name: 'Manager User',
        email: 'manager@example.com',
        role: 'manager',
      },
    });
  }),

  // Attendance handlers
  http.get(`${API_URL}/attendance/status`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        isCheckedIn: false,
        lastCheckIn: null,
      },
    });
  }),

  // Appointments
  http.get(`${API_URL}/appointments`, () => {
    return HttpResponse.json({
      success: true,
      data: [],
    });
  }),

  // Notifications
  http.get(`${API_URL}/notifications`, () => {
    return HttpResponse.json({
      success: true,
      data: [],
    });
  }),
];
