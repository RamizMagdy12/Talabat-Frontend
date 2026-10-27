import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, ReplaySubject, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, Address, Profile } from '../shared/models/user';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AccountService {
    baseUrl = environment.apiUrl;
    private currentUserSource = new ReplaySubject<User | null>(1);
    currentUser$ = this.currentUserSource.asObservable();

    private http = inject(HttpClient);
    private router = inject(Router);

    loadCurrentUser(token: string | null): Observable<User | null> {
        if (!token) {
            this.currentUserSource.next(null);
            return of<User | null>(null);
        }

        // Restore session from JWT claims (no GET /account endpoint required)
        try {
            const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
            const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
            const payload = JSON.parse(atob(padded));
            const email =
                payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
                payload.email;
            const displayName =
                payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'] ||
                payload.given_name ||
                email;

            if (!email) {
                localStorage.removeItem('token');
                this.currentUserSource.next(null);
                return of<User | null>(null);
            }

            const user: User = { email, displayName, token };
            this.currentUserSource.next(user);
            return of<User | null>(user);
        } catch {
            localStorage.removeItem('token');
            this.currentUserSource.next(null);
            return of<User | null>(null);
        }
    }

    login(values: any) {
        return this.http.post<User>(this.baseUrl + 'account/login', values).pipe(
            map((user: User) => {
                if (user) {
                    localStorage.setItem('token', user.token);
                    this.currentUserSource.next(user);
                }
            })
        );
    }

    register(values: any) {
        return this.http.post<User>(this.baseUrl + 'account/register', values).pipe(
            map(user => {
                if (user) {
                    localStorage.setItem('token', user.token);
                    this.currentUserSource.next(user);
                }
            })
        );
    }

    logout() {
        localStorage.removeItem('token');
        this.currentUserSource.next(null);
        this.router.navigateByUrl('/');
    }

    checkEmailExists(email: string) {
        return this.http.get<boolean>(this.baseUrl + 'account/emailexists?email=' + email);
    }

    forgotPassword(email: string) {
        return this.http.post<{ message: string }>(this.baseUrl + 'account/forgotpassword', { email });
    }

    getProfile() {
        return this.http.get<Profile>(this.baseUrl + 'account/profile');
    }

    updateProfile(profile: {
        displayName: string;
        phoneNumber?: string | null;
        address?: {
            firstName: string;
            lastName: string;
            street: string;
            city: string;
            country: string;
        } | null;
    }) {
        return this.http.put<Profile>(this.baseUrl + 'account/profile', profile).pipe(
            map(updated => {
                const token = localStorage.getItem('token') || '';
                this.currentUserSource.next({
                    email: updated.email,
                    displayName: updated.displayName,
                    token
                });
                return updated;
            })
        );
    }

    changePassword(currentPassword: string, newPassword: string) {
        return this.http.post<{ message: string }>(this.baseUrl + 'account/changepassword', {
            currentPassword,
            newPassword
        });
    }

    getUserAddress() {
        return this.http.get<Address>(this.baseUrl + 'account/address');
    }

    updateUserAddress(address: Address) {
        return this.http.put<Address>(this.baseUrl + 'account/address', address);
    }
}
