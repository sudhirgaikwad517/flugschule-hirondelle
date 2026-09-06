import type { AuthProvider } from 'react-admin';

export const authProvider: AuthProvider = {
    // called when the user attempts to log in - either with the default
    // { username, password } form, or with { mode: 'otp', email, code } from
    // the "Anmeldung per E-Mail-Code" flow on the custom login page.
    login: async (params: any) => {
        const isOtp = params?.mode === 'otp';
        const request = new Request(isOtp ? '/api/auth/login-otp/verify' : '/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(
                isOtp
                    ? { email: params.email, code: params.code }
                    : { email: params.username, password: params.password }
            ),
            headers: new Headers({ 'Content-Type': 'application/json' }),
        });
        const response = await fetch(request);
        if (response.status < 200 || response.status >= 300) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.message || response.statusText);
        }
        const auth = await response.json();
        localStorage.setItem('auth', auth.token);
        localStorage.setItem('user', JSON.stringify(auth.user));
    },
    // called when the user clicks on the logout button
    logout: () => {
        localStorage.removeItem('auth');
        localStorage.removeItem('user');
        return Promise.resolve();
    },
    // called when the API returns an error
    checkError: ({ status }) => {
        if (status === 401 || status === 403) {
            localStorage.removeItem('auth');
            localStorage.removeItem('user');
            return Promise.reject();
        }
        return Promise.resolve();
    },
    // called when the user navigates to a new location, to check for authentication
    checkAuth: () => {
        return localStorage.getItem('auth')
            ? Promise.resolve()
            : Promise.reject();
    },
    // called when the user navigates to a new location, to check for permissions / roles
    getPermissions: () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            return Promise.resolve(user.role);
        }
        return Promise.resolve();
    },
};
