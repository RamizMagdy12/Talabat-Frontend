import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { BehaviorSubject, map, ReplaySubject, of } from 'rxjs';
import { User, Address } from '../shared/models/user';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

    loadCurrentUser(token: string | null) {
        if (token === null) {
            this.currentUserSource.next(null);
            return of(null);
        }

        let headers = new HttpHeaders();
        headers = headers.set('Authorization', `Bearer ${token}`);

        return this.http.get<User>(this.baseUrl + 'account', { headers }).pipe(
            map((user: User) => {
                if (user) {
                    localStorage.setItem('token', user.token);
                    this.currentUserSource.next(user);
                    return user;
                }
                return null;
            })
        );
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

    getUserAddress() {
        return this.http.get<Address>(this.baseUrl + 'account/address');
    }

    updateUserAddress(address: Address) {
        return this.http.put<Address>(this.baseUrl + 'account/address', address);
    }
}
